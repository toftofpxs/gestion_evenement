import { db } from "../db/index.js";
import { users, events, inscriptions, payments } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export const listEventsSummary = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const rows = await db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        location: events.location,
        price: events.price,
        organizer_id: events.organizer_id,
        organizer_name: users.name,
        organizer_email: users.email,
        participantsCount: sql`count(${inscriptions.id})`.mapWith(Number),
      })
      .from(events)
      .leftJoin(users, eq(events.organizer_id, users.id))
      .leftJoin(inscriptions, eq(inscriptions.event_id, events.id))
      .groupBy(events.id, users.id)
      .orderBy(events.date);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/* -------------------- UTILISATEURS ADMIN -------------------- */
export const listUsers = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const rows = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, created_at: users.created_at })
      .from(users)
      .orderBy(users.created_at);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const promoteUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid user id' });

    await db.update(users).set({ role: 'admin' }).where(eq(users.id, id));
    const u = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).where(eq(users.id, id)).then(r=>r[0]);
    res.json(u);
  } catch (err) { next(err); }
};

export const demoteUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid user id' });

    // demote to participant
    await db.update(users).set({ role: 'participant' }).where(eq(users.id, id));
    const u = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).where(eq(users.id, id)).then(r=>r[0]);
    res.json(u);
  } catch (err) { next(err); }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid user id' });

    const target = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, id)).then(r=>r[0]);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin users' });

    // delete user's inscriptions & payments
    await db.delete(inscriptions).where(eq(inscriptions.user_id, id));
    await db.delete(payments).where(eq(payments.user_id, id));

    // delete events organized by user (and related inscriptions/payments)
    const organized = await db.select({ id: events.id }).from(events).where(eq(events.organizer_id, id));
    for (const ev of organized) {
      await db.delete(inscriptions).where(eq(inscriptions.event_id, ev.id));
      await db.delete(payments).where(eq(payments.event_id, ev.id));
    }
    await db.delete(events).where(eq(events.organizer_id, id));

    // finally delete user
    await db.delete(users).where(eq(users.id, id));

    res.status(204).end();
  } catch (err) { next(err); }
};
