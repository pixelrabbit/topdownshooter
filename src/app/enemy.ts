import { Graphics, Texture, Ticker } from "pixi.js";
import { Bullet } from "./bullet";
import { Player } from "./player";
import { Character } from "./character";
import { colors } from "./variables";
import type { Obstacle } from "./buildings";

export class Enemy extends Character {
  private pursuitRadius = 600;

  constructor(
    texture: Texture,
    private player: Player
  ) {
    super(texture, 2, 2000, 0xff0000, 2); // speed, fireRate, hitboxColor, health
  }

  protected fire() {
    // Fire towards the player
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const angle = Math.atan2(dy, dx);

    const bullet = new Bullet(this.x, this.y, angle, colors.red);
    this.bullets.push(bullet);
    this.parent?.addChild(bullet);
  }

  private isCollidingWithPlayer(): boolean {
    const enemyBounds = this.getHitbox();
    const playerBounds = this.player.getHitbox();

    return (
      enemyBounds.x < playerBounds.x + playerBounds.width &&
      enemyBounds.x + enemyBounds.width > playerBounds.x &&
      enemyBounds.y < playerBounds.y + playerBounds.height &&
      enemyBounds.y + enemyBounds.height > playerBounds.y
    );
  }

  public update(ticker: Ticker, worldWidth: number, worldHeight: number, obstacles: Obstacle[]) {
    // if (!this.player || this.player.isDead()) return; // Stop updating if player is dead

    const dt = ticker.deltaTime;
    const oldX = this.x;
    const oldY = this.y;

    // Simple AI: move towards the player
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only move if the player is within the pursuit radius
    if (distance > 0 && distance < this.pursuitRadius) {
      // Avoid division by zero
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      // Move on X axis
      this.x += normalizedDx * this.speed * dt;
      if (this.isCollidingWithObstacles(obstacles) || this.isCollidingWithPlayer()) {
        this.x = oldX;
      }

      // Move on Y axis
      this.y += normalizedDy * this.speed * dt;
      if (this.isCollidingWithObstacles(obstacles) || this.isCollidingWithPlayer()) {
        this.y = oldY;
      }
    }

    this.keepInBounds(worldWidth, worldHeight);

    // Firing logic
    if (distance > 50 && Date.now() - this.lastFired > this.fireRate) {
      // Don't fire if too close
      this.fire();
      this.lastFired = Date.now();
    }
  }
}
