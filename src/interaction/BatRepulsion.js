import * as THREE from 'three';

/**
 * Detects cursor proximity to bats and applies repulsion force.
 */
export class BatRepulsion {
  constructor(app) {
    this.app = app;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.worldPos = new THREE.Vector3();
    this.isActive = false;

    this._setup();
  }

  _setup() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.isActive = true;
    });

    window.addEventListener('mouseleave', () => {
      this.isActive = false;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
      this.mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      this.isActive = true;
    });

    window.addEventListener('touchend', () => {
      this.isActive = false;
    });
  }

  update(delta) {
    if (!this.isActive || !this.app.bats) return;

    // Cast ray into the scene to find world-space cursor position
    const camera = this.app.getCamera();
    this.raycaster.setFromCamera(this.mouse, camera);

    // Use a plane at the average bat height
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -15);
    this.raycaster.ray.intersectPlane(plane, this.worldPos);

    if (this.worldPos) {
      this.app.bats.repelFrom(this.worldPos.x, this.worldPos.y, this.worldPos.z, 10);
    }
  }
}
