import User from "./User";
import Product from "./Product";

export type Status = "preparing" | "shipped" | "delivered" | "cancelled";

type Order = {
  id: number;
  userId: User["id"];
  productId: Product["id"];
  quantity: number;
  status: Status;
  createdAt: string;
};

export default Order;
