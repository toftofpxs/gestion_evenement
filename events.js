import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import {
  listEvents, getEvent, createEvent, updateEvent, deleteEvent, listMyEvents
} from '../controllers/eventsController.js'

const router = express.Router()

// Public
router.get('/', listEvents)

// ✅ Spécifique avant paramétré
router.get('/mine', authenticateToken, listMyEvents)

// Paramétré ensuite
router.get('/:id', getEvent)

// Création / édition / suppression (auth)
router.post('/', authenticateToken, createEvent)
router.put('/:id', authenticateToken, updateEvent)
router.delete('/:id', authenticateToken, deleteEvent)

export default router
