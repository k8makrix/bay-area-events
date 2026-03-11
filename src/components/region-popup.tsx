"use client";

import Link from "next/link";
import { Popup } from "react-map-gl/maplibre";
import { SCOPES } from "@/lib/scoring/scopes";
import type { ScopeName } from "@/lib/scoring/scopes";

interface RegionPopupProps {
  regionId: string;
  regionName: string;
  scope: string;
  latitude: number;
  longitude: number;
  onClose: () => void;
}

export function RegionPopup({
  regionName,
  scope,
  latitude,
  longitude,
  onClose,
}: RegionPopupProps) {
  const cities =
    scope in SCOPES ? [...SCOPES[scope as ScopeName]].slice(0, 5) : [];

  return (
    <Popup
      latitude={latitude}
      longitude={longitude}
      onClose={onClose}
      closeOnClick={false}
      anchor="bottom"
      offset={12}
      maxWidth="260px"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold text-foreground">{regionName}</h3>

        {cities.length > 0 && (
          <p className="text-xs text-muted">
            {cities.join(", ")}
            {SCOPES[scope as ScopeName]?.length > 5 ? " ..." : ""}
          </p>
        )}

        <Link
          href={`/events?scope=${scope}&timeframe=thisWeekend`}
          className="mt-1 block rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-light"
          style={{ minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          Browse {regionName} Events →
        </Link>
      </div>
    </Popup>
  );
}
