import express from "express";
import {
  createRide,
  getRides,
  matchRides,
  joinRide,
  getRideById,
  previewRide,
  rateDriver
} from "../controllers/rideController.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createRide);
router.get("/", auth, getRides);
router.get("/match", auth, matchRides);
router.get("/:id", auth, getRideById);
router.post("/join/:rideId", auth, joinRide);
router.post("/preview", auth, previewRide);

// ⭐ Rating
router.post("/rate/:rideId", auth, rateDriver);

export default router;