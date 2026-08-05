import * as THREE from 'three';
import { RAIN, SCENE, COLORS } from '../utils/Constants.js';
import { createRainStreakTexture } from '../utils/TextureGenerator.js';
import { noise1D } from '../utils/MathHelpers.js';

/**
 * Rain particle system with wind drift.
 */
export class Rain {
  constructor(scene, tierConfig) {
    this.scene = scene;
    this.count = tierConfig.rainCount;
    this.intensity = 1.0;

    this._createParticles();
  }

  _createParticles() {
    const spreadRadius = RAIN.spreadRadius;
    const heightRange = RAIN.heightRange;
    const groundY = SCENE.groundY;

    const positions = new Float32Array(this.count * 3);
    const velocities = new Float32Array(this.count); // individual fall speeds with variation

    for (let i = 0; i < this.count; i++) {
      // Random position in a large cylinder
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * spreadRadius;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = groundY + Math.random() * heightRange;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      velocities[i] = RAIN.fallSpeed * (0.7 + Math.random() * 0.6);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

    // Create rain streak texture
    const streakCanvas = createRainStreakTexture();
    const streakTex = new THREE.CanvasTexture(streakCanvas);
    streakTex.colorSpace = THREE.SRGBColorSpace;

    const mat = new THREE.PointsMaterial({
      map: streakTex,
      color: COLORS.rain,
      size: RAIN.streakLength,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.scene.add(this.points);

    this._positions = positions;
    this._velocities = velocities;
    this._time = 0;
  }

  update(delta) {
    this._time += delta;

    const positions = this._positions;
    const groundY = SCENE.groundY;
    const heightRange = RAIN.heightRange;
    const spreadRadius = RAIN.spreadRadius;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;

      // Fall down
      positions[idx + 1] -= this._velocities[i] * delta * this.intensity;

      // Wind drift (varying with height and time)
      const windX = RAIN.windDrift * noise1D(i * 0.01 + this._time * 0.3) * delta;
      const windZ = RAIN.windDrift * noise1D(i * 0.01 + this._time * 0.3 + 100) * delta;
      positions[idx] += windX;
      positions[idx + 2] += windZ;

      // Reset when below ground
      if (positions[idx + 1] < groundY - 2) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * spreadRadius;
        positions[idx] = Math.cos(angle) * radius;
        positions[idx + 1] = groundY + heightRange + Math.random() * 10;
        positions[idx + 2] = Math.sin(angle) * radius;
      }
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }

  setIntensity(val) {
    this.intensity = val;
    this.points.material.opacity = 0.5 * val;
  }
}
