import Phaser from 'phaser';
import BootScene from './BootScene';
import PlayScene from './PlayScene';
import MenuScene from './MenuScene';
import EndScene from './EndScene';

const ratio = window.devicePixelRatio;

export default {
    type: Phaser.CANVAS,
    backgroundColor: "#0374ea",
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        width: 540,
        height: 960,
        autoCenter: Phaser.Scale.CENTER_BOTH,

    },
    title: 'Hakan Garip Memory Match',
    scene: [BootScene, MenuScene, PlayScene, EndScene],
};