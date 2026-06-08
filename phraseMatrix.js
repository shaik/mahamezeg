// ─────────────────────────────────────────────────────────────────────────────
//  PHRASE MATRIX  —  edit freely
//
//  Layout:  MATRIX[ day | night ][ temp band ][ low | normal | high humidity ]
//  Each cell is an array; multiple phrases are picked at random on each load.
//
//  Temp bands    Humidity levels
//  ──────────    ───────────────
//  freezing < 10°C     low    < 35 %
//  cold     10–14°C    normal  35–64 %
//  cool     15–19°C    high   ≥ 65 %
//  perfect  20–24°C
//  warm     25–29°C
//  hot      30–33°C
//  very_hot 34–37°C
//  extreme  ≥ 38°C
// ─────────────────────────────────────────────────────────────────────────────

export const PHRASE_MATRIX = {

  // ── DAY  05:00 – 17:59 ───────────────────────────────────────────────────
  //              low (< 35 %)                normal (35–64 %)           high (≥ 65 %)
  day: {
    freezing: { low: ['קור כלבים'          ], normal: ['קור כלבים'         ], high: ['קור כלבים'            ] },
    cold:     { low: ['קר', 'ממש קר'       ], normal: ['קר'                ], high: ['קר'                   ] },
    cool:     { low: ['קצת קריר, אבל סבבה' ], normal: ['קצת קריר'], high: ['קרדיגן יספיק'  ] },
    perfect:  { low: ['מושלם'              ], normal: ['אחלה נעים'              ], high: ['סבבה, אבל לח'                ] },
    warm:     { low: ['חמימות חולפת'                 ], normal: ['חם'                 ], high: ['חם ולח'                   ] },
    hot:      { low: ['חמסין', 'חם למות'   ], normal: ['חם למות'            ], high: ['חם ודביק'             ] },
    very_hot: { low: ['חמסין', 'חם נבלות'  ], normal: ['חם נבלות'           ], high: ['סחוניה דל מות'        ] },
    extreme:  { low: ['חמסין', 'חום איימים'], normal: ['חום איימים'         ], high: ['גועל נפש. לא לצאת'  ] },
  },

  // ── NIGHT  18:00 – 04:59 ─────────────────────────────────────────────────
  //              low (< 35 %)                normal (35–64 %)           high (≥ 65 %)
  night: {
    freezing: { low: ['קור כלבים'          ], normal: ['קור כלבים'         ], high: ['קור כלבים'            ] },
    cold:     { low: ['ממש קר', 'קר'       ], normal: ['קר'                ], high: ['קר'                   ] },
    cool:     { low: ['קצת קריר, אבל סבבה' ], normal: ['קצת קריר, אבל סבבה'], high: ['קצת קריר, אבל סבבה'  ] },
    perfect:  { low: ['מושלם'              ], normal: ['מושלם'              ], high: ['מושלם'                ] },
    warm:     { low: ['חם'                 ], normal: ['חם'                 ], high: ['חם'                   ] },
    hot:      { low: ['חם למות'            ], normal: ['חם למות'            ], high: ['חם ודביק'             ] },
    very_hot: { low: ['חמסין', 'חם נבלות'  ], normal: ['חם נבלות'           ], high: ['סחוניה דל מות'        ] },
    extreme:  { low: ['חמסין', 'חום איימים'], normal: ['חום איימים'         ], high: ['תאילנד על סטרואידים'  ] },
  },

};

// ─── Thresholds ──────────────────────────────────────────────────────────────

export const TEMP_BANDS = [
  { id: 'freezing'             , max: 9.99 },
  { id: 'cold',     min: 10,    max: 14.99 },
  { id: 'cool',     min: 15,    max: 19.99 },
  { id: 'perfect',  min: 20,    max: 24.99 },
  { id: 'warm',     min: 25,    max: 29.99 },
  { id: 'hot',      min: 30,    max: 33.99 },
  { id: 'very_hot', min: 34,    max: 37.99 },
  { id: 'extreme',  min: 38               },
];

export const HUMIDITY_LEVELS = [
  { id: 'low',              max: 34 },
  { id: 'normal', min: 35,  max: 64 },
  { id: 'high',   min: 65           },
];

// ─── Lookup ──────────────────────────────────────────────────────────────────

export function getWeatherPhrase({ temperature, humidity, isNight = false }) {
  const timeKey = isNight ? 'night' : 'day';

  const band = TEMP_BANDS.find(b =>
    (b.min === undefined || temperature >= b.min) &&
    (b.max === undefined || temperature <= b.max)
  );
  const level = HUMIDITY_LEVELS.find(h =>
    (h.min === undefined || humidity >= h.min) &&
    (h.max === undefined || humidity <= h.max)
  );

  if (!band || !level) return 'לא ברור';

  const phrases = PHRASE_MATRIX[timeKey]?.[band.id]?.[level.id];
  if (!phrases || phrases.length === 0) return 'לא ברור';

  return phrases[Math.floor(Math.random() * phrases.length)];
}
