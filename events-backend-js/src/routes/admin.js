import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
	listEventsSummary,
	listUsers,
	promoteUser,
	demoteUser,
	deleteUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/events-summary", authenticateToken, requireRole('admin'), listEventsSummary);

// Users management
router.get('/users', authenticateToken, requireRole('admin'), listUsers);
router.post('/users/:id/promote', authenticateToken, requireRole('admin'), promoteUser);
router.post('/users/:id/demote', authenticateToken, requireRole('admin'), demoteUser);
router.delete('/users/:id', authenticateToken, requireRole('admin'), deleteUser);

export default router;
