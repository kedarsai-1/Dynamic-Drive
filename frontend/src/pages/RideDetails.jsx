// frontend/src/pages/RideDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import RouteMap from "../components/RouteMap";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  TextField,
} from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { stripePromise } from "../lib/stripe";

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [seatsToBook, setSeatsToBook] = useState(1);

  const load = () =>
    api
      .get(`/api/rides/${id}`, { withCredentials: true })
      .then((res) => setRide(res.data));

  useEffect(() => {
    load().catch(console.error);
  }, [id]);

  /* -----------------------------------------------------
      PAYMENT
  ------------------------------------------------------*/
  const pay = async () => {
    try {
      const stripe = await stripePromise;

      const totalAmount = ride.price * seatsToBook;

      const res = await api.post(
        "/api/payments/create-checkout-session",
        {
          amount: totalAmount,
          rideId: ride._id,
          seats: seatsToBook,
        }
      );

      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed");
    }
  };

  /* -----------------------------------------------------
      DRIVER CANCEL
  ------------------------------------------------------*/
  const cancelRide = async () => {
    const reason =
      prompt("Cancellation reason (optional):") || "Cancelled by driver";

    if (!confirm("Are you sure you want to cancel this ride?")) return;

    try {
      setLoading(true);
      await api.post(
        `/api/rides/cancel/${ride._id}`,
        { reason },
        { withCredentials: true }
      );
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F7FA", px: 2, py: 4 }}>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: "18px" }}>
          {/* HEADER */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography variant="h4" fontWeight={800}>
              {ride.fromLocation?.name} → {ride.toLocation?.name}
            </Typography>

            <Chip
              label={ride.status}
              color={
                ride.status === "cancelled"
                  ? "error"
                  : ride.status === "full"
                  ? "warning"
                  : "success"
              }
              sx={{ textTransform: "capitalize", fontWeight: 600 }}
            />
          </Stack>

          {/* ⭐ DRIVER CARD (NEW) */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: "14px",
              bgcolor: "#F7FAFC",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Avatar */}
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                bgcolor: "#E5F6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#00AFF5",
                fontSize: 18,
              }}
            >
              {ride.driver?.name?.charAt(0) || "D"}
            </Box>

            {/* Driver Info */}
            <Box>
              <Typography fontWeight={700}>
                {ride.driver?.name || "Driver"}
              </Typography>

              <Typography sx={{ fontSize: 13, color: "#555" }}>
                ⭐ {ride.driver?.avgRating?.toFixed(1) || "New"} (
                {ride.driver?.totalRatings || 0} ratings)
              </Typography>
            </Box>
          </Box>

          {/* RIDE INFO */}
          <Box
            sx={{
              mt: 2,
              bgcolor: "#F8FAFC",
              borderRadius: "12px",
              p: 2,
            }}
          >
            <Typography>
              Seats left: <b>{seatsLeft}</b>
            </Typography>

            <Typography>
              Price per seat: <b>₹{ride.price}</b>
            </Typography>

            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
              Date: {new Date(ride.date).toLocaleString()}
            </Typography>
          </Box>

          {/* MAP */}
          <Box sx={{ mt: 3, borderRadius: "12px", overflow: "hidden" }}>
            {ride?.fromLocation && ride?.toLocation ? (
              <RouteMap from={ride.fromLocation} to={ride.toLocation} />
            ) : (
              <Typography>No map data available</Typography>
            )}
          </Box>

          {/* PASSENGER SEAT SELECT */}
          {user?.role === "passenger" && ride.status === "available" && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "#F8FAFC",
                borderRadius: "12px",
              }}
            >
              <Typography fontWeight={700}>Select seats</Typography>

              <TextField
                label="Seats"
                type="number"
                value={seatsToBook}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= seatsLeft) setSeatsToBook(val);
                }}
                inputProps={{ min: 1, max: seatsLeft }}
                sx={{ mt: 1, width: 140 }}
              />

              <Typography sx={{ mt: 1.5, fontWeight: 700 }}>
                Total: ₹{ride.price * seatsToBook}
              </Typography>
            </Box>
          )}

          {/* ACTION BUTTONS */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            {user?.role === "passenger" &&
              ride.status === "available" &&
              seatsLeft > 0 && (
                <Button
                  variant="contained"
                  onClick={pay}
                  sx={{
                    bgcolor: "#00AFF5",
                    px: 4,
                    py: 1.3,
                    borderRadius: "12px",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#0095d6" },
                  }}
                >
                  Book seats
                </Button>
              )}

            {isDriverOwner && ride.status !== "cancelled" && (
              <Button
                variant="outlined"
                color="error"
                disabled={loading}
                onClick={cancelRide}
              >
                {loading ? "Cancelling..." : "Cancel ride"}
              </Button>
            )}
          </Stack>

          {/* CANCEL INFO */}
          {ride.status === "cancelled" && (
            <Typography sx={{ mt: 3, color: "error.main" }}>
              Cancelled on{" "}
              {new Date(ride.canceledAt).toLocaleString()}
              {ride.cancelReason ? ` — ${ride.cancelReason}` : ""}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default RideDetails;