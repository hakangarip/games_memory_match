export class Intro extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.scene.add.existing(this);

        this.init()
    }

    init() {

        this.logo = this.scene.add.sprite(0, -150, "sheet", "logo");
        this.logo.setOrigin(0.5);
        this.add(this.logo);

    // Removed letter logo sprites (logo_d, logo_i, logo_k, logo_s) from start screen
    this.logoArr = [];

        this.playBtn = this.scene.add.sprite(0, 70, "sheet", "playBtn");
        this.playBtn.setOrigin(.5)
        this.add(this.playBtn);

        this.menuBtn = this.scene.add.sprite(-200, 250, "sheet", "setting");
        this.menuBtn.setOrigin(.5)
        this.add(this.menuBtn);

        // New: Full Access button between sound and settings
        this.fullAccessBtn = this.scene.add.sprite(0, 250, "sheet", "frame_1");
        this.fullAccessBtn.setOrigin(.5)
        this.fullAccessBtn.setScale(0.9)
        this.add(this.fullAccessBtn);

        this.fullAccessTxt = this.scene.add.text(0, 246, "Tüm Oyunu Aç", {
            fontFamily: "ARCO",
            align: "center",
            fontSize: 36,
            fill: "#ffffff"
        });
        this.fullAccessTxt.setOrigin(0.5);
        this.add(this.fullAccessTxt);

    this.soundBtn = this.scene.add.sprite(200, 250, "sheet", "sound_on");
        this.soundBtn.setOrigin(.5)
        this.add(this.soundBtn);

        this.cloud = this.scene.add.sprite(0, 380, "cloud");
        this.cloud.setOrigin(.5)
        this.add(this.cloud);

        this.cloudArr = [];
        let startX = 0;
        for (let i = 0; i < 25; i++) {
            let moveCloud = this.scene.add.sprite(startX, 420, "sheet", "cloud1");
            moveCloud.setOrigin(.5);
            this.add(moveCloud);
            this.cloudArr.push(moveCloud);

            startX -= 300;

        }

        this.playBtn.on("pointerdown", () => {
            this.onTap(this.playBtn);
        });

        this.menuBtn.on("pointerdown", () => {
            this.onTap(this.menuBtn);
        });

        this.fullAccessBtn.setInteractive();
        this.fullAccessBtn.on("pointerdown", () => {
            this.scene.sound.add('click1').play();
            // Grant full access immediately
            try {
                sessionStorage.setItem('mm_full_access_session', '1');
                // İleride reklam ile kalıcı açılacak; şimdilik sadece oturumluk.
            } catch(e) {}
            // Visual feedback
            this.scene.tweens.add({
                targets: [this.fullAccessBtn, this.fullAccessTxt],
                scale: { from: this.fullAccessBtn.scale, to: this.fullAccessBtn.scale - 0.1 },
                ease: "Linear",
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    // Toast mesaj
                    const toast = this.scene.add.text(0, 180, 'Tüm modlar açıldı!', {
                        fontFamily: 'ARCO',
                        fontSize: 42,
                        align: 'center',
                        color: '#ffffff'
                    }).setOrigin(0.5);
                    this.add(toast);
                    toast.alpha = 0;
                    this.scene.tweens.add({
                        targets: toast,
                        alpha: { from: 0, to: 1 },
                        y: { from: toast.y + 20, to: toast.y },
                        duration: 250,
                        ease: 'Power2',
                        onComplete: () => {
                            this.scene.tweens.add({
                                targets: toast,
                                alpha: { from: 1, to: 0 },
                                delay: 1200,
                                duration: 400,
                                onComplete: () => toast.destroy()
                            });
                        }
                    });
                    // Butonu ekrandan kaldır
                    this.scene.tweens.add({
                        targets: [this.fullAccessBtn, this.fullAccessTxt],
                        alpha: { from: 1, to: 0 },
                        duration: 300,
                        onComplete: () => {
                            this.fullAccessBtn.destroy();
                            this.fullAccessTxt.destroy();
                        }
                    });
                }
            });
        });

        this.soundBtn.on("pointerdown", () => {
            this.controlSound(this.soundBtn);
        });

    this.playBtn.alpha = 0;
    this.menuBtn.alpha = 0;
    this.fullAccessBtn.alpha = 0;
    this.fullAccessTxt.alpha = 0;
    this.soundBtn.alpha = 0;
        this.logo.alpha = 0;

    this.visible = false;
        this.show();
    }

    update() {
        super.update()

        for (let i = 0; i < this.cloudArr.length; i++) {
            this.cloudArr[i].x += .5;
        }
    }

    onTap(sprite) {
        this.scene.sound.add('click1').play();
        sprite.disableInteractive()
        if(this.playBtnTween)this.playBtnTween.stop()
        this.scene.tweens.add({
            targets: sprite,
            scale: {
                from: 1,
                to: 0.9,
            },
            duration: 100,
            ease: "Power0",
            yoyo: true,
            onComplete: () => {
                if (sprite == this.playBtn)
                    this.showGamePlay();
                else if (sprite == this.menuBtn)
                    this.showMenuBtn();
            }
        })
    }

    showGamePlay() {
        this.disable();
        this.hide();
        setTimeout(() => {
            this.scene.gamePlay.show();
            this.scene.topPanel.show();
        }, 210)
    }

    showMenuBtn() {
        this.disable();
        this.hide();
        setTimeout(() => {
            this.scene.menuBtn.show();
        }, 210)
    }

    controlSound(sprite) {
        this.scene.sound.add('click1').play();
        // Toggle mute deterministically
        const newMuted = !this.scene.sound.mute;
        this.scene.sound.mute = newMuted;
        // Update icon immediately from the new state
        sprite.setFrame(newMuted ? 'sound_off' : 'sound_on');
        // Persist
        try {
            localStorage.setItem('mm_sound_muted', newMuted ? '1' : '0');
        } catch (e) {
            // ignore storage errors
        }
        // Apply to existing bgm instance(s) so unmute is audible immediately
        try {
            const bgms = this.scene.sound.getAll('bgm');
            if (bgms && bgms.length > 0) {
                bgms.forEach(s => {
                    s.setMute(newMuted);
                    if (!newMuted && !s.isPlaying) {
                        try { s.play(); } catch(e) {}
                    }
                });
            } else if (!newMuted) {
                // If no instance exists and user unmuted, start one
                const music = this.scene.sound.add('bgm', { volume: .5, loop: true });
                music.play();
            }
        } catch (e) {
            // ignore
        }
        // Press animation
        sprite.setScale(1)
        this.scene.tweens.add({
            targets: sprite,
            scale: sprite.scale - .1,
            ease: "Linear",
            duration: 100,
            yoyo: true,
        })
    }

    enable() {
        this.playBtn.setInteractive();
        this.menuBtn.setInteractive();
        this.soundBtn.setInteractive();
    }

    disable() {
        this.playBtn.disableInteractive();
        this.menuBtn.disableInteractive();
        this.soundBtn.disableInteractive();
    }

    show() {
        if (this.visible) return;
        this.visible = true;

        // Ensure sound icon matches current mute state at show time
        try {
            const savedMuted = localStorage.getItem('mm_sound_muted');
            if (savedMuted !== null) {
                this.scene.sound.mute = savedMuted === '1';
            }
        } catch (e) {
            // ignore storage errors
        }
        if (this.scene.sound.mute) {
            this.soundBtn.setFrame('sound_off');
        } else {
            this.soundBtn.setFrame('sound_on');
        }

        this.scene.tweens.add({
            targets: this.logo,
            scale: {
                from: 2,
                to: 1,
            },
            alpha: {
                from: 0,
                to: 1,
            },
            duration: 300,
            ease: "Back.Out",
            onComplete: () => {
                // Letter logo animations removed
                this.scene.tweens.add({
                    targets: this.playBtn,
                    y: {
                        from: 0,
                        to: this.playBtn.y,
                    },
                    alpha: {
                        from: 0,
                        to: 1,
                    },
                    duration: 300,
                    ease: "Power2",
                    onComplete: () => {
                        this.playBtn.scaleX = this.playBtn.scaleY = 1
                        this.playBtnTween = this.scene.tweens.add({
                            targets: this.playBtn,
                            scale: {
                                from: 1,
                                to: 1 - .1
                            },
                            ease: "Linear",
                            yoyo: true,
                            repeat: -1,
                            duration: 700,
                        });
                        this.enable();
                    }
                })

                this.scene.tweens.add({
                    targets: this.menuBtn,
                    x: {
                        from: -250,
                        to: -150,
                    },
                    alpha: {
                        from: 0,
                        to: 1,
                    },
                    duration: 300,
                    ease: "Power2",
                })

                this.scene.tweens.add({
                    targets: this.soundBtn,
                    x: {
                        from: 250,
                        to: 200,
                    },
                    alpha: {
                        from: 0,
                        to: 1,
                    },
                    duration: 300,
                    ease: "Power2",
                })

                this.scene.tweens.add({
                    targets: [this.fullAccessBtn, this.fullAccessTxt],
                    alpha: {
                        from: 0,
                        to: 1,
                    },
                    duration: 300,
                    ease: "Power2",
                })
            }
        })
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
}