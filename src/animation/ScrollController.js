import * as THREE from 'three';
import { CAMERA_KEYFRAMES, STAGE_PARAMS } from './CameraPath.js';
import { STAGES } from '../utils/Constants.js';
import { lerp, smoothstep } from '../utils/MathHelpers.js';

/**
 * 5-stage scroll controller with Bat-Signal ignition flash.
 */
export class ScrollController {
  constructor(app) {
    this.app = app;
    this.progress = 0;
    this.currentStage = 0;
    this.targetProgress = 0;
    this._stageCallbacks = {};
    this._flashActive = false;
    this._flashStart = 0;

    this._currentPos = CAMERA_KEYFRAMES[0].position.clone();
    this._currentLook = CAMERA_KEYFRAMES[0].lookAt.clone();
    this._currentFov = CAMERA_KEYFRAMES[0].fov;

    this._setupScroll();
  }

  _setupScroll() {
    this._createScrollPhantom();
    window.addEventListener('wheel', (e) => { e.preventDefault(); const m = this._phantom.scrollHeight - this._phantom.clientHeight; this._setProgress(Math.max(0, Math.min(1, this.progress + e.deltaY / m))); }, { passive: false });
    window.addEventListener('touchstart', (e) => { this._tsY = e.touches[0].clientY; this._tsP = this.progress; }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (this._tsY == null) return; e.preventDefault(); const dy = this._tsY - e.touches[0].clientY; this._setProgress(Math.max(0, Math.min(1, this._tsP + dy / (window.innerHeight * 0.7)))); }, { passive: false });
    window.addEventListener('touchend', () => { this._tsY = null; });
    window.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); this._setProgress(Math.min(1, this.progress + 0.05)); } if (e.key === 'ArrowUp') { e.preventDefault(); this._setProgress(Math.max(0, this.progress - 0.05)); } });
  }

  _createScrollPhantom() {
    const p = document.createElement('div');
    p.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;overflow-y:scroll;pointer-events:auto;z-index:0;-webkit-overflow-scrolling:touch;';
    const inner = document.createElement('div');
    inner.style.height = '300vh';
    p.appendChild(inner);
    document.body.appendChild(p);
    p.addEventListener('scroll', () => { const max = p.scrollHeight - p.clientHeight; if (max > 0) this._setProgress(p.scrollTop / max); });
    this._phantom = p;
  }

  _setProgress(p) {
    this.targetProgress = p;
    const prev = this.currentStage;
    if (p < STAGES.BIRTHDAY.end) this.currentStage = 0;
    else if (p < STAGES.HERO.end) this.currentStage = 1;
    else if (p < STAGES.REVEAL.end) this.currentStage = 2;
    else if (p < STAGES.DIVE.end) this.currentStage = 3;
    else this.currentStage = 4;

    // 🎆 SIGNAL IGNITION: transition from birthday (0) → signal (1)
    if (prev === 0 && this.currentStage === 1) {
      this._triggerSignalIgnition();
    }

    if (this.currentStage !== prev && this._stageCallbacks.change) {
      this._stageCallbacks.change(this.currentStage);
    }
  }

  /** Dramatic bloom burst when the Bat-Signal ignites */
  _triggerSignalIgnition() {
    this._flashActive = true;
    this._flashStart = performance.now() / 1000;

    // Quick bloom spike — post-processing handles the visual
    // Also ping the skyline windows
    if (this.app.skyline && this.app.skyline.pulseWindows) {
      this.app.skyline.pulseWindows(2.5, 1.5);
    }

    // Camera micro-shake
    this._shakeTime = 0.5;
    this._shakeIntensity = 1.5;
  }

  update(delta) {
    const now = performance.now() / 1000;
    this.progress += (this.targetProgress - this.progress) * Math.min(4 * delta, 1);
    const p = this.progress;

    // ── Signal ignition flash ──
    let flashBoost = 1;
    if (this._flashActive) {
      const elapsed = now - this._flashStart;
      if (elapsed > 1.5) { this._flashActive = false; }
      else {
        // Sharp attack, exponential decay
        flashBoost = 1 + Math.exp(-elapsed * 4) * 3.5;
      }
    }

    // ── Camera shake ──
    let shakeX = 0, shakeY = 0;
    if (this._shakeTime > 0) {
      this._shakeTime -= delta;
      const s = this._shakeIntensity * (this._shakeTime / 0.5);
      shakeX = (Math.random() - 0.5) * s;
      shakeY = (Math.random() - 0.5) * s;
    }

    const stageCount = 5;
    const sp = p * (stageCount - 1);
    const idx = Math.min(Math.floor(sp), stageCount - 2);
    const t = sp - idx;
    const et = smoothstep(0, 1, t);
    const k0 = CAMERA_KEYFRAMES[idx], k1 = CAMERA_KEYFRAMES[idx + 1];
    const s0 = STAGE_PARAMS[idx], s1 = STAGE_PARAMS[idx + 1];

    // Camera
    const tp = new THREE.Vector3().lerpVectors(k0.position, k1.position, et);
    const tl = new THREE.Vector3().lerpVectors(k0.lookAt, k1.lookAt, et);
    const tf = lerp(k0.fov, k1.fov, et);
    const sm = 3;
    this._currentPos.lerp(tp, Math.min(sm * delta, 1));
    this._currentLook.lerp(tl, Math.min(sm * delta, 1));
    this._currentFov += (tf - this._currentFov) * Math.min(sm * delta, 1);

    const cam = this.app.getCamera();
    cam.position.copy(this._currentPos);
    cam.position.x += shakeX;
    cam.position.y += shakeY;
    this.app.sceneManager.defaultLookTarget.copy(this._currentLook);
    cam.fov = this._currentFov;
    cam.updateProjectionMatrix();

    // Scene params
    const le = lerp;
    if (this.app.fogManager) this.app.fogManager.setDensity(le(s0.fogDensity, s1.fogDensity, et));
    if (this.app.rain) this.app.rain.setIntensity(le(s0.rainIntensity, s1.rainIntensity, et));
    if (this.app.batSignal) this.app.batSignal.setIntensity(le(s0.batSignalIntensity, s1.batSignalIntensity, et) * flashBoost);
    if (this.app.lighting) this.app.lighting.setAmbientIntensity(le(s0.ambientIntensity, s1.ambientIntensity, et));
    if (this.app.bats) this.app.bats.setTarget(le(s0.batTarget.x, s1.batTarget.x, et), le(s0.batTarget.y, s1.batTarget.y, et), le(s0.batTarget.z, s1.batTarget.z, et));
    if (this.app.postProcessing) {
      this.app.postProcessing.setBloomIntensity(le(s0.bloomIntensity, s1.bloomIntensity, et) * flashBoost);
      this.app.postProcessing.setVignetteDarkness(le(s0.vignetteDarkness, s1.vignetteDarkness, et));
    }
    if (this.app.godRays) this.app.godRays.setIntensity(le(s0.batSignalIntensity, s1.batSignalIntensity, et) * flashBoost);
    if (this.app.birthdayParticles) this.app.birthdayParticles.setIntensity(le(s0.birthdayParticles, s1.birthdayParticles, et));

    // Batman smooth dissolve
    const bVis = et < 0.5 ? s0.batmanVisible : s1.batmanVisible;
    if (this.app.batmanFigure) this.app.batmanFigure.setVisibility(bVis);
  }

  onStageChange(fn) { this._stageCallbacks.change = fn; }

  goToStage(i) { const pos = [0, 0.18, 0.36, 0.58, 0.78]; this._setProgress(pos[Math.min(i, 4)]); }

  getProgress() { return this.progress; }
  getStage() { return this.currentStage; }
}
