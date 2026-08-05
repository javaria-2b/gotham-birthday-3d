import * as THREE from 'three';
import { BatBehavior } from '../animation/BatBehavior.js';
import { BATS } from '../utils/Constants.js';
import { createBatTexture } from '../utils/TextureGenerator.js';

/**
 * Bat swarm rendered as instanced sprites with boid behavior.
 */
export class Bats {
  constructor(scene, tierConfig) {
    this.scene = scene;
    this.count = tierConfig.batCount;

    this._createSprites();
    this.behavior = new BatBehavior(this.count);
  }

  _createSprites() {
    // Create bat texture
    const batCanvas = createBatTexture();
    const batTex = new THREE.CanvasTexture(batCanvas);
    batTex.colorSpace = THREE.SRGBColorSpace;

    const mat = new THREE.SpriteMaterial({
      map: batTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    });

    this.sprites = [];

    for (let i = 0; i < this.count; i++) {
      const sprite = new THREE.Sprite(mat.clone());
      const scale = BATS.spriteSize * (0.6 + Math.random() * 0.8);
      sprite.scale.set(scale, scale, 1);
      sprite.renderOrder = 1000;
      this.scene.add(sprite);
      this.sprites.push(sprite);
    }
  }

  /**
   * Update sprite positions from boid simulation.
   */
  update(delta) {
    this.behavior.update(delta);

    for (let i = 0; i < this.count; i++) {
      const sprite = this.sprites[i];
      sprite.position.set(
        this.behavior.positions[i * 3],
        this.behavior.positions[i * 3 + 1],
        this.behavior.positions[i * 3 + 2],
      );

      // Face bats in direction of movement
      const vx = this.behavior.velocities[i * 3];
      const vy = this.behavior.velocities[i * 3 + 1];
      const vz = this.behavior.velocities[i * 3 + 2];
      const angle = Math.atan2(vx, vz);
      sprite.rotation.z = angle * 0.3; // subtle bank
    }
  }

  /**
   * Set swarm leader target (scroll-driven).
   */
  setTarget(x, y, z) {
    if (this.behavior) {
      this.behavior.setLeaderTarget(x, y, z);
    }
  }

  /**
   * Add repulsion from a world-space point.
   */
  repelFrom(x, y, z, radius = 8) {
    if (this.behavior) {
      this.behavior.addRepulsion(x, y, z, radius);
    }
  }
}
