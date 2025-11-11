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
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        {user?.role === "driver" ? "Your Rides" : "Available Rides"}
      </Typography>

      {rides.length === 0 ? (
        <Typography color="text.secondary">No rides to show.</Typography>
      ) : (
        rides.map((ride) => <RideCard key={ride._id} ride={ride} />)
      )}
    </Box>
  );
};

export default Home;
