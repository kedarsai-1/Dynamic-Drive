import Ride from "../models/Ride.js";
import User from "../models/User.js"; // ⭐ NEW
import mongoose from "mongoose";
import { geocode, routeSummary, calcPrice } from "../utils/ors.js";

/* ---------------------------------------
 ✅ Validate geocoding
----------------------------------------*/
const validateLocation = (geo) => {
  return geo && geo.latitude && geo.longitude;
};

/* ---------------------------------------
 ✅ CREATE RIDE (Only Drivers)
----------------------------------------*/
export const createRide = async (req, res) => {
  try {
    const { fromLocation, toLocation, seats, date } = req.body;

    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (req.user.role !== "driver")
      return res.status(403).json({ error: "Only drivers can create rides" });

    if (!fromLocation || !toLocation || !seats || !date)
      return res.status(400).json({ error: "All fields are required" });

    const rideDate = new Date(date);
    if (rideDate <= new Date())
      return res.status(400).json({ error: "Ride date must be in the future" });

    if (isNaN(seats) || seats < 1 || seats > 10)
      return res.status(400).json({ error: "Seats must be between 1–10" });

    const fromGeo = await geocode(fromLocation);
    const toGeo = await geocode(toLocation);

    if (!validateLocation(fromGeo) || !validateLocation(toGeo))
      return res.status(400).json({ error: "Invalid location(s)" });

    const coords = [
      [fromGeo.longitude, fromGeo.latitude],
      [toGeo.longitude, toGeo.latitude],
    ];

    const { distanceKm, durationMin } = await routeSummary(coords);

    const price = calcPrice({ distanceKm, durationMin });

    const ride = await Ride.create({
      fromLocation: {
        name: fromGeo.formattedAddress || fromLocation,
        lat: fromGeo.latitude,
        lng: fromGeo.longitude,
      },
      toLocation: {
        name: toGeo.formattedAddress || toLocation,
        lat: toGeo.latitude,
        lng: toGeo.longitude,
      },
      seats,
      bookedSeats: 0,
      price,
      distance: distanceKm.toFixed(2),
      durationMin,
      driver: req.user._id,
      date: rideDate,
      passengers: [],
      status: "available",
    });

    return res.json({ message: "Ride created successfully", ride });

  } catch (e) {
    console.error("Create ride error:", e);
    res.status(500).json({ error: "Server error while creating ride" });
  }
};

/* ---------------------------------------
 ✅ GET ALL RIDES
----------------------------------------*/
export const getRides = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    let queryBase = { status: { $ne: "cancelled" } };
    let rides;

    if (req.user.role === "driver") {
      rides = await Ride.find({ ...queryBase, driver: req.user._id })
        .sort({ date: 1 })
        .populate("driver", "name avgRating totalRatings") // ⭐ UPDATED
        .populate("passengers.user", "name email");
    } else {
      rides = await Ride.find({
        ...queryBase,
        $expr: { $lt: ["$bookedSeats", "$seats"] },
      })
        .sort({ date: 1 })
        .populate("driver", "name avgRating totalRatings")
        .populate("passengers.user", "name email");
    }

    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------
 ✅ SEARCH RIDES
----------------------------------------*/
export const matchRides = async (req, res) => {
  try {
    const { from, to, seatsNeeded = 1, minRating = 0 } = req.query;

    if (!from || !to)
      return res.status(400).json({ error: "Both FROM and TO required" });

    const rides = await Ride.find({
      "fromLocation.name": { $regex: new RegExp(from, "i") },
      "toLocation.name": { $regex: new RegExp(to, "i") },
      $expr: {
        $gte: [
          { $subtract: ["$seats", "$bookedSeats"] },
          Number(seatsNeeded),
        ],
      },
    })
      .populate({
        path: "driver",
        select: "name avgRating totalRatings",
        match: { avgRating: { $gte: Number(minRating) } }, // ⭐ FILTER
      })
      .populate("passengers.user", "name email");

    // ⭐ remove rides where driver doesn't match rating
    const filtered = rides.filter((r) => r.driver !== null);

    return res.json(filtered);

  } catch (err) {
    console.error("Match ride error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------------------------
 ✅ GET RIDE BY ID
----------------------------------------*/
export const getRideById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid Ride ID" });

    const ride = await Ride.findById(id)
      .populate("driver", "name avgRating totalRatings")
      .populate("passengers.user", "name email");

    if (!ride) return res.status(404).json({ error: "Ride not found" });

    return res.json(ride);

  } catch (err) {
    console.error("Get ride error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ---------------------------------------
 ⭐ RATE DRIVER (NEW)
----------------------------------------*/
export const rateDriver = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { rating, review } = req.body;
    const passengerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(rideId))
      return res.status(400).json({ error: "Invalid Ride ID" });

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: "Rating must be 1–5" });

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    if (req.user.role === "driver")
      return res.status(403).json({ error: "Drivers cannot rate" });

    const isPassenger = ride.passengers.some(
      (p) => p.user.toString() === passengerId.toString()
    );

    if (!isPassenger)
      return res.status(403).json({ error: "Not part of this ride" });

    const driver = await User.findById(ride.driver);

    const alreadyRated = driver.ratings.some(
      (r) =>
        r.ride.toString() === rideId &&
        r.passenger.toString() === passengerId.toString()
    );

    if (alreadyRated)
      return res.status(400).json({ error: "Already rated this driver" });

    driver.ratings.push({
      ride: rideId,
      passenger: passengerId,
      rating,
      review,
    });

    driver.totalRatings += 1;

    const total = driver.ratings.reduce((a, r) => a + r.rating, 0);
    driver.avgRating = total / driver.totalRatings;

    await driver.save();

    res.json({ message: "Driver rated successfully" });

  } catch (err) {
    console.error("Rate driver error:", err);
    res.status(500).json({ error: "Server error" });
  }
};