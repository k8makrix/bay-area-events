"use client";

import { useState, useCallback, useRef } from "react";
import Map, { Source, Layer, type MapRef, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import { BAY_AREA_REGIONS, type RegionProperties } from "@/lib/geo/bay-area-regions";
import { RegionPopup } from "@/components/region-popup";

const INITIAL_VIEW = {
  longitude: -122.15,
  latitude: 37.7,
  zoom: 8,
};

// Free vector tile style — OpenFreeMap (no API key needed)
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export function BayAreaMap() {
  const mapRef = useRef<MapRef>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<RegionProperties | null>(null);

  const onMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ["region-fill"],
    });

    if (features.length > 0) {
      const regionId = features[0].properties?.id as string;
      setHoveredRegion(regionId);
      map.getCanvas().style.cursor = "pointer";
    } else {
      setHoveredRegion(null);
      map.getCanvas().style.cursor = "";
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoveredRegion(null);
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = "";
  }, []);

  const onClick = useCallback((e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ["region-fill"],
    });

    if (features.length > 0) {
      const props = features[0].properties as unknown as RegionProperties;
      // Center is stored as a string in GeoJSON properties after queryRenderedFeatures
      let center: [number, number];
      if (typeof props.center === "string") {
        center = JSON.parse(props.center) as [number, number];
      } else {
        center = props.center;
      }

      setActiveRegion({ ...props, center });
      map.flyTo({
        center,
        zoom: 10,
        duration: 800,
      });
    } else {
      // Clicked outside any region — dismiss popup, fly back
      setActiveRegion(null);
      map.flyTo({
        center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
        zoom: INITIAL_VIEW.zoom,
        duration: 600,
      });
    }
  }, []);

  const onLoad = useCallback(() => {
    // Force resize after dynamic load so the canvas fills the container
    mapRef.current?.getMap()?.resize();
  }, []);

  const onPopupClose = useCallback(() => {
    setActiveRegion(null);
    const map = mapRef.current?.getMap();
    if (map) {
      map.flyTo({
        center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
        zoom: INITIAL_VIEW.zoom,
        duration: 600,
      });
    }
  }, []);

  return (
    <div className="h-[300px] w-full overflow-hidden rounded-xl border border-card-border sm:h-[350px] lg:h-[400px]">
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapStyle={MAP_STYLE}
        onLoad={onLoad}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        touchPitch={false}
        dragRotate={false}
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <Source id="regions" type="geojson" data={BAY_AREA_REGIONS}>
          {/* Semi-transparent region fills */}
          <Layer
            id="region-fill"
            type="fill"
            paint={{
              "fill-color": ["get", "color"],
              "fill-opacity": [
                "case",
                ["==", ["get", "id"], activeRegion?.id ?? ""],
                0.5,
                ["==", ["get", "id"], hoveredRegion ?? ""],
                0.4,
                0.2,
              ],
            }}
          />

          {/* Region outlines */}
          <Layer
            id="region-line"
            type="line"
            paint={{
              "line-color": [
                "case",
                ["==", ["get", "id"], activeRegion?.id ?? ""],
                "#e07a3a",
                ["get", "color"],
              ],
              "line-width": [
                "case",
                ["==", ["get", "id"], activeRegion?.id ?? ""],
                2.5,
                ["==", ["get", "id"], hoveredRegion ?? ""],
                2,
                1,
              ],
              "line-opacity": 0.7,
            }}
          />

          {/* Region name labels */}
          <Layer
            id="region-label"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 13,
              "text-font": ["Open Sans Bold"],
              "text-anchor": "center",
              "text-allow-overlap": false,
            }}
            paint={{
              "text-color": "#2d2a26",
              "text-halo-color": "#ffffff",
              "text-halo-width": 1.5,
            }}
          />
        </Source>

        {activeRegion && (
          <RegionPopup
            regionId={activeRegion.id}
            regionName={activeRegion.name}
            scope={activeRegion.scope}
            latitude={activeRegion.center[1]}
            longitude={activeRegion.center[0]}
            onClose={onPopupClose}
          />
        )}
      </Map>
    </div>
  );
}

export default BayAreaMap;
