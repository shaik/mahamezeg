export const DEMO_SCENARIOS = [
  {
    id: "summer_hot_nice_night",
    today:   { temperature: 35, humidity: 55 },
    tonight: { temperature: 22, humidity: 70 },
    tomorrow:{ temperature: 34, humidity: 58 }
  },
  {
    id: "humid_day_ok_night",
    today:   { temperature: 32, humidity: 72 },
    tonight: { temperature: 24, humidity: 75 },
    tomorrow:{ temperature: 33, humidity: 68 }
  },
  {
    id: "heatwave_dry",
    today:   { temperature: 38, humidity: 28 },
    tonight: { temperature: 26, humidity: 45 },
    tomorrow:{ temperature: 39, humidity: 30 }
  },
  {
    id: "perfect_day_cool_night",
    today:   { temperature: 24, humidity: 55 },
    tonight: { temperature: 17, humidity: 65 },
    tomorrow:{ temperature: 27, humidity: 50 }
  },
  {
    id: "extreme_humid",
    today:   { temperature: 39, humidity: 75 },
    tonight: { temperature: 28, humidity: 80 },
    tomorrow:{ temperature: 38, humidity: 70 }
  }
];

export function getDemoWindows() {
  const scenario = DEMO_SCENARIOS[Math.floor(Math.random() * DEMO_SCENARIOS.length)];
  return {
    today:    scenario.today,
    tonight:  scenario.tonight,
    tomorrow: scenario.tomorrow,
    scenarioId: scenario.id
  };
}
