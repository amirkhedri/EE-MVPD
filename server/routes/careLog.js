import { Router } from "express";
import { getDb, id } from "../db.js";
import { authMiddleware, requireRole } from "../auth.js";
import { isParticipant } from "../serialize.js";

const router = Router();
router.use(authMiddleware);

function getRequestOr403(db, req, res) {
  const request = db.data.requests.find((r) => r.id === req.params.requestId);
  if (!request) {
    res.status(404).json({ error: "Care request not found" });
    return null;
  }
  if (!isParticipant(request, req.user.id) && req.user.role !== "admin") {
    res.status(403).json({ error: "You do not have access to this care log" });
    return null;
  }
  return request;
}

router.get("/:requestId", async (req, res) => {
  const db = await getDb();
  const request = getRequestOr403(db, req, res);
  if (!request) return;
  const entries = db.data.careLogEntries
    .filter((e) => e.requestId === request.id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json({ entries });
});

router.post("/:requestId", requireRole("nurse"), async (req, res) => {
  const db = await getDb();
  const request = getRequestOr403(db, req, res);
  if (!request) return;
  if (request.nurseId !== req.user.id) {
    return res.status(403).json({ error: "Only the assigned caregiver can log tasks" });
  }
  if (request.status !== "active") {
    return res.status(400).json({ error: "The contract must be active before logging care tasks" });
  }

  const { time, title, category, status, note, photoUrl, vitals } = req.body || {};
  if (!time || !title || !category) {
    return res.status(400).json({ error: "time, title, and category are required" });
  }

  const entry = {
    id: id(),
    requestId: request.id,
    time,
    title,
    category,
    status: status || "pending",
    note: note || "",
    photoUrl: photoUrl || null,
    vitals: vitals || null,
    createdAt: new Date().toISOString(),
  };
  db.data.careLogEntries.push(entry);
  await db.write();
  res.status(201).json({ entry });
});

router.patch("/entry/:entryId", requireRole("nurse"), async (req, res) => {
  const db = await getDb();
  const entry = db.data.careLogEntries.find((e) => e.id === req.params.entryId);
  if (!entry) return res.status(404).json({ error: "Care log entry not found" });
  const request = db.data.requests.find((r) => r.id === entry.requestId);
  if (!request || request.nurseId !== req.user.id) {
    return res.status(403).json({ error: "Only the assigned caregiver can update this entry" });
  }

  const { status, note, photoUrl, vitals } = req.body || {};
  if (status !== undefined) entry.status = status;
  if (note !== undefined) entry.note = note;
  if (photoUrl !== undefined) entry.photoUrl = photoUrl;
  if (vitals !== undefined) entry.vitals = vitals;

  await db.write();
  res.json({ entry });
});

export default router;
