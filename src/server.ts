import express from "express";
import cors from "cors";
import usersRoutes from "./api/routes/users";
import productsRoutes from "./api/routes/products";
import ordersRoutes from "./api/routes/orders";
import sseRoutes from "./api/sse";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = Number(process.env.PORT) || 3000;

export const server = app.listen(PORT, () =>
    console.log(`http://localhost:${PORT}`));

app.use("/", usersRoutes);
app.use("/", productsRoutes);
app.use("/", ordersRoutes);
app.use("/", sseRoutes);