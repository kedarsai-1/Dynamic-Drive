// src/components/Navbar.jsx
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MenuIcon from "@mui/icons-material/Menu";
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
    <AppBar sx={{ bgcolor: "#0A83FF" }} position="sticky">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* LEFT */}
        <Box display="flex" alignItems="center" gap={1}>
          <DirectionsCarIcon fontSize="large" />
          <Typography
            variant="h6"
            component={Link}
            sx={{ color: "white", textDecoration: "none" }}
            to="/"
          >
            DynamicRide
          </Typography>
        </Box>

        {/* RIGHT */}
        {!user ? (
          <Box>
            <Button component={Link} to="/login" sx={{ color: "white" }}>Login</Button>
            <Button component={Link} to="/register" sx={{ color: "white" }}>Register</Button>
          </Box>
        ) : (
          <Box display="flex" gap={2} alignItems="center">
            <Typography sx={{ color: "white" }}>Hi, {user.name}</Typography>

            {user.role === "driver" && (
              <Button
                component={Link}
                to="/create"
                variant="contained"
                sx={{ bgcolor: "#00C46A" }}
              >
                Offer Ride
              </Button>
            )}
            {user?.role === "passenger" && (
  <Button color="inherit" component={Link} to="/search">
    Search
  </Button>
)}
{user?.role === "driver" && (
  <Button
    component={Link}
    to="/driver/bookings"
    color="inherit"
  >
    Bookings
  </Button>
)}



            <Button
              variant="outlined"
              sx={{ borderColor: "#fff", color: "#fff" }}
              onClick={handleLogout}
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
