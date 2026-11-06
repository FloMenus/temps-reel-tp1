import express from "express";
import { db } from "../db";
import User from "../../models/User";
import Product from "../../models/Product";
import Order from "../../models/Order";

const router = express.Router();

const isPositiveInteger = (n: unknown): n is number => Number.isInteger(n) && Number(n) > 0;

router.get("/orders", async (_req, res) => {
  res.json(await db.getData("/orders"));
});

router.get("/orders/:id", async (req, res) => {
  const order = await db.find<Order>("/orders", (o: Order) => o.id === Number(req.params.id));
  if (!order) {
    res.status(404).json({ error: "Commande introuvable" });
    return;
  }
  res.json(order);
});

router.post("/orders", async (req, res) => {
  const { userId, productId, quantity }: Record<string, unknown> = req.body ?? {};
  if (!isPositiveInteger(userId) || !isPositiveInteger(productId) || !isPositiveInteger(quantity)) {
    res.status(400).json({ error: "userId, productId et quantity doivent être des entiers positifs" });
    return;
  }

  const user = await db.find<User>("/users", (u: User) => u.id === userId);
  const products = await db.getObject<Product[]>("/products");
  const index = products.findIndex((p) => p.id === productId);
  const product = products[index];
  if (!user || !product) {
    res.status(404).json({ error: "Client ou produit introuvable" });
    return;
  }
  if (product.stock < quantity) {
    res.status(409).json({ error: "Stock insuffisant" });
    return;
  }

  await db.push(`/products[${index}]/stock`, product.stock - quantity);
 
  const order: Order = {
    id: (await db.count("/orders")) + 1,
    userId,
    productId,
    quantity,
    status: "preparing",
    createdAt: new Date().toISOString(),
  };
  await db.push("/orders[]", order);
  res.status(201).json(order);
});

export default router;
