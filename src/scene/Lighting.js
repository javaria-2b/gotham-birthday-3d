import * as THREE from 'three';
import { LIGHTING, COLORS } from '../utils/Constants.js';

/**
 * Sets up all scene lighting: ambient, moon directional, and Bat-Signal spotlight.
 */
export class Lighting {
  constructor(scene) {
    this.scene = scene;

    // ── Ambient ── (very dim blue-tinted, prevents pure black shadows)
    this.ambient = new THREE.AmbientLight(LIGHTING.ambientColor, LIGHTING.ambientIntensity);
    scene.add(this.ambient);

    // ── Moon Light ── (directional, casts shadows)
    this.moonLight = new THREE.DirectionalLight(
      LIGHTING.moonColor,
      LIGHTING.moonIntensity,
    );
    this.moonLight.position.set(...LIGHTING.moonPosition);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 1024;
    this.moonLight.shadow.mapSize.height = 1024;
    this.moonLight.shadow.camera.near = 0.5;
    this.moonLight.shadow.camera.far = 200;
    this.moonLight.shadow.camera.left = -60;
    this.moonLight.shadow.camera.right = 60;
    this.moonLight.shadow.camera.top = 60;
    this.moonLight.shadow.camera.bottom = -60;
    this.moonLight.shadow.bias = -0.0001;
    scene.add(this.moonLight);

    // ── Bat-Signal Spotlight ──
    this.batSpotlight = new THREE.SpotLight(
      LIGHTING.spotlightColor,
      LIGHTING.spotlightIntensity,
      LIGHTING.spotlightAngle,
      LIGHTING.spotlightPenumbra,
      0.5,  // decay
      1.5,  // penumbra
    );
    this.batSpotlight.position.set(5, -5, -10);
    this.batSpotlight.target.position.set(5, 50, -10);
    this.batSpotlight.castShadow = true;
    this.batSpotlight.shadow.mapSize.width = 512;
    this.batSpotlight.shadow.mapSize.height = 512;
    this.batSpotlight.shadow.camera.near = 0.5;
    this.batSpotlight.shadow.camera.far = 100;
    this.batSpotlight.shadow.bias = -0.0001;
    scene.add(this.batSpotlight);
    scene.add(this.batSpotlight.target);

    // Store reference for scroll-driven adjustments
    this.batSpotlightRef = this.batSpotlight;
  }

  /**
   * Adjust spotlight intensity (for scroll-driven effects).
   */
  setSpotlightIntensity(val) {
    this.batSpotlight.intensity = LIGHTING.spotlightIntensity * val;
  }

  /**
   * Adjust ambient intensity.
   */
  setAmbientIntensity(val) {
    this.ambient.intensity = LIGHTING.ambientIntensity * val;
  }
}
