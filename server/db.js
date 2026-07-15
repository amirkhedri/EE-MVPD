import { JSONFilePreset } from "lowdb/node";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// If running on Vercel, use the writable temporary folder; otherwise, use local folder
const DB_FILE = process.env.VERCEL === "1"
  ? path.join(os.tmpdir(), "data.json")
  : path.join(__dirname, "data.json");

const defaultData = {
  users: [],
  nurseProfiles: [],
  wallets: [],
  requests: [],
  contracts: [],
  transactions: [],
  careLogEntries: [],
};

export const id = () => nanoid(12);

let dbInstance;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await JSONFilePreset(DB_FILE, defaultData);
    await seedIfEmpty(dbInstance);
  }
  return dbInstance;
}

function makeUser({ name, email, password, role }) {
  return {
    id: id(),
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    createdAt: new Date().toISOString(),
  };
}

async function seedIfEmpty(db) {
  if (db.data.users.length > 0) return;

  const now = new Date().toISOString();

  const eleanor = makeUser({ name: "Eleanor Reyes", email: "eleanor@example.com", password: "password123", role: "family" });
  const amina = makeUser({ name: "Amina Alvi", email: "amina@example.com", password: "password123", role: "family" });
  const admin = makeUser({ name: "Grace Admin", email: "admin@example.com", password: "admin123", role: "admin" });

  const amaraUser = makeUser({ name: "Amara Chen", email: "amara@example.com", password: "password123", role: "nurse" });
  const danielUser = makeUser({ name: "Daniel Okafor", email: "daniel@example.com", password: "password123", role: "nurse" });
  const priyaUser = makeUser({ name: "Priya Nair", email: "priya@example.com", password: "password123", role: "nurse" });

  db.data.users.push(eleanor, amina, admin, amaraUser, danielUser, priyaUser);

  const amaraProfile = {
    userId: amaraUser.id,
    bio: "Registered nurse specializing in elderly dementia care with a gentle, patient-first approach.",
    tags: ["Dementia Care", "Insulin Management", "Mobility Support"],
    languages: ["English", "Mandarin"],
    hourlyRate: 28,
    yearsExperience: 8,
    verified: true,
    rating: 4.9,
  };
  const danielProfile = {
    userId: danielUser.id,
    bio: "Compassionate caregiver focused on post-operative recovery and daily vitals tracking.",
    tags: ["Post-Surgery Recovery", "Catheter Care", "Vitals Monitoring"],
    languages: ["English", "French"],
    hourlyRate: 24,
    yearsExperience: 5,
    verified: true,
    rating: 4.8,
  };
  const priyaProfile = {
    userId: priyaUser.id,
    bio: "Senior palliative care specialist bringing dignity and comfort to end-of-life care.",
    tags: ["Palliative Care", "Medication Management", "Companionship"],
    languages: ["English", "Hindi", "Malayalam"],
    hourlyRate: 30,
    yearsExperience: 10,
    verified: true,
    rating: 5.0,
  };
  db.data.nurseProfiles.push(amaraProfile, danielProfile, priyaProfile);

  // Wallets — starter balance for families so the payment flow can be tried immediately.
  db.data.wallets.push(
    { userId: eleanor.id, balance: 900 },
    { userId: amina.id, balance: 500 },
    { userId: amaraUser.id, balance: 0 },
    { userId: danielUser.id, balance: 0 },
    { userId: priyaUser.id, balance: 0 },
  );

  // Seed one active example relationship (Eleanor + Amara)
  const request = {
    id: id(),
    familyId: eleanor.id,
    nurseId: amaraUser.id,
    status: "active",
    patientInfo: {
      mobility: "Needs Assistance",
      medicalNeeds: ["Medication reminders", "Insulin management"],
      otherMedical: "",
      languages: ["English"],
      culturalNotes: "Prefers meals without pork; enjoys quiet mornings.",
    },
    escrowLocked: 200,
    paidTotal: 250,
    createdAt: now,
    updatedAt: now,
  };
  db.data.requests.push(request);

  const contract = {
    id: id(),
    requestId: request.id,
    hourlyRate: amaraProfile.hourlyRate,
    weeklyEstimate: amaraProfile.hourlyRate * 15,
    familySigned: true,
    familySignedAt: now,
    familySignatureName: eleanor.name,
    nurseSigned: true,
    nurseSignedAt: now,
    nurseSignatureName: amaraUser.name,
    status: "active",
  };
  db.data.contracts.push(contract);

  db.data.transactions.push(
    { id: id(), userId: eleanor.id, requestId: request.id, type: "deposit", amount: 900, label: "Wallet top-up", createdAt: now },
    { id: id(), userId: eleanor.id, requestId: request.id, type: "escrow_fund", amount: 450, label: "Escrow funded for care contract", createdAt: now },
    { id: id(), userId: eleanor.id, requestId: request.id, type: "escrow_release", amount: 250, label: "Milestone payment released", createdAt: now },
    { id: id(), userId: amaraUser.id, requestId: request.id, type: "payout", amount: 250, label: "Milestone payout received", createdAt: now },
  );

  db.data.careLogEntries.push(
    { id: id(), requestId: request.id, time: "8:00 AM", title: "Morning Medication", category: "medication", status: "done", note: "Took 10mg dosage with breakfast, no adverse reaction.", photoUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=60", createdAt: now },
    { id: id(), requestId: request.id, time: "10:00 AM", title: "Blood Pressure Check", category: "vitals", status: "done", note: "128/82 mmHg — within normal range.", vitals: { systolic: 128, diastolic: 82, bloodSugar: 112 }, createdAt: now },
    { id: id(), requestId: request.id, time: "1:00 PM", title: "Lunch", category: "meal", status: "pending", createdAt: now },
  );

  await db.write();
}

export async function saveDb(db) {
  await db.write();
}