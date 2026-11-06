import express from "express";
import { db } from "../db";
import { broadcast } from "../sse";
import User from "../../models/User";
import Product from "../../models/Product";
import Order, { Status } from "../../models/Order";

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
  broadcast("stock-updated", { productId, stock: product.stock - quantity });
 
  const order: Order = {
    id: (await db.count("/orders")) + 1,
    userId,
    productId,
    quantity,
    status: "preparing",
    createdAt: new Date().toISOString(),
  };
  await db.push("/orders[]", order);
  broadcast("order-created", order);
  res.status(201).json(order);
});

const transitions: Record<Status, Status[]> = {
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

router.put("/orders/:id/status", async (req, res) => {
  const status: unknown = req.body?.status;
  if (typeof status !== "string") {
    res.status(400).json({ error: "status est obligatoire" });
    return;
  }

  const index = await db.getIndex("/orders", Number(req.params.id), "id");
  if (index === -1) {
    res.status(404).json({ error: "Commande introuvable" });
    return;
  }

  const order = await db.getObject<Order>(`/orders[${index}]`);
  const next = transitions[order.status].find((s) => s === status);
  if (!next) {
    res.status(409).json({ error: `Transition impossible : ${order.status} -> ${status}` });
    return;
  }

  if (next === "cancelled") {
    const productIndex = await db.getIndex("/products", order.productId, "id");
    const stock = await db.getObject<number>(`/products[${productIndex}]/stock`);
    await db.push(`/products[${productIndex}]/stock`, stock + order.quantity);
    broadcast("stock-updated", { productId: order.productId, stock: stock + order.quantity });
  }

  await db.push(`/orders[${index}]/status`, next);
  if (next === "shipped") scheduleDelivery(order.id);
  broadcast(next === "cancelled" ? "order-cancelled" : "order-status", { ...order, status: next });
  res.json({ ...order, status: next });
});

function scheduleDelivery(orderId: number): void {
  setTimeout(async () => {
    const index = await db.getIndex("/orders", orderId, "id");
    const order = await db.getObject<Order>(`/orders[${index}]`);
    if (order.status !== "shipped") return;
    await db.push(`/orders[${index}]/status`, "delivered");
    broadcast("order-status", { ...order, status: "delivered" });
  }, 20000);
}

db.filter<Order>("/orders", (o: Order) => o.status === "shipped").then((orders) =>
  orders?.forEach((o) => scheduleDelivery(o.id)));

export default router;
