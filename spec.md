# Product Requirements: `mahamezeg` — Minimal Hebrew Slang Weather App

## 1. Product Summary

Build a very simple client-side weather app called **`mahamezeg`** / **"מה המזג?"**.

The app displays a short, human, colloquial Hebrew weather summary for the next relevant 24-hour period.

The unique value of the app is not detailed meteorological data, but translating temperature and humidity into everyday Hebrew slang such as:

- `קר`
- `ממש קר`
- `קור כלבים`
- `קצת קריר, אבל סבבה`
- `מושלם`
- `חם`
- `חם למות`
- `חם נבלות`
- `חום איימים`
- `חם ודביק`
- `סחוניה דל מות`
- `תאילנד על סטרואידים`
- `חמסין`

The UI should be extremely minimal: only text on screen, similar in spirit to a simple Hebrew clock app.

The first version is fully client-side and hosted on **GitHub Pages**.

---

## 2. Core Requirements

### 2.1 Language

The app UI is Hebrew only.

No English UI should be visible to the user in the main app.

### 2.2 Directionality

The app must use full RTL layout.

Set:

```html
<html lang="he" dir="rtl">
```

All user-facing text should be right-to-left.

### 2.3 Visual Style

The UI should be minimalist.

Use:

- White or very light background
- Black text
- No images
- No icons required
- No cards unless necessary
- No charts
- No hourly table
- No weather symbols
- No unnecessary buttons on the main screen

The main screen should show only two weather summary lines.

Example during the day:

```text
היום: חם נבלות
הלילה: קצת קריר, אבל סבבה
```

Example during evening/night:

```text
הלילה: קצת קריר, אבל סבבה
מחר: חם נבלות
```

The app should be mobile-first but should also look acceptable on desktop.

---

## 3. Deployment Target

The app must be deployable to GitHub Pages.

Therefore:

- No backend server
- No server-side rendering
- No build step required unless absolutely necessary
- Prefer plain static files
- Use Vanilla HTML/CSS/JavaScript
- No framework

Recommended file structure:

```text
/
  index.html
  styles.css
  app.js
  weatherService.js
  phraseMatrix.js
  locationConfig.js
  demoMode.js
  manifest.json
  service-worker.js
```

The service worker can be very basic or intentionally minimal, but the app should include PWA-ready structure.

---

## 4. Weather Data Source

Use **Open-Meteo** for the first version.

Reason:

- Free
- No API key required
- Works client-side
- Supports hourly forecast
- Suitable for GitHub Pages

Use Tel Aviv as the hardcoded default location for v1:

```js
const DEFAULT_LOCATION = {
  id: "tel_aviv",
  nameHe: "תל אביב",
  latitude: 32.0853,
  longitude: 34.7818,
  timezone: "Asia/Jerusalem"
};
```

Fetch hourly data for at least the next 24–36 hours to make sure the app can calculate today, tonight, and tomorrow windows reliably.

Required hourly fields:

```text
temperature_2m
relative_humidity_2m
```

Rain/precipitation is not required for the first version because this version is initially focused on Israeli summer weather.

However, structure the code so precipitation can be added later.

---

## 5. Time Logic

The app determines what to display based on local Israel time.

Use timezone:

```text
Asia/Jerusalem
```

### 5.1 Day vs Evening/Night

Use fixed time ranges for v1.

Do not calculate sunrise/sunset yet.

```text
Day mode:        05:00–17:59
Evening/night:  18:00–04:59
```

### 5.2 Forecast Windows

Define three logical forecast windows:

```text
today:
  from now until 18:00 today

tonight:
  from 18:00 today until 06:00 tomorrow

tomorrow:
  from 06:00 tomorrow until 18:00 tomorrow
```

If the app opens between `05:00` and `17:59`, display:

```text
היום: <phrase for today>
הלילה: <phrase for tonight>
```

If the app opens between `18:00` and `04:59`, display:

```text
הלילה: <phrase for tonight>
מחר: <phrase for tomorrow>
```

Important edge case:

If the app opens after midnight but before 05:00, `הלילה` still refers to the current night, and `מחר` should mean the coming daytime period after 06:00.

---

## 6. Weather Aggregation Logic

For each forecast window, calculate representative weather values.

For v1:

```text
temperature: maximum temperature in the window
humidity: maximum relative humidity in the window
```

Do not use average values.

Reason: the app should describe how the period will feel at its most significant point, not the mathematical average.

Example object:

```js
{
  windowId: "today",
  maxTemperature: 34.2,
  maxHumidity: 71
}
```

Round values only if needed internally. The user does not see numbers.

---

## 7. Phrase Matrix

