import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PersonStanding,
  HandHelping,
  Armchair,
  BedDouble,
  Syringe,
  Droplets,
  Pill,
  Dumbbell,
  Plus,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { PatientInfo } from "@/lib/apiTypes";

const TOTAL_STEPS = 3;

function profileStorageKey(userId: string) {
  return `carelink_patient_profile_${userId}`;
}

interface MobilityOption {
  id: string;
  label: string;
  icon: typeof PersonStanding;
  description: string;
}

const mobilityOptions: MobilityOption[] = [
  { id: "independent", label: "Independent", icon: PersonStanding, description: "Moves around freely without help" },
  { id: "needs-assistance", label: "Needs Assistance", icon: HandHelping, description: "Requires help walking or standing" },
  { id: "wheelchair", label: "Wheelchair-bound", icon: Armchair, description: "Relies on a wheelchair to move" },
  { id: "bedridden", label: "Bedridden", icon: BedDouble, description: "Mostly or fully confined to bed" },
];

interface MedicalOption {
  id: string;
  label: string;
  icon: typeof Syringe;
}

const medicalOptions: MedicalOption[] = [
  { id: "insulin", label: "Insulin management", icon: Syringe },
  { id: "catheter", label: "Catheter care", icon: Droplets },
  { id: "medication", label: "Medication reminders", icon: Pill },
  { id: "physical-therapy", label: "Physical therapy support", icon: Dumbbell },
];

const languageOptions = ["English", "Spanish", "Mandarin", "Hindi", "Arabic", "French", "Vietnamese", "Tagalog"];

interface Answers {
  mobility: string | null;
  medicalNeeds: string[];
  otherMedicalNote: string;
  languages: string[];
  culturalNotes: string;
}

function emptyAnswers(): Answers {
  return {
    mobility: null,
    medicalNeeds: [],
    otherMedicalNote: "",
    languages: [],
    culturalNotes: "",
  };
}

function answersFromPatientInfo(info: PatientInfo): Answers {
  const knownIds = medicalOptions.map((o) => o.id);
  const knownNeeds = info.medicalNeeds.filter((need) => knownIds.includes(need));
  const hasOther = info.medicalNeeds.includes("other") || Boolean(info.otherMedical);
  return {
    mobility: info.mobility || null,
    medicalNeeds: hasOther ? [...knownNeeds, "other"] : knownNeeds,
    otherMedicalNote: info.otherMedical ?? "",
    languages: info.languages ?? [],
    culturalNotes: info.culturalNotes ?? "",
  };
}

