import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

const MapView = ({ from, to }) => {
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) {
    return <p>No map data available</p>;
  }

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        background: "#fff",
      }}
    >
      <iframe
        width="100%"
        height="400"
        style={{
          border: 0,
          display: "block",
        }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API}&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}`}
      />
    </div>
  );
};
export default MapView;