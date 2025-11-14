import { db } from "../db/index.js";
import { payments } from "../db/schema.js";

export const PaymentModel = {
  async create({ user_id, event_id, amount }) {
    const result = await db.insert(payments).values({
      user_id,
      event_id,
      amount: amount || 0,
      status: "paid",
      payment_date: new Date()
    });
    return { id: result.insertId, user_id, event_id, amount: amount || 0, status: "paid" };
  }
};
