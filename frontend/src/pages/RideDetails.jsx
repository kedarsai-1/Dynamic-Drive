// frontend/src/pages/RideDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import RouteMap from "../components/RouteMap";
import { Box, Button, Typography, Paper, Stack, Chip, TextField } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { stripePromise } from "../lib/stripe";

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [seatsToBook, setSeatsToBook] = useState(1);     // ✅ NEW

  const load = () =>
    api.get(`/api/rides/${id}`, { withCredentials: true })
      .then(res => setRide(res.data));

  useEffect(() => { load().catch(console.error); }, [id]);

  /* -----------------------------------------------------
      ✅ Payment → now includes selected seat count
  ------------------------------------------------------*/
  const pay = async () => {
    try {
      const stripe = await stripePromise;

      const totalAmount = ride.price * seatsToBook;     // ✅ multiply by user-selected seats

      const res = await api.post("/api/payments/create-checkout-session", {
        amount: totalAmount,
        rideId: ride._id,
        seats: seatsToBook,
      });

      console.log(res.data);
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed");
    }
  };

  /* -----------------------------------------------------
      ✅ Driver cancel ride
  ------------------------------------------------------*/
  const cancelRide = async () => {
    const reason = prompt("Cancellation reason (optional):") || "Cancelled by driver";
    if (!confirm("Are you sure you want to cancel this ride?")) return;

    try {
      setLoading(true);
      await api.post(`/api/rides/cancel/${ride._id}`, { reason }, { withCredentials: true });
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to cancel ride.");
    } finally {
      setLoading(false);
    }
  };

  if (!ride) return "Loading...";

  const seatsLeft = Math.max(0, ride.seats - ride.bookedSeats);

  const isDriverOwner =
    user?.role === "driver" &&
    String(ride.driver?._id || ride.driver) === String(user._id);

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={700}>
            {ride.fromLocation?.name} → {ride.toLocation?.name}
          </Typography>
          <Chip
            label={ride.status}
            color={
              ride.status === "cancelled" ? "error" :
              ride.status === "full" ? "warning" :
              "success"
            }
            sx={{ textTransform: "capitalize" }}
          />
        </Stack>

        <Typography sx={{ mt: 1 }}>
          Seats left: <b>{seatsLeft}</b> • Price per seat: <b>₹{ride.price}</b>
        </Typography>

        <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
          Date: {new Date(ride.date).toLocaleString()}
        </Typography>

        <Box sx={{ mt: 2 }}>
          {ride?.fromLocation && ride?.toLocation ? (
            <RouteMap from={ride.fromLocation} to={ride.toLocation} />
          ) : (
            <Typography>No map data available</Typography>
          )}
        </Box>

        {/* -----------------------------------------------------
            ✅ Seat Selection (Passengers only)
        ------------------------------------------------------*/}
        {user?.role === "passenger" && ride.status === "available" && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Select Seats</Typography>

            <TextField
              label="Seats"
              type="number"
              value={seatsToBook}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= seatsLeft) setSeatsToBook(val);
              }}
              inputProps={{ min: 1, max: seatsLeft }}
              sx={{ mt: 1, width: 120 }}
            />

            <Typography sx={{ mt: 1, fontWeight: 600 }}>
              Total Price: ₹{ride.price * seatsToBook}
            </Typography>
          </Box>
        )}

        {/* -----------------------------------------------------
            ✅ Action Buttons
        ------------------------------------------------------*/}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>

          {/* ✅ Passenger Book Now */}
          {user?.role === "passenger" && ride.status === "available" && seatsLeft > 0 && (
            <Button variant="contained" onClick={pay}>
              Book Now
            </Button>
          )}

          {/* ✅ Driver cancel */}
          {isDriverOwner && ride.status !== "cancelled" && (
            <Button
              variant="outlined"
              color="error"
              disabled={loading}
              onClick={cancelRide}
            >
              {loading ? "Cancelling..." : "Cancel Ride"}
            </Button>
          )}
        </Stack>

        {ride.status === "cancelled" && (
          <Typography sx={{ mt: 2, color: "error.main" }}>
            Cancelled on {new Date(ride.canceledAt).toLocaleString()}
            {ride.cancelReason ? ` — ${ride.cancelReason}` : ""}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default RideDetails;
