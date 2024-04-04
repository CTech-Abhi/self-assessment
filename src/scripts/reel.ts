import * as PIXI from "pixi.js";

export class reel extends PIXI.Container {
  private reelContainer: PIXI.Container = new PIXI.Container();

  constructor() {
    super();
    this.addChild(this.reelContainer);
  }
  public fillWithSymbols(symbols: string[]) {
    this.emptyReel();
    this.fillSymbols(symbols);
  }

  private emptyReel() {
    while (this.reelContainer.children.length > 0) {
      let removedChild = this.reelContainer.getChildAt(0);
      this.reelContainer.removeChild(removedChild);
      removedChild.destroy();
    }
  }

  private fillSymbols(symbols: string[]) {
    for (let i = 0; i < symbols.length; i++) {
      let sprite = new PIXI.Sprite(
        PIXI.Loader.shared.resources[symbols[i]].texture
      );
      sprite.y = this.reelContainer.height;
      this.reelContainer.addChild(sprite);
    }
  }
}
