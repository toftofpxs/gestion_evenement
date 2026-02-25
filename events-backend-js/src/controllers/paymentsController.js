import { PaymentModel } from "../models/paymentModel.js";
import { EventModel } from "../models/eventModel.js";

export const createPayment = async (req, res, next) => {
  try {
    const { event_id, amount } = req.body;
    const user_id = req.user.id;

    const event = await EventModel.findById(event_id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const payment = await PaymentModel.create({ user_id, event_id, amount });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};
