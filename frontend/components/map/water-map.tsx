"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Interactive map. Clicking drops a marker and reports the coordinates.
// Uses free OpenStreetMap raster tiles (no API key).
export function WaterMap({
  onSelect,
}: {
  onSelect: (lng: number, lat: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [32.9, -1.0], // Lake Victoria region
      zoom: 6,
    });
    map.addControl(new maplibregl.NavigationControl({}), "top-right");

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({ color: "#0e7490" })
          .setLngLat([lng, lat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }
      onSelectRef.current(lng, lat);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
