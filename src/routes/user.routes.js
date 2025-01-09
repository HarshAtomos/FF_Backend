import express from "express";
import {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);

export default router;