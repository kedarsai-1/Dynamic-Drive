// frontend/src/pages/RideDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useAuth } from "../auth/AuthContext";

const RideDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);

  const [seatsToBook, setSeatsToBook] = useState(1);

  // ⭐ rating state
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const load = () =>
    api.get(`/api/rides/${id}`, { withCredentials: true })
      .then((res) => setRide(res.data));

  useEffect(() => {
    load().catch(console.error);
  }, [id]);

  /* ---------------- PAYMENT ---------------- */
  const pay = async () => {
    try {
      const totalAmount = ride.price * seatsToBook;

      const res = await api.post("/api/payments/create-checkout-session", {
        amount: totalAmount,
        rideId: ride._id,
        seats: seatsToBook,
      });

      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      alert("Payment failed");
    }
  };

  /* ---------------- RATE DRIVER ---------------- */
  const submitRating = async () => {
    try {
      await api.post(
        `/api/rides/rate/${ride._id}`,
        { rating, review },
        { withCredentials: true }
      );

      alert("Rating submitted ⭐");
      setReview("");
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Rating failed");
    }
  };

  /* ---------------- CANCEL ---------------- */
  const cancelRide = async () => {
    const reason = prompt("Cancellation reason") || "Cancelled by driver";
    if (!confirm("Cancel this ride?")) return;

    try {
      setLoading(true);
      await api.post(`/api/rides/cancel/${ride._id}`, { reason }, { withCredentials:true });
      await load();
    } finally {
      setLoading(false);
    }
  };

  if (!ride) return "Loading...";

  const seatsLeft = Math.max(0, ride.seats - ride.bookedSeats);

  const isDriverOwner =
    user?.role === "driver" &&
    String(ride.driver?._id || ride.driver) === String(user?._id);

  const isPassengerOfRide = ride.passengers?.some(
    (p) => String(p.user?._id || p.user) === String(user?._id)
  );

  return (
    <Box sx={{ minHeight:"100vh", bgcolor:"#F5F7FA", py:4 }}>
      <Box sx={{ maxWidth:900, mx:"auto", px:2 }}>

        <Paper sx={{ p:4, borderRadius:"18px" }}>

          {/* HEADER */}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h4" fontWeight={800}>
              {ride.fromLocation?.name} → {ride.toLocation?.name}
            </Typography>

            <Chip
              label={ride.status}
              color={
                ride.status==="cancelled"
                  ?"error"
                  :ride.status==="full"
                  ?"warning"
                  :"success"
              }
              sx={{ textTransform:"capitalize" }}
            />
          </Stack>

          {/* ⭐ DRIVER CARD (Blablacar style) */}
          <Box
            sx={{
              mt:3,
              p:2,
              borderRadius:"14px",
              bgcolor:"#F7FAFC",
              display:"flex",
              alignItems:"center",
              gap:2
            }}
          >
            <Box
              sx={{
                width:48,
                height:48,
                borderRadius:"50%",
                bgcolor:"#E5F6FF",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                fontWeight:700,
                color:"#00AFF5",
                fontSize:18
              }}
            >
              {ride.driver?.name?.charAt(0) || "D"}
            </Box>

            <Box>
              <Typography fontWeight={700}>
                {ride.driver?.name || "Driver"}
              </Typography>

              <Typography sx={{ fontSize:13 }}>
                ⭐ {ride.driver?.avgRating?.toFixed(1) || "New"} (
                {ride.driver?.totalRatings || 0} ratings)
              </Typography>
            </Box>
          </Box>

          {/* INFO BOX */}
          <Box sx={{ mt:2, p:2, bgcolor:"#F8FAFC", borderRadius:"12px" }}>
            <Typography>Seats left: <b>{seatsLeft}</b></Typography>
            <Typography>Price per seat: <b>₹{ride.price}</b></Typography>
          </Box>

          {/* MAP */}
          <Box sx={{ mt:3, borderRadius:"12px", overflow:"hidden" }}>
            <RouteMap from={ride.fromLocation} to={ride.toLocation} />
          </Box>

          {/* BOOKING */}
          {user?.role==="passenger" && ride.status==="available" && (
            <Stack direction="row" spacing={2} sx={{ mt:3 }}>
              <TextField
                type="number"
                label="Seats"
                value={seatsToBook}
                onChange={(e)=>{
                  const val = Number(e.target.value);
                  if(val>=1 && val<=seatsLeft) setSeatsToBook(val);
                }}
                sx={{ width:140 }}
              />

              <Button
                variant="contained"
                sx={{ bgcolor:"#00AFF5", fontWeight:700 }}
                onClick={pay}
              >
                Book seats
              </Button>
            </Stack>
          )}

          {/* ⭐ STAR RATING UI (Blablacar style) */}
          {user?.role==="passenger" && isPassengerOfRide && (
            <Box sx={{ mt:4, p:2, bgcolor:"#F8FAFC", borderRadius:"12px" }}>
              <Typography fontWeight={700}>Rate this driver</Typography>

              {/* Star selector */}
              <Stack direction="row" spacing={1} sx={{ mt:1 }}>
                {[1,2,3,4,5].map((star)=>(
                  <Box
                    key={star}
                    onClick={()=>setRating(star)}
                    sx={{ cursor:"pointer" }}
                  >
                    {rating>=star
                      ? <StarIcon sx={{ color:"#FFC107" }}/>
                      : <StarBorderIcon sx={{ color:"#FFC107" }}/>}
                  </Box>
                ))}
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Write a review (optional)"
                value={review}
                onChange={(e)=>setReview(e.target.value)}
                sx={{ mt:2 }}
              />

              <Button
                variant="contained"
                sx={{ mt:2, bgcolor:"#00AFF5", fontWeight:700 }}
                onClick={submitRating}
              >
                Submit Rating
              </Button>
            </Box>
          )}

          {isDriverOwner && (
            <Button
              sx={{ mt:3 }}
              color="error"
              onClick={cancelRide}
              disabled={loading}
            >
              Cancel Ride
            </Button>
          )}

        </Paper>
      </Box>
    </Box>
  );
};

export default RideDetails;