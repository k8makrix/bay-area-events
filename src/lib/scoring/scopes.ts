export const SCOPES = {
  local: ["Campbell", "Los Gatos", "Pruneyard", "Dry Creek"],
  sf: ["San Francisco"],
  northBay: ["San Rafael", "Novato", "Petaluma", "Mill Valley", "Sausalito", "Tiburon", "San Anselmo"],
  southBay: [
    "San Jose", "Santa Clara", "Sunnyvale", "Cupertino",
    "Mountain View", "Campbell", "Los Gatos", "Milpitas",
    "Saratoga", "Gilroy", "Morgan Hill",
  ],
  bayArea: [
    "San Francisco", "Oakland", "Berkeley", "Palo Alto",
    "Redwood City", "Fremont", "Daly City", "Alameda",
    "San Jose", "Santa Clara", "Sunnyvale", "Cupertino",
    "Mountain View", "Campbell", "Los Gatos",
    "San Rafael", "Novato", "Mill Valley",
  ],
  peninsula: ["Redwood City", "Burlingame", "San Mateo", "Half Moon Bay", "Palo Alto", "Menlo Park"],
  eastBay: ["Oakland", "Berkeley", "Emeryville", "Walnut Creek", "Alameda", "Fremont", "Hayward"],
} as const;

export type ScopeName = keyof typeof SCOPES;

export function getCitiesForScope(scope: ScopeName): string[] {
  return [...SCOPES[scope]];
}

export function isInScope(city: string | null | undefined, scope: ScopeName): boolean {
  if (!city) return false;
  const cities = SCOPES[scope];
  return cities.some((c) => c.toLowerCase() === city.toLowerCase());
}

export function isLocal(city: string | null | undefined): boolean {
  return isInScope(city, "local");
}
