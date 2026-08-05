# 🦇 Gotham 3D

An immersive Batman-themed 3D interactive website. Procedurally generated Gotham City skyline with Bat-Signal, flying bats, rain, and cinematic scroll-driven camera movement.

**Built for fun. Designed for sharing.**

## Quick Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- **Three.js** — 3D rendering engine
- **GSAP + Custom Scroll Controller** — Cinematic scroll-driven animations
- **pmndrs postprocessing** — Bloom, vignette, and tone mapping effects
- **Vite** — Dev server and bundler
- **Vanilla JS** — No framework, just ES modules

## Features

- 🏙️ Procedural Gotham skyline with gothic spires and glowing windows
- 🔦 Bat-Signal with volumetric god rays
- 🦇 Living bat swarm with boid flocking behavior
- 🌧️ Dynamic rain with wind drift
- 🌙 Moon and starfield
- 🌫️ Atmospheric fog and ground mist
- 🖱️ Mouse parallax and bat repulsion
- 📱 Mobile gyroscope support
- 🎮 Easter eggs (Konami code, triple-tap secrets)
- 📤 Social sharing via Web Share API

## Project Structure

```
src/
├── main.js              # Entry point
├── app.js               # Orchestrator
├── scene/               # Three.js scene, camera, lighting, fog
├── objects/             # 3D objects (skyline, bat signal, bats, rain, moon)
├── effects/             # Post-processing, god rays
├── animation/           # Scroll controller, camera path, bat behavior
├── interaction/         # Mouse, touch, gyroscope, easter eggs
├── ui/                  # DOM overlay (titles, navigation, CTA)
├── utils/               # Constants, math helpers, device detection, textures
styles/                  # CSS
```

## Browser Support

All modern browsers with WebGL support. Best experienced on desktop with a mouse, but fully functional on mobile devices.

## Credits

Built with [Claude Code](https://claude.ai/code) — a Batman-themed 3D experience.
