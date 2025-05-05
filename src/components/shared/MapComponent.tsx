"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "../ui/button";

// Fix for default markers
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
  lat: number;
  lng: number;
  name: string;
  id: string;
  publicKey?: string;
  owner?: string;
}

const MapComponent = ({ locations }: { locations: Location[] }) => {
  // Set default view to first location or fallback
  const center: [number, number] = locations.length > 0 
    ? [locations[0].lat, locations[0].lng] 
    : [51.505, -0.09];

  return (
    <div className="h-full rounded-lg overflow-hidden">
      <MapContainer 
        center={center} 
        zoom={locations.length ? 5 : 3} 
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
          >
            <Popup>
              <div className="dark:text-gray-900">
                <h3 className="font-semibold">{location.name}</h3>
                <Link href={
                  location.owner 
                    ? `/services/seller/${location.owner}` 
                    : `/services/factory/${location.publicKey}`
                }>
                  <Button className="w-full" variant="default">
                    View Details
                  </Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
});