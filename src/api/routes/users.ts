import express from "express";
import { db } from "../db";
import User from "../../models/User";

const router = express.Router();

router.get("/users", async (_req, res) => {
  res.json(await db.getData("/users"));
});

router.get("/users/:id", async (req, res) => {
  const user = await db.find<User>("/users", (u: User) => u.id === Number(req.params.id));
  if (!user) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }
  res.json(user);
});

export default router;
