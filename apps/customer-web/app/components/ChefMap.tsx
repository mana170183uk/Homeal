"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Chef } from "../lib/types";

// Fix Leaflet default icon paths for webpack/Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ChefMapProps {
  chefs: Chef[];
  center: [number, number];
  radius: number;
}

export default function ChefMap({ chefs, center, radius }: ChefMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const zoom = radius <= 5 ? 12 : radius <= 10 ? 11 : radius <= 20 ? 10 : 9;

    const map = L.map(mapRef.current).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // Add chef markers
    chefs.forEach((chef) => {
      if (chef.latitude == null || chef.longitude == null) return;
      const marker = L.marker([chef.latitude, chef.longitude]).addTo(map);
      marker.bindPopup(
        `<div style="min-width:150px;font-family:system-ui,sans-serif">
          <strong style="font-size:13px">${chef.kitchenName}</strong><br/>
          <span style="font-size:11px;color:#666">by ${chef.user.name}</span><br/>
          ${chef.avgRating > 0 ? `<span style="font-size:11px;color:#F59E0B">\u2605 ${chef.avgRating.toFixed(1)}</span><br/>` : ""}
          <a href="/chef/${chef.id}" style="color:#8B5CF6;font-size:12px;font-weight:600;text-decoration:none">View Menu \u2192</a>
        </div>`
      );
    });

    map.setView(center, map.getZoom());
  }, [chefs, center]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] sm:h-[500px] rounded-2xl border border-[var(--border)] overflow-hidden"
    />
  );
}
