import Phaser from 'phaser';
import RaceScene from './RaceScene';

/**
 * Phaser game configuration
 * Sets up the canvas, physics, and scenes
 */
const config = {
  type: Phaser.AUTO, // Automatically choose WebGL or Canvas
  parent: 'phaser-game', // DOM element ID to mount the canvas
  width: 1600, // Base width
  height: 600, // Base height
  backgroundColor: '#87CEEB', // Sky blue background
  scale: {
    mode: Phaser.Scale.FIT, // Scale to fit container while maintaining aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game canvas
  },
  scene: [RaceScene], // Load the RaceScene
  autoStart: false, // Don't auto-start - wait for React to provide data
};

export default config;
