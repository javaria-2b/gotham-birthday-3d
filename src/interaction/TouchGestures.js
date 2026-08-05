/**
 * Mobile touch gesture detection.
 * Detects swipe direction for stage navigation.
 */
export class TouchGestures {
  constructor(scrollController) {
    this.sc = scrollController;
    this.swipeThreshold = 50; // min px for a swipe
    this._startX = 0;
    this._startY = 0;
    this._startProgress = 0;

    this._setup();
  }

  _setup() {
    // These complement the ScrollController's touch handling
    // by providing swipe-for-stage on mobile when no scroll phantom is used
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this._startX = e.touches[0].clientX;
        this._startY = e.touches[0].clientY;
        this._startProgress = this.sc.getProgress();
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (this._startY == null) return;
      const dy = this._startY - (e.changedTouches[0]?.clientY || this._startY);
      const dx = this._startX - (e.changedTouches[0]?.clientX || this._startX);

      // Only treat as swipe if vertical movement dominates
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > this.swipeThreshold) {
        const direction = dy > 0 ? 'down' : 'up';
        const currentStage = this.sc.getStage();

        if (direction === 'down' && currentStage < 3) {
          this.sc.goToStage(currentStage + 1);
        } else if (direction === 'up' && currentStage > 0) {
          this.sc.goToStage(currentStage - 1);
        }
      }
    });
  }
}
