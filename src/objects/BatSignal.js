import * as THREE from 'three';
import { BAT_SIGNAL, COLORS } from '../utils/Constants.js';
import { createBatEmblemTexture } from '../utils/TextureGenerator.js';

/**
 * Bat-Signal: searchlight on a rooftop + bat emblem projected into the sky.
 */
export class BatSignal {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.intensity = 1.0;

    this._createSearchlight();
    this._createBeamCone();
    this._createEmblem();

    scene.add(this.group);
  }

  _createSearchlight() {
    const [x, y, z] = BAT_SIGNAL.searchlightPosition;
    const sl = new THREE.Group();
    sl.position.set(x, y, z);

    // Base cylinder
    const baseGeo = new THREE.CylinderGeometry(0.6, 1.0, 1.5, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2a,
      roughness: 0.3,
      metalness: 0.7,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.75;
    base.castShadow = true;
    sl.add(base);

    // Spotlight housing
    const housingGeo = new THREE.CylinderGeometry(0.5, 0.7, 1.2, 8);
    const housingMat = new THREE.MeshStandardMaterial({
      color: 0x222235,
      roughness: 0.2,
      metalness: 0.8,
    });
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.position.y = 2.0;
    housing.castShadow = true;
    sl.add(housing);

    // Emissive lens
    const lensGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.15, 16);
    const lensMat = new THREE.MeshStandardMaterial({
      color: COLORS.batSignal,
      emissive: COLORS.batSignal,
      emissiveIntensity: 3,
      roughness: 0.1,
      metalness: 0.1,
    });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.y = 2.65;
    sl.add(lens);

    // Small rooftop platform
    const platformGeo = new THREE.BoxGeometry(3, 0.3, 3);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.5,
      metalness: 0.3,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.15;
    platform.receiveShadow = true;
    sl.add(platform);

    this.group.add(sl);
    this.searchlightGroup = sl;
  }

  _createBeamCone() {
    // Volumetric light cone — fades from opaque at base to transparent at tip
    const [x, y, z] = BAT_SIGNAL.searchlightPosition;
    const beamRadius = BAT_SIGNAL.beamRadius;
    const beamLength = BAT_SIGNAL.beamLength;

    const coneGeo = new THREE.CylinderGeometry(beamRadius * 0.3, beamRadius, beamLength, 32, 1, true);
    const coneMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(COLORS.batSignal) },
        uIntensity: { value: 1.0 },
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying float vHeight;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vHeight = worldPos.y;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        varying float vHeight;
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uTime;

        void main() {
          // Fade from base (opaque-ish) to tip (transparent)
          float heightFade = 1.0 - vUv.y;
          heightFade = pow(heightFade, 2.5);

          // Edge softness
          float edgeFade = 1.0 - abs(vUv.x - 0.5) * 2.0;
          edgeFade = pow(edgeFade, 1.5);

          // Subtle shimmer
          float shimmer = 0.9 + 0.1 * sin(vUv.y * 20.0 + uTime * 3.0) * cos(vUv.x * 15.0 + uTime * 2.0);

          float alpha = heightFade * edgeFade * shimmer * uIntensity * 0.35;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    this.beamMesh = new THREE.Mesh(coneGeo, coneMat);
    this.beamMesh.position.set(x, y + 2.6, z);
    this.beamMesh.renderOrder = 998;
    this.group.add(this.beamMesh);
  }

  _createEmblem() {
    // Bat emblem projection plane in the sky
    const canvas = createBatEmblemTexture();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const emblemSize = BAT_SIGNAL.emblemSize;
    const emblemGeo = new THREE.PlaneGeometry(emblemSize, emblemSize);
    const emblemMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTexture: { value: texture },
        uOpacity: { value: 0.85 },
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float uOpacity;
        uniform float uTime;

        void main() {
          vec4 tex = texture2D(uTexture, vUv);
          float pulse = 0.9 + 0.1 * sin(uTime * 2.0);
          float alpha = tex.a * uOpacity * pulse;
          gl_FragColor = vec4(tex.rgb, alpha);
        }
      `,
    });

    const [x, , z] = BAT_SIGNAL.searchlightPosition;
    this.emblemMesh = new THREE.Mesh(emblemGeo, emblemMat);
    this.emblemMesh.position.set(x, BAT_SIGNAL.emblemHeight, z);
    this.emblemMesh.renderOrder = 997;
    this.group.add(this.emblemMesh);
  }

  /**
   * Update the beam and emblem shader time.
   */
  update(delta) {
    if (this.beamMesh.material.uniforms) {
      this.beamMesh.material.uniforms.uTime.value += delta;
      this.beamMesh.material.uniforms.uIntensity.value +=
        (this.intensity - this.beamMesh.material.uniforms.uIntensity.value) * 0.05;
    }
    if (this.emblemMesh.material.uniforms) {
      this.emblemMesh.material.uniforms.uTime.value += delta;
    }
  }

  setIntensity(val) {
    this.intensity = val;
  }
}
