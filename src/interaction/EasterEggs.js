/**
 * Easter eggs: Konami code, triple-tap on specific targets, hidden details.
 */
export class EasterEggs {
  constructor(app) {
    this.app = app;

    this._konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA',
    ];
    this._konamiIndex = 0;

    // Triple-tap: require 3 taps within 400ms, AND within 30px of each other
    this._tapTimes = [];
    this._tapPositions = [];

    this._setup();
  }

  _setup() {
    window.addEventListener('keydown', (e) => {
      if (e.code === this._konamiSequence[this._konamiIndex]) {
        this._konamiIndex++;
        if (this._konamiIndex === this._konamiSequence.length) {
          this._triggerKonami();
          this._konamiIndex = 0;
        }
      } else { this._konamiIndex = 0; }
    });

    window.addEventListener('click', (e) => {
      const now = Date.now();
      this._tapTimes.push(now);
      this._tapPositions.push({ x: e.clientX, y: e.clientY });

      // Keep only recent taps
      while (this._tapTimes.length && now - this._tapTimes[0] > 400) {
        this._tapTimes.shift();
        this._tapPositions.shift();
      }

      // Need exactly 3 taps within 400ms and within 30px of each other
      if (this._tapTimes.length >= 3) {
        const first = this._tapPositions[0];
        const allClose = this._tapPositions.every(
          p => Math.abs(p.x - first.x) < 30 && Math.abs(p.y - first.y) < 30
        );
        if (allClose) {
          this._handleTripleTap(e);
          this._tapTimes = [];
          this._tapPositions = [];
        }
      }
    });
  }

  _triggerKonami() {
    if (this.app.skyline && this.app.skyline.pulseWindows) {
      this.app.skyline.pulseWindows(3.0, 2.0);
    }
    this._toast('🦇 THE DARK KNIGHT RISES');
  }

  _handleTripleTap(e) {
    const cx = e.clientX / window.innerWidth;
    const cy = e.clientY / window.innerHeight;

    // Bat-Signal area: top-center
    if (cx > 0.35 && cx < 0.65 && cy < 0.4) {
      if (this.app.batSignal) {
        this.app.batSignal.setIntensity(2.5);
        setTimeout(() => this.app.batSignal.setIntensity(1.0), 3000);
      }
      this._toast('🔦 THE SIGNAL GROWS BRIGHTER');
    }

    // Moon area: top-right
    if (cx > 0.6 && cy < 0.3) {
      this._toast('🦇 A SHADOW PASSES THE MOON');
    }
  }

  _toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.getElementById('ui-layer').appendChild(t); }
    t.textContent = msg; t.classList.add('visible');
    setTimeout(() => t.classList.remove('visible'), 2500);
  }
}
