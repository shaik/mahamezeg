import { fetchHourlyForecast, aggregateWindow } from './weatherService.js';
import { getWeatherPhrase } from './phraseMatrix.js';
import { getDemoWindows } from './demoMode.js';
import { DEFAULT_LOCATION, LOCATIONS } from './locationConfig.js';

// --- URL params ---
const params    = new URLSearchParams(window.location.search);
const urlDemo   = params.get('demo') === '1' || params.get('mode') === 'demo';
const urlRotate = urlDemo && params.get('rotate') === '1';
const isDebug   = params.get('debug') === '1';

// --- Mutable settings state ---
let activeLocation   = DEFAULT_LOCATION;
let settingsDemo     = false;
let demoCycleTimer   = null;

function isDemoActive() { return urlDemo || settingsDemo; }

// --- Theme ---
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-color-meta')
    ?.setAttribute('content', theme === 'light' ? '#f8f8f8' : '#111111');
  localStorage.setItem('mhm_theme', theme);
}

// --- Israel time helpers ---
// Returns current Israel local time as a "naive UTC" Date for consistent comparisons.
function getIsraelNow() {
  const isoStr = new Date()
    .toLocaleString('sv-SE', { timeZone: 'Asia/Jerusalem' })
    .replace(' ', 'T')
    .slice(0, 19);
  return new Date(isoStr + 'Z');
}

function buildWindows(israelNow) {
  const y  = israelNow.getUTCFullYear();
  const mo = israelNow.getUTCMonth();
  const d  = israelNow.getUTCDate();
  const h  = israelNow.getUTCHours();

  const today18    = new Date(Date.UTC(y, mo, d,      18, 0, 0));
  const today06    = new Date(Date.UTC(y, mo, d,       6, 0, 0));
  const tomorrow06 = new Date(Date.UTC(y, mo, d + 1,   6, 0, 0));
  const tomorrow18 = new Date(Date.UTC(y, mo, d + 1,  18, 0, 0));

  if (h >= 5 && h < 18) return { mode: 'day', windows: {
    today:   { start: israelNow, end: today18 },
    tonight: { start: today18,   end: tomorrow06 }
  }};

  if (h >= 18) return { mode: 'night', windows: {
    tonight:  { start: israelNow,  end: tomorrow06 },
    tomorrow: { start: tomorrow06, end: tomorrow18 }
  }};

  // 00:00–04:59 — still tonight, daytime comes later today
  return { mode: 'night', windows: {
    tonight:  { start: israelNow, end: today06 },
    tomorrow: { start: today06,   end: today18 }
  }};
}

// --- Rendering ---
function renderLines(lines) {
  document.getElementById('forecast').innerHTML = lines
    .map(({ label, phrase }) =>
      `<div class="line"><span class="label">${label}:</span> <span class="phrase">${phrase}</span></div>`
    )
    .join('');
}

function renderError(msg) {
  document.getElementById('forecast').innerHTML = `<div class="line error">${msg}</div>`;
}

