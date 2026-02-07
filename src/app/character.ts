import { Container, Graphics, Sprite, Texture, Rectangle } from "pixi.js";
import { Bullet } from "./bullet";
import type { Obstacle } from "./buildings";

export abstract class Character extends Container {
  protected speed: number;
  protected sprite: Sprite;
  public bullets: Bullet[] = [];
  protected lastFired = 0;
  protected fireRate: number;
  public health: number;
  public maxHealth: number;

  constructor(texture: Texture, speed: number, fireRate: number, hitboxColor: number, health: number) {
    super();
    this.speed = speed;
    this.fireRate = fireRate;
    this.health = health;
    this.maxHealth = health;

    const hitbox = new Graphics();
    hitbox
      .rect(-texture.width / 2, -texture.height / 2, texture.width, texture.height)
      .stroke({ width: 4, color: hitboxColor });
    this.addChild(hitbox);

    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.addChild(this.sprite);
  }

  public getHitbox(): Rectangle {
    return this.sprite.getBounds().rectangle;
  }

  public isCollidingWithObstacles(obstacles: Obstacle[]): boolean {
    const bounds = this.getHitbox();
    for (const obstacle of obstacles) {
      const obstacleBounds = obstacle.getBounds().rectangle;

      if (
        bounds.x < obstacleBounds.x + obstacleBounds.width &&
        bounds.x + bounds.width > obstacleBounds.x &&
        bounds.y < obstacleBounds.y + obstacleBounds.height &&
        bounds.y + bounds.height > obstacleBounds.y
      ) {
        return true;
      }
    }
    return false;
  }

  public takeDamage(amount: number) {
    this.health -= amount;
  }

  public isDead(): boolean {
    return this.health <= 0;
  }
  protected keepInBounds(worldWidth: number, worldHeight: number) {
    const halfWidth = this.sprite.width / 2;
    const halfHeight = this.sprite.height / 2;
    this.x = Math.max(halfWidth, Math.min(worldWidth - halfWidth, this.x));
    this.y = Math.max(halfHeight, Math.min(worldHeight - halfHeight, this.y));
  }

  protected abstract fire(): void;
}
