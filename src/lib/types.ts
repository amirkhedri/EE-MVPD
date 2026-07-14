export interface NurseCandidate {
  id: string;
  name: string;
  avatarUrl?: string;
  matchPercentage: number;
  yearsExperience: number;
  verified: boolean;
  rating: number;
  tags: string[];
  languages: string[];
  hourlyRate: number;
  bio: string;
}

export interface CareLogTask {
  id: string;
  time: string;
  title: string;
  category: "medication" | "meal" | "vitals" | "hygiene" | "mobility" | "note";
  status: "done" | "pending" | "missed";
  note?: string;
  photoUrl?: string;
  completedBy?: string;
}

export interface VitalReading {
  date: string;
  systolic: number;
  diastolic: number;
  bloodSugar: number;
}

export interface EscrowSummary {
  totalBalance: number;
  lockedInEscrow: number;
  paidOut: number;
  currency: string;
}

export interface Transaction {
  id: string;
  label: string;
  amount: number;
  date: string;
  status: "completed" | "locked" | "pending";
}

export interface Course {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  thumbnail: string;
  progress: number;
  locked?: boolean;
}

export interface NurseBadge {
  id: string;
  label: string;
  icon: string;
  earned: boolean;
}

export interface ShiftTask {
  id: string;
  time: string;
  title: string;
  category: "medication" | "meal" | "vitals" | "hygiene" | "mobility" | "note";
  status: "done" | "pending" | "missed";
  requiresPhoto?: boolean;
  photoUrl?: string;
  note?: string;
}

export interface VerificationRequest {
  id: string;
  name: string;
  avatarUrl?: string;
  submittedAt: string;
  documentType: string;
  status: "pending" | "approved" | "rejected";
  riskFlags: number;
}

export interface DisputeTicket {
  id: string;
  subject: string;
  family: string;
  nurse: string;
  status: "open" | "investigating" | "resolved";
  priority: "low" | "medium" | "high";
  updatedAt: string;
  messages: { author: string; text: string; time: string }[];
}

export interface SystemAlert {
  id: string;
  message: string;
  level: "info" | "warning" | "critical";
  time: string;
}
