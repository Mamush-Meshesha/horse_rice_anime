import Phaser from 'phaser';
// Import real assets (Vite will handle these)
// Old 2D assets removed
// import trackImage from '../assets/tartan-track-2678544_1280.jpg';
// import horseSprite from '../assets/horse_run_cycle.png';

/**
 * Main race scene that handles the horse race animation
 * This scene manages:
 * - Loading and displaying assets (track, horses)
 * - Creating sprite animations
 * - Moving horses based on speed values
 * - Detecting finish line
 */
class RaceScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RaceScene' });
    this.horses = [];
    this.raceData = null;
    this.raceStarted = false;
    this.raceFinished = false;
    this.finishLineX = 0;
  }

  /**
   * Initialize scene with data from React
   * @param {Object} data - Race data containing horses and winner info
   */
  init(data) {
    console.log('RaceScene initialized with data:', data);
    this.raceData = data;
    this.raceStarted = false;
    this.raceFinished = false;
    this.horses = [];
  }

  /**
   * Preload REAL assets from src/assets
   * This loads your actual track and horse images
   */
  preload() {
    console.log('2D Scene: Assets removed, skipping load...');
    // 2D assets were removed for 3D upgrade
    /*
    this.load.image('track', trackImage);
    this.load.spritesheet('horse', horseSprite, {
      frameWidth: 82,
      frameHeight: 66
    });
    */
  }
  /**
   * Create the scene - called after preload
   */
  create() {
    console.log('Creating race scene with real assets...');
    
    // Add track background (scaled to fit canvas)
    const track = this.add.image(800, 300, 'track');
    track.setDisplaySize(1600, 600); // Scale to fit our canvas
    
    // Set finish line position (90% of track width)
    this.finishLineX = this.cameras.main.width * 0.9;
    
    // Draw finish line overlay (checkered pattern)
    const finishLine = this.add.graphics();
    
    // Checkered pattern
    const checkSize = 25;
    for (let row = 0; row < 24; row++) {
      for (let col = 0; col < 2; col++) {
        const color = (row + col) % 2 === 0 ? 0x000000 : 0xFFFFFF;
        finishLine.fillStyle(color, 0.8);
        finishLine.fillRect(
          this.finishLineX + (col * checkSize),
          row * checkSize,
          checkSize,
          checkSize
        );
      }
    }
    
    // Finish line pole
    finishLine.fillStyle(0x000000, 1);
    finishLine.fillRect(this.finishLineX - 5, 0, 10, 600);

    if (this.raceData && this.raceData.horses) {
      this.createHorses();
    }
  }

  /**
   * Create horse sprites and animations from the real sprite sheet
   */
  createHorses() {
    const horses = this.raceData.horses;
    const laneHeight = 350 / 3; // Three lanes
    const startX = 50; // Start position
    
    // Create animation once (shared by all horses)
    // 5 frames for running cycle
    if (!this.anims.exists('horseRun')) {
      this.anims.create({
        key: 'horseRun',
        frames: this.anims.generateFrameNumbers('horse', { start: 0, end: 4 }), // 5 frames (0-4)
        frameRate: 12,
        repeat: -1
      });
    }
    
    horses.forEach((horseData, index) => {
      // Calculate Y position for this horse's lane
      const laneY = 150 + (laneHeight / 2) + (index * laneHeight);
      
      // Create sprite using the real sprite sheet
      const sprite = this.add.sprite(startX, laneY, 'horse');
      sprite.setScale(2.0); // Larger scale since sprite is smaller
      
      // Apply color tint to differentiate horses (optional)
      const tints = [0xFFFFFF, 0xFFDDDD, 0xDDDDFF]; // White, reddish, bluish
      sprite.setTint(tints[index % tints.length]);
      
      // Play the shared animation
      sprite.play('horseRun');
      
      // Store horse data
      this.horses.push({
        sprite: sprite,
        speed: horseData.speed,
        id: horseData.id,
        baseSpeed: horseData.speed,
        isWinner: horseData.id === this.raceData.winner,
        finished: false,
        slowdownFactor: 1.0, // Used to keep horses close until 75% mark
      });
      
      // Add horse number text
      const numberText = this.add.text(sprite.x, sprite.y, `${horseData.id}`, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#000000',
        fontStyle: 'bold',
      });
      numberText.setOrigin(0.5);
      
      // Make text follow horse
      sprite.numberText = numberText;
    });
    
    this.raceStarted = true;
    console.log(`Race started with ${this.horses.length} horses`);
  }

  /**
   * Update loop - called every frame
   * Handles horse movement and race logic
   */
  update() {
    if (!this.raceStarted || this.raceFinished) {
      return;
    }

    let allFinished = true;

    this.horses.forEach((horse) => {
      if (horse.finished) {
        return;
      }

      allFinished = false;

      // Calculate race progress (0 to 1)
      const progress = horse.sprite.x / this.finishLineX;
      
      // Keep horses close together until 75% of the race
      if (progress < 0.75) {

        
        // All horses move at similar speed (slight variance)
        // Non-winners move slightly faster in early race to stay competitive
        if (horse.isWinner) {
          horse.slowdownFactor = 1.0;
        } else {
          horse.slowdownFactor = 1.05; // Non-winners move 5% faster early on
        }
      } else {
        // After 75%, winner speeds up, others slow down
        if (horse.isWinner) {
          horse.slowdownFactor = 1.3; // Winner accelerates significantly
        } else {
          horse.slowdownFactor = 0.85; // Others slow down
        }
      }

      // Move horse horizontally
      const effectiveSpeed = horse.baseSpeed * horse.slowdownFactor;
      horse.sprite.x += effectiveSpeed;
      
      // Update number text position
      if (horse.sprite.numberText) {
        horse.sprite.numberText.x = horse.sprite.x;
      }

      // Check if horse crossed finish line
      if (horse.sprite.x >= this.finishLineX) {
        horse.finished = true;
        horse.sprite.anims.stop();
        
        if (horse.isWinner) {
          console.log(`🏆 Winner: Horse #${horse.id} finished first!`);
          
          // Add winner indicator
          const winnerText = this.add.text(
            horse.sprite.x,
            horse.sprite.y - 60,
            '🏆 WINNER!',
            {
              fontSize: '32px',
              fontFamily: 'Arial',
              color: '#FFD700',
              fontStyle: 'bold',
              stroke: '#000000',
              strokeThickness: 4,
            }
          );
          winnerText.setOrigin(0.5);
        } else {
          console.log(`Horse #${horse.id} finished`);
        }
      }
    });

    // Check if all horses finished
    if (allFinished) {
      this.raceFinished = true;
      console.log('Race completed!');
    }
  }

  /**
   * Clean up when scene is destroyed
   */
  shutdown() {
    this.horses = [];
    this.raceData = null;
    this.raceStarted = false;
    this.raceFinished = false;
  }
}

export default RaceScene;
