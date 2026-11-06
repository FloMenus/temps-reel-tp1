import express from "express";
import { db } from "../db";
import Product from "../../models/Product";

const router = express.Router();

router.get("/products", async (_req, res) => {
  res.json(await db.getData("/products"));
});

router.get("/products/:id", async (req, res) => {
  const product = await db.find<Product>("/products", (p: Product) => p.id === Number(req.params.id));
  if (!product) {
    res.status(404).json({ error: "Produit introuvable" });
    return;
  }
  res.json(product);
});

export default router;
