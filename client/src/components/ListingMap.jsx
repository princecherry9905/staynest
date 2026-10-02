import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function ListingMap({ listing }) {
  const lat = Number(listing.location?.lat);
  const lng = Number(listing.location?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return <p className="muted">Map coordinates have not been added for this stay yet.</p>;
  }

  return (
    <MapContainer
      key={`${lat},${lng}`}
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={false}
      className="listing-map"
      aria-label={`Map showing ${listing.title}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>{listing.title}</Popup>
      </Marker>
    </MapContainer>
  );
}
