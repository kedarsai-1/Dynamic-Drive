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
    <Box maxWidth={500} mx="auto" mt={5}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Offer a Ride
        </Typography>

        {/* ✅ FROM INPUT */}
        <Box sx={{ position: "relative", mb: 2 }}>
          <TextField
            label="From"
            name="fromLocation"
            fullWidth
            required
            value={form.fromLocation}
            onChange={changeHandler}
          />

          {fromSuggest.length > 0 && (
            <Paper sx={{ position: "absolute", top: "60px", left: 0, right: 0, zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
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

        {/* ✅ TO INPUT */}
        <Box sx={{ position: "relative", mb: 2 }}>
          <TextField
            label="To"
            name="toLocation"
            fullWidth
            required
            value={form.toLocation}
            onChange={changeHandler}
          />

          {toSuggest.length > 0 && (
            <Paper sx={{ position: "absolute", top: "60px", left: 0, right: 0, zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
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

        {/* ✅ SEATS */}
        <TextField
          label="Seats"
          name="seats"
          type="number"
          fullWidth
          required
          sx={{ mb: 2 }}
          onChange={changeHandler}
        />

        {/* ✅ DATE */}
        <TextField
          label="Date & Time"
          name="date"
          type="datetime-local"
          fullWidth
          required
          sx={{ mb: 2 }}
          onChange={changeHandler}
        />

        {/* ✅ PREVIEW BUTTON */}
        <Button
          variant="contained"
          fullWidth
          onClick={previewRide}
          disabled={loading}
        >
          Preview Distance & Fare
        </Button>

        {/* ✅ PREVIEW OUTPUT */}
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

        {/* ✅ CREATE BUTTON */}
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
