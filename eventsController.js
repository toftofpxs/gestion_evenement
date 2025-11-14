// src/controllers/eventsController.js
import { EventModel } from "../models/eventModel.js";

/* -------------------- Lister tous les événements publics -------------------- */
export const listEvents = async (req, res, next) => {
  try {
    const events = await EventModel.findAll();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

/* -------------------- Récupérer un événement par ID -------------------- */
export const getEvent = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const event = await EventModel.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

/* -------------------- Créer un événement -------------------- */
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, location, date, price, photos } = req.body;
    const organizer_id = req.user.id;

    // Validation de la date
    const eventDate = date instanceof Date ? date : new Date(date);
    if (isNaN(eventDate)) return res.status(400).json({ message: "Invalid date format" });

    const newEvent = await EventModel.create({
      title,
      description,
      location,
      date: eventDate,
      price,
      organizer_id,
      photos,
    });

    res.json(newEvent);
  } catch (err) {
    next(err);
  }
};

/* -------------------- Mettre à jour un événement -------------------- */
export const updateEvent = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const fields = req.body;

    const event = await EventModel.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (req.user.role !== "admin" && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await EventModel.update(id, fields);
    res.json({ message: "Updated" });
  } catch (err) {
    next(err);
  }
};

/* -------------------- Supprimer un événement -------------------- */
export const deleteEvent = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid event id' });

    const event = await EventModel.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Seul le créateur ou un admin peut supprimer
    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    await EventModel.delete(id);
    return res.status(204).end(); // ou res.json({ message: 'Deleted' })
  } catch (err) { next(err); }
};


/* -------------------- Lister mes événements (organisateur/admin) -------------------- */
export const listMyEvents = async (req, res, next) => {
  try {
    const organizerId = Number(req.user.id);          // 👈 force en number
    if (Number.isNaN(organizerId)) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const rows = await EventModel.findByOrganizer(organizerId);
    res.json(rows);
  } catch (err) { next(err); }
};
