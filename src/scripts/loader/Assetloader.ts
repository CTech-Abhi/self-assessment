import * as PIXI from "pixi.js";
import { TextStyle } from "pixi.js";

export class Assetloader extends PIXI.Container {
  private loader: PIXI.Loader = PIXI.Loader.shared;
  private gameContainer: PIXI.Container;
  private loadingProgressText: PIXI.Text;
  private loaderPromise: any;

  constructor() {
    super();
    this.gameContainer = new PIXI.Container();
    this.loadingProgressText = new PIXI.Text(
      "",
      new TextStyle({
        fontFamily: ["Helvetica", "Arial", "sans-serif"],
        fontSize: 36,
      })
    );
    this.loadingProgressText.anchor.set(0.5);
    this.loadingProgressText.x = 540;
    this.loadingProgressText.y = 360;
    this.gameContainer.addChild(this.loadingProgressText);
    this.addChild(this.gameContainer);
  }

  public startLoad(): Promise<void> {
    /* PIXI.LoaderResource.setExtensionLoadType(
      "wav",
      PIXI.LoaderResource.LOAD_TYPE.XHR
    );
    PIXI.LoaderResource.setExtensionXhrType(
      "wav",
      PIXI.LoaderResource.XHR_RESPONSE_TYPE.BLOB
    ); */
    this.loader
      .add("hv1", "../images/hv1_symbol.png")
      .add("hv2", "../images/hv2_symbol.png")
      .add("hv3", "../images/hv3_symbol.png")
      .add("hv4", "../images/hv4_symbol.png")
      .add("lv1", "../images/lv1_symbol.png")
      .add("lv2", "../images/lv2_symbol.png")
      .add("lv3", "../images/lv3_symbol.png")
      .add("lv4", "../images/lv4_symbol.png")
      .add("bg", "../images/background.png")
      .add("spin", "../images/spin_button.png")
      .add("pointer", "../images/pointer.png")
      .add("wheelSlice", "../images/wheelSlice.png")
      .add("wheel_center", "../images/wheel_center.png")
      .add("coinAnim", "../animations/coin-anim/coin-anim.json");

    this.loader.load(this.onLoadComplete.bind(this));
    this.loader.onProgress.add(this.progressUpdate.bind(this));
    return new Promise((resolve) => {
      this.loaderPromise = resolve;
    });
  }

  private progressUpdate(loader: PIXI.Loader) {
    this.loadingProgressText.text = "" + loader.progress.toFixed(2) + " %";
  }

  protected onLoadComplete(): void {
    this.loadingProgressText.text = "100%";
    console.log("All resources loaded ...");
    this.loaderPromise();
  }
}
