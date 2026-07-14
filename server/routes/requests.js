import { Router } from "express";
import { getDb, id } from "../db.js";
import { authMiddleware, requireRole } from "../auth.js";
import { enrichRequest, isParticipant } from "../serialize.js";

const router = Router();
router.use(authMiddleware);

const ACTIVE_STATUSES = ["pending", "accepted", "active"];

router.get("/mine", async (req, res) => {
  const db = await getDb();
  const mine =
    req.user.role === "family"
      ? db.data.requests.filter((r) => r.familyId === req.user.id)
      : db.data.requests.filter((r) => r.nurseId === req.user.id);

  const enriched = mine
    .map((r) => enrichRequest(db, r))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ requests: enriched });
});

router.get("/:id", async (req, res) => {
  const db = await getDb();
  const request = db.data.requests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (!isParticipant(request, req.user.id) && req.user.role !== "admin") {
    return res.status(403).json({ error: "You do not have access to this request" });
  }
  res.json({ request: enrichRequest(db, request) });
});

router.post("/", requireRole("family"), async (req, res) => {
  const { nurseId, patientInfo } = req.body || {};
  if (!nurseId || !patientInfo) {
    return res.status(400).json({ error: "nurseId and patientInfo are required" });
  }
  const db = await getDb();
  const nurseProfile = db.data.nurseProfiles.find((p) => p.userId === nurseId);
  if (!nurseProfile) return res.status(404).json({ error: "Nurse not found" });

  const duplicate = db.data.requests.find(
    (r) => r.familyId === req.user.id && r.nurseId === nurseId && ACTIVE_STATUSES.includes(r.status),
  );
  if (duplicate) {
    return res.status(409).json({ error: "You already have an active or pending request with this nurse" });
  }

  const now = new Date().toISOString();
  const request = {
    id: id(),
    familyId: req.user.id,
    nurseId,
    status: "pending",
    patientInfo,
    escrowLocked: 0,
    paidTotal: 0,
    createdAt: now,
    updatedAt: now,
  };
  db.data.requests.push(request);
  await db.write();
  res.status(201).json({ request: enrichRequest(db, request) });
});

router.post("/:id/accept", requireRole("nurse"), async (req, res) => {
  const db = await getDb();
  const request = db.data.requests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.nurseId !== req.user.id) return res.status(403).json({ error: "This request is not addressed to you" });
  if (request.status !== "pending") return res.status(400).json({ error: "This request is no longer pending" });

  const nurseProfile = db.data.nurseProfiles.find((p) => p.userId === req.user.id);
  request.status = "accepted";
  request.updatedAt = new Date().toISOString();

  const contract = {
    id: id(),
    requestId: request.id,
    hourlyRate: nurseProfile?.hourlyRate ?? 25,
    weeklyEstimate: (nurseProfile?.hourlyRate ?? 25) * 15,
    familySigned: false,
    familySignedAt: null,
    familySignatureName: null,
    nurseSigned: false,
    nurseSignedAt: null,
    nurseSignatureName: null,
    status: "awaiting_signatures",
  };
  db.data.contracts.push(contract);
  await db.write();
  res.json({ request: enrichRequest(db, request) });
});

router.post("/:id/decline", requireRole("nurse"), async (req, res) => {
  const db = await getDb();
  const request = db.data.requests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.nurseId !== req.user.id) return res.status(403).json({ error: "This request is not addressed to you" });
  if (request.status !== "pending") return res.status(400).json({ error: "This request is no longer pending" });

  request.status = "declined";
  request.updatedAt = new Date().toISOString();
  await db.write();
  res.json({ request: enrichRequest(db, request) });
});

export default router;
