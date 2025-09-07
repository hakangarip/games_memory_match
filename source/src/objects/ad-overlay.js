export class AdOverlay extends Phaser.GameObjects.Container {
  constructor(scene, x = 0, y = 0) {
    super(scene);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.scene.add.existing(this);
    this.visible = false;
    this.init();
  }

  init() {
    const w = 960, h = 640;
    // dim background
    this.back = this.scene.add.rectangle(0, 0, w + 1000, h + 1000, 0x000000, 0.0).setOrigin(0.5);
    this.add(this.back);

    // ad image (placeholder uses logo3.png already in assets)
    this.image = this.scene.add.image(0, -20, 'ad_image').setOrigin(0.5);
    // scale to fit
    const maxW = 700, maxH = 420;
    const sx = maxW / this.image.width;
    const sy = maxH / this.image.height;
    const s = Math.min(1, sx, sy);
    this.image.setScale(s);
    this.add(this.image);

    // close button
    this.close = this.scene.add.text(0, 220, 'Kapat', {
      fontFamily: 'ARCO', fontSize: 48, color: '#ffffff'
    }).setOrigin(0.5);
    this.add(this.close);

    this.close.setInteractive({ useHandCursor: true });
    this.close.on('pointerdown', () => this.hideOnce());
  }

  showOnce() {
    if (this.scene.registry.get('ad_shown')) return; // already shown this session
    this.scene.registry.set('ad_shown', true);
    this.alpha = 0;
    this.visible = true;
    this.scene.tweens.add({ targets: this, alpha: { from: 0, to: 1 }, duration: 200, ease: 'Power0' });
  }

  hideOnce() {
    this.scene.sound.add('click1').play();
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0 },
      duration: 150,
      ease: 'Power0',
      onComplete: () => { this.visible = false; }
    });
  }
}
