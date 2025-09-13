import { AdService } from '../ads/adService';

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

        // Full access butonu: sadece oturumda daha önce açılmadıysa oluştur
        const sessionUnlocked = sessionStorage.getItem('mm_full_access_session') === '1';
    if (!sessionUnlocked) {
            this.fullAccessBtn = this.scene.add.sprite(0, 300, 'free_btn');
            this.fullAccessBtn.setOrigin(.45)
            this.fullAccessBtn.setScale(0.85)
            this.add(this.fullAccessBtn);
        } else {
            this.fullAccessBtn = null;
        }

    this.soundBtn = this.scene.add.sprite(100, 290, "sheet", "sound_on");
        this.soundBtn.setOrigin(.75)

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

    if (this.fullAccessBtn) {
    this.fullAccessBtn.setInteractive();
    this._unlockBusy = false;
    this.fullAccessBtn.on("pointerdown", () => {
            if (this._unlockBusy) return; // ignore rapid double taps
            this._unlockBusy = true;
            this.scene.sound.add('click1').play();
            // Give quick visual feedback and disable interaction while loading ad
            try { this.fullAccessBtn.disableInteractive(); } catch(e) {}
            this.scene.tweens.add({
                targets: [this.fullAccessBtn],
                scale: { from: this.fullAccessBtn.scale, to: this.fullAccessBtn.scale - 0.08 },
                duration: 80,
                yoyo: true
            });
            // Show rewarded ad; unlock only if rewarded
            (async () => {
                const res = await AdService.showRewarded();
                if (res && res.rewarded) {
                    try {
                        sessionStorage.setItem('mm_full_access_session', '1');
                    } catch (e) {}
                    // Visual feedback
                    this.scene.tweens.add({
                        targets: [this.fullAccessBtn],
                        scale: { from: this.fullAccessBtn.scale, to: this.fullAccessBtn.scale - 0.1 },
                        ease: "Linear",
                        duration: 100,
                        yoyo: true,
                        onComplete: () => {
                            const toast = this.scene.add.text(0, 180, 'All modes are unlocked!', {
                                fontFamily: 'ARCO',
                                fontSize: 30,
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
                            this.scene.tweens.add({
                                targets: [this.fullAccessBtn],
                                alpha: { from: 1, to: 0 },
                                duration: 300,
                                onComplete: () => {
                                    this.fullAccessBtn.destroy();
                                    this.fullAccessBtn = null;
                                    this._unlockBusy = false; // ensure flag reset even if destroyed
                                }
                            });
                        }
                    });
                } else {
                    // Optional: show hint when ad closed without reward
                    const toast = this.scene.add.text(0, 180, 'Watch the ad to unlock.', {
                        fontFamily: 'ARCO', fontSize: 26, color: '#ffffff'
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
                    // Re-enable button for another try since reward wasn't granted
                    try { if (this.fullAccessBtn) this.fullAccessBtn.setInteractive(); } catch(e) {}
                    this._unlockBusy = false;
                }
            })();
        });
    }


        this.soundBtn.on("pointerdown", () => {
            this.controlSound(this.soundBtn);
        });

    this.playBtn.alpha = 0;
    this.menuBtn.alpha = 0;
    if (this.fullAccessBtn) this.fullAccessBtn.alpha = 0;
    this.soundBtn.alpha = 0;
        this.logo.alpha = 0;

    this.visible = false;
        this.firstShowDone = false; // ilk animasyon oynatıldı mı
        this.show();
    }

    // Ayarlar ekranından geri dönerken güvenli şekilde butonları geri yüklemek için
    forceReturnShow() {
        this.firstShowDone = true;
        this.visible = true;
        this.alpha = 1;
        [this.logo, this.playBtn, this.menuBtn, this.soundBtn, this.fullAccessBtn].forEach(el=>{ if(el){ el.alpha = 1; }});
        if (!this.playBtnTween || (this.playBtnTween.playState !== 0 && this.playBtnTween.playState !== 1)) {
            this.playBtn.scaleX = this.playBtn.scaleY = 1;
            this.playBtnTween = this.scene.tweens.add({
                targets: this.playBtn,
                scale: { from: 1, to: 1 - .1 },
                ease: 'Linear',
                yoyo: true,
                repeat: -1,
                duration: 700,
            });
        }
        this.enable();
        [this.playBtn, this.menuBtn, this.soundBtn, this.fullAccessBtn].forEach(b=>{
            if (!b) return;
            if (b === this.fullAccessBtn && this._unlockBusy) return; // don't re-enable while ad is loading/showing
            if (!b.input) b.setInteractive(); else b.input.enabled = true;
        });
        try {
            if (this.scene.introgrp && !this.scene.introgrp.list.includes(this)) {
                this.scene.introgrp.add(this);
            }
            if (this.scene.gameGroup) this.scene.gameGroup.bringToTop(this.scene.introgrp);
        } catch(e) {}
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

        // Eğer ilk giriş animasyonu daha önce oynatıldıysa hızlı göster (animasyonsuz)
        if (this.firstShowDone) {
            this.visible = true;
            this.alpha = 1;
            this.logo.alpha = 1;
            this.playBtn.alpha = 1;
            this.menuBtn.alpha = 1;
            this.soundBtn.alpha = 1;
            if (this.fullAccessBtn) this.fullAccessBtn.alpha = 1;
            // Nabız tween'i yoksa ekle, varsa dokunma
    if (!this.playBtnTween || (this.playBtnTween.playState !== 0 && this.playBtnTween.playState !== 1)) {
                this.playBtn.scaleX = this.playBtn.scaleY = 1;
                this.playBtnTween = this.scene.tweens.add({
                    targets: this.playBtn,
                    scale: { from: 1, to: 1 - .1 },
                    ease: 'Linear',
                    yoyo: true,
                    repeat: -1,
                    duration: 700,
                });
            }
            // Her durumda etkileşimi yeniden aç
            // Her ihtimale karşı inputları yeniden aç ve hit area'ları tazele
            this.enable();
            [this.playBtn, this.menuBtn, this.soundBtn].forEach(b=>{
                if (b && !b.input) b.setInteractive();
                else if (b && b.input && !b.input.enabled) b.input.enabled = true;
            });
            if (this.fullAccessBtn) {
                if (!this._unlockBusy) {
                    if (!this.fullAccessBtn.input) this.fullAccessBtn.setInteractive();
                    else this.fullAccessBtn.input.enabled = true;
                }
            }
            return;
        }

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

                if (this.fullAccessBtn) {
                    this.scene.tweens.add({
                        targets: this.fullAccessBtn,
                        alpha: { from: 0, to: 1 },
                        duration: 300,
                        ease: "Power2",
                    })
                }
                this.firstShowDone = true;

                // İlk açılışta (oturumda bir kez) reklam izleme hatırlatması popup'ı göster
                const alreadyUnlocked = sessionStorage.getItem('mm_full_access_session') === '1' || localStorage.getItem('mm_full_access') === '1';
                if (!alreadyUnlocked && !sessionStorage.getItem('mm_unlock_hint_shown')) {
                    try { sessionStorage.setItem('mm_unlock_hint_shown','1'); } catch(e) {}
                    const hintContainer = this.scene.add.container(0, -20);
                    this.add(hintContainer);
                    const g = this.scene.add.graphics();
                    g.fillStyle(0x000000, 0.72);
                    g.fillRoundedRect(-340, -60, 680, 120, 28);
                    hintContainer.add(g);
                    const msg = this.scene.add.text(0, 0, 'Watch a short ad to \n unlock the game.', {
                        fontFamily: 'ARCO',
                        fontSize: 30,
                        align: 'center',
                        color: '#ffffff'
                    }).setOrigin(0.5);
                    hintContainer.add(msg);
                    hintContainer.alpha = 0;
                    this.scene.tweens.add({
                        targets: hintContainer,
                        alpha: { from: 0, to: 1 },
                        duration: 250,
                        ease: 'Power2',
                        onComplete: () => {
                            this.scene.tweens.add({
                                targets: hintContainer,
                                alpha: { from: 1, to: 0 },
                                delay: 2000,
                                duration: 400,
                                onComplete: () => hintContainer.destroy()
                            });
                        }
                    });
                }
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