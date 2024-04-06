import * as PIXI from "pixi.js";
import { gsap, Linear, Quad } from "gsap";
import { Model } from "../dataStore/Model";
import * as constants from "../config/constants.json";
import * as localizeText from "../config/en.json";

export interface IcallbackHandler {
  balanceUpdate: VoidFunction;
  switchScreens: VoidFunction;
}

export class BonusScreen extends PIXI.Container {
  private mainContainer: PIXI.Container = new PIXI.Container();
  private wheel: PIXI.Container = new PIXI.Container();
  private sliceAngle: number = constants.WHEEL.SLICE_ANGLE;
  private gameData: Model;
  private wheelPrizes: number[] = [];
  private banner: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  private popup: PIXI.Container = new PIXI.Container();
  private winCountup: PIXI.Text;
  private balanceUpdateCallback: VoidFunction;
  private endFeatureCallback: VoidFunction;

  constructor(callbackMethod: IcallbackHandler) {
    super();
    this.endFeatureCallback = callbackMethod["switchScreens"];
    this.balanceUpdateCallback = callbackMethod["balanceUpdate"];
    this.gameData = Model.getInstance();

    const style = new PIXI.TextStyle({
      fontSize: 30,
      fill: "#ece4e4",
      fontWeight: "bold",
    });
    this.winCountup = new PIXI.Text("0.00", style);
    this.winCountup.anchor.set(0.5, 0);

    this.addChild(this.mainContainer);
    this.mainContainer.addChild(this.wheel);
    this.mainContainer.addChild(this.popup);
  }

  public init(): void {
    this.wheelPrizes = this.gameData.wheelPrizeList;
    this.createWheel();
    this.addPointer();
    this.addBanner();
  }

  private addBanner() {
    this.banner.tint = 0xaaaaaa;
    this.banner.width = constants.WHEEL.BANNER.WIDTH;
    this.banner.height = constants.WHEEL.BANNER.HEIGHT;
    this.banner.anchor.set(0.5);

    this.popup.addChild(this.banner);
    this.popup.x = this.wheel.x;
    this.popup.y = this.wheel.y;

    const style = new PIXI.TextStyle({
      fontSize: 40,
      fill: "#ece4e4",
      align: "center",
    });
    const congratulationsMsg = new PIXI.Text(localizeText.BONUS_WIN, style);
    congratulationsMsg.anchor.set(0.5, 1);
    this.popup.addChild(congratulationsMsg);
    this.winCountup.y += constants.WHEEL.BANNER.WIN_AMOUNT_OFFSET_Y;
    this.popup.addChild(this.winCountup);
    this.popup.alpha = 0;
    this.winCountup.visible = false;
  }

  private addPointer() {
    let pointer = PIXI.Sprite.from("pointer");
    pointer.anchor.set(0.5);
    pointer.tint = 0x456782;
    this.mainContainer.addChild(pointer);
    pointer.x = this.wheel.x;
    pointer.y = this.wheel.y - this.wheel.height / 2;
  }

  private addCountup() {
    this.winCountup.visible = true;
    this.winCountup.text = "0.00";
    this.winCountup.alpha = 1;

    var counter = { value: 0 };
    gsap.to(counter, {
      duration: constants.WHEEL.CELEBRATION.COUNT_UP_DURATION,
      value: this.gameData.bonusWin,
      ease: Linear.easeNone,
      onUpdate: () => {
        this.winCountup.text = "$" + counter.value.toFixed(2);
      },
    });

    this.winCountup.alpha = 1;
    gsap.delayedCall(
      constants.WHEEL.CELEBRATION.BALANCE_ADDITION_DELAY,
      this.onRollupComplete.bind(this)
    );
  }

  private onRollupComplete() {
    this.gameData.addBonusWin();
    this.balanceUpdateCallback();
    gsap.delayedCall(
      constants.WHEEL.CELEBRATION.CLOSING_DELAY,
      this.endFeatureCallback
    );
  }

  public reset() {
    this.popup.alpha = 0;
    this.winCountup.text = "0.00";
  }

  private createWheel() {
    let sliceCount = 0;
    let startingAngle = 0;
    while (startingAngle < 360) {
      let slice = this.getNewSlice(sliceCount);
      slice.angle = startingAngle;
      this.wheel.addChild(slice);
      sliceCount++;
      startingAngle += this.sliceAngle;
    }

    this.wheel.scale.set(0.45);
    this.wheel.x = constants.WHEEL.X;
    this.wheel.y = constants.WHEEL.Y;

    let wheelShinCover = PIXI.Sprite.from("wheel_center");
    wheelShinCover.anchor.set(0.5);
    this.wheel.addChild(wheelShinCover);
  }

  public rotateWheel(): void {
    let wheelStopIndex = this.gameData.weightedWheelPrize;
    console.log(wheelStopIndex);

    let minWheelSpinAngle = Math.PI * 2 * constants.WHEEL.MIN_SPIN_COUNT;
    let targetStopAngle =
      Math.PI * 2 - (Math.PI / 180) * this.sliceAngle * wheelStopIndex;

    gsap.to(this.wheel, {
      rotation: minWheelSpinAngle + targetStopAngle,
      duration: constants.WHEEL.SPIN_TIME,
      ease: Quad.easeInOut,
      onComplete: () => {
        this.wheel.rotation =
          this.wheel.rotation - Math.PI * 2 * constants.WHEEL.MIN_SPIN_COUNT;
        this.addCelebrationPopup();
      },
    });
  }

  private addCelebrationPopup() {
    this.popup.alpha = 0;
    gsap.to(this.popup, {
      alpha: 1,
      delay: constants.WHEEL.CELEBRATION.APPEAR_DELAY,
      duration: constants.WHEEL.CELEBRATION.APPEAR_DURATION,

      ease: Linear.easeNone,
      onComplete: this.addCountup.bind(this),
    });
  }

  private getNewSlice(prizeIndex: number) {
    let slice = PIXI.Sprite.from(constants.WHEEL.SLICE_SPRITE);
    slice.anchor.set(0.5, 1);
    const style = new PIXI.TextStyle({
      fontSize: 50,
      wordWrapWidth: 800,
    });
    const text = new PIXI.Text("" + this.wheelPrizes[prizeIndex], style);
    text.anchor.set(0.5);
    text.rotation = -Math.PI / 2;
    text.y = -slice.height / 2 + constants.WHEEL.SLICE_TEXT_OFFSET_Y;
    slice.addChild(text);

    return slice;
  }
}
