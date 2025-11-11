import express from "express";
import auth from "../middleware/auth.js";
import { createCheckoutSession } from "../controllers/paymentController.js";

const router = express.Router();
router.post("/create-checkout-session", auth, createCheckoutSession);

export default router;
