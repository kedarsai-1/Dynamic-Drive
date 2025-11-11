import { useState } from "react";
import api from "../api/axios";
import RideCard from "../components/RideCard";
import { Box, Button, TextField, Typography } from "@mui/material";

const SearchRides = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [seatsNeeded, setSeatsNeeded] = useState(1);     // ✅ NEW
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRides = async () => {
    if (!from || !to) return alert("Please enter both From & To");

    setLoading(true);
    try {
      const res = await api.get(
        `/api/rides/match?from=${from}&to=${to}&seatsNeeded=${seatsNeeded}`   // ✅ added seatsNeeded
      );
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to search rides");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Search Ride
      </Typography>

      <TextField
        label="From"
        fullWidth
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        label="To"
        fullWidth
        value={to}
        onChange={(e) => setTo(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* ✅ NEW seats selector */}
      <TextField
        label="Seats Needed"
        type="number"
        value={seatsNeeded}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (val >= 1) setSeatsNeeded(val);
        }}
        sx={{ mb: 2 }}
        inputProps={{ min: 1 }}
        fullWidth
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={searchRides}
      >
        {loading ? "Searching..." : "Search"}
      </Button>

      <Box sx={{ mt: 3 }}>
        {results.length === 0 && (
          <Typography color="gray">No results yet</Typography>
        )}

        {results.map((r) => (
          <RideCard key={r._id} ride={r} seatsNeeded={seatsNeeded} />   
        ))}
      </Box>
    </Box>
  );
};

export default SearchRides;
