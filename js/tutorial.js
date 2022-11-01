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

let startGame;

let game = new Phaser.Game(config);

function preload() {

}

function create() {
    startGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
}

function update() {
    if (startGame.isDown) {
        location.href = 'index.html';
    }
}