import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import geocodeRoutes from "./routes/geocodeRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

// 🔥 ENV + DB
dotenv.config();
connectDB();

const app = express();

// ⭐ Path helpers (for React build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../frontend/dist");

// ⭐ CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "http://localhost:5173",
        "https://dynamic-drive.onrender.com",
        "https://dynamic-drive-1.onrender.com",
      ];

      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ ROUTES
import authRoutes from "./routes/authRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/geocode", geocodeRoutes);
app.use("/api/location", locationRoutes);

// ⭐ Serve React build (VERY IMPORTANT — AFTER API ROUTES)
app.use(express.static(frontendPath));

// SPA fallback — allows refresh on /ride/:id, /payment-success
app.get("/*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));