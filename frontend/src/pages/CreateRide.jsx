import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const CreateRide = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fromLocation: "",
    toLocation: "",
    seats: "",
    date: "",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Preview distance + price (without saving ride)
  const previewRide = async () => {
    try {
      setLoading(true);

      if (!form.fromLocation || !form.toLocation) {
        alert("Enter both locations");
        return;
      }

      const res = await api.post(
        "/api/rides/preview",
        {
          fromLocation: form.fromLocation,
          toLocation: form.toLocation,
        },
        { withCredentials: true }
      );

      setPreview(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Preview failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submit actual ride creation
  const submitRide = async () => {
    try {
      setLoading(true);

      const res = await api.post(
        "/api/rides/create",
        {
          ...form,
        },
        { withCredentials: true }
      );

      alert("Ride created ✅");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={5}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Offer a Ride
        </Typography>

        <TextField
          label="From"
          name="fromLocation"
          fullWidth
          required
          sx={{ mb: 2 }}
          onChange={changeHandler}
        />

        <TextField
          label="To"
          name="toLocation"
          fullWidth
          required
          sx={{ mb: 2 }}
          onChange={changeHandler}
        />

        <TextField
          label="Seats"
          name="seats"
          type="number"
          fullWidth
          required
          sx={{ mb: 2 }}
          onChange={changeHandler}
        />

        <TextField
          label="Date & Time"
          name="date"
          type="datetime-local"
          fullWidth
          required
          sx={{ mb: 2 }}
          onChange={changeHandler}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={previewRide}
          disabled={loading}
        >
          Preview Distance & Fare
        </Button>

        {preview && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">
              <b>Distance:</b> {preview.distance} km
            </Typography>
            <Typography variant="body1">
              <b>Fare:</b> ₹{preview.price}/seat
            </Typography>
          </>
        )}

        <Button
          variant="contained"
          color="success"
          fullWidth
          sx={{ mt: 2 }}
          disabled={!preview || loading}
          onClick={submitRide}
        >
          Confirm & Create Ride
        </Button>
      </Paper>
    </Box>
  );
};

export default CreateRide;
