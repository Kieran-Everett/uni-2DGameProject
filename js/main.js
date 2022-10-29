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

// Defining global variables
let player;
let cursors;
let fire;
let playerBullets;
let playerHP = 3;
let playerHPText;

let enemy;
let enemyHP = 100;
let gameOver = false;
let enemyState = 3;
let enemyBullets;
let enemyLineAttacks;
let enemyLineAttackRot = 0;

let currentTime = new Date();
let lastBulletFire = 0;

let enemyStep = 0;
let enemyStepTime = 100;
let lastEnemyStep = enemyStep;
let lastStepTime = currentTime;

// Creating game object
let game = new Phaser.Game(config);


function preload() {
    // Loading assets
    this.load.image('character', 'assets/player.png');
    this.load.image('playerBullet', 'assets/playerBullet.png');
    this.load.image('enemy', 'assets/enemy.png');
}

function create() {
    // Setting up player physics
    player = this.physics.add.sprite(config.width / 2, 450, 'character');
    player.setCollideWorldBounds(true);

    // Variables for getting player inputs
    cursors = this.input.keyboard.createCursorKeys();
    fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    // Creating groups for bullets
    playerBullets = this.physics.add.group();
    enemyBullets = this.physics.add.group();
    //enemyLineAttacks = this.physics.add.group();

    // Enemy physics
    enemy = this.physics.add.sprite(config.width / 2, 200, 'enemy');

    // Displaying player HP text
    playerHPText = this.add.text(10, 750, 'HP: ' + playerHP, { fontSize: '32px', fill: '#FFFFFF'});


    // Collision
    this.physics.add.overlap(enemy, playerBullets, damageEnemy, null, this); // Enemy getting hit by playerBullets
    this.physics.add.overlap(player, enemyBullets, damagePlayer, null, this); // Player getting hit by enemyBullets
}

function update() {

    // If gameOver then don't run update
    if (gameOver) return;

    // Getting the current time for things that need delta time
    currentTime = new Date();

    // Calculating current step for the enemy AI
    // Each step lasts a number of miliseconds and then it increments the step count for controling certain behaviours like when the enemy fires
    if (currentTime - lastStepTime > enemyStepTime) {
        enemyStep += 1;
        lastStepTime = currentTime; // Updating lastStepTime so it knows how long as been since the last step took place
    }

    
    // Making the player's bullets wiggle by iterating over and applying a sine to their X velocity based on their Y position
    playerBullets.children.iterate(function (child) {
        child.setVelocityX(Math.sin(child.y / 25) * 200);
    });

    // If this is a new step then run this
    if (enemyStep > lastEnemyStep){

        // State machine stuff
        if (enemyState == 1) { // Random bullets falling from the top of the screen
            fireEnemyBullet(Math.random() * config.width + 1, 0, 0);
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
            
            fireEnemyBullet(enemy.x, enemy.y, (enemy.x - player.x) * -1, (enemy.y - player.y) * -1);
        } else if (enemyState == 3) {
            //fireEnemyLine(player.x, player.y, 10);
            enemyLineAttackRot += 10;
            this.add.line(
                player.x, // origin x
                player.y, // origin y
                getCircleAngleCoord(100, enemyLineAttackRot)[0]*-1, // start x
                getCircleAngleCoord(100, enemyLineAttackRot)[1]*-1, // start y
                getCircleAngleCoord(100, enemyLineAttackRot)[0], // end x
                getCircleAngleCoord(100, enemyLineAttackRot)[1], // end y
                0xff0000).setOrigin(0,0); // x, y, startx, starty, endx, endy, color, alpha
        }

    }


    // If player is pressing the fire button and it has been a certain amount of time since the last bullet was fired then fire a bullet
    if (fire.isDown && (currentTime - lastBulletFire) > 200) {
        firePlayerBullet();
        lastBulletFire = new Date(); // Save when this was so it knows how long it has been since the last bullet was fired
    }


    // Player movement
    if (cursors.left.isDown) { // Left
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) { // Right
        player.setVelocityX(200);
    } else { // Neutral
        player.setVelocityX(0);
    }

    if (cursors.down.isDown) { // Down
        player.setVelocityY(200);
    } else if (cursors.up.isDown) { // Up
        player.setVelocityY(-200);
    } else { // Neutral
        player.setVelocityY(0);
    }

    // Updating the current step
    lastEnemyStep = enemyStep;
}


// Player bullet firing function
function firePlayerBullet() {
    // Making the bullet
    let bullet = playerBullets.create(player.x, player.y, 'playerBullet');

    //bullet.setCollideWorldBounds(true);

    // Setting its velocity
    bullet.setVelocity(0, -300);
}

// Enemy bullet firing function
function fireEnemyBullet(x, y, velocityX, velocityY) {
    // Making the bullet
    let bullet = enemyBullets.create(x, y, 'playerBullet');

    // Setting its velocity based on arguments
    bullet.setVelocity(velocityX, velocityY);
}

function fireEnemyLine(x, y, length) {
    let line;
}

// Damaging enemy function
function damageEnemy(enemy, bullet) {
    enemyHP -= 1; // Dealing damage
    console.log(enemyHP);
    bullet.destroy(); // Destroying the playerBullet that hit the enemy

    if (enemyHP == 0) { // Game over if enemy has 0 HP
        this.physics.pause();
        gameOver = true;
    }
}

// Damaging the player function
function damagePlayer(player, bullet) {
    playerHP -= 1; // Dealing damage
    playerHPText.setText('HP: ' + playerHP); // Updating the UI with the current player HP
    bullet.destroy(); // Destroying the enemy bullet

    if (playerHP == 0) { // Game over if the player has 0 HP
        this.physics.pause();
        gameOver = true;
    }
}

/*
function vectorMagnitude(x, y) {
    return Math.sqrt((x * x) + (y * y));
}

function vectorNormalize(x, y) {
    let magnitude = vectorMagnitude(x, y);
    if (magnitude > 0) {
        let normX = x / magnitude;
        let normY = y / magnitude;
        //return Math.sqrt((normX * normX) + (normY * normY));
        return [normX, normY];
    } else {
        //return 0;
        return [0, 0];
    }
}
*/


//https://stackoverflow.com/questions/43641798/how-to-find-x-and-y-coordinates-on-a-flipped-circle-using-javascript-methods#:~:text=Typically%2C%20to%20find%20the%20x,sin(degrees%E2%80%8E%C2%B0)).
function getCircleAngleCoord(radius, angle) {
    /*
    let x = radius * Math.sin(Math.PI * 2 * angle / 360);
    let y = radius * Math.cos(Math.PI * 2 * angle / 360);
    return [x, y];
    */

    /*
    if (angle <= 90){
        let x = radius * Math.sin(Math.PI * 2 * angle / 360);
        let y = radius * Math.cos(Math.PI * 2 * angle / 360);
        return [x, y];
    } else if (angle <= 180) {
        let x = radius * Math.sin(Math.PI * 2 * (angle - 90) / 360);
        let y = radius * Math.cos(Math.PI * 2 * (angle - 90) / 360);
        return [x, y*-1];
    }
    */

    angle = (angle - 90) * Math.PI/180;
    return [radius*Math.cos(angle), -radius*Math.sin(angle)];
}