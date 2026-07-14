import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { verificationQueue } from "@/lib/mockData";
import type { VerificationRequest } from "@/lib/types";

const statusToneMap: Record<VerificationRequest["status"], "warning" | "success" | "accent"> = {
  pending: "warning",
  approved: "success",
  rejected: "accent",
};

export default function VerificationQueue() {
  const [requests, setRequests] = useState<VerificationRequest[]>(verificationQueue);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  function updateStatus(id: string, status: VerificationRequest["status"]) {
    setRequests((prev) =>
      prev.map((request) => (request.id === id ? { ...request, status } : request)),
    );
  }

  return (
    <div>
      <PageHeader
        title="Verification Queue"
        description="Review nurse credential submissions and clear or flag risky applications."
      />

      <p className="text-sm text-slate-600 mb-3">
        <span className="font-semibold text-slate-800">{pendingCount}</span> pending &bull;{" "}
        <span className="font-semibold text-slate-800">{approvedCount}</span> approved &bull;{" "}
        <span className="font-semibold text-slate-800">{rejectedCount}</span> rejected
      </p>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Nurse</th>
              <th className="px-5 py-3">Document Type</th>
              <th className="px-5 py-3">Submitted</th>
              <th className="px-5 py-3">Risk Flags</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={request.name} src={request.avatarUrl} size="sm" />
                    <span className="font-medium text-slate-800">{request.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{request.documentType}</td>
                <td className="px-5 py-3 text-slate-500">{request.submittedAt}</td>
                <td className="px-5 py-3">
                  <Badge tone={request.riskFlags > 0 ? "accent" : "neutral"}>
                    {request.riskFlags}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={statusToneMap[request.status]} className="capitalize">
                    {request.status}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  {request.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateStatus(request.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(request.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Reviewed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
