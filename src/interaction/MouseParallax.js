import { lerp } from '../utils/MathHelpers.js';

/**
 * Maps mouse position to subtle camera look-at offset.
 */
export class MouseParallax {
  constructor(app) {
    this.app = app;
    this.mouseX = 0.5; // normalized 0-1
    this.mouseY = 0.5;
    this.targetX = 0.5;
    this.targetY = 0.5;

    // Parallax strength in world units
    this.strength = { x: 6, y: 4 };

    this._setup();
  }

  _setup() {
    window.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX / window.innerWidth;
      this.targetY = e.clientY / window.innerHeight;
    });

    // Reset on mouse leave
    window.addEventListener('mouseleave', () => {
      this.targetX = 0.5;
      this.targetY = 0.5;
    });
  }

  update(delta) {
    // Smooth follow
    const smoothing = 2;
    this.mouseX += (this.targetX - this.mouseX) * Math.min(smoothing * delta, 1);
    this.mouseY += (this.targetY - this.mouseY) * Math.min(smoothing * delta, 1);

    // Convert to offset (-1 to 1)
    const ox = (this.mouseX - 0.5) * this.strength.x;
    const oy = (this.mouseY - 0.5) * this.strength.y;

    // Apply to camera look target
    const base = this.app.sceneManager.defaultLookTarget;
    const target = this.app.sceneManager.currentLookTarget;
    target.x = base.x + ox;
    target.y = base.y - oy;
  }
}
