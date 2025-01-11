import express from "express";
import { activityLogs } from "../controllers/profile.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/activity-logs", authenticateToken, activityLogs);

export default router;
