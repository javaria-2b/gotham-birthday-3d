// ── Basic Math ──
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + (outMax - outMin) * clamp(t, 0, 1);
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

// ── 3D Perlin-like Noise ──
// Simplified gradient noise for mist opacity and bat movement variation.
// Uses a permutation table and smooth interpolation.

const PERM = new Uint8Array(512);
const GRAD3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

// Seed the permutation table
(function seedPerm() {
  const p = [];
  for (let i = 0; i < 256; i++) p[i] = i;
  // Fisher-Yates shuffle with deterministic seed
  let seed = 42;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) {
    PERM[i] = p[i & 255];
  }
})();

function dot3(g, x, y, z) {
  return g[0] * x + g[1] * y + g[2] * z;
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function noise3D(x, y, z) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;

  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);

  const u = fade(x);
  const v = fade(y);
  const w = fade(z);

  const A = PERM[X] + Y;
  const AA = PERM[A] + Z;
  const AB = PERM[A + 1] + Z;
  const B = PERM[X + 1] + Y;
  const BA = PERM[B] + Z;
  const BB = PERM[B + 1] + Z;

  return lerp(
    lerp(
      lerp(dot3(GRAD3[PERM[AA] % 12], x, y, z), dot3(GRAD3[PERM[BA] % 12], x - 1, y, z), u),
      lerp(dot3(GRAD3[PERM[AB] % 12], x, y - 1, z), dot3(GRAD3[PERM[BB] % 12], x - 1, y - 1, z), u),
      v,
    ),
    lerp(
      lerp(dot3(GRAD3[PERM[AA + 1] % 12], x, y, z - 1), dot3(GRAD3[PERM[BA + 1] % 12], x - 1, y, z - 1), u),
      lerp(dot3(GRAD3[PERM[AB + 1] % 12], x, y - 1, z - 1), dot3(GRAD3[PERM[BB + 1] % 12], x - 1, y - 1, z - 1), u),
      v,
    ),
    w,
  );
}

// Simple 1D noise for varied use
export function noise1D(x) {
  return noise3D(x * 1.7, x * 3.1, 0.5);
}