The weather phrase must be selected from a manually editable matrix.

The matrix should be easy for a non-developer to edit.

Implement it in:

```text
phraseMatrix.js
```

The selection should currently consider:

- Temperature
- Humidity

Rain/precipitation should be planned for later but not required in v1.

### 7.1 Temperature Bands

Use the following initial temperature bands:

```text
below 10°C:  קור כלבים
10–15°C:    קר
15–19°C:    קצת קריר, אבל סבבה
20–24°C:    מושלם
25–29°C:    חם
30–33°C:    חם למות
34–37°C:    חם נבלות
38°C+:      חום איימים
```

### 7.2 Humidity Modifiers / Overrides

Humidity should affect hot-weather phrases.

Initial logic:

For temperatures below 30°C, humidity usually should not override the basic phrase.

For hot temperatures, high humidity should produce stronger “sticky” phrases.

Suggested initial matrix:

```text
30–33°C + high humidity:
  חם ודביק

34–37°C + high humidity:
  סחוניה דל מות

38°C+ + high humidity:
  תאילנד על סטרואידים
```

For hot and dry weather, use:

```text
חמסין
```

Suggested initial condition:

```text
temperature >= 34°C
humidity <= 35%
```

This should override the default hot phrase.

### 7.3 Suggested Initial Implementation

Use an ordered rules array rather than nested if/else, so the user can easily add and reorder phrases later.

Example:

```js
export const PHRASE_RULES = [
  {
    id: "heatwave_dry",
    minTemp: 34,
    maxHumidity: 35,
    phrase: "חמסין"
  },
  {
    id: "extreme_hot_humid",
    minTemp: 38,
    minHumidity: 65,
    phrase: "תאילנד על סטרואידים"
  },
  {
    id: "very_hot_humid",
    minTemp: 34,
    maxTemp: 37.99,
    minHumidity: 65,
    phrase: "סחוניה דל מות"
  },
  {
    id: "hot_humid",
    minTemp: 30,
    maxTemp: 33.99,
    minHumidity: 65,
    phrase: "חם ודביק"
  },
  {
    id: "freezing",
    maxTemp: 9.99,
    phrase: "קור כלבים"
  },
  {
    id: "cold",
    minTemp: 10,
    maxTemp: 14.99,
    phrase: "קר"
  },
  {
    id: "cool_ok",
    minTemp: 15,
    maxTemp: 19.99,
    phrase: "קצת קריר, אבל סבבה"
  },
  {
    id: "perfect",
    minTemp: 20,
    maxTemp: 24.99,
    phrase: "מושלם"
  },
  {
    id: "warm",
    minTemp: 25,
    maxTemp: 29.99,
    phrase: "חם"
  },
  {
    id: "hot",
    minTemp: 30,
    maxTemp: 33.99,
    phrase: "חם למות"
  },
  {
    id: "very_hot",
    minTemp: 34,
    maxTemp: 37.99,
    phrase: "חם נבלות"
  },
  {
    id: "extreme_hot",
    minTemp: 38,
    phrase: "חום איימים"
  }
];
```

Rules should be evaluated from top to bottom.

The first matching rule wins.

This allows specific overrides, such as hot + humid or hot + dry, to run before generic temperature rules.

---

## 8. Deterministic Text

In v1, the phrase selection must be deterministic.

Same temperature + humidity = same phrase.

Do not randomly select different real weather phrases in the main production mode.

Random phrase combinations are only allowed in the separate demo mode.

---

## 9. Demo Mode

Add a demo mode that shows random but logical combinations of day and night phrases.

Purpose:

- Let the user preview the app without relying on live weather data.
- Help test the tone of the phrase matrix.
- Make it easy to see different phrase combinations.

### 9.1 Activating Demo Mode

Support demo mode via query parameter:

```text
?demo=1
```

Example:

```text
https://username.github.io/mahamezeg/?demo=1
```

Optionally also support:

```text
?mode=demo
```

### 9.2 Demo Mode Behavior

When demo mode is active:

- Do not call Open-Meteo.
- Generate synthetic weather windows.
- Display the same two-line layout as the real app.
- Respect the current time display logic:
  - During day: show `היום` and `הלילה`
  - During evening/night: show `הלילה` and `מחר`

### 9.3 Logical Random Combinations

Demo mode must avoid absurd combinations.

For example:

Bad:

```text
היום: חום איימים
הלילה: חום איימים
```

This can happen in extreme heatwaves, but it is not ideal for casual demo rotation.

Better:

```text
היום: חם נבלות
הלילה: קצת קריר, אבל סבבה
```

or:

```text
היום: חם ודביק
הלילה: מושלם
```

