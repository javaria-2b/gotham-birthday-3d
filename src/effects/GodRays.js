import * as THREE from 'three';

/**
 * Volumetric god rays for the Bat-Signal.
 * Uses concentric semi-transparent cone-like planes with additive blending
 * to simulate volumetric light scattering in the night sky.
 */
export class GodRays {
  constructor(scene, spotlightPos) {
    this.scene = scene;
    this.origin = new THREE.Vector3(...spotlightPos);
    this.rays = [];
    this.intensity = 1;
    this._time = 0;

    this._createVolumetricBeam();
    this._createRayPlanes();
  }

  /** Core volumetric beam — a semi-transparent cone with soft edges */
  _createVolumetricBeam() {
    const geo = new THREE.CylinderGeometry(1.2, 5.5, 75, 24, 1, true);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(0xFFE080) },
        uIntensity: { value: 0.12 },
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying float vWorldY;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldY = wp.y;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        varying float vWorldY;
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uTime;
        void main() {
          float h = 1.0 - vUv.y;
          float fade = pow(h, 3.5);
          float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
          edge = pow(edge, 2.0);
          float shimmer = 0.85 + 0.15 * sin(vUv.y * 30.0 + uTime * 2.5) * cos(vUv.x * 20.0 + uTime);
          float a = fade * edge * shimmer * uIntensity;
          gl_FragColor = vec4(uColor, a);
        }
      `,
    });

    this.beam = new THREE.Mesh(geo, mat);
    this.beam.position.copy(this.origin);
    this.beam.position.y += 38;
    this.beam.renderOrder = 996;
    this.scene.add(this.beam);
  }

  /** Individual light rays radiating outward for texture */
  _createRayPlanes() {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const h = 8 + Math.random() * 60;
      const w = 0.3 + Math.random() * 1.5;
      const len = 12 + Math.random() * 44;

      const geo = new THREE.PlaneGeometry(w, len);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.13, 1, 0.5 + Math.random() * 0.5),
        transparent: true,
        opacity: 0.02 + Math.random() * 0.04,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });

      const ray = new THREE.Mesh(geo, mat);
      ray.position.copy(this.origin);
      ray.position.y += h;
      ray.position.x += Math.cos(a) * (6 + Math.random() * 12);
      ray.position.z += Math.sin(a) * (6 + Math.random() * 12);
      ray.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      ray.rotation.y = a;
      ray.renderOrder = 997;

      this.scene.add(ray);
      this.rays.push({
        mesh: ray,
        baseOpacity: mat.opacity,
        phase: Math.random() * Math.PI * 2,
        speed: 0.25 + Math.random() * 0.6,
      });
    }
  }

  update(time) {
    this._time = time;

    // Shimmer individual rays
    for (const r of this.rays) {
      r.mesh.material.opacity = r.baseOpacity * this.intensity * (0.7 + 0.3 * Math.sin(time * r.speed + r.phase));
    }

    // Pulsing core beam
    if (this.beam && this.beam.material.uniforms) {
      this.beam.material.uniforms.uTime.value = time;
      this.beam.material.uniforms.uIntensity.value = 0.12 * this.intensity;
    }
  }

  setIntensity(val) {
    this.intensity += (val - this.intensity) * 0.06;
  }

  dispose() {
    this.rays.forEach(r => this.scene.remove(r.mesh));
    if (this.beam) this.scene.remove(this.beam);
  }
}
