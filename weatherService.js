import { DEFAULT_LOCATION } from './locationConfig.js';

export async function fetchHourlyForecast(location = DEFAULT_LOCATION) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${location.latitude}` +
    `&longitude=${location.longitude}` +
    `&hourly=temperature_2m,relative_humidity_2m` +
    `&timezone=${encodeURIComponent(location.timezone)}` +
    `&forecast_days=3`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  // The API returns times in the requested timezone without offset info, e.g. "2024-06-08T18:00".
  // Appending 'Z' stores them as naive-UTC so they compare correctly with our Israel-time boundaries.
  return data.hourly.time.map((timeStr, i) => ({
    time:        new Date(timeStr + 'Z'),
    temperature: data.hourly.temperature_2m[i],
    humidity:    data.hourly.relative_humidity_2m[i]
  }));
}

// Returns { maxTemperature, maxHumidity } for all hours in [startTime, endTime).
export function aggregateWindow(hourlyData, startTime, endTime) {
  const hours = hourlyData.filter(h => h.time >= startTime && h.time < endTime);
  if (hours.length === 0) return null;
  return {
    maxTemperature: Math.max(...hours.map(h => h.temperature)),
    maxHumidity:    Math.max(...hours.map(h => h.humidity))
  };
}
