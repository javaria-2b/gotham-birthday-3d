import * as THREE from 'three';

/**
 * Golden sparkle particles rising around Batman's tower.
 * Uses standard PointsMaterial for reliable rendering.
 */
export class BirthdayParticles {
  constructor(scene) {
    this.scene = scene;
    this.count = 300;
    this.intensity = 1;

    this._createParticles();
  }

  _createParticles() {
    const positions = new Float32Array(this.count * 3);
    const aLife = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      this._reset(i, positions, aLife, true);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Radial glow texture
    const s = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = s;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,245,190,1)');
    g.addColorStop(0.1, 'rgba(255,220,110,0.9)');
    g.addColorStop(0.35, 'rgba(255,175,60,0.5)');
    g.addColorStop(1, 'rgba(255,130,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      map: tex,
      color: 0xFFD700,
      size: 1.2,  // Large enough to be visible at camera distance
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.position.set(6, 26, -8);
    this.scene.add(this.points);

    this._pos = positions;
    this._life = aLife;
    this._time = 0;
  }

  _reset(i, pos, life, randomY) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.2 + Math.random() * 5;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = randomY ? Math.random() * 32 : -1;
    pos[i * 3 + 2] = Math.sin(a) * r;
    life[i] = Math.random() * 6;
  }

  update(delta) {
    this._time += delta;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this._pos[idx + 1] += delta * (2.0 + this._life[i] * 0.6) * this.intensity;
      this._pos[idx] += Math.sin(this._time * 2.5 + i) * delta * 0.4;
      this._pos[idx + 2] += Math.cos(this._time * 2.5 + i) * delta * 0.4;

      if (this._pos[idx + 1] > 32) {
        this._reset(i, this._pos, this._life, false);
      }
    }

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.material.opacity = 0.85 * this.intensity;
  }

  setIntensity(val) {
    this.intensity += (val - this.intensity) * 0.04;
  }
}
