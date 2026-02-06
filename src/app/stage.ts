import { Assets, Container, Ticker, Graphics, FederatedPointerEvent, Rectangle, TilingSprite } from 'pixi.js';
import { Player } from './player';
import { HUD, Minimap } from './hud';
import { Enemy } from './enemy';

interface ObstacleData {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class GameStage extends Container {
  private player!: Player;  //TODO: understand exclamation point
  private enemies: Enemy[] = [];
  private hud: HUD;
  private minimap: Minimap;
  private readonly screenWidth: number;
  private readonly screenHeight: number;
  private readonly worldWidth = 2400;
  private readonly worldHeight = 1600;
  private world: Container;

  constructor(screenWidth: number, screenHeight: number) {
    super();
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.world = new Container();

    this.addChild(this.world);

    this.hud = new HUD();
    this.addChild(this.hud);

    this.minimap = new Minimap(this.worldWidth, this.worldHeight, this.screenWidth, this.screenHeight);
    this.addChild(this.minimap);

    // Make stage interactive to capture mouse events across the whole screen
    this.eventMode = 'static';
    this.hitArea = new Rectangle(0, 0, screenWidth, screenHeight);
    this.on('pointermove', this.onPointerMove, this);
  }

  private onPointerMove(event: FederatedPointerEvent): void {
    if (this.player) {
      // Convert screen coordinates to world coordinates
      const worldPoint = this.world.toLocal(event.global);
      this.player.setMousePosition(worldPoint);
    }
  }

  public async setup(): Promise<void> {
    // Add repeating grass background
    const grassTexture = await Assets.load('assets/grass.jpg');
    const background = new TilingSprite({
      texture: grassTexture,
      width: this.worldWidth,
      height: this.worldHeight,
    });
    this.world.addChild(background);

    // // Add a background grid to the world
    // const grid = new Graphics();
    // grid.lineStyle(2, 0xcccccc, 0.5);
    // for (let i = 0; i < this.worldWidth; i += 100) {
    //   grid.moveTo(i, 0);
    //   grid.lineTo(i, this.worldHeight);
    // }
    // for (let i = 0; i < this.worldHeight; i += 100) {
    //   grid.moveTo(0, i);
    //   grid.lineTo(this.worldWidth, i);
    // }
    // this.world.addChild(grid);

    // Load the bunny player
    const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
    this.player = new Player(texture);

    // PLAYER
    this.player.x = this.worldWidth / 2;
    this.player.y = this.worldHeight / 2;
    this.world.addChild(this.player);

    const obstacleData = [
      { x: 200, y: 200, w: 100, h: 100 },
      { x: 800, y: 150, w: 50, h: 300 },
      { x: 500, y: 500, w: 200, h: 40 },
      { x: 900, y: 600, w: 120, h: 120 },
    ];
    this.createObstacles(obstacleData);

    this.minimap.setObstacles(this.obstacles);

    // ENEMIES
    const numEnemies = 1;
    for (let i = 0; i < numEnemies; i++) {
      const enemy = new Enemy(texture, this.player);

      // Find a valid spawn position
      do {
        enemy.x = Math.random() * this.worldWidth;
        enemy.y = Math.random() * this.worldHeight;
      } while (enemy.isCollidingWithObstacles(this.obstacles));

      this.enemies.push(enemy);
      this.world.addChild(enemy);
    }
  }

  // OBSTACLES
  private obstacles: Graphics[] = [];
  private createObstacles(obstacleData: ObstacleData[]): void {
    obstacleData.forEach((data: ObstacleData) => {
      const obstacle = new Graphics()
        .rect(0, 0, data.w, data.h)
        .stroke({ width: 4, color: 0x000000 })
      obstacle.x = data.x;
      obstacle.y = data.y;

      this.obstacles.push(obstacle);
      this.world.addChild(obstacle);
    });

  }



  private handleCollisions(dt: number): void {
    if (!this.player) return;

    // bullets vs enemy
    for (let i = this.player.bullets.length - 1; i >= 0; i--) {
      const bullet = this.player.bullets[i];
      bullet.update(dt);

      let hitEnemy = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (bullet.isCollidingWithCharacter(enemy)) {
          hitEnemy = true;
          enemy.takeDamage(1);
          if (enemy.isDead()) {
            this.removeChild(enemy);
            this.enemies.splice(j, 1);
          }
          break; // Bullet hits one enemy
        }
      }

      if (hitEnemy || bullet.isOutOfBounds(this.worldWidth, this.worldHeight) || bullet.isColliding(this.obstacles)) {
        this.world.removeChild(bullet);
        this.player.bullets.splice(i, 1);
      }
    }

    // bullets vs player
    for (const enemy of this.enemies) {
      for (let i = enemy.bullets.length - 1; i >= 0; i--) {
        const bullet = enemy.bullets[i];
        bullet.update(dt);

        let hitPlayer = false;
        if (this.player && !this.player.isDead() && bullet.isCollidingWithCharacter(this.player)) {
          hitPlayer = true;
          this.player.takeDamage(1);
          if (this.player.isDead()) {
            this.removeChild(this.player);
            this.player = null!;
            // TODO: game over
          }
        }

        if (hitPlayer || bullet.isOutOfBounds(this.worldWidth, this.worldHeight) || bullet.isColliding(this.obstacles)) {
          this.world.removeChild(bullet);
          enemy.bullets.splice(i, 1);
        }
      }
    }
  }

  public update(ticker: Ticker): void {
    this.player?.update(ticker, this.worldWidth, this.worldHeight, this.obstacles, this.enemies); // The '?' handles if player is null
    this.enemies.forEach(enemy => {
      enemy.update(ticker, this.worldWidth, this.worldHeight, this.obstacles);
    });

    this.handleCollisions(ticker.deltaTime);

    // Camera follow logic
    if (this.player) {
      this.world.x = this.screenWidth / 2 - this.player.x;
      this.world.y = this.screenHeight / 2 - this.player.y;

      // Clamp camera to world boundaries
      this.world.x = Math.max(Math.min(this.world.x, 0), this.screenWidth - this.worldWidth);
      this.world.y = Math.max(Math.min(this.world.y, 0), this.screenHeight - this.worldHeight);
    }

    // Update HUD
    this.minimap.update(this.player, this.world);
  }
}
