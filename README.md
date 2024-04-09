# slot-machine-test

Its a demo for H5 slot game development using PIXI.JS,
A wheel bonus has been introduced to complete the demo

# Developer

**Abhishek Singhal**

# Installation

- run command : npm install or npm i
- run command : npm run serve
- browser game : open "localhost:8080" on your preferred browser

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

- Click spin button to see next result.
  Clicking on the spin button will deduct a random bet from [1, 2, 3, 5, 10], player balance will reduce accordingly.
  As the spin result the new reel stop positions will be displayed on the left bottom, symbols on the reel will change accordingly.

  In case of user win, winning details will display below the reel area ( replacing good luck msg ).
  A quick rollup will play to the total win amount and will be placed right below the balance meter.
  On roll up complete, balnce meter will update.

- We also have a bonus button on the main screen
  On clicking the bonus button, it will add a transition and take us to the wheel screen.
  On this screen we have a start button, clicking on it will make the wheel spin.
  Weight table for the wheel is defined inside model.ts, using it a win will be decided and the corrosponding slice will land on the wheel pointer.

  - Celebration
    To celebrate the wheel win, a popup will appear right over the wheel.
    Amount on the wheel will countup to the slice value. at the same time coin shower will happen from top to bottom.
    At the end of the countup, balance will be updated and at the end of the coin shower another transition screen will take you back to the main screen.

- Debug panel :  
  To inject the cheat the wheel bonus, click on the wheel slice that you want to win and start the wheel.
