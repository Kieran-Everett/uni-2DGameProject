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

let game = new Phaser.Game(config);


function preload() {
    this.load.image('character', 'assets/player.png');
}

function create() {
    player = this.physics.add.sprite(config.width / 2, 450, 'character');
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
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