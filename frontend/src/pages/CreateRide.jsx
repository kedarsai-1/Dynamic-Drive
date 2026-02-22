import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemButton,
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

  // ✅ Autosuggest states
  const [fromSuggest, setFromSuggest] = useState([]);
  const [toSuggest, setToSuggest] = useState([]);

  /*-----------------------------------
      INPUT HANDLER
  -----------------------------------*/
  const changeHandler = async (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Fetch suggest for only from & to
    if (name === "fromLocation") fetchSuggest(value, setFromSuggest);
    if (name === "toLocation") fetchSuggest(value, setToSuggest);
  };

  /*-----------------------------------
      AUTOSUGGEST API CALL
  -----------------------------------*/
  const fetchSuggest = async (text, setFn) => {
    if (!text) return setFn([]);

    try {
      const res = await api.get("/api/locations/suggest", {
        params: { text },
        withCredentials: true,
      });
      setFn(res.data);
    } catch (err) {
      console.log("suggest err", err);
    }
  };

  /*-----------------------------------
      PREVIEW
  -----------------------------------*/
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

  /*-----------------------------------
      CREATE RIDE
  -----------------------------------*/
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
          maxWidth: 520,
          p: 4,
          borderRadius: "18px",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          mb={3}
          textAlign="center"
        >
          🚗 Offer a Ride
        </Typography>
  
        {/* FROM */}
        <Box sx={{ position: "relative", mb: 2 }}>
          <TextField
            label="Leaving from"
            name="fromLocation"
            fullWidth
            required
            value={form.fromLocation}
            onChange={changeHandler}
            sx={{ bgcolor: "#fff", borderRadius: 2 }}
          />
  
          {fromSuggest.length > 0 && (
            <Paper
              sx={{
                position: "absolute",
                top: "56px",
                left: 0,
                right: 0,
                zIndex: 10,
                maxHeight: 220,
                overflowY: "auto",
                borderRadius: 2,
              }}
            >
              <List>
                {fromSuggest.map((x, i) => (
                  <ListItem key={i} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setForm({ ...form, fromLocation: x.label });
                        setFromSuggest([]);
                      }}
                    >
                      {x.label}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
  
        {/* TO */}
        <Box sx={{ position: "relative", mb: 2 }}>
          <TextField
            label="Going to"
            name="toLocation"
            fullWidth
            required
            value={form.toLocation}
            onChange={changeHandler}
            sx={{ bgcolor: "#fff", borderRadius: 2 }}
          />
  
          {toSuggest.length > 0 && (
            <Paper
              sx={{
                position: "absolute",
                top: "56px",
                left: 0,
                right: 0,
                zIndex: 10,
                maxHeight: 220,
                overflowY: "auto",
                borderRadius: 2,
              }}
            >
              <List>
                {toSuggest.map((x, i) => (
                  <ListItem key={i} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setForm({ ...form, toLocation: x.label });
                        setToSuggest([]);
                      }}
                    >
                      {x.label}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
  
        {/* SEATS */}
        <TextField
          label="Available seats"
          name="seats"
          type="number"
          fullWidth
          required
          sx={{ mb: 2 }}
          onChange={changeHandler}
        />
  
        {/* DATE */}
        <TextField
  label="Date & Time"
  name="date"
  type="datetime-local"
  fullWidth
  required
  value={form.date}              // ⭐ THIS IS THE FIX
  onChange={changeHandler}
  InputLabelProps={{ shrink: true }}
/>
  
        {/* PREVIEW */}
        <Button
          variant="contained"
          fullWidth
          onClick={previewRide}
          disabled={loading}
          sx={{
            bgcolor: "#00AFF5",
            py: 1.4,
            borderRadius: "10px",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#0095d6" },
          }}
        >
          Preview distance & price
        </Button>
  
        {preview && (
          <Paper
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 3,
              bgcolor: "#F0FAFF",
            }}
          >
            <Typography>
              <b>Distance:</b> {preview.distance} km
            </Typography>
            <Typography>
              <b>Fare:</b> ₹{preview.price}/seat
            </Typography>
          </Paper>
        )}
  
        {/* CREATE */}
        <Button
          variant="contained"
          fullWidth
          disabled={!preview || loading}
          onClick={submitRide}
          sx={{
            mt: 3,
            bgcolor: "#00AFF5",
            py: 1.6,
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "15px",
          }}
        >
          Confirm & Publish Ride
        </Button>
      </Paper>
    </Box>
  );
};

export default CreateRide;
