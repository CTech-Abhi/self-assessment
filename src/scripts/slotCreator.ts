import * as PIXI from "pixi.js";
import { assetloader } from "./assetloader";
import { gameController } from "./gameController";

export class slotCreator extends PIXI.Container {
  private loader: assetloader;
  private gameContainer: gameController;

  constructor() {
    super();
    this.loader = new assetloader();
    this.gameContainer = new gameController();
    this.gameContainer.visible = false;
    this.addChild(this.gameContainer);
    this.addChild(this.loader);

    this.initGame();
  }

  private async initGame() {
    await this.loader.startLoad();

    this.gameContainer.init();
    this.removeChild(this.loader);
    this.gameContainer.visible = true;
    this.loader.destroy();
  }
}
