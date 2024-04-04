# slot-machine-test

Its a demo for H5 slot game development using PIXI.JS

# Developer
**Abhishek Singhal**

# Installation
   * run command : npm install or npm i
   * run command : npm run serve
   * browser game : open "localhost:8080" on your preferred browaser

In case you see below error ( on serve command )
opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],

Use any of the below options :

**for macOS, Linux or Windows Git Bash**

export NODE_OPTIONS=--openssl-legacy-provider

**for Windows CMD (Command Prompt)**

set NODE_OPTIONS=--openssl-legacy-provider

**for Windows PowerShell**

$env:NODE_OPTIONS="--openssl-legacy-provider"

**for Docker (in your Dockerfile)**

ENV NODE_OPTIONS="--openssl-legacy-provider"

# Game Behavior
* Click spin button to see next result.
* See stop positions in the text box next to spin button.
* If there is a win, see details in the next textbox at the right bottom of the app.
* If you wish to check the loading progress, open dev tools network tab on the browser and set throttle to slow 3G.
