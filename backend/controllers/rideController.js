import Ride from "../models/Ride.js";
import axios from "axios";
import mongoose from "mongoose";
import { geocode, routeSummary, calcPrice } from "../utils/ors.js";

/* ---------------------------------------
 ✅ Validate geocoding
----------------------------------------*/
const validateLocation = (geo) => {
  return geo && geo.latitude && geo.longitude;
};

/* ---------------------------------------
 ❌ REMOVE — NO LONGER USING OSM
----------------------------------------*/
// import NodeGeocoder from "node-geocoder";
// const geocoder = NodeGeocoder({ provider: "openstreetmap" });


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

    // ✅ ORS Geocode
    const fromGeo = await geocode(fromLocation);
    const toGeo = await geocode(toLocation);

    if (!validateLocation(fromGeo) || !validateLocation(toGeo))
      return res.status(400).json({ error: "Invalid location(s)" });

    // ✅ ORS routing
    const coords = [
      [fromGeo.longitude, fromGeo.latitude],
      [toGeo.longitude, toGeo.latitude],
    ];

    const { distanceKm, durationMin } = await routeSummary(coords);

    if (!distanceKm)
      return res.status(400).json({ error: "Unable to calculate distance" });

    const price = calcPrice({ distanceKm, durationMin });

    // ✅ Save
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

    return res.json({
      message: "Ride created successfully",
      ride,
    });

  } catch (e) {
    console.error("Create ride error:", e);
    res.status(500).json({
      error: "Server error while creating ride",
      details: e?.message,
    });
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
        .populate("driver passengers.user");
    } else {
      rides = await Ride.find({
        ...queryBase,
        $expr: { $lt: ["$bookedSeats", "$seats"] },
      })
        .sort({ date: 1 })
        .populate("driver passengers.user");
    }

    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ---------------------------------------
 ✅ SEARCH RIDES (match)
----------------------------------------*/
export const matchRides = async (req, res) => {
  try {
    const { from, to, seatsNeeded = 1 } = req.query;

    if (!from || !to)
      return res.status(400).json({ error: "Both FROM and TO required" });

    const rides = await Ride.find({
      "fromLocation.name": { $regex: new RegExp(from, "i") },
      "toLocation.name": { $regex: new RegExp(to, "i") },
      $expr: { $gte: [{ $subtract: ["$seats", "$bookedSeats"] }, Number(seatsNeeded)] },
    }).populate("driver passengers.user");

    return res.json(rides);

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

    const ride = await Ride.findById(id).populate("driver passengers.user");
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    return res.json(ride);

  } catch (err) {
    console.error("Get ride error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


/* ---------------------------------------
 ✅ JOIN RIDE (Passengers only) — seat selection added
----------------------------------------*/
export const joinRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { seats } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(rideId))
      return res.status(400).json({ error: "Invalid Ride ID" });

    if (req.user.role === "driver")
      return res.status(403).json({ error: "Drivers cannot book rides" });

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    if (ride.passengers.some(p => p.user.toString() === userId.toString()))
      return res.status(400).json({ error: "Already joined" });

    if (!seats || seats < 1)
      return res.status(400).json({ error: "Invalid seats" });

    if (ride.bookedSeats + seats > ride.seats)
      return res.status(400).json({ error: "Not enough seats available" });

    // ✅ Store user + seats
    ride.passengers.push({ user: userId, seatsBooked: seats });
    ride.bookedSeats += seats;

    if (ride.bookedSeats >= ride.seats) ride.status = "full";

    await ride.save();
    res.json({ message: "Seats booked", ride });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ---------------------------------------
 ✅ PREVIEW RIDE
----------------------------------------*/
export const previewRide = async (req, res) => {
  try {
    const { fromLocation, toLocation } = req.body;

    if (!fromLocation || !toLocation)
      return res.status(400).json({ error: "Missing locations" });

    // ✅ ORS geocode
    const fromGeo = await geocode(fromLocation);
    const toGeo = await geocode(toLocation);

    if (!validateLocation(fromGeo) || !validateLocation(toGeo))
      return res.status(400).json({ error: "Invalid locations" });

    // ✅ ORS routing
    const coords = [
      [fromGeo.longitude, fromGeo.latitude],
      [toGeo.longitude, toGeo.latitude],
    ];

    const { distanceKm, durationMin } = await routeSummary(coords);
    const price = calcPrice({ distanceKm, durationMin });

    return res.json({
      from: fromGeo.formattedAddress || fromLocation,
      to: toGeo.formattedAddress || toLocation,
      distance: distanceKm.toFixed(2),
      durationMin,
      price,
    });

  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({ error: "Preview failed", details: err.message });
  }
};


/* ---------------------------------------
 ✅ CANCEL RIDE
----------------------------------------*/
export const cancelRide = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (req.user.role !== "driver")
      return res.status(403).json({ error: "Only drivers can cancel rides" });

    const { rideId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(rideId))
      return res.status(400).json({ error: "Invalid Ride ID" });

    const ride = await Ride.findOne({ _id: rideId, driver: req.user._id });
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    if (ride.status === "cancelled")
      return res.status(400).json({ error: "Ride already cancelled" });

    if (ride.date <= new Date())
      return res.status(400).json({ error: "Cannot cancel after departure time" });

    ride.status = "cancelled";
    ride.canceledAt = new Date();
    ride.canceledBy = req.user._id;
    ride.cancelReason = reason || "Cancelled by driver";
    await ride.save();

    res.json({ message: "Ride cancelled", ride });

  } catch (err) {
    console.error("Cancel ride error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


/* ---------------------------------------
 ✅ DRIVER BOOKINGS
----------------------------------------*/
export const getDriverRideBookings = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "driver") {
      return res.status(403).json({ error: "Only drivers allowed" });
    }

    const rides = await Ride.find({ driver: req.user._id })
      .populate("passengers.user", "name email")
      .sort({ date: 1 });

    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
