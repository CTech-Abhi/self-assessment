import * as PIXI from "pixi.js";
import { Assetloader } from "./loader/Assetloader";
import { GameController } from "./controller/GameController";

export class PreLoader extends PIXI.Container {
  private loader: Assetloader;
  private gameContainer: GameController;

  constructor() {
    super();
    this.loader = new Assetloader();
    this.gameContainer = new GameController();
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
