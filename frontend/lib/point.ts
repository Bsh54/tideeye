// Turn a clicked point into a square AOI box (~radiusKm on each side),
// latitude-corrected. The same polygon is drawn on the map and sent to the
// backend, so the analyzed zone always matches the framed rectangle.
export type GeoJSONPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export function pointToBufferPolygon(
  lng: number,
  lat: number,
  radiusKm = 1,
): GeoJSONPolygon {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    type: "Polygon",
    coordinates: [
      [
        [lng - lngDelta, lat - latDelta],
        [lng + lngDelta, lat - latDelta],
        [lng + lngDelta, lat + latDelta],
        [lng - lngDelta, lat + latDelta],
        [lng - lngDelta, lat - latDelta],
      ],
    ],
  };
}
