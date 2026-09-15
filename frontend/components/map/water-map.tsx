"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import { Satellite, Map as MapIcon } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

// Two basemaps, no API key required:
// - satellite: Esri World Imagery + Carto labels (best for seeing water bodies)
// - street: Carto Voyager raster tiles
type Basemap = "satellite" | "street";

const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    imagery: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Tiles © Esri, Maxar, Earthstar Geographics",
    },
    labels: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© CARTO",
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#0b1024" } },
    { id: "imagery", type: "raster", source: "imagery" },
    { id: "labels", type: "raster", source: "labels", paint: { "raster-opacity": 0.85 } },
  ],
};

const STREET_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    voyager: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [{ id: "voyager", type: "raster", source: "voyager" }],
};

const STYLES: Record<Basemap, StyleSpecification> = {
  satellite: SATELLITE_STYLE,
  street: STREET_STYLE,
};

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
  const [basemap, setBasemap] = useState<Basemap>("satellite");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLES.satellite,
      center: [32.9, -1.0], // Lake Victoria region
      zoom: 6,
    });
    map.addControl(new maplibregl.NavigationControl({}), "top-right");

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({ color: "#06b6d4" })
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

  useEffect(() => {
    mapRef.current?.setStyle(STYLES[basemap], { diff: false });
  }, [basemap]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <button
        type="button"
        onClick={() => setBasemap((b) => (b === "satellite" ? "street" : "satellite"))}
        className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-card hover:bg-muted"
      >
        {basemap === "satellite" ? (
          <>
            <MapIcon size={16} /> Street view
          </>
        ) : (
          <>
            <Satellite size={16} /> Satellite view
          </>
        )}
      </button>
    </div>
  );
}
