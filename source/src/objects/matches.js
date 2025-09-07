export class Matches extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.scene.add.existing(this);

        this.init()
    }

    init() {

        this.value = (this.scene.gamePlay.rows * this.scene.gamePlay.cols) / 2;

    this.matchBox = this.scene.add.sprite(0, 0, "sheet", "matches_icon");
        // this.matchBox.setOrigin(.5);
    // this.matchBox.setScale(0.8);
        this.add(this.matchBox);

        this.matchNumTxt = this.scene.add.text(25, -5, this.value, {
            fontFamily: "ARCO",
            align: "center",
            fontSize: 28,
            fill: "#ffffff"
        });
        this.matchNumTxt.setOrigin(0.5);
        this.add(this.matchNumTxt);

        this.visible = false;
        this.show()
    }

    updateCount(amount) {
        if (this.value < 0) return;

        this.value -= amount;
        this.matchNumTxt.text = this.value;
        if (this.value < 0) {
            this.value = 0
            this.matchNumTxt.text = this.value
        }
        if (this.value == 0) {
            this.scene.topPanel.hide();
            this.scene.topPanel.timer.timerStop();
            this.scene.cta.show();
        }
    }

    show() {
        if (this.visible) return;
        this.visible = true;
    
    }
}