import * as THREE from 'three';
import { SCENE, SKYLINE, COLORS } from '../utils/Constants.js';
import { createWindowTexture } from '../utils/TextureGenerator.js';

/**
 * Procedural Gotham City skyline.
 * Generates buildings, spires, and ground plane with no external models.
 */
export class Skyline {
  constructor(scene, tierConfig) {
    this.scene = scene;
    this.buildings = [];
    this.buildingGroup = new THREE.Group();

    // ── Generate window textures ──
    this.windowTextures = this._createWindowTextures();

    // ── Ground ──
    this._createGround();

    // ── Buildings ──
    const count = tierConfig.buildingCount;
    this._generateBuildings(count);

    scene.add(this.buildingGroup);
  }

  _createWindowTextures() {
    const textures = [];
    const variants = [
      { cols: 4, rows: 8, prob: 0.3 },
      { cols: 6, rows: 10, prob: 0.35 },
      { cols: 8, rows: 12, prob: 0.4 },
      { cols: 10, rows: 14, prob: 0.35 },
      { cols: 6, rows: 16, prob: 0.5 },
    ];

    variants.forEach((v) => {
      const canvas = createWindowTexture(v.cols, v.rows, v.prob);
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      textures.push(tex);
    });

    return textures;
  }

  _createGround() {
    const size = SKYLINE.groundSize;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x080812,
      roughness: 0.7,
      metalness: 0.3,
    });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = SCENE.groundY;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Subtle grid lines on ground
    const gridHelper = new THREE.PolarGridHelper(size / 2.5, 48, 32, 64, 0x111125, 0x111125);
    gridHelper.position.y = SCENE.groundY + 0.01;
    this.scene.add(gridHelper);
  }

  _generateBuildings(count) {
    // Place buildings in concentric rings
    const rings = [
      { radius: SKYLINE.ringRadii[0], count: Math.floor(count * 0.2), heightRange: [15, 45], detail: 'high' },
      { radius: SKYLINE.ringRadii[1], count: Math.floor(count * 0.4), heightRange: [8, 30], detail: 'medium' },
      { radius: SKYLINE.ringRadii[2], count: Math.floor(count * 0.4), heightRange: [5, 18], detail: 'low' },
    ];

    rings.forEach((ring) => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const radiusVariation = ring.radius + (Math.random() - 0.5) * ring.radius * 0.4;
        const x = Math.cos(angle) * radiusVariation;
        const z = Math.sin(angle) * radiusVariation - 15; // offset toward center-back

        const width = 1.5 + Math.random() * 3.5;
        const depth = 1.5 + Math.random() * 3.5;
        const minH = ring.heightRange[0];
        const maxH = ring.heightRange[1];
        const height = minH + Math.random() * (maxH - minH);

        this._createBuilding(x, SCENE.groundY, z, width, height, depth, ring.detail);
      }
    });

    // Extra tall towers — placed AWAY from Batman's tower at (6, -12)
    this._createBuilding(-5, SCENE.groundY, -10, 2.5, 42, 2.5, 'high');
    this._createBuilding(14, SCENE.groundY, -5, 2, 32, 2, 'high');
  }

  _createBuilding(x, groundY, z, w, h, d, detail) {
    const group = new THREE.Group();
    group.position.set(x, groundY + h / 2, z);

    // ── Main building body ──
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: detail === 'high' ? COLORS.buildingMid : COLORS.buildingDark,
      roughness: 0.6,
      metalness: 0.2,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // ── Windows ──
    if (detail !== 'low') {
      const windowTex = this.windowTextures[Math.floor(Math.random() * this.windowTextures.length)];
      const windowMat = new THREE.MeshStandardMaterial({
        map: windowTex,
        emissive: COLORS.windowGlow,
        emissiveMap: windowTex,
        emissiveIntensity: 0.4 + Math.random() * 0.4,
        roughness: 0.3,
        metalness: 0.1,
      });

      const windowGeo = new THREE.BoxGeometry(w + 0.05, h - 0.5, d + 0.05);
      const windows = new THREE.Mesh(windowGeo, windowMat);
      group.add(windows);
    }

    // ── Gothic Spire ──
    if (detail === 'high' && h > 15 && Math.random() < 0.6) {
      const spireH = 2 + Math.random() * 10;
      const spireRadius = Math.min(w, d) * 0.25;
      const spireGeo = new THREE.ConeGeometry(spireRadius, spireH, 6, 1);
      const spireMat = new THREE.MeshStandardMaterial({
        color: 0x111125,
        roughness: 0.4,
        metalness: 0.5,
      });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.y = h / 2 + spireH / 2;
      spire.castShadow = true;
      group.add(spire);

      // Secondary smaller spires
      if (Math.random() < 0.4) {
        for (let s = 0; s < 2; s++) {
          const sideSpire = new THREE.Mesh(
            new THREE.ConeGeometry(spireRadius * 0.6, spireH * 0.6, 4, 1),
            spireMat,
          );
          const offset = (s === 0 ? 1 : -1) * Math.max(w, d) * 0.3;
          sideSpire.position.set(offset, h / 2 + spireH * 0.3, 0);
          sideSpire.castShadow = true;
          group.add(sideSpire);
        }
      }
    }

    // ── Roof decorative elements ──
    if (detail === 'high' && Math.random() < 0.3) {
      const gargoyleGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
      const gargoyleMat = new THREE.MeshStandardMaterial({
        color: 0x0d0d1d,
        roughness: 0.5,
        metalness: 0.3,
      });
      for (let c = 0; c < 4; c++) {
        const cx = (c < 2 ? 1 : -1) * (w / 2 + 0.3);
        const cz = (c % 2 === 0 ? 1 : -1) * (d / 2 + 0.3);
        const gargoyle = new THREE.Mesh(gargoyleGeo, gargoyleMat);
        gargoyle.position.set(cx, h / 2 - 1, cz);
        group.add(gargoyle);
      }
    }

    this.buildingGroup.add(group);
    this.buildings.push({ group, body });
  }

  /**
   * Pulse building window brightness (for easter egg wave effect).
   */
  pulseWindows(intensity = 2.0, duration = 1.5) {
    this.buildings.forEach(({ group }, index) => {
      const delay = index * 0.02;
      setTimeout(() => {
        group.children.forEach((child) => {
          if (child.material && child.material.emissiveIntensity !== undefined
              && child.material.emissive && child.material.emissive.getHex() === COLORS.windowGlow) {
            child.material.emissiveIntensity = intensity;
            setTimeout(() => {
              child.material.emissiveIntensity = 0.4 + Math.random() * 0.4;
            }, duration * 1000 * 0.3);
          }
        });
      }, delay * 1000);
    });
  }
}
