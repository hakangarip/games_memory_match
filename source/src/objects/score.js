export class Score extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.scene.add.existing(this);

        this.init()
    }

    init() {
        this.value = 0;


    this.scoreBox = this.scene.add.sprite(0, 0, "sheet", "score_icon");
        // this.scoreBox.setOrigin(.5);
    // this.scoreBox.setScale(0.8);
        this.add(this.scoreBox);

        this.scoreNumTxt = this.scene.add.text(30, -5, this.value, {
            fontFamily: "ARCO",
            align: "center",
            fontSize: 28,
            fill: "#ffffff"
        });
        this.scoreNumTxt.setOrigin(0.5);
        this.add(this.scoreNumTxt);

        this.visible = false;
        this.show()
    }

    updateCount(amount) {
        this.value += amount;
        this.scoreNumTxt.text = this.value;
    }

    show() {
        if (this.visible) return;
        this.visible = true;

    }
}