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
} from "@mui/material";

const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // ✅ Email Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ⭐ Regex validation
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const res = await api.post("/api/auth/login", form, {
        withCredentials: true,
      });

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
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
          maxWidth: 420,
          p: 5,
          borderRadius: "18px",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={1}>
          Welcome back 👋
        </Typography>

        <Typography mb={3} color="text.secondary">
          Log in to continue your journey
        </Typography>

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          {/* ✅ EMAIL FIELD WITH LIVE REGEX VALIDATION */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            error={form.email !== "" && !emailRegex.test(form.email)}
            helperText={
              form.email !== "" && !emailRegex.test(form.email)
                ? "Invalid email format"
                : ""
            }
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
            Log in
          </Button>
        </form>

        <Typography mt={3} fontSize="14px">
          New here?{" "}
          <Link
            to="/register"
            style={{
              color: "#00AFF5",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Create an account
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;