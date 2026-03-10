import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { requireRole } from '../middleware/roles.js'
import { UserModel } from '../models/userModel.js'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq, sql } from 'drizzle-orm'

const router = express.Router()
const USERNAME_REGEX = /^[A-Za-z0-9]+$/

// ----- routes fixes d'abord -----
// Mon profil
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const u = await UserModel.findById(Number(req.user.id))
    if (!u) return res.status(404).json({ message: 'User not found' })
    const { id, name, email, role, created_at } = u
    res.json({ id, name, email, role, created_at })
  } catch (e) { next(e) }
})

// Mettre à jour mon profil (changer le pseudo)
router.put('/me', authenticateToken, async (req, res, next) => {
  try {
    const id = Number(req.user.id)
    if (Number.isNaN(id)) return res.status(401).json({ message: 'Not authenticated' })

    const { name } = req.body
    const normalizedName = typeof name === 'string' ? name.trim() : ''

    if (!normalizedName) {
      return res.status(400).json({ message: 'Name is required' })
    }

    if (!USERNAME_REGEX.test(normalizedName)) {
      return res.status(400).json({ message: 'Username must contain only letters and numbers' })
    }

    const existingName = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`LOWER(${users.name}) = LOWER(${normalizedName}) AND ${users.id} <> ${id}`)
      .then(rows => rows[0])

    if (existingName) {
      return res.status(400).json({ message: 'Username already used' })
    }

    await db.update(users).set({ name: normalizedName }).where(eq(users.id, id))
    const updated = await UserModel.findById(id)
    res.json(updated)
  } catch (e) { next(e) }
})

// Liste de tous les utilisateurs (ADMIN uniquement)
router.get('/', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    const rows = await UserModel.findAll()
    // on ne renvoie pas password_hash
    const safe = rows.map(u => ({
      id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at
    }))
    res.json(safe)
  } catch (e) { next(e) }
})

// ----- routes paramétrées ensuite -----
// Détail d’un user (ADMIN)
router.get('/:id', authenticateToken, requireRole('admin'), async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid user id' })
    const u = await UserModel.findById(id)
    if (!u) return res.status(404).json({ message: 'User not found' })
    const { name, email, role, created_at } = u
    res.json({ id, name, email, role, created_at })
  } catch (e) { next(e) }
})

export default router
