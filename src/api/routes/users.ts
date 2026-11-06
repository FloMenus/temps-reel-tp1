import express from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, streamUsers } from "../controllers/usersController";

const router = express.Router();

router.get("/users/stream", streamUsers);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
