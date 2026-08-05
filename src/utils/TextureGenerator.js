/**
 * Generates procedural textures using Canvas 2D API.
 * All textures are created at runtime — zero external image assets.
 */

/**
 * Creates a bat silhouette texture for sprites.
 * Returns a canvas that can be used as a Three.js texture.
 */
export function createBatTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const w = size;
  const h = size;
  const cx = w / 2;
  const cy = h / 2;

  ctx.fillStyle = '#000000';

  // Draw bat silhouette (body + wings)
  ctx.beginPath();
  // Body
  ctx.ellipse(cx, cy, w * 0.06, h * 0.18, 0, 0, Math.PI * 2);
  // Head
  ctx.ellipse(cx, cy - h * 0.22, w * 0.06, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left wing
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.04, cy - h * 0.1);
  ctx.quadraticCurveTo(cx - w * 0.3, cy - h * 0.35, cx - w * 0.45, cy - h * 0.2);
  ctx.quadraticCurveTo(cx - w * 0.35, cy + h * 0.15, cx - w * 0.15, cy + h * 0.35);
  ctx.quadraticCurveTo(cx - w * 0.08, cy + h * 0.15, cx - w * 0.04, cy - h * 0.05);
  ctx.fill();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.04, cy - h * 0.1);
  ctx.quadraticCurveTo(cx + w * 0.3, cy - h * 0.35, cx + w * 0.45, cy - h * 0.2);
  ctx.quadraticCurveTo(cx + w * 0.35, cy + h * 0.15, cx + w * 0.15, cy + h * 0.35);
  ctx.quadraticCurveTo(cx + w * 0.08, cy + h * 0.15, cx + w * 0.04, cy - h * 0.05);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.06, cy - h * 0.28);
  ctx.lineTo(cx - w * 0.04, cy - h * 0.38);
  ctx.lineTo(cx - w * 0.01, cy - h * 0.28);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + w * 0.06, cy - h * 0.28);
  ctx.lineTo(cx + w * 0.04, cy - h * 0.38);
  ctx.lineTo(cx + w * 0.01, cy - h * 0.28);
  ctx.fill();

  return canvas;
}

/**
 * Creates a bat emblem texture for the Bat-Signal projection.
 */
export function createBatEmblemTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.42;

  // Glowing background circle
  const bgGrad = ctx.createRadialGradient(cx, cy, s * 0.4, cx, cy, s * 1.1);
  bgGrad.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
  bgGrad.addColorStop(0.6, 'rgba(255, 200, 0, 0.3)');
  bgGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Bat shape
  ctx.fillStyle = 'rgba(2, 2, 16, 0.85)';
  ctx.beginPath();
  const scale = s / 50;
  ctx.moveTo(cx, cy - 50 * scale);
  ctx.lineTo(cx + 12 * scale, cy - 22 * scale);
  ctx.lineTo(cx + 32 * scale, cy - 28 * scale);
  ctx.lineTo(cx + 36 * scale, cy - 8 * scale);
  ctx.lineTo(cx + 48 * scale, cy - 2 * scale);
  ctx.lineTo(cx + 60 * scale, cy + 18 * scale);
  ctx.lineTo(cx + 52 * scale, cy + 38 * scale);
  ctx.lineTo(cx + 42 * scale, cy + 22 * scale);
  ctx.lineTo(cx + 28 * scale, cy + 28 * scale);
  ctx.lineTo(cx + 18 * scale, cy + 14 * scale);
  ctx.lineTo(cx, cy + 50 * scale);
  ctx.lineTo(cx - 18 * scale, cy + 14 * scale);
  ctx.lineTo(cx - 28 * scale, cy + 28 * scale);
  ctx.lineTo(cx - 42 * scale, cy + 22 * scale);
  ctx.lineTo(cx - 52 * scale, cy + 38 * scale);
  ctx.lineTo(cx - 60 * scale, cy + 18 * scale);
  ctx.lineTo(cx - 48 * scale, cy - 2 * scale);
  ctx.lineTo(cx - 36 * scale, cy - 8 * scale);
  ctx.lineTo(cx - 32 * scale, cy - 28 * scale);
  ctx.lineTo(cx - 12 * scale, cy - 22 * scale);
  ctx.closePath();
  ctx.fill();

  return canvas;
}

/**
 * Creates a window grid texture for building facades.
 * @param {number} cols
 * @param {number} rows
 * @param {number} litProbability - chance each window is lit (0-1)
 * @returns {HTMLCanvasElement}
 */
export function createWindowTexture(cols = 8, rows = 16, litProbability = 0.35) {
  const cellSize = 12;
  const gap = 3;
  const width = cols * (cellSize + gap) + gap;
  const height = rows * (cellSize + gap) + gap;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#080812';
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = gap + col * (cellSize + gap);
      const y = gap + row * (cellSize + gap);

      if (Math.random() < litProbability) {
        // Lit window with warm amber glow
        const brightness = 0.3 + Math.random() * 0.7;
        const alpha = 0.4 + Math.random() * 0.6;
        ctx.fillStyle = `rgba(255, ${Math.floor(160 + brightness * 95)}, ${Math.floor(40 + brightness * 60)}, ${alpha})`;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Subtle glow
        ctx.shadowColor = 'rgba(255, 179, 71, 0.6)';
        ctx.shadowBlur = 3 + Math.random() * 3;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.shadowBlur = 0;
      } else {
        // Dark window
        ctx.fillStyle = 'rgba(5, 5, 15, 0.7)';
        ctx.fillRect(x, y, cellSize, cellSize);

        // Subtle frame
        ctx.strokeStyle = 'rgba(20, 20, 40, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }

  return canvas;
}

/**
 * Creates a rain streak texture for the rain particle system.
 */
export function createRainStreakTexture(size = 32) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const cx = size / 2;
  const grad = ctx.createLinearGradient(cx, 0, cx, size);
  grad.addColorStop(0, 'rgba(160, 180, 210, 0)');
  grad.addColorStop(0.3, 'rgba(160, 180, 210, 0.4)');
  grad.addColorStop(0.7, 'rgba(160, 180, 210, 0.7)');
  grad.addColorStop(1, 'rgba(160, 180, 210, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(cx - 1, 0, 2, size);

  return canvas;
}

/**
 * Creates a soft circular gradient texture for the moon glow.
 */
export function createGlowTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, size * 0.2, cx, cy, size * 0.5);
  grad.addColorStop(0, 'rgba(255, 255, 240, 0.5)');
  grad.addColorStop(0.3, 'rgba(232, 224, 200, 0.2)');
  grad.addColorStop(1, 'rgba(232, 224, 200, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return canvas;
}
