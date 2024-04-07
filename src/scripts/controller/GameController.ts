import * as PIXI from "pixi.js";
//import { sound } from "@pixi/sound";
import { Model } from "../dataStore/Model";
import { gsap, Linear } from "gsap";
import { BonusScreen } from "../scene/BonusScreen";
import { MainScreen } from "../scene/MainScreen";
import * as constants from "../config/constants.json";
import * as localizeText from "../config/en.json";

export interface IButtonView {
  SPRITE: string;
  NAME: string;
  X: number;
  Y: number;
  TEXT: string;
}

export class GameController extends PIXI.Container {
  private gameData: Model;
  private winDisplay: PIXI.Text;
  private balanceDisplay: PIXI.Text;
  private stopDisplay: PIXI.Text;
  private winDisplayMaxHeight = constants.maxWinPanelHeight;
  private countup: PIXI.Text;
  private transitionLayer: PIXI.Sprite = new PIXI.Sprite();
  private gameState: string = constants.GAMESTATE.INIT;
  private gameButtons: PIXI.Sprite[] = [];
  private bonusScreen: BonusScreen;
  private mainScreen: MainScreen;

  constructor() {
    super();
    this.gameData = Model.getInstance();
    this.winDisplay = this.createWinText();
    this.balanceDisplay = this.createBalanceMeter();
    this.stopDisplay = this.createStopDisplay();

    this.mainScreen = new MainScreen();
    this.bonusScreen = new BonusScreen({
      balanceUpdate: this.updateBalance.bind(this),
      switchScreens: this.startTransition.bind(this),
    });

    this.countup = new PIXI.Text(
      "",
      new PIXI.TextStyle(constants.mainGameCountUpFont as PIXI.ITextStyle)
    );
  }

  private setupUI() {
    const mainBg = PIXI.Sprite.from(constants.background.sprite);
    this.addChild(mainBg);
    this.addChild(this.winDisplay);
    this.addChild(this.balanceDisplay);
    this.addChild(this.stopDisplay);
    this.addChild(this.countup);

    this.updateBalance();

    this.addChild(this.countup);
    this.countup.x = this.balanceDisplay.x;
    this.countup.y =
      this.balanceDisplay.y +
      this.balanceDisplay.height +
      constants.winCountUpMargin;

    this.mainScreen.init();
    this.bonusScreen.init();
  }

  public init() {
    this.setupUI();

    this.addChild(this.mainScreen);
    this.addChild(this.bonusScreen);

    this.gameButtons.push(this.createSpinButton());
    this.gameButtons.push(this.createBonusButton());
    this.gameButtons.push(this.createWheelSpinButton());
    this.updateScreenState();

    this.transitionLayer.destroy();
    this.transitionLayer = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.transitionLayer.width = constants.viewport.width;
    this.transitionLayer.height = constants.viewport.height;

    this.transitionLayer.alpha = 0;
    this.addChild(this.transitionLayer);
  }

  private getButtonByName(buttonName: string) {
    let selectedButton;
    this.gameButtons.forEach((button) => {
      if (button.name == buttonName) {
        selectedButton = button;
      }
    });

    return selectedButton;
  }

  private createBalanceMeter() {
    const style = new PIXI.TextStyle(
      constants.BALANCE_METER.balnceMeterTextStyle
    );
    const text = new PIXI.Text(localizeText.BALANCE_METER, style);
    this.addChild(text);
    text.x = constants.BALANCE_METER.X;
    text.y = constants.BALANCE_METER.Y;
    return text;
  }

  private updateBalance() {
    this.balanceDisplay.text =
      localizeText.BALANCE_METER + this.gameData.balance;
  }

  private addButton(btnView: IButtonView) {
    const mainButton = PIXI.Sprite.from(btnView.SPRITE);
    mainButton.name = btnView.NAME;
    mainButton.x = btnView.X;
    mainButton.y = btnView.Y;
    mainButton.interactive = true;
    mainButton.cursor = "pointer";
    this.addChild(mainButton);

    if (btnView.TEXT) {
      const style = new PIXI.TextStyle({
        fontSize: 50,
      });
      const text = new PIXI.Text(btnView.TEXT, style);
      text.anchor.set(0.5);
      mainButton.addChild(text);
    }

    return mainButton;
  }

  private createSpinButton() {
    let mainButton = this.addButton(constants.SPIN_BTN);
    mainButton.scale.set(0.6);
    mainButton.anchor.set(0.5);
    mainButton.on("pointerdown", this.handleSpinRequest, this);
    return mainButton;
  }
  private createBonusButton() {
    let mainButton = this.addButton(constants.BONUS_BTN);
    mainButton.scale.set(0.6);
    mainButton.anchor.set(0.5);
    mainButton.on("pointerdown", this.startWheelBonus, this);
    return mainButton;
  }
  private createWheelSpinButton() {
    let mainButton = this.addButton(constants.WHEEL_BTN);
    mainButton.scale.set(0.6);
    mainButton.anchor.set(0.5);
    mainButton.on("pointerdown", this.startWheelSpin, this);
    return mainButton;
  }

