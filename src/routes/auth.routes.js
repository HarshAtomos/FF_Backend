import express from "express";
import {
  login,
  create,
  logout,
  createRoles,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-roles", authenticateToken, createRoles);
router.post("/create", authenticateToken, create);
router.post("/login", login);
router.delete("/logout", authenticateToken, logout);

export default router;
