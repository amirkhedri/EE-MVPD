import { Router } from "express";
import { getDb } from "../db.js";
import { authMiddleware } from "../auth.js";
import { isParticipant } from "../serialize.js";

const router = Router();
router.use(authMiddleware);

router.get("/by-request/:requestId", async (req, res) => {
  const db = await getDb();
  const request = db.data.requests.find((r) => r.id === req.params.requestId);
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (!isParticipant(request, req.user.id) && req.user.role !== "admin") {
    return res.status(403).json({ error: "You do not have access to this contract" });
  }
  const contract = db.data.contracts.find((c) => c.requestId === request.id);
  if (!contract) return res.status(404).json({ error: "No contract exists for this request yet" });
  res.json({ contract, request });
});

router.post("/:id/sign", async (req, res) => {
  const { signatureName } = req.body || {};
  if (!signatureName || !signatureName.trim()) {
    return res.status(400).json({ error: "A typed signature name is required" });
  }
  const db = await getDb();
  const contract = db.data.contracts.find((c) => c.id === req.params.id);
  if (!contract) return res.status(404).json({ error: "Contract not found" });
  const request = db.data.requests.find((r) => r.id === contract.requestId);
  if (!request) return res.status(404).json({ error: "Related request not found" });

  const now = new Date().toISOString();
  if (req.user.id === request.familyId) {
    if (contract.familySigned) return res.status(400).json({ error: "You have already signed this contract" });
    contract.familySigned = true;
    contract.familySignedAt = now;
    contract.familySignatureName = signatureName.trim();
  } else if (req.user.id === request.nurseId) {
    if (contract.nurseSigned) return res.status(400).json({ error: "You have already signed this contract" });
    contract.nurseSigned = true;
    contract.nurseSignedAt = now;
    contract.nurseSignatureName = signatureName.trim();
  } else {
    return res.status(403).json({ error: "You are not a participant in this contract" });
  }

  if (contract.familySigned && contract.nurseSigned) {
    contract.status = "active";
    request.status = "active";
    request.updatedAt = now;
  }

  await db.write();
  res.json({ contract, request });
});

export default router;
