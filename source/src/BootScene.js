import Phaser from 'phaser';
import { AdService } from './ads/adService';
// Dynamically require all animal images at build-time
const animalsContext = (() => {
    try {
        // Webpack will bundle these and return URLs
        return require.context('../img/new_png_animals/256px', false, /\.png$/);
    } catch (e) {
        return null;
    }
})();

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'boot' });
    }

    preload() {
        const bg = this.add.rectangle(540/2, 960/2, 400, 30, 0x666666);
        const bar = this.add.rectangle(bg.x, bg.y, bg.width, bg.height, 0x1effff).setScale(0, 1);

        this.add.text(bg.x, bg.y - 50, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Initialize global mute from persisted state before any sounds are created/played
        try {
            const savedMuted = localStorage.getItem('mm_sound_muted');
            if (savedMuted !== null) {
                this.sound.mute = savedMuted === '1';
            }
        } catch (e) {
            // ignore storage errors
        }

        // Uygulama tam kapatılıp açıldığında unlock ve grid ayarlarını sıfırla
        try {
            // Unlock oturum ve kalıcı bayrakları temizle
            try { sessionStorage.removeItem('mm_full_access_session'); } catch(e) {}
            try { localStorage.removeItem('mm_full_access'); } catch(e) {}
            // Grid’i varsayılan 2x2’ye zorla
            localStorage.setItem('mm_rows','2');
            localStorage.setItem('mm_cols','2');
            // Diğer opsiyonel ayarları sıfırla (kart önizleme/karıştırma)
            localStorage.removeItem('mm_card_shown');
            localStorage.removeItem('mm_card_shuffle');
            // Sayaç ilk değerlerini kur (varsa dokunma ama yoksa 0 yap)
            if (!localStorage.getItem('mm_games_played')) localStorage.setItem('mm_games_played','0');
        } catch(e) { /* noop */ }

    this.load.image('bg', 'img/bg.png');
    this.load.image('cloud', 'img/cloud.png');
    this.load.image('free_btn', 'img/free.png');
    this.load.image('back_button', 'img/restore.png');
    this.loadFont('ARCO', 'fonts/ARCO.ttf');
        this.loadFont('ARCO for OSX', 'fonts/ARCO for OSX.otf');

        this.load.atlas('sheet', "img/sheet.png", "img/sheet.json");

        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

        this.load.audio('card', 'sounds/card.mp3');
        this.load.audio('click', 'sounds/click.mp3');
        this.load.audio('click1', 'sounds/click1.mp3');
        this.load.audio('bgm', 'sounds/bgm.mp3');
      

        this.fontsLoaded = false;
        this.assetsLoaded = false;
        // Load animal images and keep their keys for later random selection
        this.animalKeys = [];
        if (animalsContext) {
            animalsContext.keys().forEach((file) => {
                // console.log(file);
                const base = file.replace('./', '').replace(/\.png$/i, '');
                // Normalize key: spaces/dashes to underscores, prefix to avoid key clashes

                const processedBase = base.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
                const key = `animal_${processedBase.charAt(0).toUpperCase() + processedBase.slice(1)}`;
                const url = animalsContext(file);
                this.load.image(key, url);
                this.animalKeys.push(key);
            });
        }
        this.load.on('progress', function(progress) {
            bar.setScale(progress, 1);
        });

        this.load.on('complete', () => {
            this.assetsLoaded = true;
            // Share the animal keys with other scenes
            if (this.animalKeys && this.animalKeys.length) {
                this.registry.set('animalKeys', this.animalKeys);
            }
            // Try initializing Ad service early (no-op on web)
            try { AdService.init(); } catch(e) {}
        });
    }

    loadFont(name, url) {
        var newFont = new FontFace(name, `url(${url})`);
        let _this = this;
        newFont.load().then(function(loaded) {
            document.fonts.add(loaded);
            _this.fontsLoaded = true;
        }).catch(function(error) {
            return error;
        });
    }

    update() {

        if (this.assetsLoaded && this.fontsLoaded && !this.gameStarted) {
            this.gameStarted = true;
            this.scene.start('menu');
        }
        // this.scene.start('play');
        // this.scene.remove();
    }
}