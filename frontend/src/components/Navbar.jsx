// src/components/Navbar.jsx
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        color: "#111827",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: 1200,
          mx: "auto",
          width: "100%",
        }}
      >
        {/* LEFT */}
        <Box display="flex" alignItems="center" gap={1}>
          <DirectionsCarIcon sx={{ color: "#00AFF5" }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ color: "#111827", textDecoration: "none", fontWeight: 800 }}
          >
            DynamicRide
          </Typography>
        </Box>

        {/* RIGHT */}
        {!user ? (
          <Box>
            <Button
              component={Link}
              to="/login"
              sx={{ color: "#111827", fontWeight: 600 }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{
                bgcolor: "#00AFF5",
                ml: 1,
                borderRadius: "10px",
                fontWeight: 700,
                "&:hover": { bgcolor: "#0095d6" },
              }}
            >
              Register
            </Button>
          </Box>
        ) : (
          <Box display="flex" gap={2} alignItems="center">
            <Typography sx={{ color: "#374151", fontWeight: 600 }}>
              Hi, {user.name}
            </Typography>

            {/* DRIVER ONLY */}
            {user.role === "driver" && (
              <Button
                component={Link}
                to="/create"
                variant="contained"
                sx={{
                  bgcolor: "#00AFF5",
                  borderRadius: "10px",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#0095d6" },
                }}
              >
                Offer Ride
              </Button>
            )}

            {user.role === "driver" && (
              <Button
                component={Link}
                to="/driver/bookings"
                sx={{ color: "#111827", fontWeight: 600 }}
              >
                Bookings
              </Button>
            )}

            {/* PASSENGER ONLY */}
            {user.role === "passenger" && (
              <Button
                component={Link}
                to="/search"
                sx={{ color: "#111827", fontWeight: 600 }}
              >
                Search
              </Button>
            )}

            {/* ✅ My Bookings for passengers */}
            {user.role === "passenger" && (
              <Button
                component={Link}
                to="/driver/bookings"
                sx={{ color: "#111827", fontWeight: 600 }}
              >
                My Bookings
              </Button>
            )}

            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{
                borderColor: "#D1D5DB",
                color: "#111827",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;