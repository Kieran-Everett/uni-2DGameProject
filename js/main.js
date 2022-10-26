let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade'
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


let player;
let cursors;
let fire;
let playerBullets;
let playerHP = 3;
let playerHPText;

let enemy;
let enemyHP = 100;
let gameOver = false;
let enemyState = 2;
let enemyBullets;

let currentTime = new Date();
let lastBulletFire = 0;

let enemyStep = 0;
let lastEnemyStep = enemyStep;
let lastStepTime = currentTime;

let game = new Phaser.Game(config);


function preload() {
    this.load.image('character', 'assets/player.png');
    this.load.image('playerBullet', 'assets/playerBullet.png');
    this.load.image('enemy', 'assets/enemy.png');
}

function create() {
    player = this.physics.add.sprite(config.width / 2, 450, 'character');
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
    fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    playerBullets = this.physics.add.group();
    enemyBullets = this.physics.add.group();


    enemy = this.physics.add.sprite(config.width / 2, 200, 'enemy');

    playerHPText = this.add.text(10, 550, 'HP: ' + playerHP, { fontSize: '32px', fill: '#FFFFFF'});


    this.physics.add.overlap(enemy, playerBullets, damageEnemy, null, this);
    this.physics.add.overlap(player, enemyBullets, damagePlayer, null, this);
}

function update() {

    if (gameOver) return;

    currentTime = new Date();

    if (currentTime - lastStepTime > 500) {
        enemyStep += 1;
        lastStepTime = currentTime;
    }

    
    playerBullets.children.iterate(function (child) {
        child.setVelocityX(Math.sin(child.y / 25) * 200);
    });

    if (enemyStep > lastEnemyStep){

        if (enemyState == 1) {
            fireEnemyBullet(Math.random() * config.width + 1, 0, 0, 500);
        } else if (enemyState == 2) {
            // TODO Normalize the velocity vector
            
            /*
            let bulletVectorX = enemy.x - player.x;
            let bulletVectorY = enemy.y - player.y;
            bulletVectorX = vectorNormalize(bulletVectorX, bulletVectorY)[0];
            bulletVectorY = vectorNormalize(bulletVectorX, bulletVectorY)[1];
            
            bulletVectorX *= 100;
            bulletVectorY *= 100;

            fireEnemyBullet(enemy.x, enemy.y, bulletVectorX, bulletVectorY, 500);
            */
            
            fireEnemyBullet(enemy.x, enemy.y, (enemy.x - player.x) * -1, (enemy.y - player.y) * -1, 500);
        }

    }


    if (fire.isDown && (currentTime - lastBulletFire) > 200) {
        firePlayerBullet();
        lastBulletFire = new Date();
    }


    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.down.isDown) {
        player.setVelocityY(200);
    } else if (cursors.up.isDown) {
        player.setVelocityY(-200);
    } else {
        player.setVelocityY(0);
    }

    lastEnemyStep = enemyStep;
}


function firePlayerBullet() {
    let bullet = playerBullets.create(player.x, player.y, 'playerBullet');

    //bullet.setCollideWorldBounds(true);
    bullet.setVelocity(0, -300);
}

function fireEnemyBullet(x, y, velocityX, velocityY) {
    let bullet = enemyBullets.create(x, y, 'playerBullet');

    bullet.setVelocity(velocityX, velocityY);
}

function damageEnemy(enemy, bullet) {
    enemyHP -= 1;
    console.log(enemyHP);
    bullet.destroy();

    if (enemyHP == 0) {
        this.physics.pause();
        gameOver = true;
    }
}

function damagePlayer(player, bullet) {
    playerHP -= 1;
    playerHPText.setText('HP: ' + playerHP);
    bullet.destroy();

    if (playerHP == 0) {
        this.physics.pause();
        gameOver = true;
    }
}

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