import * as THREE from 'three';
import { SCENE } from '../utils/Constants.js';

export class BatmanFigure {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.time = 0;
    this._opacityTarget = 1;
    this._opacity = 1;
    this._lastOpacity = 1;

    try {
      this._createRooftop();
      this._createFigure();
      this._createLighting();
    } catch (e) {
      console.error('[Gotham] BatmanFigure failed:', e);
    }

    this.group.position.set(6, SCENE.groundY, -12);
    this.group.rotation.y = -0.25;
    scene.add(this.group);
  }

  _createRooftop() {
    const g = new THREE.Group();
    const shaftH = 44;

    const shaft = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, shaftH, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x0d0d20, roughness: 0.5, metalness: 0.3 }),
    );
    shaft.position.y = shaftH / 2;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    g.add(shaft);

    const winGeo = new THREE.BoxGeometry(0.14, 1.8, 0.06);
    const baseWinMat = new THREE.MeshStandardMaterial({
      color: 0xFFB347, emissive: 0xFFB347, emissiveIntensity: 0.6, roughness: 0.2,
    });
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 3; col++) {
        for (let s = 0; s < 4; s++) {
          const a = (s / 4) * Math.PI * 2;
          const win = new THREE.Mesh(winGeo, baseWinMat.clone());
          win.material.emissiveIntensity = 0.3 + Math.random() * 0.6;
          win.position.set(Math.cos(a) * 1.3, 3 + row * 5.5 + col * 0.3, Math.sin(a) * 1.3);
          win.rotation.y = a;
          g.add(win);
        }
      }
    }

    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 1.0, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x141430, roughness: 0.3, metalness: 0.5 }),
    );
    crown.position.y = shaftH + 0.5;
    crown.castShadow = true;
    crown.receiveShadow = true;
    g.add(crown);

    const ledgeGeo = new THREE.BoxGeometry(4.0, 0.25, 4.0);
    const ledgeMat = new THREE.MeshStandardMaterial({ color: 0x1c1c38, roughness: 0.25, metalness: 0.6 });
    this.ledge = new THREE.Mesh(ledgeGeo, ledgeMat);
    this.ledge.position.y = shaftH + 1.1;
    this.ledge.receiveShadow = true;
    g.add(this.ledge);

    const sGeo = new THREE.ConeGeometry(0.18, 2.0, 4);
    const sMat = new THREE.MeshStandardMaterial({ color: 0x0d0d1d, roughness: 0.35, metalness: 0.5 });
    for (let cx = -1; cx <= 1; cx += 2) {
      for (let cz = -1; cz <= 1; cz += 2) {
        const sp = new THREE.Mesh(sGeo, sMat);
        sp.position.set(cx * 1.6, shaftH + 2.1, cz * 1.6);
        sp.castShadow = true;
        g.add(sp);
      }
    }

    this.rooftopGroup = g;
    this.group.add(g);
  }

  _createFigure() {
    const fig = new THREE.Group();
    const ledgeTop = (this.ledge ? this.ledge.position.y : 45.35) + 0.125;

    const suit = new THREE.MeshStandardMaterial({ color: 0x1a1a30, roughness: 0.3, metalness: 0.25 });
    const cowl = new THREE.MeshStandardMaterial({ color: 0x0c0c18, roughness: 0.15, metalness: 0.35 });
    const capeM = new THREE.MeshStandardMaterial({ color: 0x080812, roughness: 0.4, metalness: 0.05, side: THREE.DoubleSide });
    const gold = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.12, metalness: 0.95, emissive: 0xFFD700, emissiveIntensity: 0.6 });

    // CAPE — wide scalloped bat-wing shape
    const cw = 3.8, ch = 7.0;
    const capeShape = new THREE.Shape();
    capeShape.moveTo(0, 0);
    capeShape.quadraticCurveTo(-0.15, ch * 0.1, -0.1, ch * 0.2);
    capeShape.quadraticCurveTo(-cw * 0.55, ch * 0.55, -cw, ch * 0.7);
    capeShape.quadraticCurveTo(-cw * 0.9, ch * 0.85, -cw * 0.75, ch);
    capeShape.quadraticCurveTo(-cw * 0.4, ch * 0.75, -0.1, ch * 0.7);
    capeShape.lineTo(0, ch * 0.65);
    capeShape.lineTo(0.1, ch * 0.7);
    capeShape.quadraticCurveTo(cw * 0.4, ch * 0.75, cw * 0.75, ch);
    capeShape.quadraticCurveTo(cw * 0.9, ch * 0.85, cw, ch * 0.7);
    capeShape.quadraticCurveTo(cw * 0.55, ch * 0.55, 0.1, ch * 0.2);
    capeShape.quadraticCurveTo(0.15, ch * 0.1, 0, 0);

    const capeGeo = new THREE.ExtrudeGeometry(capeShape, { steps: 1, depth: 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
    capeGeo.translate(0, -ch * 0.82, -0.04);
    const cape = new THREE.Mesh(capeGeo, capeM);
    cape.position.set(0, 0.2, 0.18);
    cape.rotation.x = -0.05;
    cape.castShadow = true;
    fig.add(cape);

    // Shoulder drapes
    for (let s = -1; s <= 1; s += 2) {
      const dShape = new THREE.Shape();
      dShape.moveTo(0, 0);
      dShape.quadraticCurveTo(s * 0.6, -0.1, s * 1.4, 0.8);
      dShape.quadraticCurveTo(s * 1.5, 1.6, s * 0.8, 3.2);
      dShape.quadraticCurveTo(s * 0.3, 3.8, 0, 3.0);
      dShape.lineTo(0, 0);
      const dGeo = new THREE.ExtrudeGeometry(dShape, { steps: 1, depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 });
      dGeo.translate(0, -1.2, -0.02);
      const d = new THREE.Mesh(dGeo, capeM);
      d.position.set(s * 0.55, -0.5, -0.1);
      d.rotation.z = s * 0.5;
      d.rotation.y = s * 0.2;
      d.renderOrder = -1;
      fig.add(d);
    }

    // LEGS
    for (let s = -1; s <= 1; s += 2) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 3.2, 8), suit);
      leg.position.set(s * 0.4, -2.0, 0);
      leg.castShadow = true;
      fig.add(leg);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.95), cowl);
      boot.position.set(s * 0.4, -3.7, 0.05);
      boot.castShadow = true;
      fig.add(boot);
    }

    // TORSO
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 2.5, 10), suit);
    torso.position.y = 1.0;
    torso.castShadow = true;
    fig.add(torso);

    // Chest plate
    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.4, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x1c1c38, roughness: 0.2, metalness: 0.55 }),
    );
    chest.position.set(0, 1.2, 0.42);
    fig.add(chest);

    // Bat emblem on chest
    const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 0.06, 16), gold);
    emblem.position.set(0, 1.35, 0.62);
    emblem.rotation.x = Math.PI / 2;
    fig.add(emblem);

    // Belt
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.1, 8, 20), gold);
    belt.position.y = 0.0;
    belt.rotation.x = Math.PI / 2;
    fig.add(belt);

    // Belt pouches
    for (let s = -1; s <= 1; s += 2) {
      for (let f = -1; f <= 1; f += 2) {
        const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.2), gold);
        const angle = (s * 70 + f * 20) * Math.PI / 180;
        pouch.position.set(Math.sin(angle) * 0.65, -0.15, Math.cos(angle) * 0.65);
        pouch.rotation.y = angle + Math.PI / 2;
        fig.add(pouch);
      }
    }

    // ARMS
    for (let s = -1; s <= 1; s += 2) {
      const ua = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.7, 8), suit);
      ua.position.set(s * 0.95, 1.4, 0);
      ua.rotation.z = s * 0.55;
      ua.castShadow = true;
      fig.add(ua);

      const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.65, 8), cowl);
      fa.position.set(s * 1.25, 0.05, 0);
      fa.rotation.z = s * 0.35;
      fa.castShadow = true;
      fig.add(fa);

      for (let sp = 0; sp < 3; sp++) {
        const spk = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.45, 4), cowl);
        spk.position.set(s * (1.3 + sp * 0.12), -0.55 + sp * 0.1, 0);
        spk.rotation.z = s * 1.0;
        fig.add(spk);
      }
    }

    // HEAD & COWL
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), cowl);
    head.position.y = 2.6;
    fig.add(head);

    for (let s = -1; s <= 1; s += 2) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.85, 6), cowl);
      ear.position.set(s * 0.19, 3.1, 0.01);
      ear.rotation.z = s * 0.25;
      fig.add(ear);
    }

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.35, 8), cowl);
    neck.position.y = 2.12;
    fig.add(neck);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xEEEEEE });
    for (let s = -1; s <= 1; s += 2) {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.04), eyeMat);
      eye.position.set(s * 0.14, 2.65, 0.41);
      fig.add(eye);
    }

    // Position figure: boots on ledge
    fig.position.y = ledgeTop + 4.05;

    this.figureGroup = fig;
    this.group.add(fig);
  }

  _createLighting() {
    this.rimLight = new THREE.PointLight(0x8899CC, 8, 20);
    this.rimLight.position.set(-3, 48, -5);
    this.group.add(this.rimLight);

    this.fillLight = new THREE.PointLight(0x998866, 2.5, 10);
    this.fillLight.position.set(4, 47, 2);
    this.group.add(this.fillLight);

    this.upLight = new THREE.PointLight(0xFFB366, 2.0, 8);
    this.upLight.position.set(0, 44.5, 0);
    this.group.add(this.upLight);
  }

  update(delta) {
    this.time += delta;
    const t = this.time;

    this._opacity += (this._opacityTarget - this._opacity) * Math.min(3 * delta, 1);

    const breathe = Math.sin(t * 0.7) * 0.05;
    const sway = Math.sin(t * 0.45) * 0.02;

    if (this.figureGroup) {
      this.figureGroup.position.y = 49.3 + breathe;
      this.figureGroup.rotation.y = sway;
      if (this.figureGroup.children.length > 0) {
        this.figureGroup.children[0].rotation.x = -0.05 + Math.sin(t * 0.6) * 0.02;
      }
    }

    if (this.rimLight) this.rimLight.intensity = 8 + Math.sin(t * 1.3) * 1.5;
    if (this.fillLight) this.fillLight.intensity = 2.5 + Math.sin(t * 0.9 + 1) * 0.4;

    // Only traverse when opacity changed
    if (this.figureGroup && Math.abs(this._opacity - this._lastOpacity) > 0.001) {
      this._lastOpacity = this._opacity;
      this.figureGroup.traverse((child) => {
        if (child.material && !child.isLight) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => {
            m.transparent = true;
            m.opacity = this._opacity;
            m.depthWrite = this._opacity > 0.5;
          });
        }
      });
    }
  }

  setVisibility(visible) {
    this._opacityTarget = visible ? 1 : 0;
  }
}
