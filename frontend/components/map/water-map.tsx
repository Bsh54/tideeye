"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type StyleSpecification, type GeoJSONSource } from "maplibre-gl";
import { Satellite, Map as MapIcon, Mountain } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { pointToBufferPolygon, type GeoJSONPolygon } from "@/lib/point";

type Basemap = "satellite" | "street" | "terrain";

// CARTO basemaps require a key. Provided via env (public client key).
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY ?? "";
const cartoSuffix = CARTO_KEY ? `?key=${CARTO_KEY}` : "";

const AOI_SOURCE = "aoi";
const AOI_FILL = "aoi-fill";
const AOI_LINE = "aoi-line";

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
        `https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png${cartoSuffix}`,
        `https://b.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png${cartoSuffix}`,
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
        `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${cartoSuffix}`,
        `https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${cartoSuffix}`,
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [{ id: "voyager", type: "raster", source: "voyager" }],
};

const TERRAIN_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    topo: {
      type: "raster",
      tiles: [
        "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
        "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      maxzoom: 17,
      attribution: "© OpenTopoMap (CC-BY-SA)",
    },
  },
  layers: [{ id: "topo", type: "raster", source: "topo" }],
};

const STYLES: Record<Basemap, StyleSpecification> = {
  satellite: SATELLITE_STYLE,
  street: STREET_STYLE,
  terrain: TERRAIN_STYLE,
};

const BASEMAPS: { key: Basemap; label: string; Icon: typeof Satellite }[] = [
  { key: "satellite", label: "Satellite", Icon: Satellite },
  { key: "street", label: "Street", Icon: MapIcon },
  { key: "terrain", label: "Terrain", Icon: Mountain },
];

function drawAoi(map: maplibregl.Map, polygon: GeoJSONPolygon) {
  const data = { type: "Feature" as const, geometry: polygon, properties: {} };
  const existing = map.getSource(AOI_SOURCE) as GeoJSONSource | undefined;
  if (existing) {
    existing.setData(data);
    return;
  }
  map.addSource(AOI_SOURCE, { type: "geojson", data });
  map.addLayer({
    id: AOI_FILL,
    type: "fill",
    source: AOI_SOURCE,
    paint: { "fill-color": "#06b6d4", "fill-opacity": 0.14 },
  });
  map.addLayer({
    id: AOI_LINE,
    type: "line",
    source: AOI_SOURCE,
    paint: { "line-color": "#06b6d4", "line-width": 1.8 },
  });
}

export function WaterMap({
  onSelect,
  flyTo,
  forceBasemap,
}: {
  onSelect: (lng: number, lat: number, polygon: GeoJSONPolygon) => void;
  /** When set, the map flies to this point and analyzes it (geolocation flow). */
  flyTo?: { lng: number; lat: number } | null;
  /** When set, forces the basemap (e.g. terrain once a result is ready). */
  forceBasemap?: Basemap | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const polygonRef = useRef<GeoJSONPolygon | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const firstBasemapRun = useRef(true);
  const [basemap, setBasemap] = useState<Basemap>("satellite");

  const selectPoint = (map: maplibregl.Map, lng: number, lat: number) => {
    const polygon = pointToBufferPolygon(lng, lat, 1);
    polygonRef.current = polygon;
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color: "#06b6d4" })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }
    drawAoi(map, polygon);
    onSelectRef.current(lng, lat, polygon);
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLES.satellite,
      center: [32.9, -1.0],
      zoom: 6,
    });
    map.addControl(new maplibregl.NavigationControl({}), "top-right");
    map.on("click", (e) => selectPoint(map, e.lngLat.lng, e.lngLat.lat));
    mapRef.current = map;

    // Resize the map when its container changes size (e.g. it shrinks to the
    // top when the report appears below it).
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Skip the initial run: the map is already created with the satellite
    // style, so re-setting it mid-load would break later switches.
    if (firstBasemapRun.current) {
      firstBasemapRun.current = false;
      return;
    }
    map.setStyle(STYLES[basemap], { diff: false });
    map.once("styledata", () => {
      if (polygonRef.current) drawAoi(map, polygonRef.current);
    });
  }, [basemap]);

  // Geolocation flow: fly to the given point and analyze it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;
    map.flyTo({ center: [flyTo.lng, flyTo.lat], zoom: 12 });
    selectPoint(map, flyTo.lng, flyTo.lat);
  }, [flyTo]);

  // Parent can force a basemap (e.g. switch to terrain when a result is ready).
  useEffect(() => {
    if (forceBasemap) setBasemap(forceBasemap);
  }, [forceBasemap]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute bottom-4 left-4 inline-flex overflow-hidden rounded-lg border border-border bg-card shadow-card">
        {BASEMAPS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setBasemap(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${
              basemap === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
