import '../styles/reset.css';
import '../styles/base.css';
import '../styles/ui-overlay.css';
import '../styles/loading.css';
import '@fontsource/cinzel/700.css';

import { App } from './app.js';

async function start() {
  try {
    // Race: fonts ready or 3s timeout (font failure shouldn't block the app)
    await Promise.race([
      document.fonts.ready,
      new Promise(r => setTimeout(r, 3000)),
    ]);

    const app = new App();
    await app.init();
  } catch (err) {
    console.error('[Gotham] Fatal startup error:', err);
    // Show error on screen so user knows something went wrong
    const el = document.getElementById('loading-screen');
    if (el) {
      el.innerHTML = '<div style="color:#FFD700;font-family:sans-serif;text-align:center;padding:2rem;"><h2>Something went wrong</h2><p style="color:#C0C0C0;font-size:0.9rem;">Try refreshing the page</p></div>';
    }
    throw err;
  }
}

start();
