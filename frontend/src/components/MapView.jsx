import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

const MapView = ({ from, to }) => {
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) {
    return <p>No map data available</p>;
  }

  return (
    <iframe
      width="100%"
      height="400"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      src={`https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API}&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}`}
    />
  );
};
export default MapView;