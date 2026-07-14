import { useState } from "react";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { disputeTickets } from "@/lib/mockData";
import type { DisputeTicket } from "@/lib/types";

const priorityToneMap: Record<DisputeTicket["priority"], "accent" | "warning" | "neutral"> = {
  high: "accent",
  medium: "warning",
  low: "neutral",
};

const statusToneMap: Record<DisputeTicket["status"], "warning" | "sky" | "success"> = {
  open: "warning",
  investigating: "sky",
  resolved: "success",
};

export default function Disputes() {
  const [tickets, setTickets] = useState<DisputeTicket[]>(disputeTickets);
  const [selectedId, setSelectedId] = useState<string>(disputeTickets[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? null;

  function handleSend() {
    const text = draft.trim();
    if (!text || !selectedTicket) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              messages: [...ticket.messages, { author: "Support", text, time }],
            }
          : ticket,
      ),
    );
    setDraft("");
  }

  return (
    <div>
      <PageHeader
        title="Dispute Resolution"
        description="Investigate and intervene in active family/nurse disputes."
      />

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 items-start">
        <Card className="p-2 md:max-h-[calc(100vh-14rem)] md:overflow-y-auto">
          <div className="space-y-1">
            {tickets.map((ticket) => {
              const isSelected = ticket.id === selectedId;
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedId(ticket.id)}
                  className={cn(
                    "w-full text-left rounded-lg p-3 border transition-colors",
                    isSelected
                      ? "border-brand-300 bg-brand-50"
                      : "border-transparent hover:bg-slate-50",
                  )}
                >
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {ticket.subject}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ticket.family} &middot; {ticket.nurse}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge tone={priorityToneMap[ticket.priority]} className="capitalize">
                      {ticket.priority}
                    </Badge>
                    <Badge tone={statusToneMap[ticket.status]} className="capitalize">
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{ticket.updatedAt}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="flex flex-col md:h-[calc(100vh-14rem)]">
          {selectedTicket ? (
            <>
              <div className="p-5 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-900">
                  {selectedTicket.subject}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge tone={priorityToneMap[selectedTicket.priority]} className="capitalize">
                    {selectedTicket.priority} priority
                  </Badge>
                  <Badge tone={statusToneMap[selectedTicket.status]} className="capitalize">
                    {selectedTicket.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {selectedTicket.family} &middot; {selectedTicket.nurse}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {selectedTicket.messages.map((message, index) => {
                  const isSupport = message.author === "Support";
                  return (
                    <div
                      key={index}
                      className={cn("flex flex-col", isSupport ? "items-end" : "items-start")}
                    >
                      <div
                        className={cn(
                          "max-w-md rounded-lg px-3.5 py-2.5",
                          isSupport
                            ? "bg-brand-600 text-white"
                            : "bg-slate-100 text-slate-800",
                        )}
                      >
                        <p className="text-xs font-semibold opacity-80">{message.author}</p>
                        <p className="text-sm mt-0.5">{message.text}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{message.time}</p>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Type a message as Support..."
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-brand-200"
                />
                <Button variant="primary" size="sm" onClick={handleSend}>
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div className="p-8 text-sm text-slate-500">Select a ticket to view details.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
