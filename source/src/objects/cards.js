export class Cards extends Phaser.GameObjects.Container {
    constructor(scene, x, y, randomCard) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.randomCard = randomCard;
        this.scene.add.existing(this);

        this.init();
    }

    init() {
    this.shadow = this.scene.add.sprite(0, 0, "sheet", "shadow");
        this.shadow.setOrigin(0.5);
        this.add(this.shadow);
        this.shadow.alpha = 0;

    this.whiteBotShadow = this.scene.add.sprite(0, 0, "sheet", "card_glow");
        this.whiteBotShadow.setOrigin(0.5);
        this.add(this.whiteBotShadow);
        this.whiteBotShadow.alpha = 0;

    // Bottom (face) card frame from atlas (use an existing generic card frame)
    this.bottomCard = this.scene.add.sprite(0, 0, "sheet", "chickencard");
        this.bottomCard.setOrigin(0.5);
        this.add(this.bottomCard);
        this.bottomCard.alpha = 0;

    // Animal image (standalone texture loaded by key)
    this.card = this.scene.add.image(0, 0, this.randomCard);
    this.card.setOrigin(0.5);
    this.add(this.card);
    this.card.alpha = 0;

    this.topCard = this.scene.add.sprite(0, 0, "sheet", 'chickencard_close');
        this.topCard.setOrigin(0.5);
        this.add(this.topCard);

        this.whiteTopShadow = this.scene.add.sprite(0, 0, "sheet", 'card_glow');
        this.whiteTopShadow.setOrigin(0.5);
        this.add(this.whiteTopShadow);

    // Invisible interactive target; reuse the close frame
    this.target = this.scene.add.sprite(0, 0, "sheet", 'chickencard_close');
        this.target.setOrigin(0.5);
        this.add(this.target);
        this.target.alpha = .0001;
    // Normalized name from key to match pairs
    this.target.name = this.randomCard;
        this.target.shadow = this.shadow;
        this.target.bottomCard = this.bottomCard;
        this.target.card = this.card;
        this.target.topCard = this.topCard;
        this.target.whiteTopShadow = this.whiteTopShadow;
        this.target.whiteBotShadow = this.whiteBotShadow;
        this.target.used = false;

        this.target.setInteractive();
        this.target.input.alwaysEnabled = true;
        this.target.on("pointerdown", () => {
            this.onTap(this.target);
        });

        this.visible = true;
    }

    onTap(sprite) {
        if (!this.scene.gamePlay.canclick) return;
        if (this.scene.gamePlay.clickedArr.length >= 2) return;
        this.scene.sound.add('card').play();

        this.scene.gamePlay.clickedArr.push(sprite);
        this.scene.gamePlay.stopHint()

        this.cardTween(sprite);
        sprite.used = true;
        this.scene.gamePlay.canclick = false;
        this.scene.topPanel.timer.start()

        this.scene.gamePlay.startHint()

        if (this.scene.gamePlay.clickedArr.length == 2) {
            if (this.scene.gamePlay.clickedArr[0].name == this.scene.gamePlay.clickedArr[1].name) {
                this.scene.time.addEvent({
                    delay: 750,
                    callback: () => {
                        this.scene.gamePlay.clickedArr.forEach(element => {
                            element.visible = false;
                        });
                        this.completeTween();
                        this.scene.topPanel.score.updateCount(50)
                        this.scene.topPanel.matches.updateCount(1)
                        this.scene.gamePlay.clickedArr = [];
                    }
                });
            } else {
                this.scene.time.addEvent({
                    delay: 750,
                    callback: () => {
                        this.returnTween();
                    }
                });
            }
        }
    }

    cardTween(sprite) {
        this.scene.tweens.add({
            targets: [sprite.topCard, sprite.whiteTopShadow],
            scaleX: 0,
            y: sprite.topCard.y - 50,
            ease: "Linear",
            duration: 200,
            onComplete: () => {
                sprite.disableInteractive();
                sprite.bottomCard.scaleX = 0;
                sprite.shadow.scaleX = 0;
                sprite.card.scaleX = 0;
                sprite.whiteBotShadow.scaleX = 0;
                this.scene.tweens.add({
                    targets: [sprite.bottomCard, sprite.shadow, sprite.card, sprite.whiteBotShadow],
                    alpha: 1,
                    scaleX: sprite.bottomCard.scaleY,
                    y: {
                        from: sprite.bottomCard.y - 50,
                        to: sprite.bottomCard.y
                    },
                    ease: "Linear",
                    duration: 200,
                });

                this.scene.tweens.add({
                    targets: [sprite.topCard, sprite.whiteTopShadow],
                    scaleX: sprite.topCard.scaleX,
                    y: sprite.topCard.y + 50,
                    ease: "Linear",
                    duration: 300,
                    onComplete: () => {
                        this.scene.gamePlay.canclick = true;
                    }
                });
            }
        });
    }

    returnTween() {
        this.scene.gamePlay.canclick = false;

        for (let i = 0; i < this.scene.gamePlay.clickedArr.length; i++) {
            this.scene.tweens.add({
                targets: [this.scene.gamePlay.clickedArr[i].bottomCard, this.scene.gamePlay.clickedArr[i].shadow, this.scene.gamePlay.clickedArr[i].card, this.scene.gamePlay.clickedArr[i].whiteBotShadow],
                scaleX: 0,
                y: {
                    from: this.scene.gamePlay.clickedArr[i].bottomCard.y,
                    to: this.scene.gamePlay.clickedArr[i].bottomCard.y
                },
                ease: "Linear",
                duration: 300,
            });
            this.scene.tweens.add({
                targets: [this.scene.gamePlay.clickedArr[i].topCard, this.scene.gamePlay.clickedArr[i].whiteTopShadow],
                scaleX: 0,
                y: this.scene.gamePlay.clickedArr[i].topCard.y - 50,
                ease: "Linear",
                duration: 200,
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: [this.scene.gamePlay.clickedArr[i].topCard, this.scene.gamePlay.clickedArr[i].whiteTopShadow],
                        scaleX: this.scene.gamePlay.clickedArr[i].topCard.scaleY,
                        y: this.scene.gamePlay.clickedArr[i].topCard.y + 50,
                        ease: "Linear",
                        duration: 300,
                        onComplete: () => {
                            this.scene.gamePlay.clickedArr = [];
                            this.scene.gamePlay.canclick = true;
                        }
                    });
                }
            });
            this.scene.gamePlay.clickedArr[i].setInteractive();
            this.scene.gamePlay.clickedArr[i].used = false;
        }
    }

    completeTween() {
        for (let i = 0; i < this.scene.gamePlay.clickedArr.length; i++) {
            this.scene.tweens.add({
                targets: [this.scene.gamePlay.clickedArr[i].bottomCard, this.scene.gamePlay.clickedArr[i].shadow, this.scene.gamePlay.clickedArr[i].card, this.scene.gamePlay.clickedArr[i].whiteTopShadow, this.scene.gamePlay.clickedArr[i].whiteBotShadow],
                scale: this.scene.gamePlay.clickedArr[i].bottomCard.scale + .3,
                alpha: 0,
                ease: "Cubic.easeOut",
                duration: 300,
            });
        }
    }
}