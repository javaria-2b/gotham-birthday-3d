import { lerp } from '../utils/MathHelpers.js';

/**
 * Device orientation (gyroscope) parallax for mobile.
 */
export class GyroParallax {
  constructor(app) {
    this.app = app;
    this.gamma = 0;  // left-right tilt (-90 to 90)
    this.beta = 0;   // front-back tilt (-180 to 180)
    this.isSupported = false;
    this.isActive = false;

    this._setup();
  }

  async _setup() {
    // Check support
    if (typeof DeviceOrientationEvent !== 'undefined') {
      // iOS 13+ requires permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission !== 'granted') return;
        } catch (e) {
          return; // User denied
        }
      }

      window.addEventListener('deviceorientation', (e) => {
        this.gamma = e.gamma || 0; // -90 to 90
        this.beta = e.beta || 0;   // -180 to 180
        this.isActive = true;
      });

      this.isSupported = true;
    }
  }

  update(delta) {
    if (!this.isActive) return;

    // Map tilt to offset
    const ox = (this.gamma / 45) * 4;  // clamp to ±4 units
    const oy = (this.beta / 90) * 3;

    const base = this.app.sceneManager.defaultLookTarget;
    const target = this.app.sceneManager.currentLookTarget;
    target.x = base.x + ox;
    target.y = base.y - oy;
  }
}
