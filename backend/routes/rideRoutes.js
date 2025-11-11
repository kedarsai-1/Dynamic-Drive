// backend/routes/rideRoutes.js
import express from "express";
import {
  createRide,
  getRides,
  matchRides,
  joinRide,
  getRideById,
  previewRide,
  cancelRide,   
  getDriverRideBookings     // <-- add
} from "../controllers/rideController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createRide);
router.get("/", auth, getRides);
router.get("/search", auth, matchRides);
router.get("/match", auth, matchRides);
router.get("/:id", auth, getRideById);
router.post("/join/:rideId", auth, joinRide);
router.post("/preview", auth, previewRide);
router.get("/driver/bookings", auth, getDriverRideBookings);



// 🆕 Cancel ride (driver only; controller validates role)
router.post("/cancel/:rideId", auth, cancelRide);

export default router;
