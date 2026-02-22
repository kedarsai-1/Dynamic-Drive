import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import Ride from "../models/Ride.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ---------------------------------------
   CREATE CHECKOUT SESSION
----------------------------------------*/
export const createCheckoutSession = async (req, res) => {
  try {
    const { amount, rideId, seats } = req.body;

    if (!amount || !rideId || !seats) {
      return res.status(400).json({ error: "Missing payment data" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr", // ✅ changed from usd to inr for ₹
            product_data: { name: `Ride Booking - ${seats} seat(s)` },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      metadata: {
        rideId,
        seats: String(seats),
        userId: String(req.user._id), // ✅ pass userId so webhook can add passenger
      },
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("Stripe error:", e);
    res.status(500).json({ error: e.message });
  }
};

/* ---------------------------------------
   STRIPE WEBHOOK
   - Called by Stripe after payment succeeds
   - Adds passenger to the ride
----------------------------------------*/
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // must be raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { rideId, seats, userId } = session.metadata;

    try {
      const ride = await Ride.findById(rideId);
      if (!ride) return res.status(404).json({ error: "Ride not found" });

      // Prevent duplicate passengers
      const alreadyJoined = ride.passengers.some(
        (p) => p.user.toString() === userId
      );

      if (!alreadyJoined) {
        ride.passengers.push({ user: userId, seatsBooked: Number(seats) });
        ride.bookedSeats += Number(seats);
        if (ride.bookedSeats >= ride.seats) ride.status = "full";
        await ride.save();
        console.log(`✅ Passenger ${userId} added to ride ${rideId}`);
      }
    } catch (err) {
      console.error("Error adding passenger:", err);
    }
  }

  res.json({ received: true });
};