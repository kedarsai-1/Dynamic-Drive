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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700}>
        My Ride Bookings
      </Typography>

      {rides.length === 0 ? (
        <Typography>No bookings found</Typography>
      ) : (
        rides.map(ride => (
          <Paper key={ride._id} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">
              {ride.fromLocation.name} → {ride.toLocation.name}
            </Typography>
            <Typography>Date: {new Date(ride.date).toLocaleString()}</Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Passengers:
            </Typography>

            {ride.passengers.length === 0 ? (
              <Typography>No passengers yet</Typography>
            ) : (
              ride.passengers.map(p => (
                <Box key={p.user._id} sx={{ ml: 1, my: 1 }}>
                  <Typography>
                    ✅ {p.user.name} — {p.seatsBooked} seat(s)
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        ))
      )}
    </Box>
  );
};

export default DriverBookings;
