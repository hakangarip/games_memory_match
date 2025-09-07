import { Matches } from "./matches.js";
import { Score } from "./score.js";
import { Timer } from "./timer.js";

export class TopPanel extends Phaser.GameObjects.Container {
    constructor(scene, x, y, gameScene, dimensions) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.gameScene = gameScene;
        this.dimensions = dimensions;
        this.scene.add.existing(this);
        this.init();
    }

    init() {
        // Left-to-right layout: Back, Timer, Score, Matches
        const positions = [-200, -65, 65, 200];

        // Back button (asset key 'back_button' preloaded in BootScene)
        this.backButton = this.scene.add.sprite(positions[0], 0, "back_button").setInteractive({ useHandCursor: true });
        // this.backButton.setOrigin(0.5);
        // this.backButton.setScale(0.6);
        this.add(this.backButton);
        this.backButton.on("pointerdown", () => {
            const s = this.scene.sound.add('click1');
            if (s) s.play();
            this.scene.scene.start("menu");
        });

        // Timer, Score, Matches (each is a small container)
        this.timer = new Timer(this.scene, positions[1], 0);
        this.add(this.timer);

        this.score = new Score(this.scene, positions[2], 0);
        this.add(this.score);

        this.matches = new Matches(this.scene, positions[3], 0);
        this.add(this.matches);

        this.visible = false;
    }

    show() {
        if (this.visible) return;
        this.visible = true;
        // Ensure matches count is synced with current board
        if (this.scene.gamePlay && this.scene.gamePlay.rows && this.scene.gamePlay.cols) {
            this.matches.value = (this.scene.gamePlay.rows * this.scene.gamePlay.cols) / 2;
            this.matches.matchNumTxt.text = this.matches.value;
        }
        this.alpha = 1;
    }

    hide() {
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0 },
            duration: 150,
            ease: "Power0",
            onComplete: () => {
                this.visible = false;
            }
        });
    }
}