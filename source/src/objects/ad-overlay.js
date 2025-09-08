import Phaser from 'phaser';

export class AdOverlay extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        this.scene.add.existing(this);
        this.setDepth(1000);

        this.init();
    }

    init() {
        // semi-transparent background
        this.bg = this.scene.add.graphics();
        this.bg.fillStyle(0x000000, 0.7);
        this.bg.fillRect(0, 0, this.scene.sys.game.config.width, this.scene.sys.game.config.height);
        this.add(this.bg);

        // ad image (placeholder uses logo3.png already in assets)
        this.adImage = this.scene.add.image(0, 0, 'ad_image');
        this.add(this.adImage);

        // close button
        this.closeButton = this.scene.add.text(0, 0, 'X', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#ff0000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
        });
        this.closeButton.setOrigin(0.5);
        this.closeButton.setInteractive();
        this.add(this.closeButton);

        this.closeButton.on('pointerdown', () => {
            this.hide();
        });

        this.visible = false;
    }

    showOnce() {
        if (!sessionStorage.getItem('adShown')) {
            this.show();
            sessionStorage.setItem('adShown', 'true');
        }
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }
}
