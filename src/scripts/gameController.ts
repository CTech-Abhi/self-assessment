import * as PIXI from "pixi.js";
import { reel } from "./reel";
import { Model } from "./model";
import { gsap, Linear } from "gsap";

export class gameController extends PIXI.Container {
  private gameData: Model;
  private reelStartPosition_x = 70;
  private reelStartPosition_y = 30;
  private reels: reel[] = [];
  private symbolSize = 160;
  private winDisplay: PIXI.Text;
  private balanceDisplay: PIXI.Text;
  private stopDisplay: PIXI.Text;
  private winDisplayMaxHeight = 350;
  private countup: PIXI.Text;
  private transitionLayer: PIXI.Sprite = new PIXI.Sprite();
  private gameState: string = "basegame";
  private gameButtons: PIXI.Sprite[] = [];

  constructor() {
    super();
    this.gameData = Model.getInstance();
    this.winDisplay = this.createWinText();
    this.balanceDisplay = this.createBalanceMeter();
    this.stopDisplay = this.createStopDisplay();

    const style = new PIXI.TextStyle({
      fontSize: 24,
      fill: "#ece4e4",
      fontWeight: "bold",
    });
    this.countup = new PIXI.Text("", style);
  }

  private setupUI() {
    const mainBg = PIXI.Sprite.from("bg");
    this.addChild(mainBg);
    this.addChild(this.winDisplay);
    this.addChild(this.balanceDisplay);
    this.addChild(this.stopDisplay);
    this.addChild(this.countup);

    this.updateBalance();

    this.addChild(this.countup);
    this.countup.x = this.balanceDisplay.x;
    this.countup.y = this.balanceDisplay.y + this.balanceDisplay.height + 20;
    console.log(this.balanceDisplay.text);
  }

  public init() {
    this.setupUI();

    this.initReels();
    this.gameButtons.push(this.createSpinButton());
    this.gameButtons.push(this.createBonusButton());

    this.transitionLayer.destroy();
    this.transitionLayer = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.transitionLayer.width = 1280;
    this.transitionLayer.height = 720;
    // this.transitionLayer.tint = 0x000000;

    this.transitionLayer.alpha = 0;
    this.addChild(this.transitionLayer);
  }

  private createBalanceMeter() {
    const style = new PIXI.TextStyle({
      wordWrap: true,
      fill: "#ece4e4",
      wordWrapWidth: 800,
    });
    const text = new PIXI.Text("Balance :", style);
    this.addChild(text);
    text.x = 750;
    text.y = 520;
    return text;
  }

  private updateBalance() {
    this.balanceDisplay.text = "Balance : \n" + this.gameData.balance;
  }

  private createSpinButton() {
    const mainButton = PIXI.Sprite.from("wheel_center");
    mainButton.x = 1000;
    mainButton.y = 400;
    mainButton.scale.set(0.6);
    mainButton.anchor.set(0.5);
    mainButton.interactive = true;
    mainButton.cursor = "pointer";

    this.addChild(mainButton);
    mainButton.on("pointerdown", this.handleSpinRequest, this);

    const style = new PIXI.TextStyle({
      fontSize: 50,
      wordWrapWidth: 800,
    });
    const text = new PIXI.Text("SPIN", style);
    text.anchor.set(0.5);
    mainButton.addChild(text);

    /*
     */
    return mainButton;
  }
  private createBonusButton() {
    const mainButton = PIXI.Sprite.from("wheel_center");
    mainButton.x = 1000;
    mainButton.y = 150;
    mainButton.scale.set(0.6);
    mainButton.anchor.set(0.5);
    mainButton.interactive = true;
    mainButton.cursor = "pointer";

    this.addChild(mainButton);
    mainButton.on("pointerdown", this.startWheelBonus, this);

    const style = new PIXI.TextStyle({
      fontSize: 50,
      wordWrapWidth: 800,
    });
    const text = new PIXI.Text("BONUS", style);
    text.anchor.set(0.5);
    mainButton.addChild(text);
    return mainButton;
  }

  private disableGameButtons() {
    this.gameButtons.forEach((element) => {
      element.interactive = false;
    });
  }

  private enableGameButtons() {
    this.gameButtons.forEach((element) => {
      element.interactive = true;
    });
  }

  private startWheelBonus() {
    console.log("Add transition ...");
    this.startTransition();
  }

  private createWinText() {
    const style = new PIXI.TextStyle({
      wordWrap: true,
      fill: "#ece4e4",
      wordWrapWidth: 800,
    });
    const text = new PIXI.Text("GOOD LUCK !!", style);
    this.addChild(text);
    text.x = 350;
    text.y = 520;
    return text;
  }

