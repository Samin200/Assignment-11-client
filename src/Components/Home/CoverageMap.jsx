// src/Components/Home/CoverageMap.jsx
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function CoverageMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("coverage-map", {
        center: [23.8103, 90.4125],
        zoom: 6,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      const cities = [
        { name: "Dhaka", lat: 23.8103, lng: 90.4125 },
        { name: "Chattogram", lat: 22.3569, lng: 91.7832 },
        { name: "Sylhet", lat: 24.8949, lng: 91.8687 },
        { name: "Rajshahi", lat: 24.3745, lng: 88.6042 },
        { name: "Khulna", lat: 22.8456, lng: 89.5403 },
      ];

      cities.forEach((c) => {
        L.marker([c.lat, c.lng]).addTo(mapRef.current).bindPopup(
          `<b>${c.name}</b><br/>Delivery available`
        );
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <section className="py-12 bg-base-200">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-bold mb-6">Coverage Area</h3>
        <p className="mb-4 text-base-content/80">
          We currently deliver to multiple cities. Tap a marker to see availability.
        </p>

        <div id="coverage-map" className="w-full h-72 rounded-lg border border-base-300 shadow-inner" />
      </div>
    </section>
  );
}