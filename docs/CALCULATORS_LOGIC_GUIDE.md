# Astro-Website Calculators - Complete Logic Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Calculator Registry](#calculator-registry)
3. [Architecture & Data Flow](#architecture--data-flow)
4. [Calculator Implementations](#calculator-implementations)
5. [API Integration](#api-integration)
6. [Data Structures](#data-structures)
7. [Common Patterns](#common-patterns)

---

## Overview

The astro-website contains **7 Vedic astrology calculators** that compute astrological insights from birth details (name, date, time, location). Each calculator follows a consistent **form → validate → compute → display** pattern.

### Key Characteristics

- **Frontend**: Next.js (TypeScript/React) — Form input, state management, result display
- **Backend**: NestJS (TypeScript) — VedAstro API integration, local calculation engines
- **Data Sources**: Real VedAstro API data + client-side fallbacks for some calculators
- **Storage**: Session-based (`sessionStorage`) for cross-page result persistence
- **Geolocation**: OpenStreetMap Nominatim API for birthplace → coordinates conversion

---

## Calculator Registry

| # | Calculator | Route | Purpose | Input | Output | Data Source |
|---|-----------|-------|---------|-------|--------|-------------|
| 1 | **Sun Sign** | `/calculators/sun-sign-calculator` | Vedic sun sign from sun planet data | Birth details | Sun sign + element + ruling planet | VedAstro API (real data) |
| 2 | **Rashi** | `/calculators/rashi-calculator` | Moon sign from lunar position | Birth details | Rashi (Vedic moon sign) | VedAstro API (real data) |
| 3 | **Mangal Dosha** | `/calculators/mangal-dosha-calculator` | Mars placement for marriage compatibility | Birth details | Dosha present/mild/none + reasons | VedAstro API (real data) |
| 4 | **Dasha** | `/calculators/dasha-calculator` | Current/upcoming planetary periods (Vimshottari) | Birth details | Current mahadasha, antardasha, periods, dates | VedAstro API (real data) |
| 5 | **Moon Phase** | `/calculators/moon-phase-calculator` | Lunar phase at birth | Birth details | Moon phase name (New Moon, Full Moon, etc.) | VedAstro API (real data) |
| 6 | **Numerology** | `/calculators/numerology-calculator` | Pythagorean numerology from name & date | Name + birth date | Life path/expression/soul urge numbers | **Local calculation** (Pythagorean engine) |
| 7 | **Love Match** | `/calculators/love-calculator` | Compatibility between two people | Two names + two birthdates | Compatibility score (0-100%) | VedAstro API (real data) |

---

## Architecture & Data Flow

### High-Level Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND (astro-website / Next.js)                               │
├──────────────────────────────────────────────────────────────────┤
│ 1. User fills calculator form:                                   │
│    - Full name, Gender, Birth date, Birth place, Birth time      │
│    - Component: calculator-birth-details-form.tsx                │
│                                                                   │
│ 2. Form validation:                                              │
│    - Required fields check                                       │
│    - Date/time format validation                                 │
│                                                                   │
│ 3. Data transformation:                                          │
│    - Geocode birthplace text → lat/lon (OpenStreetMap)           │
│    - Format: ISO YYYY-MM-DD → VedAstro DD-MM-YYYY              │
│    - Calculate timezone offset                                   │
│    - Build VedAstro query object                                 │
│                                                                   │
│ 4. API call:                                                     │
│    - POST /api/v1/vedastro/calculators/{calculatorType}          │
│    - Pass: lat, lon, date, time, offset                          │
│    - BACKEND ↓                                                   │
└──────────────────────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────────────────┐
│ BACKEND (backend / NestJS)                                       │
├──────────────────────────────────────────────────────────────────┤
│ 1. Endpoint receives DoshaQueryDto:                              │
│    - Validate lat, lon, time, date, offset (class-validator)     │
│                                                                   │
│ 2. Route to calculator service:                                  │
│    - SUN SIGN CALC → VedAstro.SunSignName() API                 │
│    - RASHI CALC → VedAstro.MoonSignName() API                   │
│    - MANGLIK CALC → Fetch planets → Local dosha engine           │
│    - DASHA CALC → Local Vimshottari engine                       │
│    - MOON PHASE CALC → Complex lunar algorithm                  │
│    - NUMEROLOGY → Local Pythagorean engine                       │
│    - LOVE MATCH → Two people charts → compare                    │
│                                                                   │
│ 3. For VedAstro API calls:                                       │
│    - HTTP POST https://api.vedastro.org/api/Calculate/{method}   │
│    - Headers: x-api-key, Content-Type: application/json          │
│    - Response: { Status: "pass", Payload: {...} }                │
│                                                                   │
│ 4. For local engines:                                            │
│    - Execute pure JavaScript/TypeScript calculation logic        │
│                                                                   │
│ 5. Format response:                                              │
│    - Result<T> wrapper: { success, data, message }               │
│    - Return: { source, calculator-specific-fields }              │
│    - FRONTEND ↓                                                  │
└──────────────────────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────────────────┐
│ FRONTEND (Response Handling)                                     │
├──────────────────────────────────────────────────────────────────┤
│ 1. Store result in sessionStorage:                               │
│    - Key: `calculator_${calculatorType}_result`                  │
│    - Value: { ...formData, ...apiResponse }                      │
│                                                                   │
│ 2. Navigate to result page:                                      │
│    - router.push(/calculators/{type}/result)                     │
│                                                                   │
│ 3. Result component loads:                                       │
│    - Retrieve from sessionStorage                                │
│    - Lookup metadata (sun sign info, moon phase info, etc.)      │
│    - Format display values                                       │
│    - Render result card with:                                    │
│      • Personal info (name, DOB, place)                          │
│      • Main result (sign, phase, number)                         │
│      • Additional info (element, ruler, description)             │
│      • Metadata images and descriptions                          │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**:
- Next.js 14+ with TypeScript
- React 18+
- TailwindCSS for styling
- Axios for HTTP requests
- `sessionStorage` for result persistence

**Backend**:
- NestJS with TypeScript
- Class-validator for DTO validation
- Axios for external API calls
- Custom local engines:
  - Numerology: Pythagorean algorithm
  - Dasha: Vimshottari system + astronomia library
  - Dosha: Seven-dosha engine

**External APIs**:
- VedAstro API (https://api.vedastro.org) — Real astrological data
- OpenStreetMap Nominatim — Geolocation

---

## Calculator Implementations

### 1. SUN SIGN CALCULATOR

**Purpose**: Determine Vedic sun sign from birth chart

**Input**: Birth details (name, DOB, birthplace, birth time)

**Data Source**: ✅ **REAL DATA** — VedAstro API

#### Backend Implementation

**Endpoint**: `GET /api/v1/vedastro/calculators/sun-sign`

```typescript
async sunSign(dto: DoshaQueryDto) {
  let rawSign: string | undefined;

  // Primary: Try VedAstro SunSignName calculator
  try {
    const { payload } = await this.proxy.sunSignName(dto);
    rawSign = payload.sunSign || undefined;
  } catch (err) {
    this.logger.warn(`SunSignName failed, using AllPlanetData fallback`);
  }

  // Fallback: Extract from AllPlanetData (Sun planet)
  if (!rawSign) {
    const { payload } = await this.proxy.planets({ ...dto, planet: 'Sun' });
    rawSign = this.extractPlanetSign(payload);
  }

  // Normalize to English name
  const english = normalizeZodiacSignToEnglish(rawSign);

  return {
    source: 'vedastro',
    sunSign: english ?? rawSign ?? 'Unknown',
    vedicSign: rawSign,
  };
}
```

**VedAstro API Calls**:

1. **Primary**: `Calculate/SunSignName`
   - POST to: `https://api.vedastro.org/api/Calculate/SunSignName`
   - Body: `{ Time: {...}, Ayanamsa: "Raman" }`
   - Returns: `{ SunSignName: "Libra" }`

2. **Fallback**: `Calculate/AllPlanetData`
   - POST with `planetName: { Name: "Sun" }`
   - Returns: Complete planet data with sign, house, degree

**Frontend Display**:

```typescript
// From: sun-sign-calculator-result-section.tsx
const result = sessionStorage.getItem('calculator_sunSign_result');
const meta = SUN_SIGN_METADATA[result.sunSign]; // Lookup element, ruler, etc.

// Display: Sun sign name + Element + Ruling Planet + Image
```

**Related Metadata** (`lib/calculators/sun-sign-metadata.ts`):
```typescript
{
  englishName: "Libra",
  element: "Air",
  rulingPlanet: "Venus",
  dateRange: "Sep 23 - Oct 22",
  image: libra_icon
}
```

**Real Data?** ✅ YES — Directly from VedAstro's birth chart calculation

---

### 2. RASHI CALCULATOR

**Purpose**: Determine Vedic moon sign (Rashi) from lunar position

**Input**: Birth details (name, DOB, birthplace, birth time)

**Data Source**: ✅ **REAL DATA** — VedAstro API

#### Backend Implementation

**Endpoint**: `GET /api/v1/vedastro/calculators/moon-sign`

```typescript
async rashi(dto: DoshaQueryDto) {
  let rawSign: string | undefined;

  // Primary: Try VedAstro MoonSignName calculator
  try {
    const { payload } = await this.proxy.moonSignName(dto);
    rawSign = payload.moonSign || undefined;
  } catch (err) {
    this.logger.warn(`MoonSignName failed, using AllPlanetData fallback`);
  }

  // Fallback: Extract Moon from AllPlanetData
  if (!rawSign) {
    const { payload } = await this.proxy.planets({ ...dto, planet: 'Moon' });
    rawSign = this.extractPlanetSign(payload);
  }

  // Normalize to Vedic name
  const vedic = normalizeToVedicSign(rawSign);

  return {
    source: 'vedastro',
    rashi: vedic ?? rawSign ?? 'Unknown',
  };
}
```

**VedAstro API Calls**:

1. `Calculate/MoonSignName` — Get moon sign directly
2. Fallback: `Calculate/AllPlanetData` with `planetName: { Name: "Moon" }`

**Frontend Display**:

```typescript
// Lookup Vedic rashi info
const rashiMeta = RASHI_METADATA[result.rashi];
// Display: Vedic name + English name + Date range + Description
```

**Related Metadata** (`lib/calculators/rashi-metadata.ts`):
```typescript
{
  vedicName: "Mesha",
  englishName: "Aries",
  dateRange: "Mar 21 - Apr 19",
  image: mesha_icon,
  description: "..."
}
```

**Real Data?** ✅ YES — Moon's zodiac sign from birth chart

---

### 3. MANGAL DOSHA CALCULATOR

**Purpose**: Check Mars dosha (Manglik) for marriage compatibility assessment

**Input**: Birth details (name, DOB, birthplace, birth time)

**Data Source**: ✅ **REAL DATA** — VedAstro API + Local Dosha Engine

#### Backend Implementation

**Endpoint**: `GET /api/v1/vedastro/calculators/manglik`

```typescript
async manglik(dto: DoshaQueryDto) {
  // Fetch all doshas from dosha service
  const doshas = await this.doshaService.calculate(dto);
  
  return {
    source: 'vedastro',
    manglik: doshas.manglik,  // { present: boolean, strength: string, reasons: [] }
    level: this.manglikToLevel(doshas.manglik),  // 'present' | 'mild' | 'none'
  };
}

private manglikToLevel(manglik: DoshaResult): 'present' | 'mild' | 'none' {
  if (!manglik.present) return 'none';
  if (manglik.strength === 'Strong') return 'present';
  return 'mild';
}
```

#### Dosha Calculation Engine

**Location**: `src/vedastro/dosha/dosha-engine.ts`

The **Seven-Dosha Engine** evaluates 7 classical doshas by analyzing planet positions:

```typescript
function checkManglik(planets: PlanetData[], lagnaHouse: number): DoshaResult {
  const mars = getPlanet(planets, 'Mars');
  const moon = getPlanet(planets, 'Moon');
  const saturn = getPlanet(planets, 'Saturn');
  const rahu = getPlanet(planets, 'Rahu');

  if (!mars) return { present: false };

  // Manglik if Mars in sensitive houses: 1, 4, 7, 8, 12
  const sensitiveHouses = [1, 4, 7, 8, 12];
  const reasons: string[] = [];

  // Check Mars from Lagna (1st house)
  if (sensitiveHouses.includes(mars.house)) {
    reasons.push(`Mars in house ${mars.house} from Lagna`);
  }

  // Check Mars from Moon (emotional perspective)
  if (moon) {
    const marsFromMoon = houseFromReference(mars.house, moon.house);
    if (sensitiveHouses.includes(marsFromMoon)) {
      reasons.push(`Mars in house ${marsFromMoon} from Moon`);
    }
  }

  if (reasons.length === 0) {
    return { present: false };
  }

  // Determine strength
  let strength: 'Strong' | 'Mild' = 'Mild';
  if ([7, 8].includes(mars.house)) strength = 'Strong';

  // Amplifiers
  if (areConjunct(mars, saturn)) {
    reasons.push('Mars conjunct Saturn (amplifier)');
    strength = 'Strong';
  }
  if (areConjunct(mars, rahu)) {
    reasons.push('Mars conjunct Rahu (amplifier)');
    strength = 'Strong';
  }

  return { present: true, strength, reasons };
}
```

**Data Flow**:
1. Frontend sends birth details
2. Backend calculates all 7 doshas (Manglik, Pitra, Kaal, Bhaum, etc.)
3. Extract Manglik result and determine UI level
4. Return: `{ present, strength, reasons }`

**Frontend Display**:

```typescript
// Mangal Dosha metadata determines UI text/color
if (level === 'present') {
  // Red card: "Manglik present - requires remedies"
} else if (level === 'mild') {
  // Yellow card: "Mild Manglik - monitor carefully"
} else {
  // Green card: "No Manglik present"
}
```

**Real Data?** ✅ YES — Planet positions from VedAstro → Local engine analyzes houses

---

### 4. DASHA CALCULATOR

**Purpose**: Calculate current and upcoming planetary periods (Vimshottari Dasha system)

**Input**: Birth details (name, DOB, birthplace, birth time)

**Data Source**: ✅ **REAL DATA** + Local Calculation

#### What is Vimshottari Dasha?

Vimshottari is a 120-year cycle of 9 planetary periods (Mahadashas), each divided into sub-periods (Antardhashas).

**The 9 Mahadashas** (in order):
1. **Ketu** — 7 years
2. **Venus** — 20 years
3. **Sun** — 6 years
4. **Moon** — 10 years
5. **Mars** — 7 years
6. **Rahu** — 18 years
7. **Jupiter** — 16 years
8. **Saturn** — 19 years
9. **Mercury** — 17 years

Total: 120 years (complete cycle)

#### Backend Implementation

**Endpoint**: `GET /api/v1/vedastro/calculators/dasha`

```typescript
async dasha(dto: DoshaQueryDto) {
  // 1. Fetch Moon's position from VedAstro
  const { payload: moonData } = await this.proxy.planets({ 
    ...dto, 
    planet: 'Moon' 
  });
  const moonNakshatra = moonData.Nakshatra;  // e.g., "Ashwini"

  // 2. Calculate Vimshottari cycle
  const dashaEngine = new VimshottariDashaEngine();
  const dashaResult = dashaEngine.calculate({
    birthDate: parseDateString(dto.date),
    moonNakshatra,
    currentDate: new Date()
  });

  return {
    source: 'vedastro',
    currentMahadasha: dashaResult.currentMahadasha,  // { lord: "Jupiter", endDate: "2025-12-15" }
    currentAntardasha: dashaResult.currentAntardasha,
    mahadashas: dashaResult.allMahadashas,  // Array of periods
    nakshatra: moonNakshatra,
  };
}
```

#### Vimshottari Dasha Engine

**Location**: `src/vedastro/calculators/vimshottari-dasha-engine.ts`

```typescript
// Simplified version of the calculation logic:

const PLANETARY_NAKSHATRAS: Record<string, string[]> = {
  Ketu: ["Ashwini", "Magha", "Mool"],
  Venus: ["Bharani", "Purva Phalguni", "Purva Ashadha"],
  Sun: ["Krittika", "Uttara Phalguni", "Uttara Ashadha"],
  Moon: ["Rohini", "Hasta", "Shravana"],
  Mars: ["Mrigasira", "Chitra", "Dhanishta"],
  Rahu: ["Ardra", "Swati", "Satabisha"],
  Jupiter: ["Punarvasu", "Visakha", "Purva Bhadrapada"],
  Saturn: ["Pushya", "Anuradha", "Uttara Bhadrapada"],
  Mercury: ["Ashlesha", "Jyeshtha", "Revati"]
};

const MAHADASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

function calculateVimshottari(birthDate: Date, moonNakshatra: string) {
  // 1. Find which planet rules moon's nakshatra
  let startingLord = 'Ketu';
  for (const [lord, nakshatras] of Object.entries(PLANETARY_NAKSHATRAS)) {
    if (nakshatras.includes(moonNakshatra)) {
      startingLord = lord;
      break;
    }
  }

  // 2. Calculate degree within nakshatra (0-13°20')
  const moonDegree = calculateMoonDegree(birthDate);
  const degreeInNakshatra = moonDegree % 13.333;
  const percentageInNakshatra = degreeInNakshatra / 13.333;

  // 3. Calculate remaining time of starting dasha
  const startingDashaYears = MAHADASHA_YEARS[startingLord];
  const remainingYears = startingDashaYears * (1 - percentageInNakshatra);

  // 4. Calculate dasha start/end dates
  const dashaStartDate = birthDate;
  const dashaEndDate = new Date(birthDate);
  dashaEndDate.setFullYear(
    dashaEndDate.getFullYear() + Math.floor(remainingYears)
  );

  // 5. Generate all 9 mahadashas
  const allMahadashas: DashaPhase[] = [];
  let currentStart = dashaStartDate;
  let lordIndex = DASHA_LORDS.indexOf(startingLord);

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_LORDS[lordIndex % 9];
    const years = MAHADASHA_YEARS[lord];
    const currentEnd = new Date(currentStart);
    currentEnd.setFullYear(currentEnd.getFullYear() + years);

    allMahadashas.push({
      lord,
      startDate: currentStart,
      endDate: currentEnd,
      duration: years
    });

    currentStart = new Date(currentEnd);
    lordIndex++;
  }

  // 6. Determine current dasha based on today's date
  const today = new Date();
  const currentMahadasha = allMahadashas.find(d => 
    d.startDate <= today && today <= d.endDate
  );

  return {
    currentMahadasha,
    allMahadashas,
    moonNakshatra
  };
}
```

**Frontend Display**:

```typescript
// From: dasha-calculator-result-section.tsx
const result = sessionStorage.getItem('calculator_dasha_result');

// Display:
// "Current Dasha: Jupiter (Start: Dec 15, 2020 | End: Dec 15, 2036)"
// "Current Sub-Dasha: Moon under Jupiter (Start: Jan 10, 2023 | End: Dec 25, 2023)"
// Table of all upcoming mahadashas with dates
```

**Real Data?** ✅ YES — Moon's nakshatra (constellation) from VedAstro + calculated periods

---

### 5. MOON PHASE CALCULATOR

**Purpose**: Determine lunar phase at birth

**Input**: Birth details (name, DOB, birthplace, birth time)

**Data Source**: ✅ **REAL DATA** — Complex lunar algorithm

#### Backend Implementation

**Endpoint**: `GET /api/v1/vedastro/calculators/moon-phase`

```typescript
async moonPhase(dto: DoshaQueryDto) {
  // Fetch Sun and Moon positions from VedAstro
  const sunData = await this.proxy.planets({ ...dto, planet: 'Sun' });
  const moonData = await this.proxy.planets({ ...dto, planet: 'Moon' });

  const sunLongitude = sunData.Longitude;      // e.g., 45.5°
  const moonLongitude = moonData.Longitude;    // e.g., 125.3°

  // Calculate phase from elongation (angular distance)
  const elongation = (moonLongitude - sunLongitude + 360) % 360;
  const phase = this.determineMoonPhase(elongation);

  return {
    source: 'vedastro',
    phase,
    elongation,
    phasePercentage: (elongation / 360) * 100
  };
}

private determineMoonPhase(elongation: number): MoonPhaseName {
  // 0-45° = New Moon
  if (elongation < 45) return 'New Moon';
  // 45-90° = Waxing Crescent
  if (elongation < 90) return 'Waxing Crescent';
  // 90-135° = First Quarter
  if (elongation < 135) return 'First Quarter';
  // 135-180° = Waxing Gibbous
  if (elongation < 180) return 'Waxing Gibbous';
  // 180-225° = Full Moon
  if (elongation < 225) return 'Full Moon';
  // 225-270° = Waning Gibbous
  if (elongation < 270) return 'Waning Gibbous';
  // 270-315° = Last Quarter
  if (elongation < 315) return 'Last Quarter';
  // 315-360° = Waning Crescent
  return 'Waning Crescent';
}
```

**Moon Phase Types**:

| Phase | Elongation | Meaning | Energy |
|-------|-----------|---------|--------|
| New Moon | 0-45° | New beginnings | Introspection, planning |
| Waxing Crescent | 45-90° | Growing intention | Growth, building |
| First Quarter | 90-135° | Decision point | Challenge, action |
| Waxing Gibbous | 135-180° | Refinement | Completion, polish |
| Full Moon | 180-225° | Culmination | Manifestation, release |
| Waning Gibbous | 225-270° | Sharing | Wisdom, teaching |
| Last Quarter | 270-315° | Reflection | Letting go, clarity |
| Waning Crescent | 315-360° | Surrender | Rest, preparation |

**Frontend Display**:

```typescript
// From: moon-phase-calculator-result-section.tsx
const result = sessionStorage.getItem('calculator_moonPhase_result');
const phaseMeta = MOON_PHASE_METADATA[result.phase];

// Display:
// Phase name + Elongation percentage
// Description of phase meaning
// Corresponding image/icon
// Spiritual guidance text
```

**Related Metadata** (`lib/calculators/moon-phase-metadata.ts`):
```typescript
{
  phase: 'Full Moon',
  title: 'Full Moon',
  subtitle: 'Culmination and Manifestation',
  image: fullMoon_icon,
  description: 'The Full Moon represents completion, reflection, and clarity...'
}
```

**Real Data?** ✅ YES — Actual Sun/Moon positions from birth chart used to calculate phase

---

### 6. NUMEROLOGY CALCULATOR

**Purpose**: Calculate Pythagorean numerology numbers from name and birth date

**Input**: Name + Birth date (no location/time needed)

**Data Source**: ⚠️ **LOCAL CALCULATION** (Not from VedAstro API)

#### Why Local Calculation?

VedAstro doesn't expose the NumerologyReport endpoint publicly. The backend uses a **Pythagorean numerology engine** to compute numbers.

#### Backend Implementation

**Endpoint**: `GET /api/v1/vedastro/calculators/numerology`

```typescript
async numerology(dto: VedastroNumerologyQueryDto) {
  // Parse name and date
  const name = dto.name.trim();
  const date = dto.date;  // DD-MM-YYYY format

  // Compute using Pythagorean numerology
  const result = computeNumerology(name, date, dto.focus || 'life-path');

  return {
    source: 'pythagorean-engine',
    calculator: 'Numerology (name + birth date)',
    result: result.primary,
    resultLabel: result.primaryLabel,
    rows: result.rows,
    lifePath: result.lifePath,
    expression: result.expression,
    soulUrge: result.soulUrge,
    note: 'VedAstro does not provide NumerologyReport via REST API. Values computed using Pythagorean numerology.'
  };
}
```

#### Pythagorean Numerology Engine

**Location**: `src/vedastro/calculators/numerology-engine.ts`

**Letter Values**:
```
A=1  B=2  C=3  D=4  E=5  F=6  G=7  H=8  I=9
J=1  K=2  L=3  M=4  N=5  O=6  P=7  Q=8  R=9
S=1  T=2  U=3  V=4  W=5  X=6  Y=7  Z=8
```

**Three Key Numbers**:

1. **Life Path Number** (Radix Number)
   - Sum all digits of birth date
   - Reduce to single digit (except master numbers 11, 22, 33)
   - Example: DOB 25-10-1992 → 2+5+1+0+1+9+9+2 = 29 → 2+9 = 11 (Master) or 2

2. **Expression Number** (Namank)
   - Sum value of ALL letters in full name
   - Reduce to single digit
   - Example: "John" → J(1)+O(6)+H(8)+N(5) = 20 → 2+0 = 2

3. **Soul Urge Number** (Heart's Desire)
   - Sum value of VOWELS only in full name
   - Reduce to single digit
   - Example: "John" → O(6)+vowel = 6 → 6

```typescript
const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  // ... J-R repeats the cycle
  // ... S-Z repeats the cycle
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

function reduceNumber(n: number): number {
  if (n <= 9) return n;
  // Master numbers: 11, 22, 33 kept as-is
  if ([11, 22, 33].includes(n)) return n;
  // Sum digits recursively
  return reduceNumber(
    String(n).split('').reduce((sum, d) => sum + Number(d), 0)
  );
}

function sumLetters(text: string, vowelsOnly: boolean = false): number {
  let sum = 0;
  for (const char of text.toUpperCase()) {
    if (!/[A-Z]/.test(char)) continue;
    if (vowelsOnly && !VOWELS.has(char)) continue;
    sum += LETTER_VALUES[char] ?? 0;
  }
  return sum;
}

function computeNumerology(name: string, birthDate: string, focus: 'life-path' | 'expression' | 'soul-urge') {
  const expression = reduceNumber(sumLetters(name, false));     // All letters
  const soulUrge = reduceNumber(sumLetters(name, true));        // Vowels only
  const lifePath = reduceNumber(sumDateDigits(birthDate));      // Date

  const primary = focus === 'expression' ? expression :
                  focus === 'soul-urge' ? soulUrge :
                  lifePath;

  return {
    lifePath,
    expression,
    soulUrge,
    primary,
    primaryLabel: focus === 'expression' ? 'Expression Number' :
                  focus === 'soul-urge' ? 'Soul Urge Number' :
                  'Life Path Number',
    rows: [
      { label: 'Life Path Number', value: String(lifePath) },
      { label: 'Expression Number', value: String(expression) },
      { label: 'Soul Urge Number', value: String(soulUrge) },
      { label: 'Ruling Planet', value: RULING_PLANET[primary] },
      { label: 'Gemstone', value: GEMSTONE[primary] },
      { label: 'Lucky Digit', value: String(primary) }
    ]
  };
}
```

**Number Meanings**:

| Number | Meaning | Ruling Planet |
|--------|---------|---------------|
| 1 | Leadership, Independence | Sun |
| 2 | Balance, Partnership | Moon |
| 3 | Creativity, Expression | Jupiter |
| 4 | Stability, Foundation | Rahu |
| 5 | Change, Adventure | Mercury |
| 6 | Harmony, Responsibility | Venus |
| 7 | Spirituality, Analysis | Ketu |
| 8 | Power, Material Success | Saturn |
| 9 | Compassion, Completion | Mars |
| 11 | Intuition, Idealism | Moon |
| 22 | Master Builder | Saturn |
| 33 | Master Teacher | Jupiter |

**Frontend Display**:

```typescript
// From: numerology-calculator-result-section.tsx
const result = sessionStorage.getItem('calculator_numerology_result');

// Display all three numbers
// Highlight primary (based on focus: life-path, expression, soul-urge)
// Show ruling planet, gemstone, lucky digit
// Show breakdown table of calculations
```

**Real Data?** ❌ NO — Pure mathematical calculation, no external data source

---

### 7. LOVE MATCH CALCULATOR

**Purpose**: Calculate compatibility score between two people

**Input**: Two names + two birth dates (+ birthtimes optional)

**Data Source**: ✅ **REAL DATA** — VedAstro API

#### Backend Implementation

**Endpoint**: `GET /api/v1/vedastro/calculators/love-match`

```typescript
async loveMatch(query: LoveMatchQueryDto) {
  // Two separate birth charts needed
  const person1 = await this.proxy.planets({
    lat: query.lat1,
    lon: query.lon1,
    date: query.date1,
    time: query.time1,
    offset: query.offset1
  });

  const person2 = await this.proxy.planets({
    lat: query.lat2,
    lon: query.lon2,
    date: query.date2,
    time: query.time2,
    offset: query.offset2
  });

  // Compare charts
  const score = this.calculateCompatibilityScore(person1, person2);

  return {
    source: 'vedastro',
    compatibilityScore: score,  // 0-100%
    person1Chart: person1,
    person2Chart: person2
  };
}

private calculateCompatibilityScore(chart1: PlanetData[], chart2: PlanetData[]): number {
  let score = 0;

  // 1. Sun sign compatibility (25 points)
  const sunCompatibility = this.evaluateSunSigns(chart1, chart2);
  score += sunCompatibility * 25;

  // 2. Moon sign compatibility (25 points)
  const moonCompatibility = this.evaluateMoonSigns(chart1, chart2);
  score += moonCompatibility * 25;

  // 3. Venus placement (romantic) (20 points)
  const venusCompatibility = this.evaluateVenusPlacements(chart1, chart2);
  score += venusCompatibility * 20;

  // 4. Mars placement (passion/drive) (15 points)
  const marsCompatibility = this.evaluateMarsPlacements(chart1, chart2);
  score += marsCompatibility * 15;

  // 5. Dosha check (15 points)
  const doshaCompatibility = this.evaluateDoshasCompatibility(chart1, chart2);
  score += doshaCompatibility * 15;

  return Math.round(score);
}

private evaluateSunSigns(chart1: PlanetData[], chart2: PlanetData[]): number {
  const sun1Sign = this.getPlanetSign(chart1, 'Sun');
  const sun2Sign = this.getPlanetSign(chart2, 'Sun');
  
  // Same element = high compatibility
  if (this.sameElement(sun1Sign, sun2Sign)) return 0.8;
  // Complementary elements = moderate
  if (this.complementaryElements(sun1Sign, sun2Sign)) return 0.6;
  // Incompatible = low
  return 0.3;
}
```

**Compatibility Factors**:

1. **Sun Sign Compatibility** (25%) — Core personality match
2. **Moon Sign Compatibility** (25%) — Emotional compatibility
3. **Venus Compatibility** (20%) — Romance & attraction
4. **Mars Compatibility** (15%) — Passion & drive
5. **Dosha Compatibility** (15%) — Astrological harmony

**Frontend Display**:

```typescript
// From: love-calculator-result-section.tsx
const result = sessionStorage.getItem('calculator_loveMatch_result');
const score = result.compatibilityScore;

// Display:
// "Compatibility Score: 72%"
// Visual progress bar
// Breakdown by factors
// Suggestions for harmony
```

**Real Data?** ✅ YES — Real birth charts compared for compatibility

---

## API Integration

### VedAstro API Overview

**Base URL**: `https://api.vedastro.org`

**Authentication**: API key in `x-api-key` header

**Endpoint Pattern**: `POST /api/Calculate/{CalculatorName}`

#### Query Format

All VedAstro calculators use standardized input:

```typescript
interface BirthVedastroQuery {
  Time: {
    Day: number;        // 1-31
    Month: number;      // 1-12
    Year: number;       // YYYY
    Hour: number;       // 0-23
    Minute: number;     // 0-59
    Second: number;     // 0-59
    Offset: string;     // "+05:30" or "-05:00"
    Zone: number;       // Timezone offset in hours (usually derived from offset)
  };
  Location: {
    Longitude: number;  // e.g., 85.324
    Latitude: number;   // e.g., 27.7172
  };
  Ayanamsa?: string;    // 'Raman' | 'Lahiri' | 'Krishnamurti', default: 'Raman'
}
```

#### Available Calculators

| Calculator | Method | Response |
|-----------|--------|----------|
| SunSignName | `POST /Calculate/SunSignName` | `{ SunSignName: "Libra" }` |
| MoonSignName | `POST /Calculate/MoonSignName` | `{ MoonSignName: "Sagittarius" }` |
| AllPlanetData | `POST /Calculate/AllPlanetData` | All 9 planets with position, house, sign, etc. |
| NakshataraName | `POST /Calculate/NakshataraName` | Nakshatra (lunar constellation) |
| NakshatraID | `POST /Calculate/NakshatraID` | Numerical ID of nakshatra |
| RasiName | `POST /Calculate/RasiName` | Rashi (moon sign in Vedic) |

#### Response Format

All VedAstro responses follow:

```json
{
  "Status": "pass" or "fail",
  "Payload": { ... },
  "Code": 200,
  "Message": "Success or error"
}
```

Error handling on backend:

```typescript
if ((data.Status || '').toLowerCase().trim() !== 'pass') {
  throw new HttpException(
    { message: 'VedAstro returned non-pass status', code: 'VEDASTRO_UPSTREAM_NON_PASS' },
    HttpStatus.BAD_GATEWAY
  );
}
```

---

## Data Structures

### Frontend Input Form

**Type**: `CalculatorFormValues`

```typescript
interface CalculatorFormValues {
  fullName: string;                    // "John Doe"
  gender: string;                      // "male" | "female" | "other"
  birthDate: string;                   // ISO: "1990-03-15"
  birthPlace: string;                  // "New York, USA"
  birthTimeHH: string;                 // "14" (0-23) or ""
  birthTimeMM: string;                 // "30" (0-59) or ""
  birthTimeAMPM: string;               // "am" | "pm" or ""
  dontKnowTime: boolean;               // true = use 12:00 noon fallback
}
```

### Backend Query Format

**Type**: `DoshaQueryDto` or `BirthVedastroQuery`

```typescript
interface DoshaQueryDto {
  lat: number;         // Latitude from geocoding
  lon: number;         // Longitude from geocoding
  date: string;        // DD-MM-YYYY format
  time: string;        // HH:MM in 24-hour format
  offset: string;      // "+05:30" timezone
  ayanamsa?: string;   // 'Raman' (default), 'Lahiri', 'Krishnamurti'
}
```

### Calculator Results (sessionStorage)

Results are stored with calculator-specific keys:

```typescript
// Sun Sign
{
  sunSign: "Libra",
  vedicSign: "Libra",
  source: "vedastro",
  fullName: "John Doe",
  birthDate: "1990-03-15",
  birthPlace: "New York",
  birthTimeHH: "14"
}

// Mangal Dosha
{
  level: "present" | "mild" | "none",
  manglik: {
    present: boolean,
    strength: "Strong" | "Mild",
    reasons: ["Mars in house 8 from Lagna", ...]
  },
  source: "vedastro",
  // + form fields
}

// Numerology
{
  result: 7,
  resultLabel: "Life Path Number",
  rows: [
    { label: "Radix Number", value: "7" },
    { label: "Ruling Planet", value: "Ketu" },
    ...
  ],
  source: "pythagorean-engine",
  // + form fields
}
```

### Metadata Structures

#### Sun Sign Metadata

```typescript
interface SunSignMeta {
  englishName: string;     // "Aries"
  slug: HoroscopeSign;     // For routing
  dateRangeLong: string;   // Approximate Vedic/sidereal range, e.g. "February 13 - March 14"
  element: string;         // "Fire"
  rulingPlanet: string;    // "Mars"
  image: StaticImageData;  // Zodiac icon
  description?: string;    // Personality traits
}
```

#### Moon Phase Metadata

```typescript
interface MoonPhaseMeta {
  phase: MoonPhaseName;      // "Full Moon" | "New Moon" | ...
  title: string;
  subtitle: string;          // "Culmination and Manifestation"
  image: StaticImageData;    // Moon phase icon
  description: string;       // Spiritual/astrological meaning
  affirmation?: string;      // Daily affirmation
}
```

---

## Common Patterns

### 1. Form → Calculate → Store → Display

All 7 calculators follow this pattern:

```typescript
// FORM COMPONENT
const onSubmit = async (values: CalculatorFormValues) => {
  // 1. Transform form to VedAstro query
  const query = buildBirthVedastroQuery(values);
  
  // 2. Call calculator API
  const result = await fetchVedastroCalculator('sun-sign', query);
  
  // 3. Store in sessionStorage
  sessionStorage.setItem('calculator_sunSign_result', JSON.stringify({
    ...values,
    ...result
  }));
  
  // 4. Navigate to result page
  router.push('/calculators/sun-sign-calculator/result');
};

// RESULT COMPONENT
useEffect(() => {
  const stored = sessionStorage.getItem('calculator_sunSign_result');
  setResult(JSON.parse(stored));
}, []);
```

### 2. Geocoding Birthplace

All birth-detail forms geocode the entered birthplace:

```typescript
const geocodePlace = async (placeName: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${placeName}&format=json`
  );
  const data = await response.json();
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };
};
```

### 3. Date/Time Conversions

Frontend uses ISO dates; backend uses VedAstro format:

```typescript
// Frontend: ISO to VedAstro
isoDate: "1990-03-15"  →  vedastroDate: "15-03-1990"

// Frontend: 12-hour to 24-hour
birthTimeHH: "02", birthTimeAMPM: "pm"  →  time: "14:00"

// Frontend: Timezone calculation
new Date(isoDate).getTimezoneOffset()  →  offset: "+05:30"
```

### 4. Local Calculation Fallbacks

For some calculators, if VedAstro API fails, use client-side logic:

```typescript
async function sunSign(dto: DoshaQueryDto) {
  try {
    const result = await vedastroAPI.sunSignName(dto);
    return result;
  } catch (err) {
    // Fallback: Determine by date alone (simple 12-sign lookup)
    return determineSunSign(dto.date);
  }
}
```

### 5. Result Templating

Most result pages use generic `calculator-report-result.tsx`:

```typescript
<CalculatorReportResult
  storageKey="calculator_rashi_result"
  title="Your Rashi"
  getReportDisplay={(result) => ({
    mainValue: result.rashi,
    description: RASHI_METADATA[result.rashi].description
  })}
  extraPersonalRows={(result) => [
    { label: "Rashi", value: result.rashi },
    { label: "English Name", value: RASHI_METADATA[result.rashi].englishName }
  ]}
/>
```

---

## Quick Reference: Real vs Calculated Data

| Calculator | Data Source | Real? | Notes |
|-----------|-------------|-------|-------|
| Sun Sign | VedAstro (SunSignName API) | ✅ YES | Actual sun position from birth chart |
| Rashi | VedAstro (MoonSignName API) | ✅ YES | Moon's zodiac sign from birth chart |
| Mangal Dosha | VedAstro (planet data) + Local engine | ✅ YES | Planet positions real; houses calculated locally |
| Dasha | Moon nakshatra (VedAstro) + Local calculation | ✅ YES | Nakshatra real; dasha periods calculated per Vimshottari system |
| Moon Phase | VedAstro (Sun/Moon position) + calculation | ✅ YES | Sun/Moon positions real; phase calculated from elongation |
| Numerology | Name + Date (user input) | ❌ NO | Pure mathematical calculation (Pythagorean) |
| Love Match | Two VedAstro birth charts + Local engine | ✅ YES | Charts real; compatibility calculated locally |

---

## Troubleshooting

### Issue: API returns Status !== "pass"

**Cause**: Invalid birth data or upstream API error

**Solution**: 
- Validate lat/lon (use OpenStreetMap directly)
- Verify date format (DD-MM-YYYY)
- Verify time format (HH:MM)
- Verify offset format (±HH:MM)

### Issue: Calculator result doesn't appear

**Cause**: `sessionStorage` key mismatch or missing result

**Solution**:
- Ensure form was submitted successfully
- Check browser console for API errors
- Verify sessionStorage key: `calculator_${type}_result`
- Clear sessionStorage and retry

### Issue: Moon phase seems incorrect

**Cause**: Timezone offset incorrect, affecting Sun/Moon positions

**Solution**:
- Verify birthplace geocoding accuracy
- Verify timezone offset calculation
- Try with explicit timezone in form

---

## For Developers

### Adding a New Calculator

1. **Create page**: `app/calculators/new-calculator/page.tsx`
2. **Create result page**: `app/calculators/new-calculator/result/page.tsx`
3. **Create components**:
   - `components/pages/calculators/new-calculator/new-calculator-section.tsx` (form)
   - `components/pages/calculators/new-calculator/new-calculator-result-section.tsx` (display)
4. **Add backend endpoint**:
   - Add method in `calculators.controller.ts`
   - Add service logic in `calculators.service.ts`
5. **Add metadata** (if needed):
   - Create `lib/calculators/new-calculator-metadata.ts`
6. **Update routes**: Add to calculator registry/routing

### Testing Calculators

**Test with known birth data**:
- Name: "Arjun"
- DOB: 25-10-1992 (25 October 1992)
- Place: "Kathmandu, Nepal"
- Time: 14:30 (2:30 PM)

**Expected outputs** (may vary by ayanamsa):
- Sun Sign: Likely Libra or Scorpio
- Rashi: Likely Scorpio or Sagittarius
- Dasha: Depends on exact time
- Numerology: 7 (Life Path from 25-10-1992)

---

## Summary

The calculator system provides:
- **7 different astrological insights** from birth data
- **Real astrological data** from VedAstro (except numerology)
- **Client-side calculation engines** for complex astrology (dasha, dosha, moon phase)
- **Consistent UX** across all calculators
- **Session persistence** for result viewing
- **Fallback logic** for API failures

All logic is **type-safe** (TypeScript) and **well-validated** (class-validator, regex matching).

