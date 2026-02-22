import Ride from "../models/Ride.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { geocode, routeSummary, calcPrice } from "../utils/ors.js";

/* ---------------------------------------
   Helper
----------------------------------------*/
const validateLocation = (geo) => geo && geo.latitude && geo.longitude;

/* ---------------------------------------
   CREATE RIDE
----------------------------------------*/
export const createRide = async (req, res) => {
  try {
    const { fromLocation, toLocation, seats, date } = req.body;

    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (req.user.role !== "driver")
      return res.status(403).json({ error: "Only drivers can create rides" });

    const rideDate = new Date(date);
    if (rideDate <= new Date())
      return res.status(400).json({ error: "Ride date must be in future" });

    const fromGeo = await geocode(fromLocation);
    const toGeo = await geocode(toLocation);

    if (!validateLocation(fromGeo) || !validateLocation(toGeo))
      return res.status(400).json({ error: "Invalid locations" });

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

    res.json({ message: "Ride created", ride });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Create ride failed" });
  }
};

/* ---------------------------------------
   GET RIDES
----------------------------------------*/
export const getRides = async (req, res) => {
  try {
    let queryBase = { status: { $ne: "cancelled" } };

    let rides;

    if (req.user.role === "driver") {
      rides = await Ride.find({ ...queryBase, driver: req.user._id })
        .populate("driver", "name avgRating totalRatings")
        .populate("passengers.user", "name email");
    } else {
      rides = await Ride.find({
        ...queryBase,
        $expr: { $lt: ["$bookedSeats", "$seats"] },
      })
        .populate("driver", "name avgRating totalRatings")
        .populate("passengers.user", "name email");
    }

    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------
   MATCH RIDES + RATING FILTER ⭐
----------------------------------------*/
export const matchRides = async (req, res) => {
  try {
    const { from, to, seatsNeeded = 1, minRating = 0 } = req.query;

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
        match: { avgRating: { $gte: Number(minRating) } },
      })
      .populate("passengers.user", "name email");

    const filtered = rides.filter((r) => r.driver !== null);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Match failed" });
  }
};

/* ---------------------------------------
   GET BY ID
----------------------------------------*/
export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("driver", "name avgRating totalRatings")
      .populate("passengers.user", "name email");

    res.json(ride);
  } catch {
    res.status(500).json({ error: "Fetch failed" });
  }
};

/* ---------------------------------------
   JOIN RIDE
----------------------------------------*/
export const joinRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { seats } = req.body;
    const userId = req.user._id;

    const ride = await Ride.findById(rideId);

    if (ride.passengers.some(p => p.user.toString() === userId.toString()))
      return res.status(400).json({ error: "Already joined" });

    if (ride.bookedSeats + seats > ride.seats)
      return res.status(400).json({ error: "Not enough seats" });

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
   PREVIEW RIDE
----------------------------------------*/
export const previewRide = async (req, res) => {
  try {
    const { fromLocation, toLocation } = req.body;

    const fromGeo = await geocode(fromLocation);
    const toGeo = await geocode(toLocation);

    const coords = [
      [fromGeo.longitude, fromGeo.latitude],
      [toGeo.longitude, toGeo.latitude],
    ];

    const { distanceKm, durationMin } = await routeSummary(coords);
    const price = calcPrice({ distanceKm, durationMin });

    res.json({ distanceKm, durationMin, price });
  } catch {
    res.status(500).json({ error: "Preview failed" });
  }
};

/* ---------------------------------------
   CANCEL RIDE
----------------------------------------*/
export const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      _id: req.params.rideId,
      driver: req.user._id,
    });

    ride.status = "cancelled";
    ride.canceledAt = new Date();
    await ride.save();

    res.json({ message: "Ride cancelled" });
  } catch {
    res.status(500).json({ error: "Cancel failed" });
  }
};

/* ---------------------------------------
   DRIVER BOOKINGS
----------------------------------------*/
export const getDriverRideBookings = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .populate("passengers.user", "name email");

    res.json(rides);
  } catch {
    res.status(500).json({ error: "Fetch failed" });
  }
};

/* ---------------------------------------
   ⭐ RATE DRIVER
----------------------------------------*/
export const rateDriver = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { rating, review } = req.body;

    const ride = await Ride.findById(rideId);

    const driver = await User.findById(ride.driver);

    driver.ratings.push({
      ride: rideId,
      passenger: req.user._id,
      rating,
      review,
    });

    driver.totalRatings += 1;
    const total = driver.ratings.reduce((a, r) => a + r.rating, 0);
    driver.avgRating = total / driver.totalRatings;

    await driver.save();

    res.json({ message: "Driver rated" });
  } catch {
    res.status(500).json({ error: "Rating failed" });
  }
};