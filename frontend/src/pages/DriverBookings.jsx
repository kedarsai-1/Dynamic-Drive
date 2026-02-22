import { useEffect, useState } from "react";
import api from "../api/axios";
import { Box, Typography, Paper, Divider, Chip } from "@mui/material";
import { useAuth } from "../auth/AuthContext";

const DriverBookings = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const endpoint =
      user?.role === "driver"
        ? "/api/rides/driver/bookings"
        : "/api/rides/my-bookings";

    api
      .get(endpoint, { withCredentials: true })
      .then((res) => {
        // ✅ Filter out completed, cancelled, and expired rides
        const now = new Date();
        const active = res.data.filter(
          (ride) =>
            ride.status !== "completed" &&
            ride.status !== "cancelled" &&
            new Date(ride.date) > now
        );
        setRides(active);
      })
      .catch((err) => console.error(err));
  }, [user]);

  const statusColor = (status) =>
    status === "full" ? "warning" : "success";

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

        {rides.length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
            <Typography>No active bookings found</Typography>
          </Paper>
        ) : (
          rides.map((ride) => (
            <Paper
              key={ride._id}
              elevation={2}
              sx={{ p: 3, mb: 3, borderRadius: "18px" }}
            >
              {/* ROUTE HEADER */}
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
                    <Typography sx={{ color: "gray" }}>
                      No passengers yet
                    </Typography>
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
                      (p) =>
                        String(p.user?._id || p.user) === String(user?._id)
                    )
                    .map((p, i) => (
                      <Typography key={i} sx={{ mt: 1.5, color: "gray" }}>
                        You booked <b>{p.seatsBooked} seat(s)</b>
                      </Typography>
                    ))}
                </>
              )}
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default DriverBookings;