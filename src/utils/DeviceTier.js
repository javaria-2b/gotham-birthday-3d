/**
 * Detects device capability tier for performance scaling.
 * Returns 'low', 'medium', or 'high'.
 */
export function detectDeviceTier() {
  // Check for mobile via touch support and screen size
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const screenWidth = window.innerWidth;
  const pixelRatio = window.devicePixelRatio || 1;
  const memory = navigator.deviceMemory || 4; // GB, default assume 4
  const isMobile = hasTouch && screenWidth < 1024;

  // Check WebGL renderer for GPU info
  let isIntegrated = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        // Integrated GPU indicators
        isIntegrated = /Intel|Mali|Adreno|PowerVR|Apple (A|M\d)/i.test(renderer);
      }
    }
  } catch (e) {
    // Can't determine, use other signals
  }

  // Scoring
  let score = 0;

  // Screen size
  if (screenWidth >= 1920) score += 2;
  else if (screenWidth >= 1024) score += 1;

  // Pixel ratio
  if (pixelRatio >= 2) score += 2;
  else if (pixelRatio >= 1.5) score += 1;

  // Memory
  if (memory >= 8) score += 2;
  else if (memory >= 4) score += 1;

  // GPU
  if (!isIntegrated) score += 2;

  // Mobile penalty
  if (isMobile) score -= 2;

  // Determine tier
  if (score >= 5) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

/**
 * Returns a config object with values appropriate for the detected tier.
 * @param {'low'|'medium'|'high'} tier
 * @returns {{ buildingCount: number, rainCount: number, batCount: number, starCount: number, postFull: boolean, renderPixelRatio: number, antialias: boolean|string }}
 */
export function getTierConfig(tier) {
  const configs = {
    low: {
      buildingCount: 30,
      rainCount: 3000,
      batCount: 15,
      starCount: 200,
      postFull: false,
      renderPixelRatio: 0.75,
      antialias: false,
    },
    medium: {
      buildingCount: 50,
      rainCount: 8000,
      batCount: 30,
      starCount: 350,
      postFull: true,
      renderPixelRatio: 1.0,
      antialias: 'FXAA',
    },
    high: {
      buildingCount: 80,
      rainCount: 15000,
      batCount: 60,
      starCount: 500,
      postFull: true,
      renderPixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      antialias: 'SMAA',
    },
  };
  return configs[tier] || configs.medium;
}
