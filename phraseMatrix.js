// Rules are evaluated top to bottom — first match wins.
// Specific overrides (hot+humid, hot+dry) must come before generic temperature rules.
export const PHRASE_RULES = [
  { id: "heatwave_dry",      minTemp: 34,                  maxHumidity: 35, phrase: "חמסין" },
  { id: "extreme_hot_humid", minTemp: 38,                  minHumidity: 65, phrase: "תאילנד על סטרואידים" },
  { id: "very_hot_humid",    minTemp: 34, maxTemp: 37.99,  minHumidity: 65, phrase: "סחוניה דל מות" },
  { id: "hot_humid",         minTemp: 30, maxTemp: 33.99,  minHumidity: 65, phrase: "חם ודביק" },
  { id: "freezing",                       maxTemp: 9.99,                    phrase: "קור כלבים" },
  { id: "cold",              minTemp: 10, maxTemp: 14.99,                   phrase: "קר" },
  { id: "cool_ok",           minTemp: 15, maxTemp: 19.99,                   phrase: "קצת קריר, אבל סבבה" },
  { id: "perfect",           minTemp: 20, maxTemp: 24.99,                   phrase: "מושלם" },
  { id: "warm",              minTemp: 25, maxTemp: 29.99,                   phrase: "חם" },
  { id: "hot",               minTemp: 30, maxTemp: 33.99,                   phrase: "חם למות" },
  { id: "very_hot",          minTemp: 34, maxTemp: 37.99,                   phrase: "חם נבלות" },
  { id: "extreme_hot",       minTemp: 38,                                   phrase: "חום איימים" }
];

export function getWeatherPhrase({ temperature, humidity }) {
  for (const rule of PHRASE_RULES) {
    if (rule.minTemp     !== undefined && temperature < rule.minTemp)     continue;
    if (rule.maxTemp     !== undefined && temperature > rule.maxTemp)     continue;
    if (rule.minHumidity !== undefined && humidity    < rule.minHumidity) continue;
    if (rule.maxHumidity !== undefined && humidity    > rule.maxHumidity) continue;
    return rule.phrase;
  }
  return "לא ברור";
}
