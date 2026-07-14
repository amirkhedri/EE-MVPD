import { Router } from "express";
import { getDb } from "../db.js";
import { authMiddleware } from "../auth.js";

const router = Router();
router.use(authMiddleware);

function toPublicNurse(db, profile) {
  const user = db.data.users.find((u) => u.id === profile.userId);
  return {
    id: profile.userId,
    name: user?.name ?? "Unknown",
    ...profile,
  };
}

router.get("/", async (req, res) => {
  const db = await getDb();
  const nurses = db.data.nurseProfiles.map((p) => toPublicNurse(db, p));
  res.json({ nurses });
});

router.get("/:id", async (req, res) => {
  const db = await getDb();
  const profile = db.data.nurseProfiles.find((p) => p.userId === req.params.id);
  if (!profile) return res.status(404).json({ error: "Nurse not found" });
  res.json({ nurse: toPublicNurse(db, profile) });
});

export default router;
