import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingState } from "@/components/ui/Spinner";
import { ContractCard } from "@/components/shared/ContractCard";
import { requestsApi } from "@/lib/api";
import type { CareRequest, ContractInfo, RequestStatus } from "@/lib/apiTypes";

const statusConfig: Record<RequestStatus, { label: string; tone: "accent" | "warning" | "success" | "neutral" }> = {
  pending: { label: "New Request", tone: "accent" },
  accepted: { label: "Contract Pending", tone: "warning" },
  active: { label: "Active", tone: "success" },
  declined: { label: "Declined", tone: "neutral" },
};

export default function Requests() {
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { requests } = await requestsApi.mine();
      setRequests(requests);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load requests");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 15000);
    return () => clearInterval(interval);
  }, [load]);

  function replaceRequest(updated: CareRequest) {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function handleAccept(id: string) {
    setActingOn(id);
    setActionErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      const { request } = await requestsApi.accept(id);
      replaceRequest(request);
    } catch (err) {
      setActionErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : "Could not accept request",
      }));
    } finally {
      setActingOn(null);
    }
  }

  async function handleDecline(id: string) {
    if (!window.confirm("Decline this care request?")) return;
    setActingOn(id);
    setActionErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      const { request } = await requestsApi.decline(id);
      replaceRequest(request);
    } catch (err) {
      setActionErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : "Could not decline request",
      }));
    } finally {
      setActingOn(null);
    }
  }

  function handleContractUpdated(_contract: ContractInfo, updatedRequest: CareRequest) {
    replaceRequest(updatedRequest);
  }

  if (loading) return <LoadingState label="Loading requests..." />;

  return (
    <div>
      <PageHeader
        title="Care Requests"
        description="Review and respond to families reaching out for care."
        actions={
          <Button variant="outline" size="sm" onClick={() => load()}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl bg-accent-500/10 text-accent-600 text-sm font-medium px-4 py-3">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <Card className="p-10 text-center">
          <Inbox className="w-8 h-8 text-brand-300 mx-auto mb-3" />
          <p className="text-brand-600/80 text-sm">
            No requests yet — they'll appear here once a family reaches out.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              acting={actingOn === request.id}
              errorMessage={actionErrors[request.id]}
              onAccept={() => handleAccept(request.id)}
              onDecline={() => handleDecline(request.id)}
              onContractUpdated={handleContractUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  acting,
  errorMessage,
  onAccept,
  onDecline,
  onContractUpdated,
}: {
  request: CareRequest;
  acting: boolean;
  errorMessage?: string;
  onAccept: () => void;
  onDecline: () => void;
  onContractUpdated: (contract: ContractInfo, request: CareRequest) => void;
}) {
  const status = statusConfig[request.status];
  const patient = request.patientInfo;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Avatar name={request.family?.name ?? "Family"} size="md" />
          <div>
            <p className="text-sm font-semibold text-brand-900">{request.family?.name ?? "A family"}</p>
            <p className="text-xs text-brand-500/70">
              Requested {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className="mt-4 rounded-xl bg-brand-50 border border-brand-100 p-4 space-y-2">
        <p className="text-sm text-brand-800">
          <span className="font-semibold">Mobility:</span> {patient.mobility || "Not specified"}
        </p>
        {patient.medicalNeeds.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-brand-800">Medical needs:</span>
            {patient.medicalNeeds.map((need) => (
              <Badge key={need} tone="sky">
                {need}
              </Badge>
            ))}
          </div>
        )}
        {patient.otherMedical && <p className="text-sm text-brand-700">{patient.otherMedical}</p>}
        {patient.languages.length > 0 && (
          <p className="text-sm text-brand-700">
            <span className="font-semibold">Languages:</span> {patient.languages.join(", ")}
          </p>
        )}
        {patient.culturalNotes && (
          <p className="text-sm text-brand-700 italic">"{patient.culturalNotes}"</p>
        )}
      </div>

      {errorMessage && <p className="mt-3 text-sm text-accent-600 font-medium">{errorMessage}</p>}

      {request.status === "pending" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="primary" size="md" disabled={acting} onClick={onAccept}>
            {acting ? "Accepting..." : "Accept"}
          </Button>
          <Button variant="outline" size="md" disabled={acting} onClick={onDecline}>
            Decline
          </Button>
        </div>
      )}

      {(request.status === "accepted" || request.status === "active") && request.contract && (
        <div className="mt-4">
          <ContractCard
            request={request}
            contract={request.contract}
            viewerRole="nurse"
            onUpdated={onContractUpdated}
          />
        </div>
      )}

      {request.status === "active" && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-sky-brand-50 border border-sky-brand-100 p-4">
          <div className="text-sm text-brand-700">
            <p>
              <span className="font-semibold">Escrow locked:</span> ${request.escrowLocked.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Paid to date:</span> ${request.paidTotal.toFixed(2)}
            </p>
          </div>
          <Link to="/nurse/shift">
            <Button variant="secondary" size="md">
              Manage Care Log
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
