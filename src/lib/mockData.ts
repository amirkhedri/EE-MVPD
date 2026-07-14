import type {
  NurseCandidate,
  CareLogTask,
  VitalReading,
  EscrowSummary,
  Transaction,
  Course,
  NurseBadge,
  ShiftTask,
  VerificationRequest,
  DisputeTicket,
  SystemAlert,
} from "./types";

export const nurseCandidates: NurseCandidate[] = [
  {
    id: "n1",
    name: "Amara Chen",
    matchPercentage: 96,
    yearsExperience: 8,
    verified: true,
    rating: 4.9,
    tags: ["Dementia Care", "Insulin Management", "Mobility Support"],
    languages: ["English", "Mandarin"],
    hourlyRate: 28,
    bio: "Registered nurse specializing in elderly dementia care with a gentle, patient-first approach.",
  },
  {
    id: "n2",
    name: "Daniel Okafor",
    matchPercentage: 91,
    yearsExperience: 5,
    verified: true,
    rating: 4.8,
    tags: ["Post-Surgery Recovery", "Catheter Care", "Vitals Monitoring"],
    languages: ["English", "French"],
    hourlyRate: 24,
    bio: "Compassionate caregiver focused on post-operative recovery and daily vitals tracking.",
  },
  {
    id: "n3",
    name: "Priya Nair",
    matchPercentage: 88,
    yearsExperience: 10,
    verified: true,
    rating: 5.0,
    tags: ["Palliative Care", "Medication Management", "Companionship"],
    languages: ["English", "Hindi", "Malayalam"],
    hourlyRate: 30,
    bio: "Senior palliative care specialist bringing dignity and comfort to end-of-life care.",
  },
];

export const careLogTasks: CareLogTask[] = [
  {
    id: "c1",
    time: "8:00 AM",
    title: "Morning Medication",
    category: "medication",
    status: "done",
    note: "Took 10mg dosage with breakfast, no adverse reaction.",
    photoUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=60",
    completedBy: "Amara Chen",
  },
  {
    id: "c2",
    time: "10:00 AM",
    title: "Blood Pressure Check",
    category: "vitals",
    status: "done",
    note: "128/82 mmHg — within normal range.",
    completedBy: "Amara Chen",
  },
  {
    id: "c3",
    time: "1:00 PM",
    title: "Lunch",
    category: "meal",
    status: "done",
    note: "Finished full portion of grilled chicken and vegetables.",
    photoUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&q=60",
    completedBy: "Amara Chen",
  },
  {
    id: "c4",
    time: "3:30 PM",
    title: "Afternoon Walk",
    category: "mobility",
    status: "pending",
  },
  {
    id: "c5",
    time: "6:00 PM",
    title: "Evening Medication",
    category: "medication",
    status: "pending",
  },
  {
    id: "c6",
    time: "8:00 PM",
    title: "Hygiene & Bedtime Routine",
    category: "hygiene",
    status: "pending",
  },
];

export const vitalsHistory: VitalReading[] = [
  { date: "Mon", systolic: 132, diastolic: 85, bloodSugar: 110 },
  { date: "Tue", systolic: 128, diastolic: 82, bloodSugar: 105 },
  { date: "Wed", systolic: 130, diastolic: 84, bloodSugar: 118 },
  { date: "Thu", systolic: 126, diastolic: 80, bloodSugar: 108 },
  { date: "Fri", systolic: 124, diastolic: 79, bloodSugar: 102 },
  { date: "Sat", systolic: 128, diastolic: 82, bloodSugar: 112 },
  { date: "Sun", systolic: 122, diastolic: 78, bloodSugar: 98 },
];

export const familyEscrow: EscrowSummary = {
  totalBalance: 4200,
  lockedInEscrow: 1350,
  paidOut: 2850,
  currency: "$",
};

export const familyTransactions: Transaction[] = [
  { id: "t1", label: "Week 6 Care Milestone", amount: 450, date: "Jul 12", status: "locked" },
  { id: "t2", label: "Week 5 Care Milestone", amount: 450, date: "Jul 5", status: "completed" },
  { id: "t3", label: "Week 4 Care Milestone", amount: 450, date: "Jun 28", status: "completed" },
  { id: "t4", label: "Onboarding Deposit", amount: 900, date: "Jun 10", status: "completed" },
];

export const nurseEscrow: EscrowSummary = {
  totalBalance: 3120,
  lockedInEscrow: 450,
  paidOut: 2670,
  currency: "$",
};

export const nursePayouts: Transaction[] = [
  { id: "p1", label: "Week 5 Payout — Eleanor R.", amount: 420, date: "Jul 5", status: "completed" },
  { id: "p2", label: "Week 4 Payout — Eleanor R.", amount: 420, date: "Jun 28", status: "completed" },
  { id: "p3", label: "Week 3 Payout — Eleanor R.", amount: 420, date: "Jun 21", status: "completed" },
  { id: "p4", label: "Week 6 Payout — Eleanor R.", amount: 450, date: "Jul 12", status: "locked" },
];

