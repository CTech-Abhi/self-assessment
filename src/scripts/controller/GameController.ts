import * as PIXI from "pixi.js";
//import { sound } from "@pixi/sound";
import { Model } from "../dataStore/Model";
import { gsap, Linear } from "gsap";
import { BonusScreen } from "../scene/BonusScreen";
import { MainScreen } from "../scene/MainScreen";
import { OverlayPanel } from "../scene/OverlayPanel";
import * as constants from "../config/constants.json";

export interface IButtonView {
  SPRITE: string;
  NAME: string;
  X: number;
  Y: number;
  TEXT: string;
}

export class GameController extends PIXI.Container {
  private gameData: Model;
  private transitionLayer: PIXI.Sprite = new PIXI.Sprite();
  private gameState: string = constants.GAMESTATE.INIT;
  private gameButtons: PIXI.Sprite[] = [];
  private bonusScreen: BonusScreen;
  private mainScreen: MainScreen;
  private betPanel: OverlayPanel;

  constructor() {
    super();
    this.gameData = Model.getInstance();
    this.betPanel = new OverlayPanel();

    this.mainScreen = new MainScreen();
    this.bonusScreen = new BonusScreen({
      balanceUpdate: this.updateBalance.bind(this),
      switchScreens: this.startTransition.bind(this),
    });
  }

  private setupUI() {
    const mainBg = PIXI.Sprite.from(constants.background.sprite);
    this.addChild(mainBg);

    this.betPanel.init();
    this.addChild(this.betPanel);
    this.betPanel.updateBalance();

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

  private updateBalance() {
    this.betPanel.updateBalance();
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
    // sound.play("sndClick");
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
    this.disableGameButtons();
    this.startTransition();
  }

  private async handleSpinRequest() {
    let reels = this.gameData.reelsetData;
    let bet = this.gameData.randomBet;
    const newReelStops: number[] = [];

    this.disableGameButtons();
    console.log("Placing BET   ::     ", bet);
    this.gameData.placeBet();
    this.betPanel.updateBalance();

    for (let i = 0; i < reels.length; i++) {
      newReelStops.push(Math.floor(Math.random() * reels[i].length));
    }
    this.gameData.reelstops = newReelStops;
    this.mainScreen.updateReelsWithNewStop();
    this.betPanel.updateStopPositionData();

    this.betPanel.showWinDetails();
    if (this.gameData.totalWinAmount) {
      this.disableGameButtons();
      await this.betPanel.addCountup();
      this.enableGameButtons();
    } else {
      this.enableGameButtons();
    }
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
      this.betPanel.updateWinDisplay(this.gameState);
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
    this.betPanel.updateStopPositionDisplay(reelsVisibility);

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
