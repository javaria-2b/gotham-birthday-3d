import * as THREE from 'three';
import { CAMERA, COLORS } from '../utils/Constants.js';

/**
 * Manages the Three.js scene, camera, and renderer.
 * Handles resize and provides the core render loop target.
 */
export class SceneManager {
  constructor(container) {
    this.container = container;

    // ── Renderer ──
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(COLORS.bg);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // ── Scene ──
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.bg);
    this.scene.fog = new THREE.FogExp2(COLORS.fog, 0.0018);

    // ── Camera ──
    this.camera = new THREE.PerspectiveCamera(
      CAMERA.fov,
      window.innerWidth / window.innerHeight,
      CAMERA.near,
      CAMERA.far,
    );
    this.camera.position.set(...CAMERA.initialPosition);
    this.camera.lookAt(6, 29, -8);

    // Store default look-at target for parallax offset
    this.defaultLookTarget = new THREE.Vector3(6, 29, -8);
    this.currentLookTarget = this.defaultLookTarget.clone();

    // ── Resize callbacks ──
    this._resizeCallbacks = [];
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    // ── Clock ──
    this.clock = new THREE.Clock();
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    // Notify post-processing etc.
    this._resizeCallbacks.forEach((fn) => fn(w, h));
  }

  onResize(fn) {
    this._resizeCallbacks.push(fn);
  }

  getDelta() {
    return Math.min(this.clock.getDelta(), 0.1); // cap to avoid spiral of death
  }

  getElapsed() {
    return this.clock.elapsedTime;
  }

  render() {
    // Update camera to look at the (possibly parallax-shifted) target
    this.camera.lookAt(this.currentLookTarget);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}