  private startWheelSpin() {
    let wheelBtn: PIXI.Sprite | undefined = this.getButtonByName(
      constants.WHEEL_BTN.NAME
    );
    this.disableButton(wheelBtn);
    this.bonusScreen.rotateWheel();
    // gsap.delayedCall(12, this.startTransition.bind(this));
  }

  private disableGameButtons() {
    this.gameButtons.forEach((button) => {
      this.disableButton(button);
    });
  }

  private enableGameButtons() {
    this.gameButtons.forEach((button) => {
      if (button.visible) {
        this.enableButton(button);
      }
    });
  }

  private enableButton(button: PIXI.Sprite | undefined) {
    if (!button) {
      return;
    }
    button.interactive = true;
    button.alpha = 1;
  }
  private disableButton(button: PIXI.Sprite | undefined) {
    if (!button) {
      return;
    }
    button.interactive = false;
    button.alpha = 0.3;
  }

  private startWheelBonus() {
    // sound.play("sndClick");
    this.disableGameButtons();
    this.startTransition();
  }

  private createWinText() {
    const style = new PIXI.TextStyle({
      wordWrap: true,
      fill: "#ece4e4",
      wordWrapWidth: 800,
    });
    const text = new PIXI.Text(localizeText.GOOD_LUCK, style);
    this.addChild(text);
    text.x = constants.WIN_TEXT.X;
    text.y = constants.WIN_TEXT.Y;
    return text;
  }

  private createStopDisplay() {
    const style = new PIXI.TextStyle({
      wordWrap: true,
      fill: "#ece4e4",
      wordWrapWidth: 200,
    });
    const text = new PIXI.Text(
      localizeText.STOP_POSITION + this.gameData.reelstops,
      style
    );
    this.addChild(text);
    text.x = constants.STOP_POS_TEXT.X;
    text.y = constants.STOP_POS_TEXT.Y;
    return text;
  }

  private handleSpinRequest() {
    let reels = this.gameData.reelsetData;
    let bet = this.gameData.randomBet;
    const newReelStops: number[] = [];

    this.disableGameButtons();
    console.log("Placing BET   ::     ", bet);
    this.gameData.placeBet();
    this.updateBalance();

    for (let i = 0; i < reels.length; i++) {
      newReelStops.push(Math.floor(Math.random() * reels[i].length));
    }
    this.gameData.reelstops = newReelStops;
    this.mainScreen.updateReelsWithNewStop();

    this.stopDisplay.text =
      localizeText.STOP_POSITION + this.gameData.reelstops;
    this.showWinDetails();
  }

  private showWinDetails() {
    const winLines = this.gameData.winningLines;
    const totalWin = this.gameData.totalWinAmount;
    this.winDisplay.scale.set(1);

    let winData = totalWin
      ? localizeText.TOTAL_WIN + this.gameData.totalWinAmount
      : localizeText.GOOD_LUCK;
    for (let i = 0; i < winLines.length; i++) {
      winData += "\n";
      winData +=
        localizeText.PAYLINE_TEXT +
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
    } else {
      this.enableGameButtons();
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
    this.transitionLayer.alpha = 0;
    gsap.to(this.transitionLayer, {
      alpha: 1,
      delay: delay,
      duration: 1,

      ease: Linear.easeNone,
      onComplete: this.onTransitionCovering.bind(this),
    });
  }

  private updateScreenState() {
    let reelsVisibility = true;
    if (this.gameState == constants.GAMESTATE.BASEGAME) {
      this.gameState = constants.GAMESTATE.BONUSGAME;
      reelsVisibility = false;
      this.winDisplay.text = localizeText.GOOD_LUCK;
    } else {
      this.gameState = constants.GAMESTATE.BASEGAME;
    }

    let wheelBtn: PIXI.Sprite | undefined = this.getButtonByName(
      constants.WHEEL_BTN.NAME
    );
    let spinBtn: PIXI.Sprite | undefined = this.getButtonByName(
      constants.SPIN_BTN.NAME
    );
    let bonusBtn: PIXI.Sprite | undefined = this.getButtonByName(
      constants.BONUS_BTN.NAME
    );
    spinBtn!.visible = reelsVisibility;
    bonusBtn!.visible = reelsVisibility;
    wheelBtn!.visible = !reelsVisibility;
    this.stopDisplay.visible = reelsVisibility;

    this.mainScreen.visible = reelsVisibility;
    this.bonusScreen.visible = !reelsVisibility;
  }

  private onTransitionCovering() {
    this.bonusScreen.reset();
    this.updateScreenState();

    gsap.to(this.transitionLayer, {
      alpha: 0,
      duration: 1,
      ease: Linear.easeNone,
      onComplete: () => {
        this.enableGameButtons();
      },
    });
  }
}
