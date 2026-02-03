/**
 * IMPROVED Production-Quality Procedural Assets
 * These create much better-looking graphics than the basic placeholders
 * Use these until you can add real sprite sheets
 */

/**
 * Creates a production-quality racing track with:
 * - Sky gradient
 * - Grass borders
 * - Dirt racing lanes
 * - White fence rails
 * - Checkered finish line
 */
export function createProductionTrack(scene) {
  const graphics = scene.add.graphics();
  const width = 1600;
  const height = 600;
  
  // Sky with gradient (light blue to deeper blue)
  graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4A90E2, 0x4A90E2, 1);
  graphics.fillRect(0, 0, width, 150);
  
  // Top grass border
  graphics.fillStyle(0x2D5016, 1);
  graphics.fillRect(0, 150, width, 50);
  
  // Dirt track base
  graphics.fillStyle(0x8B4513, 1);
  graphics.fillRect(0, 200, width, 300);
  
  // Add texture to dirt (random darker spots)
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const y = 200 + Math.random() * 300;
    const radius = Math.random() * 3 + 1;
    graphics.fillStyle(0x654321, 0.3);
    graphics.fillCircle(x, y, radius);
  }
  
  // Lane dividers (white dashed lines)
  graphics.lineStyle(2, 0xFFFFFF, 0.4);
  const lanes = [300, 400];
  lanes.forEach(y => {
    for (let x = 0; x < width; x += 40) {
      graphics.beginPath();
      graphics.moveTo(x, y);
      graphics.lineTo(x + 20, y);
      graphics.strokePath();
    }
  });
  
  // Bottom grass border
  graphics.fillStyle(0x2D5016, 1);
  graphics.fillRect(0, 500, width, 100);
  
  // Top fence (white rails)
  graphics.fillStyle(0xFFFFFF, 1);
  for (let x = 0; x < width; x += 80) {
    // Vertical posts
    graphics.fillRect(x, 180, 12, 25);
    // Horizontal rail
    if (x < width - 80) {
      graphics.fillRect(x + 12, 185, 68, 6);
    }
  }
  
  // Bottom fence (white rails)
  for (let x = 0; x < width; x += 80) {
    // Vertical posts
    graphics.fillRect(x, 495, 12, 25);
    // Horizontal rail
    if (x < width - 80) {
      graphics.fillRect(x + 12, 500, 68, 6);
    }
  }
  
  // Checkered finish line (classic racing pattern)
  const finishX = width * 0.9;
  const checkSize = 25;
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 2; col++) {
      const color = (row + col) % 2 === 0 ? 0x000000 : 0xFFFFFF;
      graphics.fillStyle(color, 1);
      graphics.fillRect(
        finishX + (col * checkSize),
        200 + (row * checkSize),
        checkSize,
        checkSize
      );
    }
  }
  
  // Finish line pole
  graphics.fillStyle(0x000000, 1);
  graphics.fillRect(finishX - 5, 180, 10, 340);
  
  graphics.generateTexture('track', width, height);
  graphics.destroy();
  
  console.log('✅ Production track created');
}

/**
 * Creates a production-quality horse sprite with running animation
 * Much more detailed than the basic placeholder
 */
export function createProductionHorse(scene, id, color) {
  const graphics = scene.add.graphics();
  const frameWidth = 128;
  const frameHeight = 128;
  const numFrames = 4;
  
  for (let frame = 0; frame < numFrames; frame++) {
    const offsetX = frame * frameWidth;
    const legPhase = (frame / numFrames) * Math.PI * 2;
    
    // Horse body (more detailed oval)
    graphics.fillStyle(color, 1);
    graphics.fillEllipse(offsetX + 64, 60, 90, 45);
    
    // Horse neck
    graphics.fillEllipse(offsetX + 95, 45, 30, 35);
    
    // Horse head
    graphics.fillEllipse(offsetX + 105, 35, 22, 28);
    
    // Ear
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(
      offsetX + 110, 25,
      offsetX + 105, 30,
      offsetX + 115, 28
    );
    
    // Eye
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(offsetX + 110, 35, 3);
    
    // Mane
    graphics.fillStyle(0x2C1810, 1);
    for (let i = 0; i < 4; i++) {
      const maneX = offsetX + 95 - (i * 5);
      const maneY = 30 + Math.sin(legPhase + i) * 3;
      graphics.fillEllipse(maneX, maneY, 8, 15);
    }
    
    // Saddle
    graphics.fillStyle(0x8B0000, 1);
    graphics.fillRect(offsetX + 50, 50, 35, 20);
    graphics.lineStyle(2, 0xFFD700);
    graphics.strokeRect(offsetX + 50, 50, 35, 20);
    
    // Racing number cloth
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(offsetX + 67, 60, 15);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(offsetX + 67, 60, 12);
    graphics.fillStyle(0xFFFFFF, 1);
    scene.add.text(offsetX + 62, 52, `${id}`, {
      fontSize: '16px',
      fontStyle: 'bold'
    }).setOrigin(0);
    
    // Legs (animated)
    const legs = [
      { x: 45, front: true },   // Front left
      { x: 60, front: true },   // Front right  
      { x: 75, front: false },  // Back left
      { x: 90, front: false }   // Back right
    ];
    
    graphics.fillStyle(color, 1);
    legs.forEach((leg, idx) => {
      const legSwing = Math.sin(legPhase + (idx * Math.PI / 2)) * 12;
      const legLength = 28;
      const legY = 78 + (leg.front ? legSwing : -legSwing);
      
      // Upper leg
      graphics.fillRect(offsetX + leg.x, 75, 10, 15);
      // Lower leg
      graphics.fillRect(offsetX + leg.x + 1, legY, 8, legLength - 15);
      // Hoof
      graphics.fillStyle(0x2C1810, 1);
      graphics.fillRect(offsetX + leg.x, legY + legLength - 15, 10, 6);
      graphics.fillStyle(color, 1);
    });
    
    // Tail (animated)
    graphics.fillStyle(0x2C1810, 1);
    const tailSwing = Math.sin(legPhase) * 8;
    graphics.beginPath();
    graphics.moveTo(offsetX + 30, 65);
    graphics.quadraticCurveTo(
      offsetX + 15 + tailSwing, 70,
      offsetX + 20, 90
    );
    graphics.lineStyle(8, 0x2C1810);
    graphics.strokePath();
  }
  
  graphics.generateTexture(`horse${id}`, frameWidth * numFrames, frameHeight);
  graphics.destroy();
  
  console.log(`✅ Production horse #${id} sprite created`);
}

// Horse color palette (more realistic browns)
export const HORSE_COLORS = [
  0x8B4513, // Saddle brown
  0xA0522D, // Sienna
  0x654321, // Dark brown
  0xD2691E, // Chocolate
  0x8B7355, // Burlywood
];

/**
 * Helper function to get a horse color by index
 */
export function getHorseColor(index) {
  return HORSE_COLORS[index % HORSE_COLORS.length];
}
