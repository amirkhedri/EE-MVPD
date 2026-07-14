import { useState } from "react";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { contractsApi } from "@/lib/api";
import type { CareRequest, ContractInfo } from "@/lib/apiTypes";

interface ContractCardProps {
  request: CareRequest;
  contract: ContractInfo;
  viewerRole: "family" | "nurse";
  onUpdated: (contract: ContractInfo, request: CareRequest) => void;
}

export function ContractCard({ request, contract, viewerRole, onUpdated }: ContractCardProps) {
  const [signatureName, setSignatureName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewerSigned = viewerRole === "family" ? contract.familySigned : contract.nurseSigned;
  const otherSigned = viewerRole === "family" ? contract.nurseSigned : contract.familySigned;
  const otherLabel = viewerRole === "family" ? "Caregiver" : "Family";

  async function handleSign() {
    setError(null);
    setSubmitting(true);
    try {
      const { contract: updated, request: updatedRequest } = await contractsApi.sign(contract.id, signatureName);
      onUpdated(updated, updatedRequest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign contract");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-brand-200">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-brand-600" />
            Care Service Agreement
          </CardTitle>
          <Badge tone={contract.status === "active" ? "success" : "warning"}>
            {contract.status === "active" ? "Fully Signed" : "Awaiting Signatures"}
          </Badge>
        </div>
        <CardDescription>
          Between {request.family?.name ?? "the family"} and {request.nurse?.name ?? "the caregiver"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800 space-y-2">
          <p>
            This agreement covers home care services at an hourly rate of{" "}
            <strong>${contract.hourlyRate}/hr</strong>, with an estimated weekly cost of{" "}
            <strong>${contract.weeklyEstimate}</strong> based on a standard care schedule.
          </p>
          <p>
            Payments are held in secure escrow by CareLink and released to the caregiver upon completion of
            agreed care milestones. Either party may raise a dispute with CareLink support at any time. Care
            tasks, vitals, and photo documentation will be logged for the family's review throughout the
            engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SignatureStatus label="Family" signed={contract.familySigned} name={contract.familySignatureName} date={contract.familySignedAt} />
          <SignatureStatus label="Caregiver" signed={contract.nurseSigned} name={contract.nurseSignatureName} date={contract.nurseSignedAt} />
        </div>

        {!viewerSigned && (
          <div className="border-t border-brand-100 pt-4 space-y-3">
            <label className="flex items-start gap-2 text-sm text-brand-800">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
              I have read and agree to the terms of this care service agreement.
            </label>
            <input
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Type your full legal name to sign"
              className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-lg italic font-serif focus:outline-none focus:ring-4 focus:ring-brand-200"
            />
            {error && <p className="text-sm text-accent-600 font-medium">{error}</p>}
            <Button disabled={!agreed || !signatureName.trim() || submitting} onClick={handleSign}>
              <ShieldCheck className="w-4 h-4" />
              {submitting ? "Signing..." : "Sign Contract"}
            </Button>
          </div>
        )}

        {viewerSigned && !otherSigned && (
          <p className="text-sm text-brand-600/80 border-t border-brand-100 pt-4">
            You've signed. Waiting on the {otherLabel.toLowerCase()} to countersign before this contract becomes active.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SignatureStatus({
  label,
  signed,
  name,
  date,
}: {
  label: string;
  signed: boolean;
  name: string | null;
  date: string | null;
}) {
  return (
    <div className="rounded-xl border border-brand-100 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-brand-500 uppercase tracking-wide">{label}</span>
        <Badge tone={signed ? "success" : "neutral"}>{signed ? "Signed" : "Pending"}</Badge>
      </div>
      {signed ? (
        <div>
          <p className="text-lg italic font-serif text-brand-900 leading-tight">{name}</p>
          <p className="text-xs text-brand-500">{date ? new Date(date).toLocaleDateString() : ""}</p>
        </div>
      ) : (
        <p className="text-sm text-brand-400">Not yet signed</p>
      )}
    </div>
  );
}
