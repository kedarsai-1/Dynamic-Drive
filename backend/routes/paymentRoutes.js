import express from "express";
import auth from "../middleware/auth.js";
import { createCheckoutSession, stripeWebhook } from "../controllers/paymentController.js";

const router = express.Router();

// ✅ Webhook MUST come first and use raw body (before any JSON parsing)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

router.post("/create-checkout-session", auth, createCheckoutSession);

export default router;