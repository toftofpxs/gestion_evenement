// src/controllers/inscriptionsController.js
import { InscriptionModel } from "../models/InscriptionModel.js";
import { EventModel } from "../models/eventModel.js";
import { db } from "../db/index.js";
import { users, inscriptions } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

/**
 * POST /api/inscriptions
 * body: { event_id }
 * nécessite authenticateToken
 */
export const createInscription = async (req, res, next) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.id;

    if (req.user.role !== "admin") {
      await db
        .update(users)
        .set({ role: "participant" })
        .where(eq(users.id, Number(user_id)));
    }

    if (!event_id) {
      return res.status(400).json({ message: "event_id requis" });
    }

    const event = await EventModel.findById(Number(event_id));
    if (!event) return res.status(404).json({ message: "Event not found" });

    const cap = Number(event.capacity)
    if (!Number.isFinite(cap) || cap <= 0) {
      return res.status(400).json({ message: "Event capacity is not configured" })
    }
    const capLimit = cap
    const countRow = await db
      .select({ count: sql`count(${inscriptions.id})`.mapWith(Number) })
      .from(inscriptions)
      .where(eq(inscriptions.event_id, Number(event_id)))
      .then((rows) => rows[0])

    const currentCount = Number(countRow?.count || 0)
    if (currentCount >= capLimit) {
      return res.status(400).json({ message: "Event is full" })
    }

    // (optionnel) empêcher inscription sur event passé
    const eventDate = new Date(event.date);
    if (isNaN(eventDate)) {
      return res.status(400).json({ message: "Event date invalid" });
    }
    if (eventDate < new Date()) {
      return res.status(400).json({ message: "Event already finished" });
    }

    // (optionnel) empêcher doublons
    const already = await InscriptionModel.findByUserAndEvent(user_id, Number(event_id));
    if (already) {
      return res.status(409).json({ message: "Already registered" });
    }

    const newInscription = await InscriptionModel.create({ user_id, event_id: Number(event_id) });
    res.json(newInscription);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/inscriptions/me
 * retourne { enCours: [...], passes: [...] }
 * nécessite authenticateToken
 */
export const getUserInscriptions = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const inscriptions = await InscriptionModel.findByUser(user_id);

    const now = new Date();

    // enrichir chaque inscription avec l'event
    const enriched = await Promise.all(
      inscriptions.map(async (ins) => {
        const ev = await EventModel.findById(Number(ins.event_id));
        if (!ev) return null;
        const evDate = new Date(ev.date);
        const status = evDate >= now ? "à venir" : "passé";
        return {
          ...ins,
          event: ev,
          status,
        };
      })
    );

    const filtered = enriched.filter(Boolean);
    const enCours = filtered.filter((i) => i.status === "à venir");
    const passes = filtered.filter((i) => i.status === "passé");

    res.json({ enCours, passes });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/inscriptions/:id
 * supprime l'inscription par son id (appartenance vérifiée)
 * nécessite authenticateToken
 */
export const cancelInscription = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user_id = req.user.id;

    if (!id) return res.status(400).json({ message: "Invalid inscription id" });

    const inscription = await InscriptionModel.findByIdAndUser(id, user_id);
    if (!inscription) return res.status(404).json({ message: "Inscription not found" });

    await InscriptionModel.delete(id);
    res.json({ message: "Désinscription effectuée" });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/inscriptions/by-event/:eventId
 * supprime l'inscription du user courant pour cet event
 * nécessite authenticateToken
 */
export const cancelByEvent = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const eventId = Number(req.params.eventId);
    if (!eventId) return res.status(400).json({ message: "Invalid event id" });

    const ins = await InscriptionModel.findByUserAndEvent(user_id, eventId);
    if (!ins) return res.status(404).json({ message: "Inscription not found" });

    await InscriptionModel.delete(ins.id);
    res.json({ message: "Désinscription effectuée" });
  } catch (err) {
    next(err);
  }
};
