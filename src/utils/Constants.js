// ── Color Palette ──
export const COLORS = {
  bg: 0x020210,
  buildingDark: 0x0a0a1a,
  buildingMid: 0x111128,
  buildingLight: 0x1a1a35,
  windowGlow: 0xFFB347,
  batSignal: 0xFFD700,
  batSignalPale: 0xFFF8DC,
  moon: 0xE8E0C8,
  fog: 0x080818,
  rain: 0x4A6A8A,
  uiGold: '#FFD700',
  uiSilver: '#C0C0C0',
  uiRed: '#8B0000',
};

// ── Scene Dimensions ──
export const SCENE = {
  worldRadius: 120,
  groundY: -20,
  skyHeight: 80,
  buildingMinHeight: 8,
  buildingMaxHeight: 45,
  spireMaxHeight: 12,
};

// ── Camera ──
export const CAMERA = {
  fov: 60,
  near: 0.5,
  far: 300,
  initialPosition: [6, 29, 10],
};

// ── Lighting ──
export const LIGHTING = {
  ambientIntensity: 0.08,
  ambientColor: 0x1a1a3a,
  moonIntensity: 0.6,
  moonColor: 0xC8D0E0,
  moonPosition: [40, 60, -30],
  spotlightIntensity: 80,
  spotlightColor: 0xFFD700,
  spotlightAngle: 0.5,
  spotlightPenumbra: 0.4,
};

// ── Fog ──
export const FOG = {
  density: 0.0018,
  color: 0x080818,
  mistCount: 4,
  mistHeight: 3,
};

// ── Bat Signal ──
export const BAT_SIGNAL = {
  searchlightPosition: [5, -5, -10],
  beamLength: 70,
  beamRadius: 4,
  emblemSize: 18,
  emblemHeight: 55,
};

// ── Bats ──
export const BATS = {
  count: { low: 15, medium: 30, high: 60 },
  spriteSize: 1.2,
  swarmRadius: 12,
  maxSpeed: 8,
  cohesionWeight: 0.004,
  separationWeight: 0.06,
  alignmentWeight: 0.03,
  targetWeight: 0.02,
  separationDistance: 3,
};

// ── Rain ──
export const RAIN = {
  count: { low: 3000, medium: 8000, high: 15000 },
  fallSpeed: 25,
  spreadRadius: 80,
  heightRange: 60,
  windDrift: 1.5,
  streakLength: 0.8,
};

// ── Skyline ──
export const SKYLINE = {
  buildingCount: { low: 30, medium: 50, high: 80 },
  groundSize: 200,
  ringRadii: [15, 30, 55],
  ringCounts: [8, 16, 24],
};

// ── Stars ──
export const STARS = {
  count: { low: 200, medium: 350, high: 500 },
  radius: 100,
};

// ── Scroll Stages (5 stages: Birthday → Signal → Reveal → Dive → Ascend) ──
export const STAGES = {
  BIRTHDAY: { start: 0, end: 0.18 },
  HERO: { start: 0.18, end: 0.36 },
  REVEAL: { start: 0.36, end: 0.58 },
  DIVE: { start: 0.58, end: 0.78 },
  ASCEND: { start: 0.78, end: 1.0 },
};

// ── Timing ──
export const TIMING = {
  loadingMinDuration: 1800,
  fadeTransition: 0.8,
};
