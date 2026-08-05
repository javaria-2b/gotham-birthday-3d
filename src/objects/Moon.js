import * as THREE from 'three';
import { STARS, COLORS } from '../utils/Constants.js';
import { createGlowTexture } from '../utils/TextureGenerator.js';

/**
 * Moon sphere + starfield particles.
 */
export class Moon {
  constructor(scene, tierConfig) {
    this.scene = scene;
    this.starCount = tierConfig.starCount;

    this._createMoon();
    this._createStars();
  }

  _createMoon() {
    // Moon sphere
    const moonGeo = new THREE.SphereGeometry(5, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: COLORS.moon,
      emissive: COLORS.moon,
      emissiveIntensity: 1.5,
      roughness: 0.8,
      metalness: 0.1,
    });
    this.moon = new THREE.Mesh(moonGeo, moonMat);
    this.moon.position.set(40, 60, -30);
    this.scene.add(this.moon);

    // Moon glow (billboarded sprite)
    const glowCanvas = createGlowTexture();
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.moonGlow = new THREE.Sprite(glowMat);
    this.moonGlow.position.copy(this.moon.position);
    this.moonGlow.scale.set(25, 25, 1);
    this.scene.add(this.moonGlow);
  }

  _createStars() {
    const positions = new Float32Array(this.starCount * 3);
    const radius = STARS.radius;

    for (let i = 0; i < this.starCount; i++) {
      // Random point on a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) * 0.6 + 20; // bias toward upper hemisphere
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.3,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);

    this._time = 0;
  }

  update(delta) {
    this._time += delta;

    // Subtle star twinkle via opacity
    const twinkle = 0.6 + 0.1 * Math.sin(this._time * 1.5) * Math.cos(this._time * 2.3);
    this.stars.material.opacity = twinkle;

    // Subtle moon glow pulse
    this.moonGlow.material.opacity = 0.55 + 0.05 * Math.sin(this._time * 0.7);
  }
}
