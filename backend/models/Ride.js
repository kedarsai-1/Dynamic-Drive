import mongoose from "mongoose";

const RideSchema = new mongoose.Schema({
  fromLocation: {
    name: String,
    lat: Number,
    lng: Number
  },
  toLocation: {
    name: String,
    lat: Number,
    lng: Number
  },

  date: { type: Date, default: Date.now },

  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },

  price: Number,

  status: {
    type: String,
    enum: ["available", "full", "cancelled", "completed"],
    default: "available"
  },

  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
passengers: [
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    seatsBooked: Number,
  }
],

});

const Ride = mongoose.model("Ride", RideSchema);
export default Ride;
