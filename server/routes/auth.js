import { Router } from "express";
import bcrypt from "bcryptjs";
import { getDb, id } from "../db.js";
import { signToken } from "../auth.js";
import { publicUser } from "../utils.js";
import { authMiddleware } from "../auth.js";

const router = Router();

router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !["family", "nurse"].includes(role)) {
    return res.status(400).json({ error: "Name, email, password, and a valid role (family or nurse) are required" });
  }
  const db = await getDb();
  const existing = db.data.users.find((u) => u.email === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const user = {
    id: id(),
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    createdAt: new Date().toISOString(),
  };
  db.data.users.push(user);
  db.data.wallets.push({ userId: user.id, balance: role === "family" ? 300 : 0 });

  if (role === "nurse") {
    db.data.nurseProfiles.push({
      userId: user.id,
      bio: "New caregiver on CareLink — profile details coming soon.",
      tags: [],
      languages: ["English"],
      hourlyRate: 22,
      yearsExperience: 1,
      verified: false,
      rating: 0,
    });
  }

  await db.write();

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const db = await getDb();
  const user = db.data.users.find((u) => u.email === String(email).toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get("/me", authMiddleware, async (req, res) => {
  const db = await getDb();
  const user = db.data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

export default router;
