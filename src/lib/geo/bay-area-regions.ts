import type { FeatureCollection, Feature, Polygon } from "geojson";

export interface RegionProperties {
  id: string;
  name: string;
  scope: string;
  center: [number, number]; // [lng, lat]
  color: string;
}

export type RegionFeature = Feature<Polygon, RegionProperties>;
export type RegionCollection = FeatureCollection<Polygon, RegionProperties>;

/**
 * Simplified GeoJSON polygons for 5 Bay Area sub-regions.
 * These are editorial boundaries for visual display and click targets,
 * not precise administrative boundaries. Adjacent regions share edges.
 */
export const BAY_AREA_REGIONS: RegionCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "sf",
        name: "San Francisco",
        scope: "sf",
        center: [-122.42, 37.77],
        color: "#e07a3a",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.517, 37.708], // SW corner (Daly City border near ocean)
            [-122.517, 37.785], // W coast mid
            [-122.497, 37.812], // NW (Presidio coast)
            [-122.477, 37.818], // Golden Gate south
            [-122.435, 37.812], // Marina
            [-122.385, 37.808], // Embarcadero north
            [-122.355, 37.790], // AT&T Park area
            [-122.355, 37.708], // SE corner (county line at bay)
            [-122.517, 37.708], // close polygon
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "northBay",
        name: "North Bay",
        scope: "northBay",
        center: [-122.50, 38.05],
        color: "#8fb573",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.80, 37.818],  // W coast at GG latitude
            [-122.477, 37.818], // Golden Gate north
            [-122.435, 37.812], // Bridge east end
            [-122.385, 37.808], // Embarcadero/Ferry area
            [-122.35, 37.815],  // Treasure Island area
            [-122.35, 37.92],   // Richmond bridge east
            [-122.20, 37.92],   // San Pablo Bay east
            [-122.20, 38.20],   // North to Petaluma area
            [-122.80, 38.20],   // NW corner
            [-122.80, 37.818],  // close polygon
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "eastBay",
        name: "East Bay",
        scope: "eastBay",
        center: [-122.20, 37.80],
        color: "#d4a574",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.35, 37.815],  // Treasure Island / Bay Bridge
            [-122.35, 37.92],   // Richmond bridge
            [-122.20, 37.92],   // San Pablo Bay
            [-122.05, 37.92],   // NE hills
            [-122.05, 37.55],   // SE (near Fremont hills)
            [-122.15, 37.55],   // Fremont
            [-122.25, 37.59],   // Union City / bay shore
            [-122.30, 37.65],   // San Leandro shore
            [-122.33, 37.72],   // Bay Farm Island
            [-122.355, 37.790], // Oakland waterfront
            [-122.385, 37.808], // Bay Bridge west approach
            [-122.35, 37.815],  // close polygon
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "peninsula",
        name: "Peninsula",
        scope: "peninsula",
        center: [-122.30, 37.50],
        color: "#b58d6e",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.517, 37.708], // SW (SF county line at coast)
            [-122.355, 37.708], // SE (SF county line at bay)
            [-122.33, 37.72],   // Bay edge
            [-122.30, 37.65],   // San Mateo bay shore
            [-122.25, 37.59],   // Redwood City shore
            [-122.20, 37.55],   // East edge near bay
            [-122.15, 37.42],   // Palo Alto / Mountain View
            [-122.15, 37.38],   // South boundary
            [-122.50, 37.38],   // SW coast (Half Moon Bay area)
            [-122.52, 37.50],   // Coast mid
            [-122.517, 37.708], // close polygon
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "southBay",
        name: "South Bay",
        scope: "southBay",
        center: [-121.90, 37.33],
        color: "#c4956a",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.15, 37.42],   // NW (Mountain View)
            [-122.15, 37.38],   // Peninsula border
            [-122.05, 37.55],   // NE (Fremont hills)
            [-121.75, 37.55],   // East hills
            [-121.70, 37.20],   // SE (Morgan Hill / Gilroy area)
            [-122.05, 37.15],   // South (below Gilroy)
            [-122.30, 37.20],   // SW (Santa Cruz Mtns)
            [-122.50, 37.38],   // W coast border with Peninsula
            [-122.15, 37.38],   // Back to Peninsula border
            [-122.15, 37.42],   // close polygon
          ],
        ],
      },
    },
  ],
};

/** Lookup a region by its scope key */
export function getRegionByScope(scope: string): RegionFeature | undefined {
  return BAY_AREA_REGIONS.features.find((f) => f.properties.scope === scope);
}

/** Get all region names and scopes for display */
export function getRegionList(): Array<{ id: string; name: string; scope: string }> {
  return BAY_AREA_REGIONS.features.map((f) => ({
    id: f.properties.id,
    name: f.properties.name,
    scope: f.properties.scope,
  }));
}
