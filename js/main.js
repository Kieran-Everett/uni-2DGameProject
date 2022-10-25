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
    player = this.physics.add.sprite(100, 450, 'character');
    player.setCollideWorldBounds(true);
}

function update() {

}