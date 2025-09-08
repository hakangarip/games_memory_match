export class CTA extends Phaser.GameObjects.Container {
    constructor(scene, x, y, gameScene) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.gameScene = gameScene;
        this.scene.add.existing(this);

        this.init();
    }

    show() {
        if (this.visible) return;

        this.visible = true;
        this.timeVal = this.scene.topPanel.timer.numTxt.text;
        this.scoreVal = this.scene.topPanel.score.value;
        this.scene.hideUI()
        this.timeTxt.text = this.timeVal;
        this.scene.gamePlay.stopHint()
        this.scoreTxt.text = this.scoreVal;
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0, to: 1 },
            ease: "Linear",
            duration: 350,
            onComplete: () => {
                for (let i = 0; i < this.starArr.length; i++) {
                    this.scene.time.addEvent({
                        delay: i * 100,
                        callback: () => {
                            this.scene.tweens.add({
                                targets: this.starArr[i],
                                alpha: { from: 0, to: 1 },
                                scale: { from: 3, to: this.starArr[i].scale },
                                ease: "Bounce.easeOut",
                                duration: 350,
                            });
                        }
                    });
                }
                this.scene.time.addEvent({
                    delay: 400,
                    callback: () => {
                        this.scene.tweens.add({
                            targets: this.winTxt,
                            alpha: { from: 0, to: 1 },
                            y: { from: this.winTxt.y - 200, to: this.winTxt.y },
                            ease: "Back.easeOut",
                            duration: 350,
                            onComplete: () => {
                                this.scene.tweens.add({
                                    targets: this.scoreBox,
                                    alpha: { from: 0, to: 1 },
                                    x: { from: this.scoreBox.x - 100, to: this.scoreBox.x },
                                    ease: "Linear",
                                    duration: 250,
                                    onComplete: () => {
                                        this.scene.tweens.add({
                                            targets: this.scoreIcon,
                                            alpha: { from: 0, to: 1 },
                                            x: { from: this.scoreIcon.x + 130, to: this.scoreIcon.x },
                                            ease: "Linear",
                                            duration: 250,
                                            onComplete: () => {
                                                this.scene.tweens.add({
                                                    targets: this.scoreTxt,
                                                    alpha: { from: 0, to: 1 },
                                                    ease: "Back.easeOut",
                                                    duration: 250
                                                });
                                            }
                                        });
                                    }
                                });
                                this.scene.tweens.add({
                                    targets: this.timeBox,
                                    alpha: { from: 0, to: 1 },
                                    x: { from: this.timeBox.x - 100, to: this.timeBox.x },
                                    ease: "Linear",
                                    duration: 250,
                                    onComplete: () => {
                                        this.scene.tweens.add({
                                            targets: this.timeIcon,
                                            alpha: { from: 0, to: 1 },
                                            x: { from: this.timeIcon.x + 130, to: this.timeIcon.x },
                                            ease: "Linear",
                                            duration: 250,
                                            onComplete: () => {
                                                this.scene.tweens.add({
                                                    targets: this.timeTxt,
                                                    alpha: { from: 0, to: 1 },
                                                    ease: "Back.easeOut",
                                                    duration: 250
                                                });
                                                this.scene.tweens.add({
                                                    targets: this.playBtn,
                                                    alpha: {
                                                        from: 0,
                                                        to: 1,
                                                    },
                                                    duration: 300,
                                                    ease: "Power2",
                                                    onComplete: () => {
                                                        this.playBtn.setInteractive();
                                                        this.playBtn.scaleX = this.playBtn.scaleY = 0.8
                                                        this.playBtnTween = this.scene.tweens.add({
                                                            targets: this.playBtn,
                                                            scale: {
                                                                from: 0.8,
                                                                to: 0.8 - .1
                                                            },
                                                            ease: "Linear",
                                                            yoyo: true,
                                                            repeat: -1,
                                                            duration: 700,
                                                        });
                                                    }
                                                });

                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    init() {
        this.winTxt = this.scene.add.sprite(0, -60, "sheet", "cta_text");
        this.winTxt.setOrigin(0.5);
        this.winTxt.setScale(1.25);
        this.add(this.winTxt);
        this.winTxt.alpha = 0;

        this.starArr = [];
        let startX = -160;
        for (let i = 0; i < 3; i++) {
            let star = this.scene.add.sprite(startX, -248, "sheet", "win_star");
            star.setOrigin(0.5);
            star.setScale(1.15);
            this.add(star);
            this.starArr.push(star);
            star.alpha = 0;
            if (i == 1) star.y = star.y - 120;
            startX += 160;
        }

        this.scoreBox = this.scene.add.sprite(-110, 108, "sheet", "cta_score");
        this.scoreBox.setOrigin(0.5);
        this.scoreBox.setScale(1.15);
        this.add(this.scoreBox);
        this.scoreBox.alpha = 0;

        this.scoreIcon = this.scene.add.sprite(this.scoreBox.x + 220, this.scoreBox.y, "sheet", "ctawin");
        this.scoreIcon.setOrigin(0.5);
        this.scoreIcon.setScale(1.15);
        this.add(this.scoreIcon);
        this.scoreIcon.alpha = 0;

        this.scoreTxt = this.scene.add.text(this.scoreBox.x + 220, this.scoreBox.y - 5, "", {
            fontFamily: "ARCO",
            align: "center",
            fontSize: 50,
            fill: "#ffffff",
        });
        this.scoreTxt.setOrigin(0.5);
        this.add(this.scoreTxt);
        this.scoreTxt.alpha = 0;

        this.timeBox = this.scene.add.sprite(-110, 228, "sheet", "cta_time");
        this.timeBox.setOrigin(0.5);
        this.timeBox.setScale(1.15);
        this.add(this.timeBox);
        this.timeBox.alpha = 0;

        this.timeIcon = this.scene.add.sprite(this.timeBox.x + 220, this.timeBox.y, "sheet", "ctawin");
        this.timeIcon.setOrigin(0.5);
        this.timeIcon.setScale(1.15);
        this.add(this.timeIcon);
        this.timeIcon.alpha = 0;

        this.timeTxt = this.scene.add.text(this.timeBox.x + 220, this.timeBox.y -5, "", {
            fontFamily: "ARCO",
            align: "center",
            fontSize: 50,
            fill: "#ffffff",
        });
        this.timeTxt.setOrigin(0.5);
        this.add(this.timeTxt);
        this.timeTxt.alpha = 0;

        this.playBtn = this.scene.add.sprite(0, 388, "sheet", "playBtn");
        this.playBtn.setOrigin(0.5);
        this.playBtn.setScale(0.8);
        this.add(this.playBtn);
        this.playBtn.alpha = 0;

        this.playBtn.on("pointerdown", () => {
            this.click(this.playBtn);
        });

        this.alpha = 0;
        this.visible = false;
        // this.show()
    }

    click(sprite) {
        this.scene.sound.add('click1').play();
        sprite.setInteractive()
        if(this.playBtnTween)this.playBtnTween.stop()
        this.scene.tweens.add({
            targets: sprite,
            scale: {
                from: .8,
                to: 0.7,
            },
            duration: 100,
            ease: "Power0",
            yoyo:true,
            onComplete: () => {
                // Increment games played counter
                try {
                    const n = parseInt(localStorage.getItem('mm_games_played')||'0')+1;
                    localStorage.setItem('mm_games_played', String(n));
                } catch(e) {}

                // If user has no full access and already played one game, enforce 2x2 next session
                try {
                    const full = localStorage.getItem('mm_full_access') === '1';
                    const played = parseInt(localStorage.getItem('mm_games_played')||'0');
                    if (!full && played >= 1) {
                        localStorage.setItem('mm_rows','2');
                        localStorage.setItem('mm_cols','2');
                    }
                } catch(e) {}

                this.scene.retry()
                this.hide()
            }
        })
    }

    hide() {
        if (!this.visible) return;
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0 },
            ease: "Linear",
            duration: 150,
            onComplete: () => {
                this.visible = false;
            }
        })
    }
}