import { useEffect, useState } from "react";
import api from "../api/axios";
import { Box, Typography, Paper, Divider } from "@mui/material";

const DriverBookings = () => {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    api.get("/api/rides/driver/bookings", { withCredentials: true })
      .then(res => setRides(res.data))
      .catch(err => console.error(err));
  }, []);

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
        <Typography
          variant="h4"
          fontWeight={700}
          mb={3}
          textAlign="center"
        >
          🚗 My Ride Bookings
        </Typography>
  
        {rides.length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
            <Typography>No bookings found</Typography>
          </Paper>
        ) : (
          rides.map((ride) => (
            <Paper
              key={ride._id}
              elevation={2}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: "18px",
              }}
            >
              {/* ROUTE HEADER */}
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 0.5 }}
              >
                {ride.fromLocation.name} → {ride.toLocation.name}
              </Typography>
  
              <Typography
                sx={{ color: "gray", fontSize: "14px", mb: 2 }}
              >
                {new Date(ride.date).toLocaleString()}
              </Typography>
  
              <Divider sx={{ mb: 2 }} />
  
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Passengers
              </Typography>
  
              {ride.passengers.length === 0 ? (
                <Typography sx={{ color: "gray" }}>
                  No passengers yet
                </Typography>
              ) : (
                ride.passengers.map((p) => (
                  <Box
                    key={p.user._id}
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
                      {p.user.name}
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
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default DriverBookings;
