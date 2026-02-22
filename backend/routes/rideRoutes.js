import express from "express";
import {
  createRide,
  getRides,
  matchRides,
  joinRide,
  getRideById,
  previewRide,
  cancelRide,
  rateDriver
} from "../controllers/rideController.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createRide);
router.get("/match", auth, matchRides);   // ✅ before /:id
router.post("/preview", auth, previewRide); // ✅ before /:id
router.post("/join/:rideId", auth, joinRide);
router.post("/cancel/:rideId", auth, cancelRide);
router.post("/rate/:rideId", auth, rateDriver);
router.get("/", auth, getRides);
router.get("/:id", auth, getRideById);    // ✅ always last

export default router;