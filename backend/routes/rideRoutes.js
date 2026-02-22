import express from "express";
import {
  createRide,
  getRides,
  matchRides,
  joinRide,
  getRideById,
  previewRide,
  cancelRide,
  getDriverRideBookings,
  rateDriver,
} from "../controllers/rideController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* -----------------------------
   CREATE / SEARCH
------------------------------*/
router.post("/create", auth, createRide);
router.get("/", auth, getRides);
router.get("/search", auth, matchRides);
router.get("/match", auth, matchRides);
router.post("/preview", auth, previewRide);

/* -----------------------------
   DRIVER ROUTES (MUST COME BEFORE /:id)
------------------------------*/
router.get("/driver/bookings", auth, getDriverRideBookings);
router.post("/cancel/:rideId", auth, cancelRide);
router.post("/rate/:rideId", auth, rateDriver);
router.post("/join/:rideId", auth, joinRide);

/* -----------------------------
   GET BY ID (KEEP LAST)
------------------------------*/
router.get("/:id", auth, getRideById);

export default router;