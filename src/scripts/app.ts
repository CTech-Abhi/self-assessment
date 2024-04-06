// app.ts

import * as PIXI from "pixi.js";
import { PreLoader } from "./PreLoader";
import * as constants from "./config/constants.json";

interface EngineParams {
  containerId: string;
  canvasW: number;
  canvasH: number;
  fpsMax: number;
}

class Engine {
  public container: HTMLElement;
  public loader: PIXI.Loader;
  public renderer: PIXI.Renderer;
  public stage: PIXI.Container;
  public graphics: PIXI.Graphics;

  constructor(params: EngineParams) {
    this.loader = PIXI.Loader.shared;
    this.renderer = PIXI.autoDetectRenderer({
      width: params.canvasW,
      height: params.canvasH,
      antialias: true,
      backgroundColor: 0xbcdf59,
    }) as PIXI.Renderer;
    this.stage = new PIXI.Container();
    this.graphics = new PIXI.Graphics();

    this.container = params.containerId
      ? document.getElementById(params.containerId) || document.body
      : document.body;
    this.container.appendChild(this.renderer.view);
  } // constructor
} // Engine

const engineProps = {
  containerId: "game",
  canvasW: constants.viewport.width,
  canvasH: constants.viewport.height,
  fpsMax: 60,
};
const engine = new Engine(engineProps);

// ==============
// === STATES ===
// ==============

window.onload = onWondowLoad;
window.addEventListener("resize", resize);
resize();

function resize() {
  let w = window.innerWidth;
  let h = window.innerHeight;

  engine.stage.scale.x = w / engineProps.canvasW;
  engine.stage.scale.y = h / engineProps.canvasH;
  engine.renderer.resize(w, h);
}

function onWondowLoad() {
  startDemo();
  render();
} // load

function startDemo() {
  console.log("DEMO STARTED ......");
  engine.stage.addChild(new PreLoader());
}

function render() {
  requestAnimationFrame(render);
  /* ***************************** */
  /* Render your Game Objects here */
  /* ***************************** */
  engine.renderer.render(engine.stage);
} // render
