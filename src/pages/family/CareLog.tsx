import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Pill, Utensils, Activity, ShowerHead, Footprints, StickyNote, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Spinner";
import { requestsApi, careLogApi, ApiError } from "@/lib/api";
import type { CareLogCategory, CareLogEntry, CareRequest } from "@/lib/apiTypes";
import { cn } from "@/lib/utils";

const categoryIcons: Record<CareLogCategory, typeof Pill> = {
  medication: Pill,
  meal: Utensils,
  vitals: Activity,
  hygiene: ShowerHead,
  mobility: Footprints,
  note: StickyNote,
};

const statusTone: Record<CareLogEntry["status"], "success" | "neutral"> = {
  done: "success",
  pending: "neutral",
};

function TimelineItem({ entry, isLast }: { entry: CareLogEntry; isLast: boolean }) {
  const Icon = categoryIcons[entry.category];

  return (
    <div className="relative pl-14 pb-8">
      {!isLast && (
        <span className="absolute left-5 top-10 bottom-0 w-0.5 bg-brand-100" aria-hidden="true" />
      )}
      <span
        className={cn(
          "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-2",
          entry.status === "done"
            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
            : "bg-slate-50 border-slate-200 text-slate-500",
        )}
      >
        <Icon className="w-5 h-5" />
      </span>

      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-sm font-semibold text-brand-500">{entry.time}</span>
        <Badge tone={statusTone[entry.status]}>{entry.status}</Badge>
      </div>
      <p className="font-semibold text-brand-900">{entry.title}</p>
      {entry.note && <p className="text-sm text-brand-700 mt-1.5">{entry.note}</p>}
      {entry.photoUrl && (
        <img
          src={entry.photoUrl}
          alt={entry.title}
          className="mt-3 w-28 h-28 rounded-xl object-cover border border-brand-100"
        />
      )}
    </div>
  );
}

interface VitalsPoint {
  date: string;
  systolic?: number;
  diastolic?: number;
  bloodSugar?: number;
}

export default function CareLog() {
  const [metric, setMetric] = useState<"bloodPressure" | "bloodSugar">("bloodPressure");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRequests, setActiveRequests] = useState<CareRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [entries, setEntries] = useState<CareLogEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { requests } = await requestsApi.mine();
        if (cancelled) return;
        const active = requests.filter((r) => r.status === "active");
        setActiveRequests(active);
        if (active.length > 0) setSelectedRequestId(active[0].id);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load care log");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedRequestId) return;
    let cancelled = false;
    async function loadEntries() {
      setEntriesLoading(true);
      setError(null);
      try {
        const { entries } = await careLogApi.list(selectedRequestId);
        if (!cancelled) setEntries(entries);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load care log entries");
      } finally {
        if (!cancelled) setEntriesLoading(false);
      }
    }
    loadEntries();
    return () => {
      cancelled = true;
    };
  }, [selectedRequestId]);

  const vitalsHistory = useMemo<VitalsPoint[]>(() => {
    return entries
      .filter((e) => e.vitals !== null)
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((e) => ({
        date: new Date(e.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        systolic: e.vitals?.systolic,
        diastolic: e.vitals?.diastolic,
        bloodSugar: e.vitals?.bloodSugar,
      }));
  }, [entries]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Live Monitoring Hub" description="Track today's care activities and vitals in real time." />
        <LoadingState label="Loading care log..." />
      </div>
    );
  }

  if (error && activeRequests.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Live Monitoring Hub" description="Track today's care activities and vitals in real time." />
        <div className="rounded-xl bg-accent-500/10 border border-accent-500/20 p-4 text-sm text-accent-600 font-medium">
          {error}
        </div>
      </div>
    );
  }

  if (activeRequests.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Live Monitoring Hub" description="Track today's care activities and vitals in real time." />
        <Card>
          <CardContent className="flex flex-col items-center text-center py-14 gap-3">
            <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <p className="font-semibold text-brand-900">No active care engagements yet</p>
            <p className="text-sm text-brand-600/80 max-w-sm">
              Once a caregiver accepts your request and the contract is signed, their care log will appear here.
            </p>
            <Link to="/family/requests">
              <Button className="mt-2">View My Requests</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Live Monitoring Hub"
        description="Track today's care activities and vitals in real time."
      />

      {error && (
        <div className="mb-6 rounded-xl bg-accent-500/10 border border-accent-500/20 p-4 text-sm text-accent-600 font-medium">
          {error}
        </div>
      )}

      {activeRequests.length > 1 && (
        <div className="mb-5">
          <label className="text-sm font-medium text-brand-700 mb-1.5 block">Viewing care log for</label>
          <select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-brand-200 px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
          >
            {activeRequests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nurse?.name ?? "Caregiver"}
              </option>
            ))}
          </select>
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Today's Timeline</CardTitle>
          <CardDescription>Chronological log of care tasks and observations, updated by your caregiver.</CardDescription>
        </CardHeader>
        <CardContent>
          {entriesLoading ? (
            <LoadingState label="Loading entries..." />
          ) : entries.length === 0 ? (
            <p className="text-sm text-brand-600/80 py-6 text-center">No care log entries yet.</p>
          ) : (
            <div>
              {entries.map((entry, i) => (
                <TimelineItem key={entry.id} entry={entry} isLast={i === entries.length - 1} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Vitals</CardTitle>
            <CardDescription>Recorded readings for this care engagement.</CardDescription>
          </div>
          {vitalsHistory.length > 0 && (
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant={metric === "bloodPressure" ? "primary" : "outline"}
                onClick={() => setMetric("bloodPressure")}
              >
                Blood Pressure
              </Button>
              <Button
                size="sm"
                variant={metric === "bloodSugar" ? "primary" : "outline"}
                onClick={() => setMetric("bloodSugar")}
              >
                Blood Sugar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {vitalsHistory.length === 0 ? (
            <p className="text-sm text-brand-600/80 py-6 text-center">No vitals recorded yet.</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsHistory} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  {metric === "bloodPressure" ? (
                    <>
                      <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#2c63a0" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#ff6b57" strokeWidth={2} dot={{ r: 3 }} />
                    </>
                  ) : (
                    <Line type="monotone" dataKey="bloodSugar" name="Blood Sugar" stroke="#2fa878" strokeWidth={2} dot={{ r: 3 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
