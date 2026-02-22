import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { stripeWebhook } from "./controllers/paymentController.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dynamic-drive-2.onrender.com",
    ],
    credentials: true,
  })
);

// ✅ Stripe webhook MUST be before express.json()
// Stripe needs the raw body to verify the signature
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ✅ JSON middleware for all other routes
app.use(express.json());
app.use(cookieParser());

import authRoutes from "./routes/authRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import geocodeRoutes from "./routes/geocodeRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/geocode", geocodeRoutes);
app.use("/api/location", locationRoutes);

app.get("/", (req, res) => res.send("API OK"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));