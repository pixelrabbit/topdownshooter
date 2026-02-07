import { Graphics } from "pixi.js";
import { Character } from "./character";
import type { Obstacle } from "./buildings";

export class Bullet extends Graphics {
  public velocity = { x: 0, y: 0 };
  private speed = 10;

  constructor(x: number, y: number, angle: number, color: number) {
    super();
    this.circle(0, 0, 8).fill({ color: color });
    this.x = x;
    this.y = y;
    this.velocity.x = Math.cos(angle) * this.speed;
    this.velocity.y = Math.sin(angle) * this.speed;
  }

  public update(dt: number) {
    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;
  }

  public isOutOfBounds(width: number, height: number): boolean {
    return this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50;
  }

  public isCollidingWithCharacter(character: Character): boolean {
    const bulletBounds = this.getBounds().rectangle;
    const characterBounds = character.getHitbox();

    return (
      bulletBounds.x < characterBounds.x + characterBounds.width &&
      bulletBounds.x + bulletBounds.width > characterBounds.x &&
      bulletBounds.y < characterBounds.y + characterBounds.height &&
      bulletBounds.y + bulletBounds.height > characterBounds.y
    );
  }

  public isColliding(obstacles: Obstacle[]): boolean {
    const bulletBounds = this.getBounds().rectangle;
    for (const obstacle of obstacles) {
      const obstacleBounds = obstacle.getBounds().rectangle;
      if (
        bulletBounds.x < obstacleBounds.x + obstacleBounds.width &&
        bulletBounds.x + bulletBounds.width > obstacleBounds.x &&
        bulletBounds.y < obstacleBounds.y + obstacleBounds.height &&
        bulletBounds.y + bulletBounds.height > obstacleBounds.y
      ) {
        return true;
      }
    }
    return false;
  }
}
