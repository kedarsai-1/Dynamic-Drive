// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
} from "@mui/material";

const Register = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "passenger",
  });

  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/api/auth/register", form);

      // ✅ Auto login
      const res = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "center",
        mt: 6,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 5,
          width: "480px",
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="600" mb={2}>
          Create Account
        </Typography>
        <Typography mb={3} color="text.secondary">
          Join Dynamic Ride now
        </Typography>

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            required
            margin="normal"
            value={form.name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            required
            margin="normal"
            value={form.email}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            required
            margin="normal"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          {/* ROLE SELECT */}
          <TextField
            fullWidth
            select
            name="role"
            label="Select Role"
            margin="normal"
            value={form.role}
            onChange={handleChange}
          >
            <MenuItem value="passenger">Passenger</MenuItem>
            <MenuItem value="driver">Driver</MenuItem>
          </TextField>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, bgcolor: "#0A83FF", py: 1.4 }}
          >
            Register
          </Button>
        </form>

        <Typography mt={3}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#0A83FF" }}>
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