function answersToPatientInfo(answers: Answers): PatientInfo {
  const medicalNeeds = answers.medicalNeeds.filter((id) => id !== "other");
  return {
    mobility: answers.mobility ?? "",
    medicalNeeds,
    otherMedical: answers.medicalNeeds.includes("other") ? answers.otherMedicalNote : "",
    languages: answers.languages,
    culturalNotes: answers.culturalNotes,
  };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers());

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(profileStorageKey(user.id));
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PatientInfo;
        setAnswers(answersFromPatientInfo(parsed));
      } catch {
        // ignore malformed saved data
      }
    }
  }, [user]);

  const toggleMedicalNeed = (id: string) => {
    setAnswers((prev) => ({
      ...prev,
      medicalNeeds: prev.medicalNeeds.includes(id)
        ? prev.medicalNeeds.filter((item) => item !== id)
        : [...prev.medicalNeeds, id],
    }));
  };

  const toggleLanguage = (lang: string) => {
    setAnswers((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((item) => item !== lang)
        : [...prev.languages, lang],
    }));
  };

  const hasOther = answers.medicalNeeds.includes("other");

  const canGoNext =
    (step === 0 && answers.mobility !== null) ||
    (step === 1 && answers.medicalNeeds.length > 0) ||
    step === 2;

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleFinish = () => {
    if (!user) {
      navigate("/family/matches");
      return;
    }
    const patientInfo = answersToPatientInfo(answers);
    localStorage.setItem(profileStorageKey(user.id), JSON.stringify(patientInfo));
    navigate("/family/matches");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Let's find the right care"
        description="Answer a few quick questions so we can match you with the best caregiver."
      />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand-700">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  i <= step ? "bg-brand-600" : "bg-brand-100",
                )}
              />
            ))}
          </div>
        </div>
        <ProgressBar value={step + 1} max={TOTAL_STEPS} tone="brand" />
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-brand-900 mb-1">
                What's the patient's mobility status?
              </h2>
              <p className="text-sm text-brand-600/80 mb-6">
                This helps us match caregivers with the right physical support skills.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mobilityOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = answers.mobility === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, mobility: option.id }))}
                      className={cn(
                        "text-left rounded-2xl border-2 p-5 transition-colors duration-150 min-h-30 flex flex-col gap-3",
                        selected
                          ? "border-brand-600 bg-brand-50"
                          : "border-brand-100 bg-white hover:border-brand-300",
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          selected ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700",
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-brand-900">{option.label}</p>
                        <p className="text-sm text-brand-600/80 mt-0.5">{option.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-brand-900 mb-1">
                Medical & medication needs
              </h2>
              <p className="text-sm text-brand-600/80 mb-6">
                Select everything that applies. You can choose more than one.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {medicalOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = answers.medicalNeeds.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleMedicalNeed(option.id)}
                      className={cn(
                        "text-left rounded-2xl border-2 p-5 transition-colors duration-150 min-h-22 flex items-center gap-4",
                                                selected
                          ? "border-brand-600 bg-brand-50"
                          : "border-brand-100 bg-white hover:border-brand-300",
                      )}
                    >
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                          selected ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-brand-900">{option.label}</p>
                      {selected && <Check className="w-5 h-5 text-brand-600 ml-auto shrink-0" />}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => toggleMedicalNeed("other")}
                  className={cn(
                    "text-left rounded-2xl border-2 p-5 transition-colors duration-150 min-h-22 flex items-center gap-4",
                                        hasOther
                      ? "border-brand-600 bg-brand-50"
                      : "border-brand-100 bg-white hover:border-brand-300",
                  )}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                      hasOther ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700",
                    )}
                  >
                    <Plus className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-brand-900">Other</p>
                  {hasOther && <Check className="w-5 h-5 text-brand-600 ml-auto shrink-0" />}
                </button>
              </div>

              {hasOther && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-brand-700 mb-1.5 block">
                    Tell us more
                  </label>
                  <input
                    type="text"
                    value={answers.otherMedicalNote}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, otherMedicalNote: e.target.value }))
                    }
                    placeholder="Describe any other needs..."
                    className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-brand-900 mb-1">
                Cultural & language preferences
              </h2>
              <p className="text-sm text-brand-600/80 mb-6">
                We'll try to match a caregiver who speaks your preferred language and respects
                your traditions.
              </p>
              <p className="text-sm font-medium text-brand-700 mb-2">Preferred languages</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {languageOptions.map((lang) => {
                  const selected = answers.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={cn(
                        "px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-colors duration-150",
                        selected
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-brand-100 bg-white text-brand-700 hover:border-brand-300",
                      )}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>

              <label className="text-sm font-medium text-brand-700 mb-1.5 block">
                Cultural or dietary notes (optional)
              </label>
              <textarea
                value={answers.culturalNotes}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, culturalNotes: e.target.value }))
                }
                placeholder="E.g. Halal meals only, prefers quiet prayer time in the mornings..."
                rows={4}
                className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200 resize-none"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-6 gap-3">
        <Button variant="outline" size="lg" onClick={goBack} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {step < TOTAL_STEPS - 1 ? (
          <Button size="lg" onClick={goNext} disabled={!canGoNext}>
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            variant="accent"
            onClick={handleFinish}
            className="px-8"
          >
            <Sparkles className="w-5 h-5" />
            Find My Match
          </Button>
        )}
      </div>
    </div>
  );
}
