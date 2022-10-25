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
let enemy;
let enemyHP = 100;
let gameOver = false;

let currentTime = new Date();
let lastBulletFire = 0;

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


    enemy = this.physics.add.sprite(config.width / 2, 200, 'enemy');


    this.physics.add.overlap(enemy, playerBullets, damageEnemy, null, this);
}

function update() {

    if (gameOver) return;

    currentTime = new Date();

    
    playerBullets.children.iterate(function (child) {
        child.setVelocityX(Math.sin(child.y / 25) * 200);
    });


    if (fire.isDown && (currentTime - lastBulletFire) > 200) {
        fireBullet();
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
}


function fireBullet() {
    let bullet = playerBullets.create(player.x, player.y, 'playerBullet');

    //bullet.setCollideWorldBounds(true);
    bullet.setVelocity(0, -300);
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