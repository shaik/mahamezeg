export const LOCATIONS = [
  { id: "tel_aviv",    nameHe: "תל אביב",    latitude: 32.0853, longitude: 34.7818, timezone: "Asia/Jerusalem" },
  { id: "jerusalem",  nameHe: "ירושלים",    latitude: 31.7683, longitude: 35.2137, timezone: "Asia/Jerusalem" },
  { id: "haifa",      nameHe: "חיפה",       latitude: 32.7940, longitude: 34.9896, timezone: "Asia/Jerusalem" },
  { id: "beer_sheva", nameHe: "באר שבע",    latitude: 31.2529, longitude: 34.7915, timezone: "Asia/Jerusalem" },
  { id: "eilat",      nameHe: "אילת",       latitude: 29.5577, longitude: 34.9519, timezone: "Asia/Jerusalem" },
  { id: "golan",      nameHe: "רמת הגולן",  latitude: 33.0150, longitude: 35.7770, timezone: "Asia/Jerusalem" },
  { id: "galilee",    nameHe: "גליל",       latitude: 32.9650, longitude: 35.3810, timezone: "Asia/Jerusalem" },
  { id: "dead_sea",   nameHe: "ים המלח",    latitude: 31.5590, longitude: 35.4732, timezone: "Asia/Jerusalem" }
];

export const DEFAULT_LOCATION = LOCATIONS.find(l => l.id === "tel_aviv");
