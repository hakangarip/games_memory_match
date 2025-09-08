import { Cards } from './cards.js';

export class GamePlay extends Phaser.GameObjects.Container {
    constructor(scene, x, y, dimensions) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.scene.add.existing(this);

        this.init();
    }

    init() {
        this.cardShown = false;
        this.cardShuffle = false;

        this.tiles = [];
        // Default board is 2x2 unless user unlocks full access
        let savedRows = parseInt(localStorage.getItem('mm_rows')) || 2;
        let savedCols = parseInt(localStorage.getItem('mm_cols')) || 2;
    const fullAccess = (localStorage.getItem('mm_full_access') === '1') || (sessionStorage.getItem('mm_full_access_session') === '1');
        if (!fullAccess) {
            savedRows = 2;
            savedCols = 2;
            try {
                localStorage.setItem('mm_rows', '2');
                localStorage.setItem('mm_cols', '2');
            } catch(e) { /* noop */ }
        }
        this.rows = savedRows;
        this.cols = savedCols;
        this.clickedArr = [];

        this.blocksGroup = this.scene.add.container(0, 0);
        this.add(this.blocksGroup);

        this.hand = this.scene.add.sprite(0, 0, "sheet", 'hand');
        this.hand.setOrigin(0.5);
        this.hand.angle = -30
        this.add(this.hand);
        this.hand.alpha = 0;

        this.visible = false;

        // this.scene.time.addEvent({
        //     delay:1000,
        //     callback:()=>{
        // this.show();
        //     }
        // })
    }

    show() {
        this.totalMatches = (this.rows * this.cols) / 2;

        this.calculateStartValues();

        this.addCards();
        this.startCount = this.rows - 1;

        if (this.visible) return;
        this.visible = true;

        this.startTween(this.startCount);

    }

    addCards() {
        let startX = this.startX;
        let startY = this.startY;

        // Pull full animal key list from registry set by BootScene
        let animalKeys = this.scene.registry.get('animalKeys') || [];
        // Fallback to atlas frames if dynamic load not available
        if (!animalKeys.length) {
            animalKeys = ['chicken', 'crab', 'elephant', 'monkey', 'octopus'];
        }

        // Choose totalMatches unique animals randomly
        Phaser.Utils.Array.Shuffle(animalKeys);
        const chosen = animalKeys.slice(0, this.totalMatches);
        const arr2 = chosen.concat(chosen);
        Phaser.Actions.Shuffle(arr2);
        let count = 0;
        for (let i = 0; i < this.rows; i++) {
            startX = this.startX;
            let arr = [];
            for (let j = 0; j < this.cols; j++) {
                let frame = arr2[count];
                count++;
                let tile = new Cards(this.scene, 0, 0, frame);
                tile.setScale(this.tileScale);
                this.blocksGroup.add(tile);
                tile.x = startX
                tile.y = startY

                tile.alpha = 0
                tile.row = i;
                tile.col = j;
                tile.xVal = startX;
                tile.yVal = startY;
                tile.name = frame

                startX += this.tileWidth;
                arr.push(tile);
            }
            startY += this.tileHeight;
            this.tiles.push(arr);
        }
        this.blocksGroup.reverse();
    }

    shuffleCards() {
        this.shuffleArr = [];
        this.currentArr = [];
        this.canclick = false
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {

                if (this.tiles[i][j]) {
                    let obj = {};
                    this.currentArr.push(this.tiles[i][j]);
                    obj.row = this.tiles[i][j].row;
                    obj.col = this.tiles[i][j].col;
                    obj.xVal = this.tiles[i][j].xVal;
                    obj.yVal = this.tiles[i][j].yVal;
                    this.shuffleArr.push(obj);
                }
            }
        }
        Phaser.Actions.Shuffle(this.shuffleArr);
        for (let i = 0; i < this.currentArr.length; i++) {
            this.currentArr[i].row = this.shuffleArr[i].row;
            this.currentArr[i].col = this.shuffleArr[i].col;
        }

        this.shuffleTween();
    }

    shuffleTween() {
        let dummyArr = [];
        let speed = 500;
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                let card = this.tiles[i][j];
                dummyArr.push(card);
                let newX = this.startX + (card.col * this.tileWidth);
                let newY = this.startY + (card.row * this.tileHeight);

                let scale = card.scaleX * 2;
                this.scene.tweens.add({
                    targets: card,
                    scaleX: scale,
                    scaleY: scale,
                    yoyo: true,
                    ease: "Linear",
                    duration: speed / 2,
                });
                this.scene.tweens.add({
                    targets: card,
                    x: newX,
                    ease: "Linear",
                    duration: speed,
                });

                this.scene.tweens.add({
                    targets: card,
                    y: newY,
                    ease: "Linear",
                    duration: speed,
                    onComplete: () => {
                        this.canclick = true;
                    }
                });

            }
        }

        this.hintDelay = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.showHint();
            }
        });
    }

    startTween(count) {
        if (this.startCount < 0) {
            if (this.cardShown) {
                this.scene.time.addEvent({
                    delay: 100,
                    callback: () => {
                        this.cardFirstRevealTween();
                        this.scene.time.addEvent({
                            delay: 2000,
                            callback: () => {
                                this.cardFirstReturnTween();
                                if (this.cardShuffle) {
                                    this.scene.time.addEvent({
                                        delay: 1000,
                                        callback: () => {
                                            this.shuffleCards();
                                        }
                                    });
                                } else {
                                    this.canclick = true;
                                    this.hintDelay = this.scene.time.addEvent({
                                        delay: 1000,
                                        callback: () => {
                                            this.showHint();
                                        }
                                    });
                                }
                            }
                        })
                    }
                });
            } else {
                if (this.cardShuffle) {
                    this.scene.time.addEvent({
                        delay: 1000,
                        callback: () => {
                            this.shuffleCards();
                        }
                    });
                } else {
                    this.canclick = true;
                    this.hintDelay = this.scene.time.addEvent({
                        delay: 500,
                        callback: () => {
                            this.showHint();
                        }
                    });
                }
            }
        }
        if (this.startCount < 0) return;
        this.scene.time.addEvent({
            delay: this.cols * 100,
            callback: () => {
                this.firstRound = true;
                this.startCount--;
                this.startTween(this.startCount);
            }
        });
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.scene.time.addEvent({
                    delay: j * 100,
                    callback: () => {
                        this.scene.tweens.add({
                            targets: this.tiles[count][j],
                            alpha: 1,
                            y: { from: this.tiles[count][j].y - 400, to: this.tiles[count][j].y },
                            ease: "Quad.easeOut",
                            duration: 250,
                            onComplete: () => {
                                if (this.rows > count && this.firstRound) {
                                    this.tiles[count][j].alpha = 1;
                                }
                            }
                        });
                    }
                });
            }
        }
    }

    calculateStartValues() {

        let r = this.rows / 2;
        let c = this.cols / 2;

        r -= 0.5;
        c -= 0.5;
    if (this.rows > 3 && this.cols < this.rows) this.tileScale = (r * -.1) + .425;
    else this.tileScale = (c * -.1) + .425;

    // Make cards a touch larger overall (~4%)
    this.tileScale *= 1.04;

        this.tileWidth = 473 * this.tileScale;
        this.tileHeight = 656 * this.tileScale;

        this.startX = -((this.cols / 2) * this.tileWidth) + (this.tileWidth / 2);
        this.startY = -((this.rows / 2) * this.tileHeight) + (this.tileHeight / 2);
    }

    cardFirstRevealTween() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.scene.tweens.add({
                    targets: [this.tiles[i][j].topCard,this.tiles[i][j].whiteTopShadow],
                    scaleX: 0,
                    y: this.tiles[i][j].topCard.y - 50,
                    ease: "Linear",
                    duration: 200,
                    onComplete: () => {
                        this.tiles[i][j].disableInteractive();
                        this.tiles[i][j].bottomCard.scaleX = 0;
                        this.tiles[i][j].shadow.scaleX = 0;
                        this.tiles[i][j].card.scaleX = 0;
                        this.tiles[i][j].whiteBotShadow.scaleX = 0;
                        this.scene.tweens.add({
                            targets: [this.tiles[i][j].bottomCard, this.tiles[i][j].shadow, this.tiles[i][j].card, this.tiles[i][j].whiteBotShadow],
                            alpha: 1,
                            scaleX: this.tiles[i][j].bottomCard.scaleY,
                            y: { from: this.tiles[i][j].bottomCard.y - 50, to: this.tiles[i][j].bottomCard.y },
                            ease: "Linear",
                            duration: 200,

                        });

                        this.scene.tweens.add({
                            targets: this.tiles[i][j].topCard,
                            scaleX: this.tiles[i][j].topCard.scaleX,
                            y: this.tiles[i][j].topCard.y + 50,
                            ease: "Linear",
                            duration: 300,
                        });
                    }
                });
            }
        }
    }

    cardFirstReturnTween() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.scene.tweens.add({
                    targets: [this.tiles[i][j].bottomCard, this.tiles[i][j].shadow, this.tiles[i][j].card, this.tiles[i][j].whiteBotShadow],
                    scaleX: 0,
                    y: { from: this.tiles[i][j].bottomCard.y, to: this.tiles[i][j].bottomCard.y },
                    ease: "Linear",
                    duration: 300,
                });
                this.scene.tweens.add({
                    targets:  [this.tiles[i][j].topCard,this.tiles[i][j].whiteTopShadow],
                    scaleX: 0,
                    y: this.tiles[i][j].topCard.y - 50,
                    ease: "Linear",
                    duration: 200,
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: [this.tiles[i][j].topCard,this.tiles[i][j].whiteTopShadow],
                            scaleX: this.tiles[i][j].topCard.scaleY,
                            y: this.tiles[i][j].topCard.y + 50,
                            ease: "Linear",
                            duration: 300,
                            onComplete: () => {}
                        });
                    }
                });
            }
        }
    }

    startHint() {
        if (this.hintDone) return;
        if (this.hintDelay) {
            this.scene.time.removeEvent(this.hintDelay);
            this.hintDelay = "";
        }
        this.hintDelay = this.scene.time.addEvent({ delay: 1000, callback: this.showHint, callbackScope: this });
        this.hintDone = true;
    }

    stopHint() {
        this.hint = false;
        this.hand.alpha = 0;
        if (this.hintDelay) {
            this.scene.time.removeEvent(this.hintDelay);
            this.hintDelay = "";
        }
        if (this.handTween) this.handTween.stop()
    }

    showHint() {
        this.index = 0;
        this.hint = true;
        this.hand.alpha = 1;
        this.hand.setScale(this.tileScale + .3);

        this.handTween = this.scene.tweens.add({
            targets: this.hand,
            scaleX: { from: this.hand.scaleX, to: this.hand.scaleX + .05 },
            scaleY: { from: this.hand.scaleY, to: this.hand.scaleY + .05 },
            ease: "Linear",
            duration: 700,
            yoyo: true,
            repeat: -1,
        });
        let count = 0;
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j].target.used) {
                    count++;
                }
            }
        }

        if (count % 2 != 0) this.firstTime = true;
        else this.firstTime = false;

        if (!this.firstTime) {
            let hintVal = false;
            let num1 = Phaser.Math.Between(0, this.tiles.length - 1);
            let num2 = Phaser.Math.Between(0, this.tiles[0].length - 1);
            for (let i = 0; i < this.tiles.length; i++) {
                for (let j = 0; j < this.tiles[i].length; j++) {
                    if (!this.tiles[i][j].target.used) {
                        this.hand.x = this.tiles[i][j].x + 10;
                        this.hand.y = this.tiles[i][j].y + 50;
                        if (i == num1 || j == num2) {
                            hintVal = true;
                            break;
                        }
                    }
                }
                if (hintVal) break;
            }
            this.firstTime = true
        } else {
            let hintData;

            for (let i = 0; i < this.tiles.length; i++) {
                for (let j = 0; j < this.tiles[i].length; j++) {
                    for (let k = 0; k < this.clickedArr.length; k++) {
                        if ((this.clickedArr[k].name == this.tiles[i][j].name + "card") && !this.tiles[i][j].target.used) {
                            hintData = this.tiles[i][j];
                            break;
                        }
                    }
                    if (hintData) break;
                }
                if (hintData) break;
            }
            if (!hintData) return;

            this.hand.x = hintData.x + 10;
            this.hand.y = hintData.y + 50;
            this.firstTime = false
        }
    }
}