  private createStopDisplay() {
    const style = new PIXI.TextStyle({
      wordWrap: true,
      fill: "#ece4e4",
      wordWrapWidth: 200,
    });
    const text = new PIXI.Text(
      "STOP POSITIONS :- \n\n" + this.gameData.reelstops,
      style
    );
    this.addChild(text);
    text.x = 75;
    text.y = 520;
    return text;
  }

  private handleSpinRequest() {
    let reels = this.gameData.reelsetData;
    let bet = this.gameData.randomBet;
    const newReelStops: number[] = [];

    console.log("Placing BET   ::     ", bet);
    this.gameData.placeBet();
    this.updateBalance();

    for (let i = 0; i < reels.length; i++) {
      newReelStops.push(Math.floor(Math.random() * reels[i].length));
    }
    this.gameData.reelstops = newReelStops;

    const newReelSymbols = this.gameData.stopSymbols;
    for (let reelIndex = 0; reelIndex < this.reels.length; reelIndex++) {
      this.reels[reelIndex].fillWithSymbols(newReelSymbols[reelIndex]);
    }

    this.stopDisplay.text = "STOP POSITIONS :- \n\n" + this.gameData.reelstops;
    this.showWinDetails();
  }

  private showWinDetails() {
    const winLines = this.gameData.winningLines;
    const totalWin = this.gameData.totalWinAmount;
    this.winDisplay.scale.set(1);

    let winData = totalWin
      ? "total Win : " + this.gameData.totalWinAmount
      : "GOOD LUCK !!";
    for (let i = 0; i < winLines.length; i++) {
      winData += "\n";
      winData +=
        " - " +
        "payline " +
        winLines[i].index +
        ", " +
        winLines[i].symbol +
        " x" +
        winLines[i].count +
        ", " +
        winLines[i].payout;
    }

    this.winDisplay.text = winData;
    if (this.winDisplay.height > this.winDisplayMaxHeight) {
      this.winDisplay.scale.set(
        this.winDisplayMaxHeight / this.winDisplay.height
      );
    }

    if (this.gameData.totalWinAmount) {
      this.disableGameButtons();
      this.addCountup();
    }
  }

  private initReels() {
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

  private addCountup() {
    this.countup.visible = true;
    this.countup.text = "0.00";
    this.countup.alpha = 1;

    var counter = { value: 0 };
    gsap.to(counter, {
      duration: 1,
      value: this.gameData.totalWinAmount,
      ease: Linear.easeNone,
      onUpdate: () => {
        this.countup.text = "$" + counter.value.toFixed(2);
      },
    });

    /* gsap.delayedCall(1, () => {
      this.gameData.addWinnings();
      this.updateBalance();
    }); */

    this.countup.alpha = 1;
    gsap.to(this.countup, {
      alpha: 0,
      delay: 2,
      duration: 0.2,
      ease: Linear.easeNone,
      onComplete: () => {
        this.gameData.addWinnings();
        this.updateBalance();
        this.enableGameButtons();
      },
    });
  }

  private startTransition(delay: number = 0) {
    /* this.eventDispature.dispatchEvent("TRANSITION_SCREEN", delay);
    this.eventDispature.dispatchEvent("DISABLE_BUTTONS"); */
    this.transitionLayer.alpha = 0;
    gsap.to(this.transitionLayer, {
      alpha: 1,
      delay: delay,
      duration: 1,

      ease: Linear.easeNone,
      onComplete: this.onTransitionCovering.bind(this),
    });
  }

  private onTransitionCovering() {
    let reelsVisibility = true;
    if (this.gameState == "basegame") {
      this.gameState = "bonusgame";
      reelsVisibility = false;
    } else {
      this.gameState = "basegame";
    }

    for (let reelIndex = 0; reelIndex < this.reels.length; reelIndex++) {
      this.reels[reelIndex].visible = reelsVisibility;
    }
    gsap.to(this.transitionLayer, {
      alpha: 0,
      duration: 1,
      ease: Linear.easeNone,
      onComplete: () => {
        this.onTransitionComplete("");
      },
    });
  }

  private onTransitionComplete(nextCommand: string) {
    if (nextCommand == "freespin") {
      // TO DO:  SHOW INTRO BANNER
      // gsap.delayedCall(2, this.onSpinStarted.bind(this));
      // this.onSpinStarted();
    } else {
      // TO DO:  CHECK AND SHOW OUTRO BANNER
      /* gsap.delayedCall(0.6, () => {
        this.eventDispature.dispatchEvent("ENABLE_BUTTONS");
      }); */
      // this.eventDispature.dispatchEvent("ENABLE_BUTTONS");
    }
  }
}
