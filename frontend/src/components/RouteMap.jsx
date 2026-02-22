import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RouteMap = ({ from, to }) => {
  if (!from?.lat || !to?.lat) return <p>No map data available</p>;

  const positions = [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ];

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      }}
    >
      <MapContainer
        center={positions[0]}
        zoom={9}
        style={{
          height: "400px",
          width: "100%",
        }}
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
  
        <Polyline
          positions={positions}
          pathOptions={{
            color: "#00AFF5",
            weight: 5,
          }}
        />
      </MapContainer>
    </div>
  );
};

export default RouteMap;
