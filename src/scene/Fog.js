import * as THREE from 'three';
import { FOG, SCENE, COLORS } from '../utils/Constants.js';
import { noise3D } from '../utils/MathHelpers.js';

/**
 * Manages scene fog and ground-level mist planes.
 */
export class FogManager {
  constructor(scene) {
    this.scene = scene;
    this.mistPlanes = [];
    this.time = 0;

    // ── Scene Fog ──
    this.scene.fog = new THREE.FogExp2(FOG.color, FOG.density);

    // ── Ground Mist Planes ──
    this._createMistPlanes();
  }

  _createMistPlanes() {
    const mistMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(COLORS.fog) },
        uOpacity: { value: 0.25 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;

        // Simple 2D noise for mist
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }

        void main() {
          vec2 uv = vWorldPos.xz * 0.15 + uTime * 0.02;
          float n = noise(uv);
          float n2 = noise(uv * 2.0 + 0.5);
          float mist = n * 0.6 + n2 * 0.4;

          // Fade at edges
          float edgeFade = 1.0 - abs(vUv.x - 0.5) * 2.0;
          edgeFade = smoothstep(0.0, 0.4, edgeFade) * smoothstep(0.0, 0.3, 1.0 - abs(vUv.y - 0.5) * 2.0);

          float alpha = mist * uOpacity * edgeFade;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    // Create multiple mist planes at different heights
    const sizes = [
      { w: 100, h: 100, y: SCENE.groundY + 0.5 },
      { w: 80, h: 80, y: SCENE.groundY + 1.5 },
      { w: 60, h: 60, y: SCENE.groundY + 3.0 },
      { w: 90, h: 90, y: SCENE.groundY + 0.2 },
    ];

    sizes.forEach(({ w, h, y }) => {
      const geo = new THREE.PlaneGeometry(w, h);
      const mesh = new THREE.Mesh(geo, mistMaterial.clone());
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = y;
      mesh.renderOrder = 999;
      mesh.material.depthWrite = false;
      this.scene.add(mesh);
      this.mistPlanes.push(mesh);
    });
  }

  /**
   * Update mist animation.
   */
  update(delta) {
    this.time += delta;
    this.mistPlanes.forEach((plane) => {
      if (plane.material.uniforms) {
        plane.material.uniforms.uTime.value = this.time;
      }
    });
  }

  /**
   * Set fog density (for scroll-driven effects).
   */
  setDensity(val) {
    this.scene.fog.density = FOG.density * val;
  }
}
