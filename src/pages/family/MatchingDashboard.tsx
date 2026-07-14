import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Star, Send, Sparkles, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingState } from "@/components/ui/Spinner";
import { nursesApi, requestsApi, ApiError } from "@/lib/api";
import type { CareRequest, PatientInfo, PublicNurse, RequestStatus } from "@/lib/apiTypes";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

function profileStorageKey(userId: string) {
  return `carelink_patient_profile_${userId}`;
}

const defaultPatientInfo: PatientInfo = {
  mobility: "",
  medicalNeeds: [],
  otherMedical: "",
  languages: [],
  culturalNotes: "",
};

interface ScoredNurse {
  nurse: PublicNurse;
  score: number;
}

function computeMatchScore(nurse: PublicNurse, patientInfo: PatientInfo): number {
  let score = 75;
  for (const need of patientInfo.medicalNeeds) {
    if (nurse.tags.some((tag) => tag.toLowerCase().includes(need.toLowerCase()))) {
      score += 7;
    }
  }
  for (const lang of patientInfo.languages) {
    if (nurse.languages.includes(lang)) {
      score += 4;
    }
  }
  return Math.min(99, score);
}

function MatchRing({ percentage }: { percentage: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-brand-100" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-accent-500 transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-brand-900">{percentage}%</span>
      </div>
    </div>
  );
}

const statusLabels: Record<RequestStatus, string> = {
  pending: "Request pending",
  accepted: "Contract pending",
  declined: "Request declined",
  active: "Active engagement",
};

function RequestStatusPill({ status }: { status: RequestStatus }) {
  const tone = status === "active" ? "success" : status === "declined" ? "accent" : status === "accepted" ? "warning" : "neutral";
  return <Badge tone={tone}>{statusLabels[status]}</Badge>;
}

interface CandidateCardProps {
  nurse: PublicNurse;
  score: number;
  existingRequest: CareRequest | undefined;
  patientInfo: PatientInfo;
  featured?: boolean;
  onRequestCreated: (request: CareRequest) => void;
}

function CandidateCard({ nurse, score, existingRequest, patientInfo, featured, onRequestCreated }: CandidateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendRequest() {
    setSending(true);
    setError(null);
    try {
      const { request } = await requestsApi.create({ nurseId: nurse.id, patientInfo });
      setSent(true);
      onRequestCreated(request);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send request");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        {featured && (
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-accent-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-accent-600">
              Golden Candidate
            </span>
          </div>
        )}

        <div className="flex items-start gap-4">
          {featured ? (
            <MatchRing percentage={score} />
          ) : (
            <div className="shrink-0 flex flex-col items-center justify-center w-16">
              <span className="text-base font-bold text-brand-900">{score}%</span>
              <span className="text-[10px] text-brand-500 uppercase tracking-wide">match</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Avatar name={nurse.name} size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-brand-900">{nurse.name}</p>
                  {nurse.verified && (
                    <Badge tone="success">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-brand-600/80">
                  {nurse.yearsExperience} years experience &middot; ${nurse.hourlyRate}/hr
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < Math.round(nurse.rating)
                  ? "fill-warning-500 text-warning-500"
                  : "text-brand-100",
              )}
            />
          ))}
          <span className="text-sm font-medium text-brand-700 ml-1">{nurse.rating}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {nurse.tags.slice(0, featured ? 3 : 4).map((tag) => (
            <Badge key={tag} tone="brand">
              {tag}
            </Badge>
          ))}
        </div>

        {expanded && (
          <div className="mt-4 p-4 rounded-xl bg-brand-50 border border-brand-100">
            <p className="text-sm text-brand-800">{nurse.bio}</p>
            <p className="text-xs font-semibold text-brand-600 mt-3 mb-1">Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {nurse.languages.map((lang) => (
                <Badge key={lang} tone="sky">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-accent-600 font-medium mt-3">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide Profile" : "View Profile"}
          </Button>

          {existingRequest ? (
            <div className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-50 text-brand-700 font-medium text-sm px-4 py-3.5">
              <RequestStatusPill status={existingRequest.status} />
            </div>
          ) : sent ? (
            <div className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 font-medium text-sm px-4 py-3.5">
              <CheckCircle2 className="w-4 h-4" />
              Request sent
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={sending}
              onClick={handleSendRequest}
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Care Request"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MatchingDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nurses, setNurses] = useState<PublicNurse[]>([]);
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(profileStorageKey(user.id));
      if (saved) {
        try {
          setPatientInfo(JSON.parse(saved));
        } catch {
          setPatientInfo(null);
        }
      }
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [nursesRes, requestsRes] = await Promise.all([nursesApi.list(), requestsApi.mine()]);
        if (cancelled) return;
        setNurses(nursesRes.nurses);
        setRequests(requestsRes.requests);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load nurses");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const effectivePatientInfo = patientInfo ?? defaultPatientInfo;

  const scoredNurses = useMemo<ScoredNurse[]>(() => {
    return nurses
      .map((nurse) => ({ nurse, score: computeMatchScore(nurse, effectivePatientInfo) }))
      .sort((a, b) => b.score - a.score);
  }, [nurses, effectivePatientInfo]);

  const topThree = scoredNurses.slice(0, 3);
  const rest = scoredNurses.slice(3);

  function findRequestFor(nurseId: string) {
    return requests.find((r) => r.nurseId === nurseId);
  }

  function handleRequestCreated(request: CareRequest) {
    setRequests((prev) => [...prev, request]);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Your Matches"
        description="Our matching engine finds caregivers tailored to your family's needs."
      />

      {!patientInfo && !loading && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-sky-brand-50 border border-sky-brand-100 p-4 text-sm text-sky-brand-600">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Complete your{" "}
            <Link to="/family/onboarding" className="font-semibold underline">
              onboarding profile
            </Link>{" "}
            for more accurate matches. You can still browse and send requests without it.
          </span>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-accent-500/10 border border-accent-500/20 p-4 text-sm text-accent-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10">
          <LoadingState label="Finding your golden candidates..." />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-5">
            {topThree.map(({ nurse, score }) => (
              <CandidateCard
                key={nurse.id}
                nurse={nurse}
                score={score}
                existingRequest={findRequestFor(nurse.id)}
                patientInfo={effectivePatientInfo}
                featured
                onRequestCreated={handleRequestCreated}
              />
            ))}
            {topThree.length === 0 && (
              <p className="text-sm text-brand-600/80 text-center py-8">
                No caregivers available yet. Check back soon.
              </p>
            )}
          </div>

          {rest.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-brand-900 mb-4">More Caregivers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {rest.map(({ nurse, score }) => (
                  <CandidateCard
                    key={nurse.id}
                    nurse={nurse}
                    score={score}
                    existingRequest={findRequestFor(nurse.id)}
                    patientInfo={effectivePatientInfo}
                    onRequestCreated={handleRequestCreated}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
