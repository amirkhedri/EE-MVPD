export type Role = "family" | "nurse" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface PublicNurse {
  id: string;
  name: string;
  bio: string;
  tags: string[];
  languages: string[];
  hourlyRate: number;
  yearsExperience: number;
  verified: boolean;
  rating: number;
}

export interface PatientInfo {
  mobility: string;
  medicalNeeds: string[];
  otherMedical: string;
  languages: string[];
  culturalNotes: string;
}

export type RequestStatus = "pending" | "accepted" | "declined" | "active";

export interface ContractInfo {
  id: string;
  requestId: string;
  hourlyRate: number;
  weeklyEstimate: number;
  familySigned: boolean;
  familySignedAt: string | null;
  familySignatureName: string | null;
  nurseSigned: boolean;
  nurseSignedAt: string | null;
  nurseSignatureName: string | null;
  status: "awaiting_signatures" | "active";
}

export interface CareRequest {
  id: string;
  familyId: string;
  nurseId: string;
  status: RequestStatus;
  patientInfo: PatientInfo;
  escrowLocked: number;
  paidTotal: number;
  createdAt: string;
  updatedAt: string;
  family: { id: string; name: string; email: string } | null;
  nurse: { id: string; name: string; email: string; hourlyRate?: number; tags?: string[]; rating?: number; verified?: boolean } | null;
  contract: ContractInfo | null;
}

export type TransactionType = "deposit" | "escrow_fund" | "escrow_release" | "payout" | "withdrawal";

export interface Transaction {
  id: string;
  userId: string;
  requestId: string | null;
  type: TransactionType;
  amount: number;
  label: string;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  escrowLocked: number;
  paidTotal: number;
  transactions: Transaction[];
}

export type CareLogCategory = "medication" | "meal" | "vitals" | "hygiene" | "mobility" | "note";

export interface VitalsReading {
  systolic?: number;
  diastolic?: number;
  bloodSugar?: number;
}

export interface CareLogEntry {
  id: string;
  requestId: string;
  time: string;
  title: string;
  category: CareLogCategory;
  status: "done" | "pending";
  note: string;
  photoUrl: string | null;
  vitals: VitalsReading | null;
  createdAt: string;
}
