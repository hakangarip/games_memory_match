export class MenuBtn extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.scene.add.existing(this);

        this.init()
    }

    init() {

        // this.value = (this.scene.gamePlay.rows * this.scene.gamePlay.cols) / 2;
        this.rowArr = [];
        this.colArr = [];
        let xPos = [-150, 0, 150, -80, 80];
        let yPos = [-100, -100, -100, 0, 0];

        this.currentRow = 6;
        this.currentCol = 6;

        this.rows = this.scene.add.sprite(0, -425, "sheet", "rows");
        this.rows.setOrigin(0.5);
        this.rows.setScale(0.8);
        this.add(this.rows);

        for (let i = 0; i < 5; i++) {
            let frame = this.scene.add.sprite(xPos[i], yPos[i] - 220, "sheet", "frame_1");
            frame.setOrigin(0.5);
            frame.setScale(0.8);
            this.add(frame);

            let frameTxt = this.scene.add.text(xPos[i], yPos[i] - 223, (i + 2), {
                fontFamily: "ARCO",
                align: "center",
                fontSize: 45,
                fill: "#ffffff"
            });
            frameTxt.setOrigin(0.5);
            this.add(frameTxt);

            let frameDark = this.scene.add.sprite(xPos[i] - 1, yPos[i] - 216.5, "sheet", "overlay");
            frameDark.setScale(0.8);

            frameDark.setOrigin(0.5);
            this.add(frameDark);

            frame.overlay = frameDark;
            frameDark.visible = false;
            this.rowArr.push(frame);

            frame.isRow = true;
            frame.isCol = false;
            frame.arr = this.rowArr;
            frame.num = i + 2;
            frame.text = frameTxt;
            if (frame.num == 4) {
                frame.setFrame("green");
                frame.setScale(.85);
                frameTxt.setColor("#5f8202");
                frameTxt.setScale(1.1);
            }

            // frame.setInteractive();
            frame.on("pointerdown", () => {
                this.onTap(frame);
            });
        }

        this.cols = this.scene.add.sprite(0, -120, "sheet", "cols");
        this.cols.setOrigin(0.5);
        this.cols.setScale(0.8);
        this.add(this.cols);

        for (let i = 0; i < 5; i++) {
            let frame = this.scene.add.sprite(xPos[i], yPos[i] + 87, "sheet", "frame_1");
            frame.setOrigin(0.5);
            frame.setScale(0.8);
            this.add(frame);

            let frameTxt = this.scene.add.text(xPos[i], yPos[i] + 80, (i + 2), {
                fontFamily: "ARCO",
                align: "center",
                fontSize: 45,
                fill: "#ffffff"
            });
            frameTxt.setOrigin(0.5);
            this.add(frameTxt);

            let frameDark = this.scene.add.sprite(xPos[i] - 1, yPos[i] + 113.5, "sheet", "overlay");
            frameDark.setOrigin(0.5);
            this.add(frameDark);

            frame.overlay = frameDark;
            frame.overlay.visible = false;

            this.colArr.push(frame);

            frame.isRow = false;
            frame.isCol = true;

            frame.text = frameTxt;
            frame.num = i + 2;
            frame.arr = this.colArr;

            if (frame.num == 4) {
                frame.setFrame("green");
                frame.setScale(.85);
                frameTxt.setColor("#5f8202");
                frameTxt.setScale(1.1);
            }

            // frame.setInteractive();
            frame.on("pointerdown", () => {
                this.onTap(frame);
            });
        }


        this.preview = this.scene.add.sprite(-160, 190, "sheet", "preview");
        this.preview.setOrigin(.5)
        this.preview.setScale(.75)
        this.add(this.preview);

        this.previewBtn = this.scene.add.sprite(-160, 290, "sheet", "frame_1");
        this.previewBtn.setOrigin(.5)
        this.previewBtn.setScale(.8)
        this.add(this.previewBtn);

        this.previewBtnTick = this.scene.add.sprite(-160, 290, "sheet", "right");
        this.previewBtnTick.setOrigin(.5)
        this.add(this.previewBtnTick);

        this.shuffleFrame = this.scene.add.sprite(160, 190, "sheet", "shuffle");
        this.shuffleFrame.setOrigin(.5);
        this.shuffleFrame.setScale(.75)
        this.add(this.shuffleFrame);

        this.shuffleBtn = this.scene.add.sprite(160, 290, "sheet", "frame_1");
        this.shuffleBtn.setOrigin(.5)
        this.shuffleBtn.setScale(.8)
        this.add(this.shuffleBtn);

        this.shuffleBtnTick = this.scene.add.sprite(160, 290, "sheet", "right");
        this.shuffleBtnTick.setOrigin(.5)
        this.add(this.shuffleBtnTick);

        this.shuffleBtnTick.visible = false;
        this.previewBtnTick.visible = false;

        this.playBtn = this.scene.add.sprite(0, 380, "sheet", "playBtn");
        this.playBtn.setOrigin(.5)
        this.playBtn.setScale(.8)
        this.add(this.playBtn);


        this.playBtn.on("pointerdown", () => {
            this.showGamePlay(this.playBtn);
        });

        this.previewBtn.on("pointerdown", () => {
            this.onBtnClick(this.previewBtn);
        });

        this.shuffleBtn.on("pointerdown", () => {
            this.onBtnClick(this.shuffleBtn);
        });

        this.visible = false;
    }

    enable() {
        for (let i = 0; i < this.rowArr.length; i++) {
            this.rowArr[i].setInteractive();
        }

        for (let i = 0; i < this.colArr.length; i++) {
            this.colArr[i].setInteractive();
        }
        this.playBtn.setInteractive();
        this.previewBtn.setInteractive();
        this.shuffleBtn.setInteractive();

    }

    show() {
        if (this.visible) return;
        this.visible = true;
        this.alpha = 0;
        this.scene.tweens.add({
            targets: this,
            alpha: {
                from: 0,
                to: 1
            },
            duration: 200,
            ease: "Power0",
            onComplete: () => {
                this.playBtn.scaleX = this.playBtn.scaleY = .8
                this.scene.tweens.add({
                    targets: this.playBtn,
                    scale: {
                        from: .8,
                        to: .8 - .1
                    },
                    ease: "Linear",
                    yoyo: true,
                    repeat: -1,
                    duration: 700,
                });
                this.enable();
            }
        })
    }

    onBtnClick(sprite) {
        this.scene.sound.add('click1').play();

        if (sprite == this.previewBtn) {
            if (!this.previewBtnTick.visible) {
                this.previewBtnTick.visible = true;
                this.scene.gamePlay.cardShown = true;
            } else {
                this.scene.gamePlay.cardShown = false;
                this.previewBtnTick.visible = false;
            }
        } else if (sprite == this.shuffleBtn) {
            if (!this.shuffleBtnTick.visible) {
                this.shuffleBtnTick.visible = true;
                this.scene.gamePlay.cardShuffle = true;
            } else {
                this.shuffleBtnTick.visible = false;
                this.scene.gamePlay.cardShuffle = false;
            }
        }
    }

    disable() {
        for (let i = 0; i < this.rowArr.length; i++) {
            this.rowArr[i].disableInteractive();
        }

        for (let i = 0; i < this.colArr.length; i++) {
            this.colArr[i].disableInteractive();
        }
        this.playBtn.disableInteractive();
        this.previewBtn.disableInteractive();
        this.shuffleBtn.disableInteractive();

    }

    hide() {
        this.scene.tweens.add({
            targets: this,
            alpha: {
                from: 1,
                to: 0,
            },
            duration: 200,
            ease: "Power0",
            onComplete: () => {
                this.visible = false;
                this.alpha = 1;
            }
        })
    }

    showGamePlay() {
        this.scene.sound.add('click1').play();
        this.disable();
        this.hide();
        setTimeout(() => {
            this.scene.gamePlay.show();
            this.scene.topPanel.show();
        }, 210)
    }

    onTap(sprite) {
        this.scene.sound.add('click1').play();

        if (sprite.isRow) {

            for (let i = 0; i < sprite.arr.length; i++) {
                sprite.arr[i].setFrame("frame_1");
                sprite.arr[i].setScale(.8);
                sprite.arr[i].text.setScale(1);
                sprite.arr[i].text.setColor("#ffffff");
                sprite.text.setScale(1);

            }
            sprite.text.setColor("#5f8202");
            sprite.text.setScale(1.1);

            sprite.setFrame("green");
            sprite.setScale(.85);

            this.scene.gamePlay.rows = sprite.num;

            if (sprite.num % 2 != 0) {
                this.colDark();
            } else {
                this.colDarkHide();
            }

        } else if (sprite.isCol) {
            for (let i = 0; i < sprite.arr.length; i++) {
                sprite.arr[i].setFrame("frame_1");
                sprite.arr[i].setScale(.8);
                sprite.arr[i].text.setScale(1);
                sprite.arr[i].text.setColor("#ffffff");
                sprite.text.setScale(1);
            }
            sprite.text.setColor("#5f8202");
            sprite.text.setScale(1.1);

            sprite.setFrame("green");
            sprite.setScale(.85);

            this.scene.gamePlay.cols = sprite.num;

            if (sprite.num % 2 != 0) {
                this.rowDark();
            } else {
                this.rowDarkHide();
            }

        }
    }

    colDark() {
        for (let i = 0; i < this.colArr.length; i++) {
            if (this.colArr[i].num % 2 != 0) {
                this.colArr[i].disableInteractive();
                this.colArr[i].text.alpha = 0.5;

                this.scene.tweens.add({
                    targets: this.colArr[i],
                    angle: { from: 0, to: 10 },
                    yoyo: true,
                    repeat: 1,
                    ease: "Linear",
                    duration: 50,
                });
            }
        }
    }

    rowDark() {
        for (let i = 0; i < this.rowArr.length; i++) {
            if (this.rowArr[i].num % 2 != 0) {
                this.rowArr[i].text.alpha = 0.5;
                this.rowArr[i].disableInteractive();
                this.scene.tweens.add({
                    targets: this.rowArr[i],
                    angle: { from: 0, to: 10 },
                    yoyo: true,
                    repeat: 1,
                    ease: "Linear",
                    duration: 50,
                });
            }
        }
    }

    rowDarkHide() {
        for (let i = 0; i < this.rowArr.length; i++) {
            if (this.rowArr[i].text.alpha == .5) {
                this.rowArr[i].text.alpha = 1;
                this.rowArr[i].setInteractive();
            }
        }
    }

    colDarkHide() {
        for (let i = 0; i < this.colArr.length; i++) {
            if (this.colArr[i].text.alpha = .5) {
                this.colArr[i].text.alpha = 1;
                this.colArr[i].setInteractive();
            }
        }
    }
}