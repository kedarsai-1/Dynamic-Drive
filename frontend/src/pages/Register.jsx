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
        minHeight: "100vh",
        bgcolor: "#F5F7FA",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 480,
          p: 5,
          borderRadius: "18px",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={1}>
          Create your account 🚗
        </Typography>
  
        <Typography mb={3} color="text.secondary">
          Join and start sharing rides today
        </Typography>
  
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
  
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
  
          <TextField
            fullWidth
            label="Email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
  
          <TextField
            fullWidth
            label="Password"
            name="password"
            required
            type="password"
            value={form.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
  
          {/* ROLE SELECT */}
          <TextField
            fullWidth
            select
            name="role"
            label="I want to"
            value={form.role}
            onChange={handleChange}
            sx={{ mb: 2 }}
          >
            <MenuItem value="passenger">Find a ride</MenuItem>
            <MenuItem value="driver">Offer a ride</MenuItem>
          </TextField>
  
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              bgcolor: "#00AFF5",
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 700,
              "&:hover": { bgcolor: "#0095d6" },
            }}
          >
            Create account
          </Button>
        </form>
  
        <Typography mt={3} fontSize="14px">
          Already registered?{" "}
          <Link
            to="/login"
            style={{
              color: "#00AFF5",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Log in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
