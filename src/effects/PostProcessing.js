/**
 * Post-processing pipeline using the pmndrs postprocessing library.
 * Dynamically imported — the scene works without it if the import fails.
 */
export class PostProcessing {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.composer = null;
    this.isReady = false;
    this.enabled = false;
    this.bloomEffect = null;
    this.vignetteEffect = null;

    this._init();
  }

  async _init() {
    try {
      const post = await import('postprocessing');

      this.composer = new post.EffectComposer(this.renderer);
      this.composer.addPass(new post.RenderPass(this.scene, this.camera));

      // Bloom
      this.bloomEffect = new post.BloomEffect({
        blendFunction: post.BlendFunction.SCREEN,
        kernelSize: post.KernelSize.LARGE,
        intensity: 0.4,
        luminanceThreshold: 0.6,
        luminanceSmoothing: 0.2,
      });

      // Vignette
      this.vignetteEffect = new post.VignetteEffect({
        blendFunction: post.BlendFunction.NORMAL,
        darkness: 0.55,
        offset: 0.35,
      });

      const effectPass = new post.EffectPass(this.camera, this.bloomEffect, this.vignetteEffect);
      this.composer.addPass(effectPass);

      this.isReady = true;
      this.enabled = true;
      console.log('[Gotham] Post-processing pipeline ready');
    } catch (err) {
      console.warn('[Gotham] Post-processing unavailable:', err.message);
      this.isReady = false;
    }
  }

  render(delta) {
    if (this.isReady && this.composer) {
      this.composer.render(delta);
    }
  }

  setBloomIntensity(val) {
    if (this.bloomEffect) this.bloomEffect.intensity = val;
  }

  setVignetteDarkness(val) {
    if (this.vignetteEffect) this.vignetteEffect.darkness = val;
  }

  resize(width, height) {
    if (this.composer) this.composer.setSize(width, height);
  }
}
