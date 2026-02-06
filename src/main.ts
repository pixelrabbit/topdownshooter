import { Application } from "pixi.js";
import { GameStage } from "./app/stage";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  const containerElement = document.querySelector("#game-container") as HTMLElement;
  await app.init({ background: "#1099bb", width: 1200, height: 800 });

  // Append the application canvas to the document body
  containerElement.appendChild(app.canvas);

  const gameStage = new GameStage(app.screen.width, app.screen.height);
  await gameStage.setup();
  app.stage.addChild(gameStage);

  // Listen for animate update
  app.ticker.add(() => {
    gameStage.update(app.ticker);
  });
})();
