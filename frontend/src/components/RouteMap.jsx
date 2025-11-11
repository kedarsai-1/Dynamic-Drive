import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RouteMap = ({ from, to }) => {
  if (!from?.lat || !to?.lat) return <p>No map data available</p>;

  const positions = [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ];

  return (
    <MapContainer
      center={positions[0]}
      zoom={9}
      style={{ height: "400px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={positions[0]}>
        <Popup>{from.name}</Popup>
      </Marker>

      <Marker position={positions[1]}>
        <Popup>{to.name}</Popup>
      </Marker>

      <Polyline positions={positions} />
    </MapContainer>
  );
};

export default RouteMap;
