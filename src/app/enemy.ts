import { Container, Graphics, Sprite, Texture, Ticker } from 'pixi.js';
import { Bullet } from './bullet';
import { Player } from './player';

export class Enemy extends Container {
  private speed = 2;
  private pursuitRadius = 600;
  private enemySprite: Sprite;
  private bullets: Bullet[] = [];
  private lastFired = 0;
  private fireRate = 1000; // Fire every 1 second

  constructor(texture: Texture, private player: Player) {
    super();

    const hitbox = new Graphics();
    hitbox.rect(-texture.width / 2, -texture.height / 2, texture.width, texture.height).stroke({ width: 4, color: 0xff0000 }); // Red for enemy
    this.addChild(hitbox);

    this.enemySprite = new Sprite(texture);
    this.enemySprite.anchor.set(0.5);
    this.addChild(this.enemySprite);
  }

  private fire() {
    // Fire towards the player
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const angle = Math.atan2(dy, dx);

    const bullet = new Bullet(this.x, this.y, angle);
    this.bullets.push(bullet);
    this.parent?.addChild(bullet);
  }

  public isColliding(obstacles: Graphics[]): boolean {
    const enemyBounds = this.enemySprite.getBounds();
    for (const obstacle of obstacles) {
      const obstacleBounds = obstacle.getBounds();

      if (enemyBounds.x < obstacleBounds.x + obstacleBounds.width &&
        enemyBounds.x + enemyBounds.width > obstacleBounds.x &&
        enemyBounds.y < obstacleBounds.y + obstacleBounds.height &&
        enemyBounds.y + enemyBounds.height > obstacleBounds.y) {
        return true;
      }
    }
    return false;
  }

  public update(ticker: Ticker, screenWidth: number, screenHeight: number, obstacles: Graphics[]) {
    const dt = ticker.deltaTime;
    const oldX = this.x;
    const oldY = this.y;

    // Simple AI: move towards the player
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only move if the player is within the pursuit radius
    if (distance > 0 && distance < this.pursuitRadius) { // Avoid division by zero
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      // Move on X axis
      this.x += normalizedDx * this.speed * dt;
      if (this.isColliding(obstacles)) {
        this.x = oldX;
      }

      // Move on Y axis
      this.y += normalizedDy * this.speed * dt;
      if (this.isColliding(obstacles)) {
        this.y = oldY;
      }
    }

    // Keep enemy within bounds
    const enemyWidth = this.enemySprite.width;
    const enemyHeight = this.enemySprite.height;
    this.x = Math.max(enemyWidth / 2, Math.min(screenWidth - enemyWidth / 2, this.x));
    this.y = Math.max(enemyHeight / 2, Math.min(screenHeight - enemyHeight / 2, this.y));

    // Firing logic
    if (distance > 50 && Date.now() - this.lastFired > this.fireRate) { // Don't fire if too close
      this.fire();
      this.lastFired = Date.now();
    }

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(dt);
      if (bullet.isOutOfBounds(screenWidth, screenHeight) || bullet.isColliding(obstacles)) {
        this.parent?.removeChild(bullet);
        this.bullets.splice(i, 1);
      }
    }
  }
}