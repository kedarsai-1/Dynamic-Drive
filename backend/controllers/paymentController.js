import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
console.log("Stripe Key: ", process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
            currency: "usd",
            product_data: { name: `Ride Booking - ${seats} seats` },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      metadata: {
        rideId,
        seats,
      },
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("Stripe error:", e);
    res.status(500).json({ error: e.message });
  }
};
