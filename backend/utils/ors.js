import axios from "axios";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 120 }); // 1h

export const geocode = async (text) => {
  const key = `geo:${text}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const res = await axios.get("https://api.openrouteservice.org/geocode/search", {
    params: { text, size: 1 },
    headers: { Authorization: process.env.ORS_API_KEY },
  });

  const f = res.data.features?.[0];
  if (!f) return null;

  const out = {
    latitude:  f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
    formattedAddress: f.properties.label,
  };
  cache.set(key, out);
  return out;
};

export const autosuggest = async (text) => {
  if (!text) return [];
  const key = `suggest:${text}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const res = await axios.get("https://api.openrouteservice.org/geocode/autocomplete", {
    params: { text, size: 5 },
    headers: { Authorization: process.env.ORS_API_KEY },
  });

  const out = (res.data.features || []).map(f => ({
    label: f.properties.label,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
  }));
  cache.set(key, out);
  return out;
};

export const routeSummary = async (coords) => {
  // coords: [[lng,lat], [lng,lat], ...] including waypoints
  const res = await axios.post(
    "https://api.openrouteservice.org/v2/directions/driving-car/json",
    { coordinates: coords },
    {
      headers: {
        Authorization: process.env.ORS_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  const r = res.data.routes[0];
  return {
    distanceKm: r.summary.distance / 1000,
    durationMin: Math.round(r.summary.duration / 60),
  };
};

export const calcPrice = ({ distanceKm, durationMin, vehicle = "car", surge = 1 }) => {
  const vehicleMultiplier = vehicle === "suv" ? 1.3 : vehicle === "bike" ? 0.7 : 1.0;
  const base = 20;                   // base fare
  const perKm = 10;                  // ₹ per km
  const perMin = 1;                  // ₹ per minute
  const raw = (base + distanceKm * perKm + durationMin * perMin) * vehicleMultiplier * surge;
  return Math.max(30, Math.round(raw)); // minimum fare ₹30
};
