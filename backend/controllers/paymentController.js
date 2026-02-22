import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
console.log("Stripe Key: ", process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { rideId, seats } = session.metadata;

    const ride = await Ride.findById(rideId);
    const userId = session.metadata.userId; // ⚠️ see below

    if (ride && userId) {
      const alreadyJoined = ride.passengers.some(
        (p) => p.user.toString() === userId
      );
      if (!alreadyJoined) {
        ride.passengers.push({ user: userId, seatsBooked: Number(seats) });
        ride.bookedSeats += Number(seats);
        if (ride.bookedSeats >= ride.seats) ride.status = "full";
        await ride.save();
      }
    }
  }

  res.json({ received: true });
};