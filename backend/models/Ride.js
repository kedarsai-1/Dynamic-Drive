import mongoose from "mongoose";

const RideSchema = new mongoose.Schema({
  fromLocation: { name: String, lat: Number, lng: Number },
  toLocation:   { name: String, lat: Number, lng: Number },
  waypoints:    [{ name: String, lat: Number, lng: Number }],   // ✅ multi-stop
  distance:     String,  // km string
  durationMin:  Number,  // ✅ duration (minutes)
  price:        Number,
  seats:        Number,
  bookedSeats:  { type: Number, default: 0 },
  status:       { type: String, default: "available" },
  date:         Date,
  driver:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  passengers:   [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, seatsBooked: Number }],
  revenue:      { type: Number, default: 0 }, // ✅ driver earnings
  cancelReason: String,
  canceledAt:   Date,
  canceledBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export default mongoose.model("Ride", RideSchema);
