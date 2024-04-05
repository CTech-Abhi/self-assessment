import * as PIXI from "pixi.js";
import { gsap, Quad } from "gsap";
import { Model } from "../model";

export class BonusScreen extends PIXI.Container {
  private mainContainer: PIXI.Container = new PIXI.Container();
  private wheel: PIXI.Container = new PIXI.Container();
  private sliceAngle: number = 45;
  private startingAngle: number = 0;
  private gameData: Model;
  private wheelPrizes: number[] = [];

  constructor() {
    super();
    this.startingAngle = this.sliceAngle / 2;
    this.gameData = Model.getInstance();

    this.addChild(this.mainContainer);
    this.mainContainer.addChild(this.wheel);
  }

  public init(): void {
    this.wheelPrizes = this.gameData.wheelPrizeList;
    this.createWheel();
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
    this.wheel.x = 450;
    this.wheel.y = 275;
    this.wheel.rotation = (Math.PI / 180) * this.startingAngle;
  }

  public rotateWheel(): void {
    let wheelStopIndex = this.gameData.weightedWheelPrize;
    console.log(wheelStopIndex);

    let minWheelSpinAngle = Math.PI * 2 * 5;
    let targetStopAngle =
      Math.PI * 2 - (Math.PI / 180) * this.sliceAngle * wheelStopIndex;

    gsap.to(this.wheel, {
      rotation: minWheelSpinAngle + targetStopAngle,
      duration: 10,
      ease: Quad.easeInOut,
      onComplete: () => {
        this.wheel.rotation = this.wheel.rotation - Math.PI * 2 * 5;
      },
    });
  }

  private getNewSlice(prizeIndex: number) {
    let slice = PIXI.Sprite.from("wheelSlice");
    slice.anchor.set(0.5, 1);
    const style = new PIXI.TextStyle({
      fontSize: 50,
      wordWrapWidth: 800,
    });
    const text = new PIXI.Text("" + this.wheelPrizes[prizeIndex], style);
    text.anchor.set(0.5);
    text.rotation = -Math.PI / 2;
    text.y = -slice.height / 2 - 50;
    slice.addChild(text);

    return slice;
  }
}
