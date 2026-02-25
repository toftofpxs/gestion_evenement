import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createPayment } from '../controllers/paymentsController.js';
const router = express.Router();
router.post('/', authenticateToken, createPayment);
export default router;
