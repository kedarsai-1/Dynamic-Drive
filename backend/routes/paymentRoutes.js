import express from "express";
import auth from "../middleware/auth.js";
import { createCheckoutSession } from "../controllers/paymentController.js";

const router = express.Router();
// ⚠️ This must be BEFORE express.json() middleware
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
  );

export default router;