export const shiftTasks: ShiftTask[] = [
  { id: "s1", time: "8:00 AM", title: "Administer Morning Medication", category: "medication", status: "done", requiresPhoto: true, photoUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=60" },
  { id: "s2", time: "10:00 AM", title: "Record Blood Pressure & Sugar", category: "vitals", status: "done", note: "128/82 mmHg, 112 mg/dL" },
  { id: "s3", time: "1:00 PM", title: "Serve Lunch", category: "meal", status: "done", requiresPhoto: true },
  { id: "s4", time: "3:30 PM", title: "Assisted Afternoon Walk", category: "mobility", status: "pending" },
  { id: "s5", time: "6:00 PM", title: "Administer Evening Medication", category: "medication", status: "pending", requiresPhoto: true },
  { id: "s6", time: "8:00 PM", title: "Hygiene & Bedtime Routine", category: "hygiene", status: "pending" },
];

export const courses: Course[] = [
  { id: "co1", title: "Alzheimer's & Dementia Care", category: "Specialization", durationMinutes: 45, thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=60", progress: 100 },
  { id: "co2", title: "Safe Patient Handling", category: "Safety", durationMinutes: 30, thumbnail: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&q=60", progress: 60 },
  { id: "co3", title: "Diabetes & Insulin Management", category: "Medical", durationMinutes: 25, thumbnail: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=60", progress: 0 },
  { id: "co4", title: "Palliative & End-of-Life Care", category: "Specialization", durationMinutes: 50, thumbnail: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&q=60", progress: 0, locked: true },
];

export const nurseBadges: NurseBadge[] = [
  { id: "b1", label: "Verified Pro", icon: "shield-check", earned: true },
  { id: "b2", label: "Dementia Specialist", icon: "brain", earned: true },
  { id: "b3", label: "5-Star Streak", icon: "star", earned: true },
  { id: "b4", label: "Rapid Responder", icon: "zap", earned: false },
];

export const verificationQueue: VerificationRequest[] = [
  { id: "v1", name: "Grace Mwangi", submittedAt: "2h ago", documentType: "Background Check", status: "pending", riskFlags: 0 },
  { id: "v2", name: "Liam Fitzgerald", submittedAt: "5h ago", documentType: "Psych Evaluation", status: "pending", riskFlags: 1 },
  { id: "v3", name: "Sofia Marquez", submittedAt: "1d ago", documentType: "Nursing License", status: "pending", riskFlags: 0 },
  { id: "v4", name: "Kenji Watanabe", submittedAt: "2d ago", documentType: "Background Check", status: "approved", riskFlags: 0 },
  { id: "v5", name: "Aaliyah Johnson", submittedAt: "3d ago", documentType: "Nursing License", status: "rejected", riskFlags: 2 },
];

export const disputeTickets: DisputeTicket[] = [
  {
    id: "d1",
    subject: "Missed evening shift without notice",
    family: "The Reyes Family",
    nurse: "Daniel Okafor",
    status: "investigating",
    priority: "high",
    updatedAt: "10m ago",
    messages: [
      { author: "The Reyes Family", text: "Our nurse didn't show up for the 6pm shift and isn't responding.", time: "9:42 AM" },
      { author: "Support", text: "We've reached out to Daniel and are arranging a backup caregiver now.", time: "9:50 AM" },
    ],
  },
  {
    id: "d2",
    subject: "Payment released before task completion",
    family: "The Alvi Family",
    nurse: "Priya Nair",
    status: "open",
    priority: "medium",
    updatedAt: "1h ago",
    messages: [
      { author: "The Alvi Family", text: "Escrow shows funds released but the vitals log wasn't updated today.", time: "8:15 AM" },
    ],
  },
  {
    id: "d3",
    subject: "Clarify medication dosage note",
    family: "The Kim Family",
    nurse: "Amara Chen",
    status: "resolved",
    priority: "low",
    updatedAt: "Yesterday",
    messages: [
      { author: "The Kim Family", text: "Can you confirm the dosage noted for yesterday's log?", time: "Yesterday" },
      { author: "Support", text: "Confirmed with Amara — 10mg as prescribed. Log updated.", time: "Yesterday" },
    ],
  },
];

export const systemAlerts: SystemAlert[] = [
  { id: "a1", message: "Nurse Daniel Okafor missed check-in for active shift #4821", level: "critical", time: "10m ago" },
  { id: "a2", message: "Matching engine latency elevated (avg 3.2s)", level: "warning", time: "35m ago" },
  { id: "a3", message: "42 new nurse applications this week", level: "info", time: "2h ago" },
];
