import { useState } from "react";
import api from "../api/axios";
import RideCard from "../components/RideCard";
import RouteMap from "../components/RouteMap";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Skeleton,
  MenuItem, // ⭐ NEW
} from "@mui/material";

const SearchRides = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [seatsNeeded, setSeatsNeeded] = useState(1);
  const [minRating, setMinRating] = useState(0); // ⭐ NEW
  const [results, setResults] = useState([]);
  const [hoveredRide, setHoveredRide] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchRides = async () => {
    if (!from || !to) return alert("Please enter both From & To");

    setLoading(true);
    try {
      const res = await api.get(
        `/api/rides/match?from=${from}&to=${to}&seatsNeeded=${seatsNeeded}&minRating=${minRating}`
      );
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to search rides");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh", px: 3, py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>

        {/* 🚗 STICKY SEARCH BAR */}
        <Box
          sx={{
            position: "sticky",
            top: 80,
            zIndex: 10,
            bgcolor: "#fff",
            borderRadius: "14px",
            p: 2,
            mb: 3,
            display: "flex",
            gap: 2,
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <TextField
            label="Leaving from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            fullWidth
          />

          <TextField
            label="Going to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            fullWidth
          />

          <TextField
            label="Seats"
            type="number"
            value={seatsNeeded}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1) setSeatsNeeded(val);
            }}
            sx={{ width: 120 }}
          />

          {/* ⭐ DRIVER RATING FILTER */}
          <TextField
            select
            label="Driver rating"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            sx={{ width: 160 }}
          >
            <MenuItem value={0}>All drivers</MenuItem>
            <MenuItem value={4}>⭐ 4+</MenuItem>
            <MenuItem value={4.5}>⭐ 4.5+</MenuItem>
            <MenuItem value={5}>⭐ 5 only</MenuItem>
          </TextField>

          <Button
            variant="contained"
            onClick={searchRides}
            sx={{
              height: 56,
              bgcolor: "#00AFF5",
              fontWeight: 700,
              "&:hover": { bgcolor: "#0095d6" },
            }}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </Box>

        {/* 🚗 DESKTOP GRID */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(650px,2fr) 1fr",
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* LEFT — RESULTS */}
          <Box>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <Paper key={i} sx={{ p: 3, mb: 2 }}>
                  <Skeleton width="40%" height={30} />
                  <Skeleton width="70%" />
                  <Skeleton width="30%" />
                </Paper>
              ))
            ) : results.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: "center", borderRadius: "14px" }}>
                <Typography color="text.secondary">
                  No rides yet. Try searching a route.
                </Typography>
              </Paper>
            ) : (
              results.map((r) => (
                <Box
                  key={r._id}
                  onMouseEnter={() => setHoveredRide(r)}
                  onMouseLeave={() => setHoveredRide(null)}
                  sx={{ transition: "0.2s", cursor: "pointer" }}
                >
                  <RideCard ride={r} seatsNeeded={seatsNeeded} />
                </Box>
              ))
            )}
          </Box>

          {/* RIGHT — MAP */}
          <Box sx={{ position: "sticky", top: 120 }}>
            <Paper
              sx={{
                borderRadius: "14px",
                overflow: "hidden",
                transition: "all 0.35s ease",
                opacity: hoveredRide ? 1 : 0.9,
                transform: hoveredRide ? "scale(1)" : "scale(0.98)",
              }}
            >
              <Typography sx={{ p: 2, fontWeight: 700, borderBottom: "1px solid #eee" }}>
                Route Preview
              </Typography>

              {hoveredRide ? (
                <RouteMap
                  from={hoveredRide.fromLocation}
                  to={hoveredRide.toLocation}
                />
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography color="text.secondary">
                    Hover a ride to preview route
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SearchRides;