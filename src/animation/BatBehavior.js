import { BATS } from '../utils/Constants.js';
import { clamp, noise3D } from '../utils/MathHelpers.js';

/**
 * Simplified Boids flocking algorithm for bat swarm behavior.
 */
export class BatBehavior {
  constructor(count) {
    this.count = count;

    // Position and velocity arrays (flat Float32)
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);

    // Swarm leader position (wanders around)
    this.leader = { x: 5, y: 25, z: -10 };
    this.leaderVelocity = { x: 0, y: 0, z: 0 };

    // Repulsion sources (e.g., mouse cursor position)
    this.repulsionPoints = [];

    // Initialize bats in a cluster near the Bat-Signal
    for (let i = 0; i < count; i++) {
      this.positions[i * 3] = 5 + (Math.random() - 0.5) * 10;
      this.positions[i * 3 + 1] = 20 + (Math.random() - 0.5) * 15;
      this.positions[i * 3 + 2] = -10 + (Math.random() - 0.5) * 10;

      this.velocities[i * 3] = (Math.random() - 0.5) * 3;
      this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 2;
      this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
  }

  /**
   * Add a repulsion point (e.g., from mouse hover).
   */
  addRepulsion(x, y, z, radius = 8) {
    this.repulsionPoints.push({ x, y, z, radius, life: 1.0 });
  }

  /**
   * Main update — runs the boid simulation for one timestep.
   */
  update(delta) {
    const dt = Math.min(delta, 0.05); // Cap to prevent explosions
    const count = this.count;

    // ── Update leader ──
    this._updateLeader(dt);

    // ── Update boids ──
    for (let i = 0; i < count; i++) {
      const px = this.positions[i * 3];
      const py = this.positions[i * 3 + 1];
      const pz = this.positions[i * 3 + 2];

      // Compute flocking forces
      let fx = 0, fy = 0, fz = 0;
      let neighborCount = 0;

      // Cohesion + Separation + Alignment
      let cx = 0, cy = 0, cz = 0; // center of neighbors
      let sx = 0, sy = 0, sz = 0; // separation
      let ax = 0, ay = 0, az = 0; // avg velocity

      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        const dx = px - this.positions[j * 3];
        const dy = py - this.positions[j * 3 + 1];
        const dz = pz - this.positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < BATS.separationDistance * 4) {
          cx += this.positions[j * 3];
          cy += this.positions[j * 3 + 1];
          cz += this.positions[j * 3 + 2];

          ax += this.velocities[j * 3];
          ay += this.velocities[j * 3 + 1];
          az += this.velocities[j * 3 + 2];

          neighborCount++;

          // Separation (avoid nearby bats)
          if (dist < BATS.separationDistance && dist > 0.001) {
            const force = (BATS.separationDistance - dist) / BATS.separationDistance;
            sx += (dx / dist) * force;
            sy += (dy / dist) * force;
            sz += (dz / dist) * force;
          }
        }
      }

      if (neighborCount > 0) {
        cx /= neighborCount;
        cy /= neighborCount;
        cz /= neighborCount;

        ax /= neighborCount;
        ay /= neighborCount;
        az /= neighborCount;

        // Cohesion: steer toward center of neighbors
        fx += (cx - px) * BATS.cohesionWeight;
        fy += (cy - py) * BATS.cohesionWeight;
        fz += (cz - pz) * BATS.cohesionWeight;

        // Alignment: match neighbors' velocity
        fx += (ax - this.velocities[i * 3]) * BATS.alignmentWeight;
        fy += (ay - this.velocities[i * 3 + 1]) * BATS.alignmentWeight;
        fz += (az - this.velocities[i * 3 + 2]) * BATS.alignmentWeight;
      }

      // Separation
      fx += sx * BATS.separationWeight;
      fy += sy * BATS.separationWeight;
      fz += sz * BATS.separationWeight;

      // Target attraction (toward leader)
      fx += (this.leader.x - px) * BATS.targetWeight;
      fy += (this.leader.y - py) * BATS.targetWeight;
      fz += (this.leader.z - pz) * BATS.targetWeight;

      // ── Repulsion from mouse / other sources ──
      for (const rp of this.repulsionPoints) {
        const dx = px - rp.x;
        const dy = py - rp.y;
        const dz = pz - rp.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < rp.radius && dist > 0.01) {
          const force = (rp.radius - dist) / rp.radius * 5;
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
          fz += (dz / dist) * force;
        }
      }

      // ── Random noise for organic movement ──
      fx += noise3D(px * 0.5, py * 0.5 + 0.5, pz * 0.5) * 0.5;
      fy += noise3D(px * 0.5 + 1, py * 0.5, pz * 0.5 + 2) * 0.3;
      fz += noise3D(px * 0.5 + 2, py * 0.5 + 1, pz * 0.5) * 0.5;

      // ── Update velocity ──
      this.velocities[i * 3] += fx * dt;
      this.velocities[i * 3 + 1] += fy * dt;
      this.velocities[i * 3 + 2] += fz * dt;

      // Speed limit
      const speed = Math.sqrt(
        this.velocities[i * 3] ** 2 +
        this.velocities[i * 3 + 1] ** 2 +
        this.velocities[i * 3 + 2] ** 2,
      );
      if (speed > BATS.maxSpeed) {
        const scale = BATS.maxSpeed / speed;
        this.velocities[i * 3] *= scale;
        this.velocities[i * 3 + 1] *= scale;
        this.velocities[i * 3 + 2] *= scale;
      }

      // ── Update position ──
      this.positions[i * 3] += this.velocities[i * 3] * dt;
      this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * dt;
      this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * dt;
    }

    // ── Decay repulsion points ──
    this.repulsionPoints = this.repulsionPoints
      .map((rp) => ({ ...rp, life: rp.life - dt * 2 }))
      .filter((rp) => rp.life > 0);
  }

  _updateLeader(dt) {
    // Leader wanders with noise-driven movement
    const speed = 2;
    this.leaderVelocity.x += noise3D(this.leader.x * 0.1, 0, 0) * 0.5;
    this.leaderVelocity.y += noise3D(0, this.leader.y * 0.1, 0) * 0.3;
    this.leaderVelocity.z += noise3D(0, 0, this.leader.z * 0.1) * 0.5;

    // Dampen
    this.leaderVelocity.x *= 0.95;
    this.leaderVelocity.y *= 0.95;
    this.leaderVelocity.z *= 0.95;

    // Speed limit
    const ls = Math.sqrt(
      this.leaderVelocity.x ** 2 + this.leaderVelocity.y ** 2 + this.leaderVelocity.z ** 2,
    );
    if (ls > speed) {
      const s = speed / ls;
      this.leaderVelocity.x *= s;
      this.leaderVelocity.y *= s;
      this.leaderVelocity.z *= s;
    }

    this.leader.x += this.leaderVelocity.x * dt;
    this.leader.y += this.leaderVelocity.y * dt;
    this.leader.z += this.leaderVelocity.z * dt;

    // Keep leader in bounds
    this.leader.x = clamp(this.leader.x, -30, 30);
    this.leader.y = clamp(this.leader.y, 5, 60);
    this.leader.z = clamp(this.leader.z, -60, 20);
  }

  /**
   * Move the leader to a specific position (for scroll-driven behavior).
   */
  setLeaderTarget(x, y, z) {
    this.leader.x += (x - this.leader.x) * 0.02;
    this.leader.y += (y - this.leader.y) * 0.02;
    this.leader.z += (z - this.leader.z) * 0.02;
  }
}