or:

```text
הלילה: קצת קריר, אבל סבבה
מחר: חם למות
```

### 9.4 Demo Data Sets

Implement demo mode using a small set of predefined logical scenarios rather than fully random values.

Example:

```js
export const DEMO_SCENARIOS = [
  {
    id: "summer_hot_nice_night",
    today: { temperature: 35, humidity: 55 },
    tonight: { temperature: 22, humidity: 70 },
    tomorrow: { temperature: 34, humidity: 58 }
  },
  {
    id: "humid_day_ok_night",
    today: { temperature: 32, humidity: 72 },
    tonight: { temperature: 24, humidity: 75 },
    tomorrow: { temperature: 33, humidity: 68 }
  },
  {
    id: "heatwave_dry",
    today: { temperature: 38, humidity: 28 },
    tonight: { temperature: 26, humidity: 45 },
    tomorrow: { temperature: 39, humidity: 30 }
  },
  {
    id: "perfect_day_cool_night",
    today: { temperature: 24, humidity: 55 },
    tonight: { temperature: 17, humidity: 65 },
    tomorrow: { temperature: 27, humidity: 50 }
  },
  {
    id: "extreme_humid",
    today: { temperature: 39, humidity: 75 },
    tonight: { temperature: 28, humidity: 80 },
    tomorrow: { temperature: 38, humidity: 70 }
  }
];
```

On each page load in demo mode, choose one random scenario.

Optional but recommended:

Add support for cycling scenarios every few seconds only if a debug flag is present:

```text
?demo=1&rotate=1
```

Default demo mode should choose one scenario per page load and stay stable.

---

## 10. Hidden Settings

Do not implement full settings in v1 unless simple.

But prepare the architecture for hidden settings.

Future hidden settings should allow the user to choose an Israeli region manually.

Suggested trigger:

```text
Long press on the main screen
```

or:

```text
5 taps on the main screen
```

For v1, it is acceptable to only leave a placeholder function.

Example:

```js
function setupHiddenSettingsTrigger() {
  // Placeholder for future hidden settings panel.
}
```

### 10.1 Future Location List

Prepare this list in `locationConfig.js`, even if only Tel Aviv is used initially:

```js
export const LOCATIONS = [
  {
    id: "tel_aviv",
    nameHe: "תל אביב",
    latitude: 32.0853,
    longitude: 34.7818,
    timezone: "Asia/Jerusalem"
  },
  {
    id: "jerusalem",
    nameHe: "ירושלים",
    latitude: 31.7683,
    longitude: 35.2137,
    timezone: "Asia/Jerusalem"
  },
  {
    id: "haifa",
    nameHe: "חיפה",
    latitude: 32.7940,
    longitude: 34.9896,
    timezone: "Asia/Jerusalem"
  },
  {
    id: "beer_sheva",
    nameHe: "באר שבע",
    latitude: 31.2529,
    longitude: 34.7915,
    timezone: "Asia/Jerusalem"
  },
  {
    id: "eilat",
    nameHe: "אילת",
    latitude: 29.5577,
    longitude: 34.9519,
    timezone: "Asia/Jerusalem"
  },
  {
    id: "golan",
    nameHe: "רמת הגולן",
    latitude: 33.0150,
    longitude: 35.7770,
    timezone: "Asia/Jerusalem"
  },
  {
    id: "galilee",
    nameHe: "גליל",
    latitude: 32.9650,
    longitude: 35.3810,
    timezone: "Asia/Jerusalem"
  },
  {
    id: "dead_sea",
    nameHe: "ים המלח",
    latitude: 31.5590,
    longitude: 35.4732,
    timezone: "Asia/Jerusalem"
  }
];
```

For v1, use `tel_aviv` by default.

---

## 11. Error Handling

Keep errors minimal and in the same informal Hebrew tone.

If weather data cannot be loaded:

```text
אין לי מושג מה קורה בחוץ
```

If the browser is offline or the fetch fails because of network issues:

```text
אין קליטה. תסתכלו מהחלון
```

Do not show technical error details to the user on the main screen.

Technical errors may be logged to the browser console.

---

## 12. No Nikud

Do not use Hebrew vowel marks / nikud in v1.

All Hebrew text should be plain unvocalized Hebrew.

---

## 13. Tone Guidelines

The tone should be:

- Everyday Hebrew
- Funny
- Slightly street-language
- Not formal
- Not childish
- Not aggressively vulgar

Allowed examples:

```text
חם נבלות
סחוניה דל מות
קור כלבים
חום איימים
חם למות
תאילנד על סטרואידים
```

Avoid real profanity in v1.

