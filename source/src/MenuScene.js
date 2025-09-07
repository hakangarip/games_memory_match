import Phaser from 'phaser';
import { GamePlay } from './objects/game-play';
import { CTA } from './objects/cta';
import config from '../config';
import { TopPanel } from './objects/top-panel';
import { MenuBtn } from './objects/menu-btn';
import { Intro } from './objects/intro';
import { AdOverlay } from './objects/ad-overlay';

let gamedata = {}
gamedata.gameWidth = 960;
gamedata.gameHeight = 640;
gamedata.left = 0;
gamedata.top = 0;
gamedata.bottom = gamedata.gameHeight;
gamedata.right = gamedata.gameWidth;

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'menu' });
    }

    preload() {


    }



    create() {
        document.getElementById("loader").style.visibility = 'hidden'

        // Restore persisted mute state before creating/playing sounds
        try {
            const savedMuted = localStorage.getItem('mm_sound_muted');
            if (savedMuted !== null) {
                this.sound.mute = savedMuted === '1';
            }
        } catch (e) {
            // ignore storage errors
        }

        // Ensure only one bgm instance plays: collapse duplicates and reuse
        const existing = this.sound.getAll('bgm');
        let music;
        if (existing && existing.length > 0) {
            // Use the first instance, stop/destroy others
            music = existing[0];
            for (let i = 1; i < existing.length; i++) {
                try { existing[i].stop(); } catch(e) {}
                try { existing[i].destroy(); } catch(e) {}
            }
            music.setLoop(true);
            music.setMute(this.sound.mute === true);
            if (!music.isPlaying) music.play();
        } else {
            music = this.sound.add('bgm', { volume: .5, loop: true });
            music.setMute(this.sound.mute === true);
            music.play();
        }

        this.gameGroup = this.add.container();

        this.bg = this.add.sprite(0, 0, 'bg');
        this.bg.setOrigin(0.5);
        this.gameGroup.add(this.bg);

        this.params = config;

        this.gamePlayGrp = this.add.container();
        this.gameGroup.add(this.gamePlayGrp)

        this.gamePlay = new GamePlay(this, 0, 0, this);
        this.gamePlayGrp.add(this.gamePlay);

        this.topGrp = this.add.container();
        this.gameGroup.add(this.topGrp)

        this.topPanel = new TopPanel(this, 0, 0, this);
        this.topGrp.add(this.topPanel);

        this.introgrp = this.add.container();
        this.gameGroup.add(this.introgrp)

    this.intro = new Intro(this,0,0,this);
        this.introgrp.add(this.intro);

    this.menuGrp = this.add.container();
        this.gameGroup.add(this.menuGrp)

        this.menuBtn = new MenuBtn(this,0,0,this,this.gamedata);
        this.menuGrp.add(this.menuBtn);

    this.ctaGrp = this.add.container();
        this.gameGroup.add(this.ctaGrp)

        this.cta = new CTA(this, 0, 0, this);
        this.ctaGrp.add(this.cta);

        this.setPositions();

        this.gameGroup.bringToTop(this.cta)

    // Show startup ad once per session
    // this.adLayer = new AdOverlay(this, gamedata.gameWidth / 2, gamedata.gameHeight / 2);
    // this.gameGroup.add(this.adLayer);
    // this.adLayer.showOnce();
    }

    update() {
        super.update();
        this.gamePlay.update();
        this.intro.update();
    }

    restart() {
        this.scene.restart()
    }

    retry() {
        if (this.gamePlay) this.gamePlay.destroy();
        this.gamePlay = new GamePlay(this, 0, 0, this);
        this.gamePlayGrp.add(this.gamePlay);

        if (this.topPanel) this.topPanel.destroy();
        this.topPanel = new TopPanel(this, 0, 0, this);
        this.topGrp.add(this.topPanel);

        if (this.intro) this.intro.destroy();
        this.intro = new Intro(this, 0, 0, this);
        this.introgrp.add(this.intro);

        if (this.menuBtn) this.menuBtn.destroy();
        this.menuBtn = new MenuBtn(this, 0, 0, this, this.gamedata);
        this.menuGrp.add(this.menuBtn);

        if (this.cta) this.cta.destroy();
        this.cta = new CTA(this, 0, 0, this);
        this.ctaGrp.add(this.cta);

        // this.gamePlay.stopHint()

    }

    hideUI() {

        this.tweens.add({
            targets: this.gamePlay,
            alpha: { from: 1, to: 0 },
            ease: "Linear",
            duration: 150,
        })
        this.tweens.add({
            targets: this.topPanel,
            alpha: { from: 1, to: 0 },
            ease: "Linear",
            duration: 150,
        })
        this.tweens.add({
            targets: this.intro,
            alpha: { from: 1, to: 0 },
            ease: "Linear",
            duration: 150,
        })
        this.tweens.add({
            targets: this.menuBtn,
            alpha: { from: 1, to: 0 },
            ease: "Linear",
            duration: 150,
        })
    }

    setPositions() {

        this.gameGroup.y = 160
        this.gameGroup.x = -210

        this.bg.x = gamedata.gameWidth / 2;
        this.bg.y = gamedata.gameHeight / 2;

        this.ctaGrp.x = gamedata.gameWidth / 2;
        this.ctaGrp.y = gamedata.gameHeight / 2;

        this.gamePlayGrp.x = gamedata.gameWidth / 2;
        this.gamePlayGrp.y = gamedata.gameHeight / 2 + 60;

        this.menuGrp.x = gamedata.gameWidth / 2;
        this.menuGrp.y = gamedata.gameHeight / 2;

        this.introgrp.x = gamedata.gameWidth / 2;
        this.introgrp.y = gamedata.gameHeight / 2;

        this.topGrp.x = gamedata.gameWidth / 2;
        this.topGrp.y = gamedata.gameHeight / 2 - 400;

    }

    offsetMouse() {

        return {
            x: (this.game.input.activePointer.worldX),
            y: (this.game.input.activePointer.worldY)
        };
    }


}