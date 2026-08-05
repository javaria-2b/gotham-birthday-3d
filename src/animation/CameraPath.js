import * as THREE from 'three';

/**
 * 5 stages: Birthday → Signal Ignition → City → Hunt → Night
 * Camera faces Batman HEAD-ON in the birthday stage so the
 * wide scalloped cape silhouette reads clearly.
 */
export const CAMERA_KEYFRAMES = [
  {
    // Stage 0: Birthday — straight-on view of Batman, cape fully visible
    position: new THREE.Vector3(6, 29, 10),
    lookAt: new THREE.Vector3(6, 29, -8),
    fov: 38,
  },
  {
    // Stage 1: Bat-Signal IGNITES — camera pulls back, dramatic
    position: new THREE.Vector3(0, 10, 22),
    lookAt: new THREE.Vector3(5, 35, -10),
    fov: 55,
  },
  {
    // Stage 2: Gotham revealed
    position: new THREE.Vector3(0, 25, 35),
    lookAt: new THREE.Vector3(0, 0, -15),
    fov: 60,
  },
  {
    // Stage 3: Bat swarm dive
    position: new THREE.Vector3(10, 5, 5),
    lookAt: new THREE.Vector3(0, 15, -30),
    fov: 70,
  },
  {
    // Stage 4: Ascend
    position: new THREE.Vector3(-5, 55, 25),
    lookAt: new THREE.Vector3(0, 15, -20),
    fov: 65,
  },
];

export const STAGE_PARAMS = [
  {
    // Birthday — warm, celebratory, head-on view
    fogDensity: 0.22,
    rainIntensity: 0,
    batSignalIntensity: 0.03,
    ambientIntensity: 5.8,
    batTarget: { x: 6, y: 30, z: -8 },
    bloomIntensity: 0.3,
    vignetteDarkness: 0.32,
    batmanVisible: true,
    birthdayParticles: 1.0,
  },
  {
    // Signal IGNITION — dramatic burst, signal fires at full strength
    fogDensity: 1.4,
    rainIntensity: 0,
    batSignalIntensity: 1.2,
    ambientIntensity: 1.0,
    batTarget: { x: 5, y: 30, z: -10 },
    bloomIntensity: 0.8,
    vignetteDarkness: 0.6,
    batmanVisible: false,
    birthdayParticles: 0.2,
  },
  {
    // City reveal
    fogDensity: 0.8,
    rainIntensity: 0.4,
    batSignalIntensity: 0.8,
    ambientIntensity: 0.8,
    batTarget: { x: 0, y: 20, z: -20 },
    bloomIntensity: 0.4,
    vignetteDarkness: 0.5,
    batmanVisible: false,
    birthdayParticles: 0.0,
  },
  {
    // Bat dive
    fogDensity: 1.0,
    rainIntensity: 1.0,
    batSignalIntensity: 0.4,
    ambientIntensity: 0.6,
    batTarget: { x: 10, y: 10, z: -20 },
    bloomIntensity: 0.3,
    vignetteDarkness: 0.7,
    batmanVisible: false,
    birthdayParticles: 0.0,
  },
  {
    // Ascend / finale
    fogDensity: 0.4,
    rainIntensity: 0.2,
    batSignalIntensity: 0.6,
    ambientIntensity: 1.2,
    batTarget: { x: 0, y: 50, z: -20 },
    bloomIntensity: 0.6,
    vignetteDarkness: 0.4,
    batmanVisible: false,
    birthdayParticles: 0.0,
  },
];
