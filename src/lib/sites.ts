/**
 * Canonical site/region model shared by every domain (contractors, workers,
 * inspections, incidents). Contractors are contracted at the region level;
 * workers, inspections and incidents are tied to one specific named site
 * within a region. This is what lets a contractor's detail page show the
 * mine's workforce and recent safety activity at its site(s).
 */
export type MiningRegion =
  | "Rustenburg"
  | "eMalahleni (Witbank)"
  | "Kathu"
  | "Marikana"
  | "Carletonville"
  | "Steelpoort"
  | "Burgersfort"
  | "Booysendal"
  | "Mogalakwena";

export const MINING_REGIONS: MiningRegion[] = [
  "Rustenburg",
  "eMalahleni (Witbank)",
  "Kathu",
  "Marikana",
  "Carletonville",
  "Steelpoort",
  "Burgersfort",
  "Booysendal",
  "Mogalakwena",
];

export interface MiningSite {
  id: string;
  name: string;
  region: MiningRegion;
}

export const MINING_SITES: MiningSite[] = [
  { id: "bathopele-mine", name: "Bathopele Mine", region: "Rustenburg" },
  { id: "thembelani-shaft", name: "Thembelani Shaft", region: "Rustenburg" },
  { id: "khutala-colliery", name: "Khutala Colliery", region: "eMalahleni (Witbank)" },
  { id: "greenside-colliery", name: "Greenside Colliery", region: "eMalahleni (Witbank)" },
  { id: "sishen-mine", name: "Sishen Mine", region: "Kathu" },
  { id: "marikana-operations", name: "Marikana Operations", region: "Marikana" },
  { id: "mponeng-mine", name: "Mponeng Mine", region: "Carletonville" },
  { id: "leeuwpoort-drill-section", name: "Leeuwpoort Drill Section", region: "Steelpoort" },
  { id: "tumela-shaft", name: "Tumela Shaft", region: "Burgersfort" },
  { id: "booysendal-platinum-mine", name: "Booysendal Platinum Mine", region: "Booysendal" },
  { id: "dishaba-section", name: "Dishaba Section", region: "Mogalakwena" },
];

export function getSiteById(id: string): MiningSite | undefined {
  return MINING_SITES.find((s) => s.id === id);
}

export function getSitesForRegion(region: MiningRegion): MiningSite[] {
  return MINING_SITES.filter((s) => s.region === region);
}

export function siteLabel(id: string): string {
  const site = getSiteById(id);
  return site ? `${site.name} — ${site.region}` : id;
}
