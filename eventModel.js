import { db } from "../db/index.js";
import { events } from "../db/schema.js";
import { eq, lt, desc } from "drizzle-orm";

export const EventModel = {
  async create({ title, description, location, date, price, organizer_id, photos }) {
    const eventDate = date instanceof Date ? date : new Date(date);
    if (isNaN(eventDate)) throw new Error("Invalid date format");

    const priceStr = price == null ? "0" : String(price);
    const organizerIdNum = Number(organizer_id);                  // 👈 cast sûr
    if (!Number.isFinite(organizerIdNum)) throw new Error("Invalid organizer_id");

    const result = await db.insert(events).values({
      title,
      description,
      location,
      date: eventDate,
      price: priceStr,
      organizer_id: organizerIdNum,
      photos: photos ? JSON.stringify(photos) : null,
    });

    // récupère précisément la ligne insérée
    if (result.insertId) {
      const row = await db.select().from(events).where(eq(events.id, result.insertId));
      return row[0] ?? null;
    }

    // fallback: dernier event de cet organizer
    const [row] = await db
      .select()
      .from(events)
      .where(eq(events.organizer_id, organizerIdNum))
      .orderBy(desc(events.id))
      .limit(1);

    return row ?? null;
  },

  async findByOrganizer(organizerId) {
    const idNum = Number(organizerId);                          // 👈 cast sûr
    if (!Number.isFinite(idNum)) return [];
    return db.select().from(events).where(eq(events.organizer_id, idNum)).orderBy(events.date);
  },

  async findAll() {
    await this.deleteExpiredEvents();
    return db.select().from(events).orderBy(events.date);
  },

  async findById(id) {
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) return null;
    const rows = await db.select().from(events).where(eq(events.id, idNum));
    return rows[0] || null;
  },

  async update(id, fields) {
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) throw new Error("Invalid id");
    const patch = { ...fields };
    if (patch.date) {
      const d = patch.date instanceof Date ? patch.date : new Date(patch.date);
      if (isNaN(d)) throw new Error("Invalid date format");
      patch.date = d;
    }
    if (patch.price != null) patch.price = String(patch.price);
    if (patch.organizer_id != null) patch.organizer_id = Number(patch.organizer_id);
    await db.update(events).set(patch).where(eq(events.id, idNum));
    return true;
  },

  async delete(id) {
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) return false;
    await db.delete(events).where(eq(events.id, idNum));
    return true;
  },

  async deleteExpiredEvents() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1);
    await db.delete(events).where(lt(events.date, cutoff));
  },
};
