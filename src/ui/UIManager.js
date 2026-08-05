import { StageIndicators } from './StageIndicators.js';

/**
 * Top-level UI manager. Wires StageIndicators and coordinates with app lifecycle.
 */
export class UIManager {
  constructor(scrollController) {
    this.stageIndicators = new StageIndicators(scrollController);
  }

  update(delta) {
    this.stageIndicators.update(delta);
  }
}
