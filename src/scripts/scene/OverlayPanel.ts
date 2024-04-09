import * as PIXI from "pixi.js";
import { gsap, Linear } from "gsap";
import { Model } from "../dataStore/Model";
import * as constants from "../config/constants.json";
import * as localizeText from "../config/en.json";

export class OverlayPanel extends PIXI.Container {
  private mainContainer: PIXI.Container = new PIXI.Container();
  private gameData: Model;
  private winDisplay: PIXI.Text;
  private balanceDisplay: PIXI.Text;
  private stopDisplay: PIXI.Text;
  private winDisplayMaxHeight = constants.maxWinPanelHeight;
  private countup: PIXI.Text;
  private counterPromise: (value: unknown) => void = () => {};

  constructor() {
    super();
    this.addChild(this.mainContainer);
    this.gameData = Model.getInstance();
    this.winDisplay = this.createWinText();
    this.balanceDisplay = this.createBalanceMeter();
    this.stopDisplay = this.createStopDisplay();

    this.countup = new PIXI.Text(
      "",
      new PIXI.TextStyle(constants.mainGameCountUpFont as PIXI.ITextStyle)
    );
  }

  public init() {
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

  public updateBalance() {
    this.balanceDisplay.text =
      localizeText.BALANCE_METER + this.gameData.balance;
  }

  public updateWinDisplay(gameState: string) {
    if (gameState == constants.GAMESTATE.BONUSGAME) {
      this.winDisplay.text = localizeText.GOOD_LUCK;
    }
  }

  public updateStopPositionData() {
    this.stopDisplay.text =
      localizeText.STOP_POSITION + this.gameData.reelstops;
  }

  public updateStopPositionDisplay(visibility: boolean) {
    this.stopDisplay.visible = visibility;
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

  public showWinDetails() {
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
  }

  public addCountup() {
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
        this.counterPromise(null);
      },
    });

    return new Promise((resolve) => {
      this.counterPromise = resolve;
    });
  }
}
