import { Assets, Container, Ticker, Graphics } from 'pixi.js';
import { Player } from './player';
import { HUD } from './hud';
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
  private readonly screenWidth: number;
  private readonly screenHeight: number;

  constructor(screenWidth: number, screenHeight: number) {
    super();
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.hud = new HUD();
    this.addChild(this.hud);
  }

  public async setup(): Promise<void> {
    // Load the bunny player
    const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
    this.player = new Player(texture);

    // Setup player properties
    this.player.x = this.screenWidth / 2;
    this.player.y = this.screenHeight / 2;
    this.addChild(this.player);

    const obstacleData = [
      { x: 200, y: 200, w: 100, h: 100 },
      { x: 800, y: 150, w: 50, h: 300 },
      { x: 500, y: 500, w: 200, h: 40 },
      { x: 900, y: 600, w: 120, h: 120 },
    ];
    this.createObstacles(obstacleData);

    // Add 3 enemies at random positions, avoiding obstacles
    for (let i = 0; i < 3; i++) {
      const enemy = new Enemy(texture, this.player);

      // Find a valid spawn position
      do {
        enemy.x = Math.random() * this.screenWidth;
        enemy.y = Math.random() * this.screenHeight;
      } while (enemy.isColliding(this.obstacles));

      this.enemies.push(enemy);
      this.addChild(enemy);
    }
  }

  private obstacles: Graphics[] = [];
  private createObstacles(obstacleData: ObstacleData[]): void {
    obstacleData.forEach((data: ObstacleData) => {
      const obstacle = new Graphics()
        .rect(0, 0, data.w, data.h)
        .stroke({ width: 4, color: 0x000000 })
      obstacle.x = data.x;
      obstacle.y = data.y;

      this.obstacles.push(obstacle);
      this.addChild(obstacle);
    });

  }



  public update(ticker: Ticker): void {
    this.player?.update(ticker, this.screenWidth, this.screenHeight, this.obstacles);
    this.enemies.forEach(enemy => {
      enemy.update(ticker, this.screenWidth, this.screenHeight, this.obstacles);
    });
  }
}
