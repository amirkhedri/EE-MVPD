import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Inbox } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingState, Spinner } from "@/components/ui/Spinner";
import { requestsApi, ApiError } from "@/lib/api";
import type { CareRequest, ContractInfo, RequestStatus } from "@/lib/apiTypes";
import { ContractCard } from "@/components/shared/ContractCard";

const statusConfig: Record<RequestStatus, { label: string; tone: "neutral" | "warning" | "accent" | "success" }> = {
  pending: { label: "Awaiting Response", tone: "neutral" },
  accepted: { label: "Contract Pending", tone: "warning" },
  declined: { label: "Declined", tone: "accent" },
  active: { label: "Active", tone: "success" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function RequestCard({
  request,
  onUpdated,
}: {
  request: CareRequest;
  onUpdated: (contract: ContractInfo, updatedRequest: CareRequest) => void;
}) {
  const status = statusConfig[request.status];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Avatar name={request.nurse?.name ?? "Caregiver"} size="md" />
          <div>
            <p className="font-bold text-brand-900">{request.nurse?.name ?? "Caregiver"}</p>
            <p className="text-xs text-brand-500/80">Requested {formatDate(request.createdAt)}</p>
          </div>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {request.patientInfo.mobility && (
            <Badge tone="brand">{request.patientInfo.mobility}</Badge>
          )}
          {request.patientInfo.medicalNeeds.map((need) => (
            <Badge key={need} tone="sky">
              {need}
            </Badge>
          ))}
        </div>

        {request.status === "pending" && (
          <div className="flex items-center gap-2 text-sm text-brand-600/80 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
            <Spinner className="w-4 h-4 text-brand-400" />
            Waiting for the caregiver to respond
          </div>
        )}

        {(request.status === "accepted" || request.status === "active") && request.contract && (
          <ContractCard
            request={request}
            contract={request.contract}
            viewerRole="family"
            onUpdated={onUpdated}
          />
        )}

        {(request.status === "accepted" || request.status === "active") && !request.contract && (
          <p className="text-sm text-brand-500/80">Contract is being prepared...</p>
        )}

        {request.status === "active" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-brand-700">
                <strong>${request.escrowLocked.toFixed(2)}</strong> in escrow
              </span>
              <span className="text-brand-700">
                <strong>${request.paidTotal.toFixed(2)}</strong> paid
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/family/care-log">
                <Button variant="outline" size="sm">Care Log</Button>
              </Link>
              <Link to="/family/wallet">
                <Button variant="outline" size="sm">Wallet</Button>
              </Link>
            </div>
          </div>
        )}

        {request.status === "declined" && (
          <p className="text-sm text-brand-500/70 italic">
            This caregiver declined your request. Browse other matches to send a new request.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Requests() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<CareRequest[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { requests } = await requestsApi.mine();
        if (!cancelled) setRequests(requests);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load requests");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleContractUpdated(contract: ContractInfo, updatedRequest: CareRequest) {
    setRequests((prev) =>
      prev.map((r) => (r.id === updatedRequest.id ? { ...updatedRequest, contract } : r)),
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="My Requests"
        description="Track the caregivers you've reached out to and manage contracts."
      />

      {error && (
        <div className="mb-6 rounded-xl bg-accent-500/10 border border-accent-500/20 p-4 text-sm text-accent-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState label="Loading your requests..." />
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center text-center py-14 gap-3">
            <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="font-semibold text-brand-900">No requests yet</p>
            <p className="text-sm text-brand-600/80 max-w-sm">
              Browse caregivers and send a care request to get started.
            </p>
            <Link to="/family/matches">
              <Button className="mt-2">
                <Clock className="w-4 h-4" />
                Find a Nurse
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} onUpdated={handleContractUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
