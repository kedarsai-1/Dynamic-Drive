import { useEffect, useState } from "react";
import api from "../api/axios";
import { Box, Typography, Paper, Divider, Chip, Button } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const DriverBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeRides, setActiveRides] = useState([]);
  const [pastRides, setPastRides] = useState([]);

  useEffect(() => {
    const endpoint =
      user?.role === "driver"
        ? "/api/rides/driver/bookings"
        : "/api/rides/passenger/bookings";

    api
      .get(endpoint, { withCredentials: true })
      .then((res) => {
        const now = new Date();
        const active = res.data.filter(
          (ride) =>
            ride.status !== "completed" &&
            ride.status !== "cancelled" &&
            new Date(ride.date) > now
        );
        const past = res.data.filter(
          (ride) =>
            ride.status === "completed" ||
            ride.status === "cancelled" ||
            new Date(ride.date) <= now
        );
        setActiveRides(active);
        setPastRides(past);
      })
      .catch((err) => console.error(err));
  }, [user]);

  const statusColor = (status) =>
    status === "cancelled"
      ? "error"
      : status === "completed"
      ? "default"
      : status === "full"
      ? "warning"
      : "success";

  const RideCard = ({ ride, showRateButton }) => (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: "18px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {ride.fromLocation.name} → {ride.toLocation.name}
        </Typography>
        <Chip
          label={ride.status}
          color={statusColor(ride.status)}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      </Box>

      <Typography sx={{ color: "gray", fontSize: "14px", mb: 2 }}>
        {new Date(ride.date).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })}
      </Typography>

      <Typography sx={{ mb: 1 }}>
        Price: <b>₹{ride.price}/seat</b>
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* DRIVER VIEW */}
      {user?.role === "driver" && (
        <>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Passengers
          </Typography>
          {ride.passengers.length === 0 ? (
            <Typography sx={{ color: "gray" }}>No passengers yet</Typography>
          ) : (
            ride.passengers.map((p, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "#F8FAFC",
                  borderRadius: "12px",
                  px: 2,
                  py: 1.5,
                  mb: 1.2,
                }}
              >
                <Typography fontWeight={500}>
                  {p.user?.name || "Passenger"}
                </Typography>
                <Typography
                  sx={{
                    bgcolor: "#E3F6FF",
                    px: 2,
                    py: 0.5,
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {p.seatsBooked} seat(s)
                </Typography>
              </Box>
            ))
          )}
        </>
      )}

      {/* PASSENGER VIEW */}
      {user?.role === "passenger" && (
        <>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Driver
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "#F8FAFC",
              borderRadius: "12px",
              px: 2,
              py: 1.5,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "#E5F6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#00AFF5",
              }}
            >
              {ride.driver?.name?.charAt(0) || "D"}
            </Box>
            <Box>
              <Typography fontWeight={600}>
                {ride.driver?.name || "Driver"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "gray" }}>
                ⭐ {ride.driver?.avgRating?.toFixed(1) || "New"} (
                {ride.driver?.totalRatings || 0} ratings)
              </Typography>
            </Box>
          </Box>

          {ride.passengers
            .filter(
              (p) => String(p.user?._id || p.user) === String(user?._id)
            )
            .map((p, i) => (
              <Typography key={i} sx={{ mt: 1.5, color: "gray" }}>
                You booked <b>{p.seatsBooked} seat(s)</b>
              </Typography>
            ))}

          {/* ✅ Rate Driver button — only for completed rides */}
          {showRateButton && ride.status === "completed" && (
            <Button
              variant="contained"
              sx={{ mt: 2, bgcolor: "#00AFF5", fontWeight: 700 }}
              onClick={() => navigate(`/rides/${ride._id}`)}
            >
              ⭐ Rate Driver
            </Button>
          )}
        </>
      )}
    </Paper>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F7FA",
        px: 2,
        py: 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 800 }}>
        <Typography variant="h4" fontWeight={700} mb={3} textAlign="center">
          {user?.role === "driver" ? "🚗 My Ride Bookings" : "🎟️ My Bookings"}
        </Typography>

        {/* ACTIVE RIDES */}
        <Typography variant="h6" fontWeight={700} mb={2}>
          Active Rides
        </Typography>
        {activeRides.length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center", mb: 3 }}>
            <Typography color="text.secondary">No active bookings</Typography>
          </Paper>
        ) : (
          activeRides.map((ride) => (
            <RideCard key={ride._id} ride={ride} showRateButton={false} />
          ))
        )}

        {/* PAST RIDES */}
        <Typography variant="h6" fontWeight={700} mb={2} mt={2}>
          Past Rides
        </Typography>
        {pastRides.length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
            <Typography color="text.secondary">No past rides</Typography>
          </Paper>
        ) : (
          pastRides.map((ride) => (
            <RideCard key={ride._id} ride={ride} showRateButton={true} />
          ))
        )}
      </Box>
    </Box>
  );
};

export default DriverBookings;