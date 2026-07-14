import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Pill,
  Utensils,
  HeartPulse,
  ShowerHead,
  Footprints,
  StickyNote,
  Camera,
  CheckCircle2,
  Check,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { requestsApi, careLogApi } from "@/lib/api";
import type { CareLogCategory, CareLogEntry, CareRequest } from "@/lib/apiTypes";

const PLACEHOLDER_PHOTO =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=60";

const categoryIcons: Record<CareLogCategory, typeof Pill> = {
  medication: Pill,
  meal: Utensils,
  vitals: HeartPulse,
  hygiene: ShowerHead,
  mobility: Footprints,
  note: StickyNote,
};

const categoryOptions: { value: CareLogCategory; label: string }[] = [
  { value: "medication", label: "Medication" },
  { value: "meal", label: "Meal" },
  { value: "vitals", label: "Vitals" },
  { value: "hygiene", label: "Hygiene" },
  { value: "mobility", label: "Mobility" },
  { value: "note", label: "Note" },
];

const statusTone: Record<CareLogEntry["status"], "success" | "neutral"> = {
  done: "success",
  pending: "neutral",
};

interface VitalsDraft {
  systolic: string;
  diastolic: string;
  bloodSugar: string;
}

export default function ShiftTasks() {
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");

  const [entries, setEntries] = useState<CareLogEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [entryErrors, setEntryErrors] = useState<Record<string, string>>({});

  const [openNoteFor, setOpenNoteFor] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [vitalsDrafts, setVitalsDrafts] = useState<Record<string, VitalsDraft>>({});

  const [newTime, setNewTime] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<CareLogCategory>("note");
  const [addingTask, setAddingTask] = useState(false);
  const [addTaskError, setAddTaskError] = useState<string | null>(null);

  useEffect(() => {
    requestsApi
      .mine()
      .then(({ requests }) => {
        const active = requests.filter((r) => r.status === "active");
        setRequests(active);
        if (active.length > 0) setSelectedRequestId(active[0].id);
      })
      .catch((err) => setRequestsError(err instanceof Error ? err.message : "Could not load your shifts"))
      .finally(() => setLoadingRequests(false));
  }, []);

  useEffect(() => {
    if (!selectedRequestId) return;
    setLoadingEntries(true);
    setEntriesError(null);
    careLogApi
      .list(selectedRequestId)
      .then(({ entries }) => setEntries(entries))
      .catch((err) => setEntriesError(err instanceof Error ? err.message : "Could not load care log"))
      .finally(() => setLoadingEntries(false));
  }, [selectedRequestId]);

  function applyEntry(entry: CareLogEntry) {
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
  }

  async function updateEntry(id: string, data: Partial<CareLogEntry>) {
    setEntryErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      const { entry } = await careLogApi.update(id, data);
      applyEntry(entry);
      return entry;
    } catch (err) {
      setEntryErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : "Could not save changes",
      }));
      return null;
    }
  }

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    if (!selectedRequestId || !newTitle.trim() || !newTime.trim()) return;
    setAddingTask(true);
    setAddTaskError(null);
    try {
      const { entry } = await careLogApi.create(selectedRequestId, {
        time: newTime.trim(),
        title: newTitle.trim(),
        category: newCategory,
        status: "pending",
      });
      setEntries((prev) => [...prev, entry]);
      setNewTime("");
      setNewTitle("");
      setNewCategory("note");
    } catch (err) {
      setAddTaskError(err instanceof Error ? err.message : "Could not add task");
    } finally {
      setAddingTask(false);
    }
  }

  function markDone(id: string) {
    updateEntry(id, { status: "done" });
  }

  function toggleNote(entry: CareLogEntry) {
    setOpenNoteFor((prev) => (prev === entry.id ? null : entry.id));
    setNoteDrafts((prev) => (prev[entry.id] !== undefined ? prev : { ...prev, [entry.id]: entry.note ?? "" }));
  }

  async function saveNote(id: string) {
    const note = noteDrafts[id] ?? "";
    const saved = await updateEntry(id, { note });
    if (saved) setOpenNoteFor(null);
  }

  function uploadPhoto(id: string) {
    updateEntry(id, { photoUrl: PLACEHOLDER_PHOTO });
  }

  function getVitalsDraft(entry: CareLogEntry): VitalsDraft {
    return (
      vitalsDrafts[entry.id] ?? {
        systolic: entry.vitals?.systolic != null ? String(entry.vitals.systolic) : "",
        diastolic: entry.vitals?.diastolic != null ? String(entry.vitals.diastolic) : "",
        bloodSugar: entry.vitals?.bloodSugar != null ? String(entry.vitals.bloodSugar) : "",
      }
    );
  }

  function updateVitalsField(entry: CareLogEntry, field: keyof VitalsDraft, value: string) {
    setVitalsDrafts((prev) => ({ ...prev, [entry.id]: { ...getVitalsDraft(entry), [field]: value } }));
  }

  async function saveVitals(entry: CareLogEntry) {
    const draft = getVitalsDraft(entry);
    await updateEntry(entry.id, {
      status: "done",
      vitals: {
        systolic: draft.systolic ? Number(draft.systolic) : undefined,
        diastolic: draft.diastolic ? Number(draft.diastolic) : undefined,
        bloodSugar: draft.bloodSugar ? Number(draft.bloodSugar) : undefined,
      },
    });
  }

  if (loadingRequests) return <LoadingState label="Loading your shifts..." />;

  if (requestsError) {
    return (
      <div>
        <PageHeader title="Today's Shift" />
        <div className="rounded-xl bg-accent-500/10 text-accent-600 text-sm font-medium px-4 py-3">
          {requestsError}
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div>
        <PageHeader
          title="Today's Shift"
          description="Log tasks as you complete them — everything is saved automatically."
        />
        <Card className="p-10 text-center">
          <p className="text-brand-600/80 text-sm mb-4">
            You don't have any active care engagements yet. Accept a request to start logging care tasks.
          </p>
          <Link to="/nurse/requests">
            <Button variant="primary">View Requests</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Today's Shift"
        description="Log tasks as you complete them — everything is saved automatically."
        actions={
          requests.length > 1 ? (
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className="rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-sky-brand-200 focus:border-sky-brand-300"
            >
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.family?.name ?? "Patient"}
                </option>
              ))}
            </select>
          ) : undefined
        }
      />

      <Card className="p-4 sm:p-5 mb-4">
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="w-full sm:w-32">
            <label className="text-xs font-medium text-brand-600/80 block mb-1">Time</label>
            <input
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="3:30 PM"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-sky-brand-200 focus:border-sky-brand-300"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-brand-600/80 block mb-1">Task</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Afternoon medication"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-sky-brand-200 focus:border-sky-brand-300"
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="text-xs font-medium text-brand-600/80 block mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as CareLogCategory)}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-sky-brand-200 focus:border-sky-brand-300"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="primary" size="md" disabled={addingTask || !newTime.trim() || !newTitle.trim()}>
            <Plus className="w-4 h-4" />
            {addingTask ? "Adding..." : "Add Task"}
          </Button>
        </form>
        {addTaskError && <p className="text-sm text-accent-600 font-medium mt-2">{addTaskError}</p>}
      </Card>

      {entriesError && (
        <div className="mb-4 rounded-xl bg-accent-500/10 text-accent-600 text-sm font-medium px-4 py-3">
          {entriesError}
        </div>
      )}

      {loadingEntries ? (
        <LoadingState label="Loading care log..." />
      ) : entries.length === 0 ? (
        <Card className="p-8 text-center text-sm text-brand-600/80">
          No tasks logged yet for this shift. Add one above to get started.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const Icon = categoryIcons[entry.category];
            const isDone = entry.status === "done";
            const isPending = entry.status === "pending";
            const isVitals = entry.category === "vitals";
            const vitals = getVitalsDraft(entry);
            const entryError = entryErrors[entry.id];

            return (
              <Card
                key={entry.id}
                className={cn("p-4 sm:p-5 transition-colors", isDone && "bg-brand-50/60 border-brand-100")}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={cn(
                      "shrink-0 rounded-xl p-2.5",
                      isDone ? "bg-brand-100 text-brand-500" : "bg-sky-brand-100 text-sky-brand-600",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className={cn("text-sm font-semibold text-brand-900", isDone && "text-brand-700")}>
                          {entry.title}
                        </p>
                        <p className="text-xs text-brand-500/80 mt-0.5">{entry.time}</p>
                      </div>
                      <Badge tone={statusTone[entry.status]} className="capitalize shrink-0">
                        {entry.status}
                      </Badge>
                    </div>

                    {isVitals && (
                      <div className="mt-4 rounded-xl bg-sky-brand-50 border border-sky-brand-100 p-4">
                        <div className="grid grid-cols-3 gap-3">
                          <VitalsField
                            label="Systolic"
                            suffix="mmHg"
                            value={vitals.systolic}
                            onChange={(v) => updateVitalsField(entry, "systolic", v)}
                            disabled={isDone}
                          />
                          <VitalsField
                            label="Diastolic"
                            suffix="mmHg"
                            value={vitals.diastolic}
                            onChange={(v) => updateVitalsField(entry, "diastolic", v)}
                            disabled={isDone}
                          />
                          <VitalsField
                            label="Blood Sugar"
                            suffix="mg/dL"
                            value={vitals.bloodSugar}
                            onChange={(v) => updateVitalsField(entry, "bloodSugar", v)}
                            disabled={isDone}
                          />
                        </div>

                        {!isDone && (
                          <Button
                            variant="primary"
                            size="md"
                            className="mt-3 w-full sm:w-auto"
                            onClick={() => saveVitals(entry)}
                          >
                            Save Vitals
                          </Button>
                        )}

                        {isDone && (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium mt-3">
                            <CheckCircle2 className="w-4 h-4" />
                            Vitals recorded
                          </div>
                        )}
                      </div>
                    )}

                    {!isVitals && isDone && entry.note && (
                      <p className="text-sm text-brand-600 bg-brand-100/60 rounded-lg px-3 py-2 mt-3">
                        {entry.note}
                      </p>
                    )}

                    {!isVitals && entry.photoUrl && (
                      <img
                        src={entry.photoUrl}
                        alt="Task evidence"
                        className="w-20 h-20 rounded-lg object-cover mt-3 border border-brand-100"
                      />
                    )}

                    {!isVitals && isPending && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button variant="primary" size="md" onClick={() => markDone(entry.id)}>
                          <Check className="w-4 h-4" />
                          Mark as Done
                        </Button>
                        <Button variant="outline" size="md" onClick={() => toggleNote(entry)}>
                          <StickyNote className="w-4 h-4" />
                          Add Note
                        </Button>
                        {!entry.photoUrl && (
                          <Button variant="secondary" size="md" onClick={() => uploadPhoto(entry.id)}>
                            <Camera className="w-4 h-4" />
                            Upload Photo
                          </Button>
                        )}
                      </div>
                    )}

                    {!isVitals && openNoteFor === entry.id && (
                      <div className="mt-3">
                        <textarea
                          value={noteDrafts[entry.id] ?? ""}
                          onChange={(e) =>
                            setNoteDrafts((prev) => ({ ...prev, [entry.id]: e.target.value }))
                          }
                          placeholder="Write a note about this task..."
                          rows={3}
                          className="w-full rounded-lg border border-brand-200 p-3 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-sky-brand-200 focus:border-sky-brand-300"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          className="mt-2"
                          onClick={() => saveNote(entry.id)}
                        >
                          Save Note
                        </Button>
                      </div>
                    )}

                    {entryError && <p className="text-sm text-accent-600 font-medium mt-2">{entryError}</p>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VitalsField({
  label,
  suffix,
  value,
  onChange,
  disabled,
}: {
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-brand-600/80">{label}</span>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-sky-brand-200 bg-white px-2.5 py-2 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-sky-brand-200 focus:border-sky-brand-300 disabled:opacity-60"
        />
      </div>
      <span className="text-[11px] text-brand-500/70">{suffix}</span>
    </label>
  );
}
