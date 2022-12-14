// Phaser config
let config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    physics: {
        default: 'arcade'
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let debugMode = false;

let gameRunning = false;
let tutorialSprite;
let gameStartTime;

// Defining global variables
let player;
let cursors;
let fire;
let fire2;
let slow;
let bomb;
let bombLock = false;
let playerBombText;
let playerBombCount = 1;
let playerBullets;
let playerHP = 3;
let playerHPText;
let playerPower = 1;
let playerSpeed = 400;
let powerUps;
let health;

let enemy;
let enemyMaxHP = 500;
let enemyHP = enemyMaxHP;
let enemyHPBar;

let gameOver = false;
let gameOverLoad = true;
let gameOverSprite;

let enemyState = 0;
let enemyBullets;
let enemyLineAttacks = [];
let enemyLineAttackRot = 0;
let enemyLineAttackPos = [];
let enemyRot = 0;

let currentTime = new Date();
let lastBulletFire = 0;

let enemyStep = 0;
//let enemyStepTime = 100;
let enemyStepTime = 400;
let lastEnemyStep = enemyStep;
let lastStepTime = currentTime;
let stepsToNextState = 0;

// Creating game object
let game = new Phaser.Game(config);


function preload() {
    // Loading assets
    this.load.image('character', 'assets/player.png');
    this.load.image('playerBullet', 'assets/playerBullet.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('powerUp', 'assets/powerUp.png');
    this.load.image('tutorial', 'assets/tutorial2.png');
    this.load.image('clearScreen', 'assets/clearScreen.png');
    this.load.image('playerHitbox', 'assets/playerHitbox.png');
    this.load.image('playerHitboxShown', 'assets/playerHitboxShown.png');
    //this.load.image('playerHitbox', 'assets/player.png');
    //this.load.image('playerHitboxShown', 'assets/player.png');
    this.load.image('health', 'assets/health.png');
}

function create() {
    playerSprite = this.physics.add.sprite(config.width / 2, 450, 'character');
    
    // Setting up player physics
    player = this.physics.add.sprite(config.width / 2, 450, 'playerHitboxShown');
    player.setCollideWorldBounds(true);
    player.visible = false;

    // Variables for getting player inputs
    cursors = this.input.keyboard.createCursorKeys();
    fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    fire2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    slow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    bomb = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // Creating groups for bullets
    playerBullets = this.physics.add.group();
    enemyBullets = this.physics.add.group();

    // Creating groups for collectables
    powerUps = this.physics.add.group();
    health = this.physics.add.group();

    // Enemy physics
    enemy = this.physics.add.sprite(config.width / 2, 200, 'enemy');

    // Displaying player HP text
    playerHPText = this.add.text(10, 750, 'HP: ' + playerHP, {fontSize: '32px', fill: '#FFFFFF'}); // x, y, text, style

    playerBombText = this.add.text(400, 750, 'Bombs: ' + playerBombCount, {fontSize: '32px', fill: '#FFFFFF'});

    // Enemy HP bar
    let barProgress = enemyHP / enemyMaxHP;
    enemyHPBar = this.add.graphics();
    enemyHPBar.fillStyle(0xff0000, 1);
    enemyHPBar.fillRect(0, 0, barProgress * config.width, 30);

    // Creating a sprite for the tutorial, probably a better way to do this
    tutorialSprite = this.physics.add.sprite(config.width / 2, config.height / 2, 'tutorial');

    // Collision
    this.physics.add.overlap(enemy, playerBullets, damageEnemy, null, this); // Enemy getting hit by playerBullets
    this.physics.add.overlap(player, enemyBullets, damagePlayer, null, this); // Player getting hit by enemyBullets
    this.physics.add.overlap(playerSprite, powerUps, getPowerUp, null, this);
    this.physics.add.overlap(playerSprite, health, getHealth, null, this);
}

function update() {
    // Checks to see if the game is meant to be paused, if so then return so the update function isn't ran that frame
    if (gameRunning == false) {

        if (fire.isDown) { // If the player presses X then start the game
            tutorialSprite.destroy();
            gameRunning = true;
            gameStartTime = new Date();
        }

        return;
    }

    // If gameOver then don't run update
    if (gameOver) {
        gameOverScreen(this);
        return;
    }

    // Changing enemy state to the next one and setting the number of steps until the next state
    if (stepsToNextState == 0) {
        enemyState += 1;
        if (enemyState > 5) {
            enemyState = 1;
        }

        switch (enemyState){
            case 1:
                stepsToNextState = 200;
                break;
            case 2:
                stepsToNextState = 20;
                break;
            case 3:
                stepsToNextState = 1;
                break;
            case 4:
                stepsToNextState = 1;
                break;
            case 5:
                stepsToNextState = 200;
                break;
            default:
                stepsToNextState = 20;
        }
    }

    // Getting the current time for things that need delta time
    currentTime = new Date();

    // Calculating current step for the enemy AI
    // Each step lasts a number of miliseconds and then it increments the step count for controling certain behaviours like when the enemy fires
    if (currentTime - lastStepTime > enemyStepTime) {
        enemyStep += 1;
        lastStepTime = currentTime; // Updating lastStepTime so it knows how long as been since the last step took place
    }

    /*
    if (playerPower >= 5) {
        // Making the player's bullets wiggle by iterating over and applying a sine to their X velocity based on their Y position
        playerBullets.children.iterate(function (child) {
            child.setVelocityX(Math.sin(child.y / 25) * 200);
        });
    }
    */

    // Bullet tracking for final power upgrade
    if (playerPower >= 4) {
        playerBullets.children.iterate(function (child) { // For every player bullet
            let newVelocity = (config.width / 2 > child.x) ? 50 : -50; // Move the bullet in the direction of the enemy
            newVelocity = ((config.height / 100) - (child.y / 100)) * newVelocity; // Do a gradule increase of velocity
            child.setVelocityX(newVelocity);
        })
    }
    

    // If this is a new step then run this
    if (enemyStep > lastEnemyStep){

        // State machine stuff
        if (enemyState == 1) { // Random bullets falling from the top of the screen
            enemyStepTime = 50;

            fireEnemyBullet(Math.random() * config.width + 1, 0, 0, 400);

            stepsToNextState -= 1;
        } else if (enemyState == 2) { // Bullets are targeted to the player and start at the enemy
            // TODO Normalize the velocity vector
            
            /*
            let bulletVectorX = enemy.x - player.x;
            let bulletVectorY = enemy.y - player.y;
            bulletVectorX = vectorNormalize(bulletVectorX, bulletVectorY)[0];
            bulletVectorY = vectorNormalize(bulletVectorX, bulletVectorY)[1];
            
            bulletVectorX *= 100;
            bulletVectorY *= 100;

            fireEnemyBullet(enemy.x, enemy.y, bulletVectorX, bulletVectorY;
            */

            enemyStepTime = 500;
            
            fireEnemyBullet(enemy.x, enemy.y, (enemy.x - player.x) * -1, (enemy.y - player.y) * -1);

            stepsToNextState -= 1;
        } else if (enemyState == 3) { // Line attack telegraph and calculations
            //fireEnemyLine(player.x, player.y, 10);
            enemyStepTime = 100;

            enemyLineAttackRot += 10;

            let startPos = [getCircleAngleCoord(100, enemyLineAttackRot)[0]*-1, getCircleAngleCoord(100, enemyLineAttackRot)[1]*-1];
            let endPos = [getCircleAngleCoord(100, enemyLineAttackRot)[0], getCircleAngleCoord(100, enemyLineAttackRot)[1]];
            
            let startPosAbsolute = [getCircleAngleCoord(100, enemyLineAttackRot)[0]*-1 + player.x, getCircleAngleCoord(100, enemyLineAttackRot)[1]*-1 + player.y];
            let endPosAbsolute = [getCircleAngleCoord(100, enemyLineAttackRot)[0] + player.x, getCircleAngleCoord(100, enemyLineAttackRot)[1] + player.y];

            enemyLineAttacks.push(this.add.line(
                player.x, // origin x
                player.y, // origin y
                startPos[0], // start x
                startPos[1], // start y
                endPos[0], // end x
                endPos[1], // end y
                0x6f0000).setOrigin(0,0)
            ); // x, y, startx, starty, endx, endy, color
            
            enemyLineAttackPos.push([startPosAbsolute, endPosAbsolute]);

            if (enemyLineAttackRot == 360) {
                enemyState = 4;
                enemyLineAttackRot = 0;
            }

        } else if (enemyState == 4) { // Line attack projectiles
            enemyStepTime = 100;

            if (enemyLineAttackRot < enemyLineAttackPos.length) {

                let bulletVelocity = [0, 0];

                
                // Alternate which direction the bullets start from and travel to
                if (enemyLineAttackRot % 2) {
                    bulletVelocity[0] = (enemyLineAttackPos[enemyLineAttackRot][0][0] - enemyLineAttackPos[enemyLineAttackRot][1][0])*-1;
                    bulletVelocity[1] = (enemyLineAttackPos[enemyLineAttackRot][0][1] - enemyLineAttackPos[enemyLineAttackRot][1][1])*-1;

                    fireEnemyBullet(enemyLineAttackPos[enemyLineAttackRot][0][0], enemyLineAttackPos[enemyLineAttackRot][0][1], bulletVelocity[0] * 2, bulletVelocity[1] * 2);
                } else {
                    bulletVelocity[0] = (enemyLineAttackPos[enemyLineAttackRot][0][0] - enemyLineAttackPos[enemyLineAttackRot][1][0]);
                    bulletVelocity[1] = (enemyLineAttackPos[enemyLineAttackRot][0][1] - enemyLineAttackPos[enemyLineAttackRot][1][1]);

                    fireEnemyBullet(enemyLineAttackPos[enemyLineAttackRot][1][0], enemyLineAttackPos[enemyLineAttackRot][1][1], bulletVelocity[0] * 2, bulletVelocity[1] * 2);
                }
            
                enemyLineAttackRot += 1;

            } else {
                //enemyState = 3;
                enemyLineAttackRot = 0;
                enemyLineAttackPos = [];
                stepsToNextState = 0;
                
                let lineCount = enemyLineAttacks.length
                for (i = 0; i < lineCount; i++) {
                    enemyLineAttacks[0].destroy();
                    enemyLineAttacks.shift();
                }
            }
        } else if (enemyState == 5) { // Spin attack
            enemyStepTime = 75;
            fireEnemyBullet(enemy.x, enemy.y, getCordFromAngle(100, enemyRot)[0], getCordFromAngle(100, enemyRot)[1]);
            enemyRot += 1;

            stepsToNextState -= 1;
        }

    }

    if (playerBombCount > 0) {
        if (bomb.isDown && bombLock == false) { // Dont spend all bombs at once by holding down the button
            enemyBullets.clear(true, true); // Deletes all of the enemy bullets
            bombLock = true;
            playerBombCount -= 1;
            playerBombText.setText('Bombs: ' + playerBombCount);
        } else if (bomb.isDown == false) {
            bombLock = false;
        }
    }


    // If player is pressing the fire button and it has been a certain amount of time since the last bullet was fired then fire a bullet
    if ((fire.isDown || fire2.isDown) && (currentTime - lastBulletFire) > 200) {
        firePlayerBullet();
        lastBulletFire = new Date(); // Save when this was so it knows how long it has been since the last bullet was fired
    }


    let newVelocity = {x: 0, y:0};

    // Player movement
    if (cursors.left.isDown) { // Left
        //player.setVelocityX(-200);
        newVelocity.x = -playerSpeed;
    } else if (cursors.right.isDown) { // Right
        //player.setVelocityX(200);
        newVelocity.x = playerSpeed;
    } else { // Neutral
        //player.setVelocityX(0);
        newVelocity.x = 0;
    }

    if (cursors.down.isDown) { // Down
        //player.setVelocityY(200);
        newVelocity.y = playerSpeed;
    } else if (cursors.up.isDown) { // Up
        //player.setVelocityY(-200);
        newVelocity.y = -playerSpeed;
    } else { // Neutral
        //player.setVelocityY(0);
        newVelocity.y = 0;
    }

    if (slow.isDown) { // slowing down movement if holding shift
        newVelocity.x /= 2;
        newVelocity.y /= 2;
    }
    
    player.visible = (slow.isDown) ? true : false; // showing the hitbox

    player.setVelocityX(newVelocity.x);
    player.setVelocityY(newVelocity.y);

    playerSprite.x = player.x;
    playerSprite.y = player.y;

    // Updating the current step
    lastEnemyStep = enemyStep;
}


// Player bullet firing function
function firePlayerBullet() {
    // Making the bullet
    if (playerPower == 1) { // One bullet
        let bullet = playerBullets.create(player.x, player.y, 'playerBullet');

        //bullet.setCollideWorldBounds(true);
    
        // Setting its velocity
        bullet.setVelocity(0, -600);
    } else if (playerPower == 2) { // Two bullets
        let bullet1 = playerBullets.create(player.x - 10, player.y, 'playerBullet');
        let bullet2 = playerBullets.create(player.x + 10, player.y, 'playerBullet');

        bullet1.setVelocity(0, -600);
        bullet2.setVelocity(0, -600);
    } else { // Three bullets
        let bullet = playerBullets.create(player.x, player.y - 5, 'playerBullet');
        let bullet1 = playerBullets.create(player.x - 15, player.y, 'playerBullet');
        let bullet2 = playerBullets.create(player.x + 15, player.y, 'playerBullet');

        bullet.setVelocity(0, -600);
        bullet1.setVelocity(0, -600);
        bullet2.setVelocity(0, -600);
    }
}

// Enemy bullet firing function
function fireEnemyBullet(x, y, velocityX, velocityY) {
    // Making the bullet
    let bullet = enemyBullets.create(x, y, 'playerBullet');

    // Setting its velocity based on arguments
    bullet.setVelocity(velocityX, velocityY);
}

// Damaging enemy function
function damageEnemy(enemy, bullet) {
    enemyHP -= 1; // Dealing damage
    //console.log(enemyHP);
    bullet.destroy(); // Destroying the playerBullet that hit the enemy

    if (enemyHP == 0) { // Game over if enemy has 0 HP
        this.physics.pause();
        gameOver = true;
    } else if (enemyHP % 50 == 0) {
        if (enemyHP % 100 == 0) {
            spawnHealth(Math.random() * config.width + 1, 0, 0, 150);
        } else {
            spawnPowerUP(Math.random() * config.width + 1, 0, 0, 150);
        }
    }

    let barProgress = enemyHP / enemyMaxHP;
    //console.log(barProgress);
    enemyHPBar.clear();
    enemyHPBar.fillStyle(0xff0000, 1);
    enemyHPBar.fillRect(0, 0, barProgress * config.width, 30);
}

// Damaging the player function
function damagePlayer(player, bullet) {
    if (debugMode == false) {
        playerHP -= 1; // Dealing damage
    }
    playerHPText.setText('HP: ' + playerHP); // Updating the UI with the current player HP
    bullet.destroy(); // Destroying the enemy bullet

    if (playerHP == 0) { // Game over if the player has 0 HP
        this.physics.pause();
        gameOver = true;
    }
}

// Calculating the x and y of a point on a cirlce with any given angle
function getCircleAngleCoord(radius, angle) {
    // https://stackoverflow.com/a/43642478
    angle = (angle - 90) * Math.PI/180;
    return [radius*Math.cos(angle), -radius*Math.sin(angle)];
}

function getPowerUp(player, powerUp) {
    playerPower += 1;
    powerUp.destroy();
}

function getHealth(player, healthUp) {
    playerHP += 1;
    playerHPText.setText('HP: ' + playerHP); // Updating the UI with the current player HP
    healthUp.destroy();
}

function spawnPowerUP(x, y, velocityX, velocityY) {

    if (playerPower == 4) {
        return;
    }

    let powerUp = powerUps.create(x, y, 'powerUp');

    powerUp.setVelocity(velocityX, velocityY);
}

function spawnHealth(x, y, velocityX, velocityY) {
    let healthUp = health.create(x, y, 'health');

    healthUp.setVelocity(velocityX, velocityY);
}

function getCordFromAngle(radius, angle) {
    let opposite = Math.sin(angle) * radius; // x axis
    let adjacent = Math.cos(angle) * radius; // y axis

    return [opposite, adjacent];
}

function gameOverScreen(thisRef) {
    if (gameOverLoad) {
        gameOverSprite = thisRef.physics.add.sprite(config.width / 2, config.height / 2, 'clearScreen');

        let outputText = (enemyHP <= 0) ? 'You win' : 'You died';
        thisRef.add.text(100, 100, outputText, {fontSize: '32px', fill: '#FFFFFF'});

        if (enemyHP <= 0) {
            let score = Math.floor(((1000* playerPower) + (((currentTime - gameStartTime) / 1000)*-1))*playerHP);
            thisRef.add.text(100, 150, 'Score: ' + score, {fontSize: '32px', fill: '#FFFFFF'})
        }

        gameOverLoad = false;
    }
}