// --- Main run ---
async function run() {
  const israelNow = getIsraelNow();
  const { mode, windows } = buildWindows(israelNow);

  if (isDebug) console.log('[debug] mode:', mode, '| Israel hour:', israelNow.getUTCHours());

  let weatherWindows;

  if (isDemoActive()) {
    weatherWindows = getDemoWindows();
    if (isDebug) console.log('[debug] demo scenario:', weatherWindows.scenarioId, weatherWindows);
  } else {
    try {
      const hourlyData = await fetchHourlyForecast(activeLocation);
      weatherWindows = {};
      for (const [key, { start, end }] of Object.entries(windows)) {
        const agg = aggregateWindow(hourlyData, start, end);
        if (agg) {
          weatherWindows[key] = { temperature: agg.maxTemperature, humidity: agg.maxHumidity };
          if (isDebug) console.log(`[debug] ${key}:`, weatherWindows[key]);
        }
      }
    } catch (err) {
      console.error('[mahamezeg] fetch failed:', err);
      renderError(!navigator.onLine ? 'אין קליטה. תסתכלו מהחלון' : 'אין לי מושג מה קורה בחוץ');
      return;
    }
  }

  const slots = mode === 'day'
    ? [{ key: 'today', label: 'היום' }, { key: 'tonight', label: 'הלילה' }]
    : [{ key: 'tonight', label: 'הלילה' }, { key: 'tomorrow', label: 'מחר' }];

  const lines = [];
  for (const { key, label } of slots) {
    const data = weatherWindows[key];
    if (!data) continue;
    const phrase = getWeatherPhrase({ temperature: data.temperature, humidity: data.humidity });
    if (isDebug) console.log(`[debug] ${key} → "${phrase}" (temp=${data.temperature}, hum=${data.humidity})`);
    lines.push({ label, phrase });
  }

  if (lines.length === 0) { renderError('אין לי מושג מה קורה בחוץ'); return; }

  renderLines(lines);

  if (urlRotate && !settingsDemo) setTimeout(run, 3000);
}

// --- Settings panel ---
function openSettings() {
  // Build location list
  document.getElementById('location-list').innerHTML = LOCATIONS.map(loc =>
    `<li><button class="location-item${loc.id === activeLocation.id ? ' active' : ''}"
       data-location-id="${loc.id}">${loc.nameHe}</button></li>`
  ).join('');

  // Sync theme buttons
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeBtn === currentTheme);
  });

  // Sync demo button
  const demoBtn = document.getElementById('settings-demo-btn');
  demoBtn.textContent = settingsDemo ? 'עצור דמו' : 'הפעל דמו';
  demoBtn.classList.toggle('active', settingsDemo);

  document.getElementById('settings').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settings').classList.add('hidden');
}

function startSettingsDemo() {
  settingsDemo = true;
  closeSettings();
  run();
  demoCycleTimer = setInterval(run, 3000);
}

function stopSettingsDemo() {
  clearInterval(demoCycleTimer);
  demoCycleTimer = null;
  settingsDemo = false;
  closeSettings();
  run();
}

function setupHiddenSettingsTrigger() {
  // Hebrew clock pattern: tap the main text to open settings.
  // No long-press — plain click is reliable on all mobile browsers.
  document.getElementById('forecast').addEventListener('click', openSettings);
  document.getElementById('version').addEventListener('click', openSettings);

  // Close on backdrop click
  document.getElementById('settings').addEventListener('pointerdown', e => {
    if (e.target === document.getElementById('settings')) closeSettings();
  });

  document.getElementById('settings-close').addEventListener('click', closeSettings);

  // Location selection
  document.getElementById('location-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-location-id]');
    if (!btn) return;
    const loc = LOCATIONS.find(l => l.id === btn.dataset.locationId);
    if (!loc || loc.id === activeLocation.id) return;
    activeLocation = loc;
    localStorage.setItem('mhm_location', loc.id);
    // Location change always exits demo and shows real weather
    clearInterval(demoCycleTimer);
    demoCycleTimer = null;
    settingsDemo = false;
    closeSettings();
    run();
  });

  // Theme selection
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.themeBtn);
      document.querySelectorAll('[data-theme-btn]').forEach(b => {
        b.classList.toggle('active', b.dataset.themeBtn === btn.dataset.themeBtn);
      });
    });
  });

  // Demo toggle
  document.getElementById('settings-demo-btn').addEventListener('click', () => {
    settingsDemo ? stopSettingsDemo() : startSettingsDemo();
  });
}

// --- Init ---
function loadSettings() {
  const savedId = localStorage.getItem('mhm_location');
  if (savedId) {
    const loc = LOCATIONS.find(l => l.id === savedId);
    if (loc) activeLocation = loc;
  }
  const savedTheme = localStorage.getItem('mhm_theme');
  if (savedTheme) applyTheme(savedTheme);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .catch(err => console.warn('[mahamezeg] SW registration failed:', err));
}

loadSettings();
setupHiddenSettingsTrigger();
run();
