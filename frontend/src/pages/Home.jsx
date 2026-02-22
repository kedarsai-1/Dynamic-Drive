// frontend/src/pages/Home.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import RideCard from "../components/RideCard";
import { useAuth } from "../auth/AuthContext";
import { Box, Typography } from "@mui/material";

const Home = () => {
  const [rides, setRides] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get("/api/rides", { withCredentials: true })
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
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        {/* HEADER */}
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ mb: 3 }}
        >
          {user?.role === "driver" ? "Your rides" : "Available rides"}
        </Typography>
  
        {/* SUBTEXT */}
        <Typography
          sx={{ color: "gray", mb: 3 }}
        >
          {user?.role === "driver"
            ? "Manage the rides you’ve published"
            : "Choose a ride that suits your trip"}
        </Typography>
  
        {/* RIDE LIST */}
        {rides.length === 0 ? (
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography color="text.secondary">
              No rides available right now
            </Typography>
          </Box>
        ) : (
          rides.map((ride) => (
            <Box key={ride._id} sx={{ mb: 2 }}>
              <RideCard ride={ride} />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Home;
