export class Timer extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.scene.add.existing(this);

        this.init();
    }

    init() {

        this.timerCount = 0;
        this.initialTime = 0;

        this.timerBox = this.scene.add.sprite(0, 0, "sheet", "timer_icon");
        // this.timerBox.setOrigin(.5);
        // this.timerBox.setScale(0.8);
        this.add(this.timerBox);

        this.numTxt = this.scene.add.text(30, -5, this.formatTime(this.initialTime), {
            fontFamily: "ARCO",
            align: "center",
            fontSize: 28,
            fill: "#ffffff",
        });
        this.numTxt.setOrigin(0.5);
        this.add(this.numTxt);

        this.visible = false;
        this.show();
    }

    show() {
        if (this.visible) return;
        this.visible = true;

    }

    start() {
        if (this.timer) return;
        this.timer = this.scene.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true });
    }

    timerStop() {
        if (this.timer) {
            this.scene.time.removeEvent(this.timer);
            this.timer = "";
        }
    }

    hide() {
        if (this.timer) {
            this.scene.time.removeEvent(this.timer);
            this.timer = "";
            this.scene.tweens.add({
                targets: this,
                alpha: { from: 1, to: 0 },
                ease: "Linear",
                duration: 200,
            });
        }
    }

    formatTime(seconds) {
        var minutes = Math.floor(seconds / 60);
        var partInSeconds = seconds % 60;
        partInSeconds = partInSeconds.toString().padStart(2, '0');
        return `${minutes}:${partInSeconds}`;
    }

    onEvent() {
        this.initialTime += 1; // One second
        this.numTxt.setText(this.formatTime(this.initialTime));
    }
}