The app should not directly address the user by gender.

Prefer weather descriptions only.

---

## 14. PWA Support

Include basic PWA support.

### 14.1 `manifest.json`

Include:

```json
{
  "name": "mahamezeg",
  "short_name": "מה המזג?",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "dir": "rtl",
  "lang": "he"
}
```

Icons can be placeholders for now.

### 14.2 Service Worker

Add a simple service worker only if it does not complicate the implementation.

Minimum goal:

- Cache static app shell files
- Do not cache weather API responses aggressively
- Make sure stale weather is not shown as if it is current

If service worker adds complexity, keep the file minimal or defer actual caching.

---

## 15. Architecture

Separate the app into small modules.

### 15.1 `index.html`

Responsibilities:

- Basic document shell
- RTL Hebrew setup
- Root container
- Load JavaScript modules

Main visible markup should be minimal:

```html
<main id="app" class="app">
  <div id="forecast" class="forecast" aria-live="polite"></div>
</main>
```

### 15.2 `styles.css`

Responsibilities:

- Minimal layout
- Mobile-first typography
- RTL
- Centered or near-centered text
- Clean readable spacing

Suggested style direction:

```css
body {
  margin: 0;
  min-height: 100vh;
  background: #ffffff;
  color: #000000;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  direction: rtl;
}

.app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.forecast {
  font-size: clamp(2rem, 8vw, 5rem);
  line-height: 1.35;
  font-weight: 400;
}
```

### 15.3 `app.js`

Responsibilities:

- App startup
- Determine demo mode
- Get current time
- Decide which labels to display
- Fetch or generate weather data
- Render final two-line text

### 15.4 `weatherService.js`

Responsibilities:

- Build Open-Meteo URL
- Fetch hourly forecast
- Normalize response into internal hourly data format

Example internal shape:

```js
{
  time: Date,
  temperature: number,
  humidity: number
}
```

### 15.5 `phraseMatrix.js`

Responsibilities:

- Store phrase rules
- Export function:

```js
getWeatherPhrase({ temperature, humidity })
```

This function returns a Hebrew phrase.

### 15.6 `locationConfig.js`

Responsibilities:

- Store location definitions
- Export default location
- Prepare future location support

### 15.7 `demoMode.js`

Responsibilities:

- Store demo scenarios
- Choose random scenario
- Return synthetic weather window values

---

## 16. Main Rendering Logic

Final displayed data should be an array of two lines.

Example:

```js
[
  { label: "היום", phrase: "חם נבלות" },
  { label: "הלילה", phrase: "קצת קריר, אבל סבבה" }
]
```

Render as:

```text
היום: חם נבלות
הלילה: קצת קריר, אבל סבבה
```

Use line breaks, not cards.

No extra labels, no location, no timestamp on the main screen.

---

## 17. Debug / Development Options

Optional query parameters:

```text
?demo=1
```

Activates demo mode.

```text
?demo=1&rotate=1
```

Optional: rotate demo scenarios every few seconds.

```text
?debug=1
```

Optional: log selected scenario, calculated temperature, humidity, selected rule, and display mode to console.

Do not show debug data in the UI.

---

## 18. Acceptance Criteria

The implementation is acceptable when all of the following are true:

1. The app runs as static files on GitHub Pages.
2. The UI is Hebrew, RTL, and minimalist.
3. The main screen shows exactly two weather summary lines.
4. During 05:00–17:59, the labels are:

   ```text
   היום
   הלילה
   ```

5. During 18:00–04:59, the labels are:

   ```text
   הלילה
   מחר
   ```

6. The app fetches hourly temperature and humidity from Open-Meteo for Tel Aviv by default.
7. Each forecast window uses maximum temperature and maximum humidity.
8. The Hebrew phrase is selected from an editable rule-based phrase matrix.
9. Demo mode works with:

   ```text
   ?demo=1
   ```

10. Demo mode does not call the weather API.
11. Demo mode shows logical random combinations.
12. The app has no framework dependency.
13. No backend is required.
14. The code is modular enough to later reuse the phrase logic in an Android widget.
15. No nikud is used.
16. Errors are displayed in informal Hebrew, not technical language.

---

## 19. Implementation Notes for Claude

Prioritize simplicity over abstraction.

Do not overbuild.

Avoid:

- React
- Vue
- Build tools
- TypeScript unless absolutely necessary
- Complex state management
- UI libraries
- Graphs
- Weather icons
- Hourly forecast display
- User accounts
- Analytics

The most important part is clean separation between:

```text
weather fetching
forecast window calculation
phrase selection
rendering
demo mode
```

The phrase matrix should be very easy to edit manually.
