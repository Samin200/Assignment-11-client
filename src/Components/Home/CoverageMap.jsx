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
        { name: "Dhaka",      lat: 23.8103, lng: 90.4125 },
        { name: "Chattogram", lat: 22.3569, lng: 91.7832 },
        { name: "Sylhet",     lat: 24.8949, lng: 91.8687 },
        { name: "Rajshahi",   lat: 24.3745, lng: 88.6042 },
        { name: "Khulna",     lat: 22.8456, lng: 89.5403 },
      ];

      cities.forEach(c => {
        L.marker([c.lat, c.lng])
          .addTo(mapRef.current)
          .bindPopup(`<b>${c.name}</b><br/>📦 Delivery available`);
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
    <section className="py-24 bg-base-200">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">Delivery zones</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Coverage Area</h2>
          <p className="text-base-content/50 max-w-lg mx-auto">
            We currently deliver across major cities. Tap a pin to see availability in your area.
          </p>
        </div>

        {/* Map */}
        <div className="rounded-3xl overflow-hidden border border-base-300 shadow-2xl">
          <div id="coverage-map" className="w-full h-80 md:h-[420px]" />
        </div>

        {/* City chips */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna"].map(city => (
            <span key={city} className="px-4 py-2 rounded-full bg-base-100 border border-base-300
                                        text-sm font-semibold text-base-content/70
                                        hover:border-primary/40 hover:text-primary transition-colors cursor-default">
              📍 {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
