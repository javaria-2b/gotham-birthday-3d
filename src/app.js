import { SceneManager } from './scene/SceneManager.js';
import { Lighting } from './scene/Lighting.js';
import { FogManager } from './scene/Fog.js';
import { Skyline } from './objects/Skyline.js';
import { BatSignal } from './objects/BatSignal.js';
import { GodRays } from './effects/GodRays.js';
import { Rain } from './objects/Rain.js';
import { Moon } from './objects/Moon.js';
import { Bats } from './objects/Bats.js';
import { BatmanFigure } from './objects/BatmanFigure.js';
import { BirthdayParticles } from './objects/BirthdayParticles.js';
import { ScrollController } from './animation/ScrollController.js';
import { TouchGestures } from './interaction/TouchGestures.js';
import { MouseParallax } from './interaction/MouseParallax.js';
import { GyroParallax } from './interaction/GyroParallax.js';
import { BatRepulsion } from './interaction/BatRepulsion.js';
import { EasterEggs } from './interaction/EasterEggs.js';
import { UIManager } from './ui/UIManager.js';
import { detectDeviceTier, getTierConfig } from './utils/DeviceTier.js';
import { TIMING, BAT_SIGNAL } from './utils/Constants.js';

export class App {
  constructor() {
    this.isRunning = false;
    this.isLoading = true;
    this.animFrameId = null;
    this._lastFrameTime = performance.now();
    this._fpsFrames = 0;
    this._fpsTime = 0;
    this._isPageVisible = true;
  }

  async init() {
    this.tier = detectDeviceTier();
    this.tierConfig = getTierConfig(this.tier);
    console.log(`[Gotham] Device: ${this.tier}`, this.tierConfig);

    const container = document.getElementById('canvas-container');
    this.sceneManager = new SceneManager(container);
    const { scene, camera, renderer } = this.sceneManager;

    // 3D modules
    this.lighting = new Lighting(scene);
    this.fogManager = new FogManager(scene);
    this.skyline = new Skyline(scene, this.tierConfig);
    this.batSignal = new BatSignal(scene);
    this.godRays = new GodRays(scene, BAT_SIGNAL.searchlightPosition);
    this.rain = new Rain(scene, this.tierConfig);
    this.moon = new Moon(scene, this.tierConfig);
    this.bats = new Bats(scene, this.tierConfig);
    this.batmanFigure = new BatmanFigure(scene);
    this.birthdayParticles = new BirthdayParticles(scene);

    this._initPostProcessing(scene, camera, renderer);

    // Interaction
    this.scrollController = new ScrollController(this);
    this.touchGestures = new TouchGestures(this.scrollController);
    this.mouseParallax = new MouseParallax(this);
    this.gyroParallax = new GyroParallax(this);
    this.batRepulsion = new BatRepulsion(this);
    this.easterEggs = new EasterEggs(this);

    // UI
    this.uiManager = new UIManager(this.scrollController);

    // Resize → post-processing
    this.sceneManager.onResize((w, h) => {
      if (this.postProcessing && this.postProcessing.isReady) this.postProcessing.resize(w, h);
    });

    // Page visibility — pause when tab hidden
    this._setupVisibility();

    // FPS monitor (log every 5s)
    this._fpsInterval = setInterval(() => this._reportFPS(), 5000);

    await this._handleLoading();
    this._startLoop();
  }

  async _initPostProcessing(scene, camera, renderer) {
    try {
      const { PostProcessing } = await import('./effects/PostProcessing.js');
      this.postProcessing = new PostProcessing(scene, camera, renderer);
    } catch (err) {
      console.warn('[Gotham] Post-processing skipped:', err.message);
    }
  }

  _setupVisibility() {
    document.addEventListener('visibilitychange', () => {
      this._isPageVisible = !document.hidden;
    });
  }

  async _handleLoading() {
    const el = document.getElementById('loading-screen');
    const bar = document.querySelector('.loader-bar-fill');
    const t0 = performance.now();

    const anim = () => {
      const p = Math.min((performance.now() - t0) / TIMING.loadingMinDuration, 1);
      bar.style.width = `${(1 - Math.pow(1 - p, 3)) * 100}%`;
      if (p < 1) requestAnimationFrame(anim);
    };
    anim();

    await new Promise(r => setTimeout(r, TIMING.loadingMinDuration));
    el.classList.add('fade-out');
    await new Promise(r => setTimeout(r, 800));
    el.style.display = 'none';
    this.isLoading = false;
  }

  _startLoop() {
    this.isRunning = true;

    const loop = () => {
      if (!this.isRunning) return;
      this.animFrameId = requestAnimationFrame(loop);

      // Skip heavy work when page is hidden
      if (!this._isPageVisible) return;

      const delta = this.sceneManager.getDelta();
      const elapsed = this.sceneManager.getElapsed();

      this.fogManager.update(delta);
      this.batSignal.update(delta);
      this.godRays.update(elapsed);
      this.rain.update(delta);
      this.moon.update(delta);
      this.bats.update(delta);
      this.batmanFigure.update(delta);
      this.birthdayParticles.update(delta);

      this.scrollController.update(delta);
      this.mouseParallax.update(delta);
      this.gyroParallax.update(delta);
      this.batRepulsion.update(delta);
      this.uiManager.update(delta);

      if (this.postProcessing && this.postProcessing.isReady) {
        this.postProcessing.render(delta);
      } else {
        this.sceneManager.render();
      }

      this._countFPS();
    };

    loop();
  }

  _countFPS() {
    this._fpsFrames++;
  }

  _reportFPS() {
    const now = performance.now();
    const elapsed = (now - this._lastFrameTime) / 1000;
    const fps = Math.round(this._fpsFrames / elapsed);
    if (this.tier === 'low' && fps < 25) {
      console.warn(`[Gotham] Low FPS: ${fps}. Consider reducing quality.`);
    }
    this._fpsFrames = 0;
    this._lastFrameTime = now;
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this._fpsInterval) clearInterval(this._fpsInterval);
  }

  getScene() { return this.sceneManager.scene; }
  getCamera() { return this.sceneManager.camera; }
  getRenderer() { return this.sceneManager.renderer; }
  getTierConfig() { return this.tierConfig; }
}
