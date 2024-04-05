import * as PIXI from "pixi.js";
import { Model } from "../model";
import { reel } from "../reel";

export class MainScreen extends PIXI.Container {
  private mainContainer: PIXI.Container = new PIXI.Container();
  private gameData: Model;
  private reelStartPosition_x = 70;
  private reelStartPosition_y = 30;
  private reels: reel[] = [];
  private symbolSize = 160;

  constructor() {
    super();
    this.gameData = Model.getInstance();
    this.addChild(this.mainContainer);
  }

  public init(): void {
    let initReels = this.gameData.stopSymbols;
    for (let i = 0; i < initReels.length; i++) {
      let newReel = new reel();
      newReel.fillWithSymbols(initReels[i]);
      newReel.scale.set(0.6);
      this.addChild(newReel);

      newReel.x = this.reelStartPosition_x + i * this.symbolSize;
      newReel.y = this.reelStartPosition_y;
      this.reels.push(newReel);
    }
  }

  public updateReelsWithNewStop() {
    const newReelSymbols = this.gameData.stopSymbols;
    for (let reelIndex = 0; reelIndex < this.reels.length; reelIndex++) {
      this.reels[reelIndex].fillWithSymbols(newReelSymbols[reelIndex]);
    }
  }
}
