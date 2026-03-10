import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
	listEventsSummary,
	listAllEvents,
	listUsers,
	promoteUser,
	demoteUser,
	setUserOrganizer,
	setUserParticipant,
	updateUserName,
	deleteUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/events-summary", authenticateToken, requireRole('admin'), listEventsSummary);
router.get('/events-all', authenticateToken, requireRole('admin'), listAllEvents);

// Users management
router.get('/users', authenticateToken, requireRole('admin'), listUsers);
router.post('/users/:id/promote', authenticateToken, requireRole('admin'), promoteUser);
router.post('/users/:id/demote', authenticateToken, requireRole('admin'), demoteUser);
router.post('/users/:id/set-organizer', authenticateToken, requireRole('admin'), setUserOrganizer);
router.post('/users/:id/set-participant', authenticateToken, requireRole('admin'), setUserParticipant);
router.patch('/users/:id/name', authenticateToken, requireRole('admin'), updateUserName);
router.delete('/users/:id', authenticateToken, requireRole('admin'), deleteUser);

export default router;
