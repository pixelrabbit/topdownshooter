import { Container, Graphics, Text, TextStyle } from "pixi.js";
import type { Player } from "./player";

export class Minimap extends Container {
  private cameraRect: Graphics;
  private playerDot: Graphics;
  private obstacleContainer: Container;

  private readonly worldWidth: number;
  private readonly screenWidth: number;
  private readonly screenHeight: number;

  private readonly minimapWidth = 120;
  private readonly minimapHeight = 120;
  private readonly minimapScale: number;

  constructor(worldWidth: number, _worldHeight: number, screenWidth: number, screenHeight: number) {
    super();

    this.worldWidth = worldWidth;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.x = screenWidth - this.minimapWidth - 12;
    this.y = 12;

    // Minimap background (represents the whole world)
    const minimapBg = new Graphics()
      .rect(0, 0, this.minimapWidth, this.minimapHeight)
      .fill({ color: 0x111111, alpha: 0.66 });
    this.addChild(minimapBg);

    // Container for obstacles
    this.obstacleContainer = new Container();
    this.addChild(this.obstacleContainer);

    // Calculate scale - assuming world is square for simplicity
    this.minimapScale = this.minimapWidth / this.worldWidth;

    // Camera viewport rectangle
    this.cameraRect = new Graphics()
      .rect(0, 0, this.screenWidth * this.minimapScale, this.screenHeight * this.minimapScale)
      .stroke({ width: 1, color: 0xffffff }); // White border
    this.addChild(this.cameraRect);

    // Player dot
    this.playerDot = new Graphics().circle(0, 0, 2).fill({ color: 0x00ff00 }); // Green dot for player
    this.addChild(this.playerDot);
  }

  public setObstacles(obstacles: Graphics[]): void {
    this.obstacleContainer.removeChildren();
    for (const obstacle of obstacles) {
      const obstacleRep = new Graphics()
        .rect(
          obstacle.x * this.minimapScale,
          obstacle.y * this.minimapScale,
          obstacle.width * this.minimapScale,
          obstacle.height * this.minimapScale
        )
        .fill({ color: 0x888888 }); // Grey for obstacles
      this.obstacleContainer.addChild(obstacleRep);
    }
  }

  public update(player: Player, camera: Container): void {
    if (!player) {
      this.playerDot.visible = false;
      this.cameraRect.visible = false;
      return;
    }

    this.playerDot.visible = true;
    this.cameraRect.visible = true;

    this.playerDot.x = player.x * this.minimapScale;
    this.playerDot.y = player.y * this.minimapScale;

    this.cameraRect.x = -camera.x * this.minimapScale;
    this.cameraRect.y = -camera.y * this.minimapScale;
  }
}

export class HUD extends Container {
  constructor() {
    super();

    const background = new Graphics().rect(16, 16, 240, 80).fill({ color: 0x111111 });
    this.addChild(background);

    // Add "bunny" text
    const style = new TextStyle({
      fill: "#ffffff",
      fontSize: 18,
      fontWeight: "bold",
    });
    const name = new Text({ text: "wabbit", style });
    name.x = 0;
    name.y = 0;
    name.origin.set(0);
    background.addChild(name);

    // Add 4 red squares in a row
    const squareSize = 16;
    const spacing = 8;
    const startX = 0;

    for (let i = 0; i < 4; i++) {
      const square = new Graphics()
        .rect(startX + (squareSize + spacing) * i, 24, squareSize, squareSize)
        .fill({ color: 0xff0000 });
      background.addChild(square);
    }
  }
}
