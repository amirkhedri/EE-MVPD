import { Router } from "express";
import { getDb, id } from "../db.js";
import { authMiddleware, requireRole } from "../auth.js";
import { isValidCard } from "../utils.js";

const router = Router();
router.use(authMiddleware);

function getOrCreateWallet(db, userId) {
  let wallet = db.data.wallets.find((w) => w.userId === userId);
  if (!wallet) {
    wallet = { userId, balance: 0 };
    db.data.wallets.push(wallet);
  }
  return wallet;
}

function summarize(db, user) {
  const wallet = getOrCreateWallet(db, user.id);
  const myRequests =
    user.role === "family"
      ? db.data.requests.filter((r) => r.familyId === user.id)
      : db.data.requests.filter((r) => r.nurseId === user.id);

  const escrowLocked = myRequests.reduce((sum, r) => sum + (r.escrowLocked || 0), 0);
  const paidTotal = myRequests.reduce((sum, r) => sum + (r.paidTotal || 0), 0);

  const transactions = db.data.transactions
    .filter((t) => t.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    balance: wallet.balance,
    escrowLocked,
    paidTotal,
    transactions,
  };
}

router.get("/", async (req, res) => {
  const db = await getDb();
  res.json(summarize(db, req.user));
});

router.post("/deposit", requireRole("family"), async (req, res) => {
  const { amount, card } = req.body || {};
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: "Enter a valid deposit amount" });
  }
  const cardError = isValidCard(card || {});
  if (cardError) {
    return res.status(400).json({ error: cardError });
  }

  const db = await getDb();
  const wallet = getOrCreateWallet(db, req.user.id);
  wallet.balance += numericAmount;

  db.data.transactions.push({
    id: id(),
    userId: req.user.id,
    requestId: null,
    type: "deposit",
    amount: numericAmount,
    label: `Card deposit ending in ${String(card.number).replace(/\s+/g, "").slice(-4)}`,
    createdAt: new Date().toISOString(),
  });

  await db.write();
  res.json(summarize(db, req.user));
});

router.post("/fund-escrow", requireRole("family"), async (req, res) => {
  const { requestId, amount } = req.body || {};
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: "Enter a valid amount" });
  }
  const db = await getDb();
  const request = db.data.requests.find((r) => r.id === requestId);
  if (!request || request.familyId !== req.user.id) {
    return res.status(404).json({ error: "Care request not found" });
  }
  if (request.status !== "active") {
    return res.status(400).json({ error: "The contract must be fully signed before funding escrow" });
  }
  const wallet = getOrCreateWallet(db, req.user.id);
  if (wallet.balance < numericAmount) {
    return res.status(400).json({ error: "Insufficient wallet balance — add funds first" });
  }

  wallet.balance -= numericAmount;
  request.escrowLocked = (request.escrowLocked || 0) + numericAmount;
  request.updatedAt = new Date().toISOString();

  db.data.transactions.push({
    id: id(),
    userId: req.user.id,
    requestId,
    type: "escrow_fund",
    amount: numericAmount,
    label: "Escrow funded for care contract",
    createdAt: new Date().toISOString(),
  });

  await db.write();
  res.json(summarize(db, req.user));
});

router.post("/release", requireRole("family"), async (req, res) => {
  const { requestId, amount } = req.body || {};
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: "Enter a valid amount" });
  }
  const db = await getDb();
  const request = db.data.requests.find((r) => r.id === requestId);
  if (!request || request.familyId !== req.user.id) {
    return res.status(404).json({ error: "Care request not found" });
  }
  if ((request.escrowLocked || 0) < numericAmount) {
    return res.status(400).json({ error: "Not enough funds in escrow for this release" });
  }

  request.escrowLocked -= numericAmount;
  request.paidTotal = (request.paidTotal || 0) + numericAmount;
  request.updatedAt = new Date().toISOString();

  const nurseWallet = getOrCreateWallet(db, request.nurseId);
  nurseWallet.balance += numericAmount;

  const now = new Date().toISOString();
  db.data.transactions.push(
    { id: id(), userId: req.user.id, requestId, type: "escrow_release", amount: numericAmount, label: "Milestone payment released to caregiver", createdAt: now },
    { id: id(), userId: request.nurseId, requestId, type: "payout", amount: numericAmount, label: "Milestone payout received", createdAt: now },
  );

  await db.write();
  res.json(summarize(db, req.user));
});

router.post("/withdraw", requireRole("nurse"), async (req, res) => {
  const { amount } = req.body || {};
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: "Enter a valid withdrawal amount" });
  }
  const db = await getDb();
  const wallet = getOrCreateWallet(db, req.user.id);
  if (wallet.balance < numericAmount) {
    return res.status(400).json({ error: "Insufficient available balance" });
  }
  wallet.balance -= numericAmount;

  db.data.transactions.push({
    id: id(),
    userId: req.user.id,
    requestId: null,
    type: "withdrawal",
    amount: numericAmount,
    label: "Withdrawal to bank account",
    createdAt: new Date().toISOString(),
  });

  await db.write();
  res.json(summarize(db, req.user));
});

export default router;
