# 🏇 Horse Racing Betting Frontend MVP

A minimal MVP horse racing betting frontend built with React (Vite) and Phaser 3 for canvas-based game rendering.

## 🚀 Features

- **React + Vite** - Fast development with Hot Module Replacement
- **Phaser 3** - HTML5 Canvas/WebGL game engine for smooth animations
- **JavaScript** - No TypeScript complexity
- **Mock API** - Simulates Golang backend race data
- **Responsive** - Mobile-friendly scaling
- **Dynamic Racing** - Horses stay close until 75% of race, then winner pulls ahead

## 📁 Project Structure

```
Horse/
├── src/
│   ├── components/
│   │   └── RaceCanvas.jsx        # React component that mounts Phaser
│   ├── game/
│   │   ├── config.js              # Phaser game configuration
│   │   └── RaceScene.js           # Main race scene with horse logic
│   ├── assets/                    # (Future) Real sprite sheets and images
│   ├── App.jsx                    # Main App component
│   ├── App.css                    # Styling with modern aesthetics
│   └── main.jsx                   # Entry point
├── public/                        # Static assets
├── index.html                     # HTML template
├── package.json                   # Dependencies
└── vite.config.js                 # Vite configuration
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd /home/mamush/Desktop/project/Horse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - The app will be available at `http://localhost:5173`
   - Vite will show the exact URL in the terminal

## 🎮 How It Works

### Data Flow

1. **React App Loads** (`App.jsx`)
   - Renders `RaceCanvas` component

2. **Fetch Race Data** (`RaceCanvas.jsx`)
   - Mock API call simulates backend response:
   ```javascript
   {
     "winner": 1,
     "horses": [
       { "id": 1, "speed": 1.2 },
       { "id": 2, "speed": 1.05 },
       { "id": 3, "speed": 1.0 }
     ]
   }
   ```

3. **Initialize Phaser** (`config.js`)
   - Creates game instance with responsive scaling
   - Mounts canvas to React container

4. **Race Scene** (`RaceScene.js`)
   - Receives race data from React via `init(data)`
   - Creates horse sprites with running animations
   - Moves horses based on speed values
   - Implements race logic:
     - 0-75%: All horses stay close (slight speed variance)
     - 75-100%: Winner accelerates, others slow down
   - Detects finish line at 90% canvas width
   - Logs winner to console

### React ⟷ Phaser Communication

**React → Phaser (Props):**
```javascript
// In RaceCanvas.jsx
game.scene.start('RaceScene', raceData);
```

**Phaser Receives Data:**
```javascript
// In RaceScene.js
init(data) {
  this.raceData = data; // { winner, horses }
}
```

### Cleanup on Unmount

```javascript
// In RaceCanvas.jsx useEffect cleanup
return () => {
  if (gameRef.current) {
    gameRef.current.destroy(true);
    gameRef.current = null;
  }
};
```

## 🎨 Customization

### Adding Real Assets

1. **Replace placeholder graphics in `RaceScene.js`:**

```javascript
// Instead of createPlaceholderAssets(), use:
preload() {
  this.load.image('track', '/assets/track.png');
  this.load.spritesheet('horse', '/assets/horse.png', {
    frameWidth: 128,
    frameHeight: 128
  });
}
```

2. **Add assets to `public/assets/` directory**

### Connecting to Real Backend

Replace mock data fetch in `RaceCanvas.jsx`:

```javascript
// Instead of mock data:
const response = await fetch('http://your-golang-backend:8080/api/race-data');
const data = await response.json();
setRaceData(data);
```

### Adjusting Race Behavior

In `RaceScene.js`, modify the `update()` method:

```javascript
// Change when winner pulls ahead (currently 75%)
if (progress < 0.75) {
  // Early race logic
} else {
  // Late race logic
}

// Adjust speed multipliers
horse.slowdownFactor = 1.3; // Winner acceleration
horse.slowdownFactor = 0.85; // Loser slowdown
```

## 📱 Mobile Responsive

The game uses Phaser's built-in scaling:

```javascript
// In config.js
scale: {
  mode: Phaser.Scale.FIT,      // Maintains aspect ratio
  autoCenter: Phaser.Scale.CENTER_BOTH,
}
```

CSS ensures container is responsive:
```css
.phaser-container canvas {
  width: 100% !important;
  height: auto !important;
}
```

## 🔧 Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## 🐛 Debugging

1. **Check browser console** - Race events are logged
2. **Phaser DevTools** - Install Phaser Editor DevTools extension
3. **React DevTools** - Inspect component state

### Common Issues

**Canvas not appearing:**
- Ensure Phaser dependency installed: `npm install phaser`
- Check console for errors
- Verify `containerRef` is attached to DOM element

**Horses not moving:**
- Check race data is passed correctly
- Verify `raceStarted` flag is true
- Inspect browser console for logs

**Race finished but winner not detected:**
- Check `finishLineX` calculation
- Verify winner ID matches horse ID in data

## 📊 Tech Stack

- **React 18** - UI library
- **Vite 6** - Build tool
- **Phaser 3** - Game engine
- **JavaScript** - Programming language
- **CSS3** - Styling with modern features

## 🎯 Future Enhancements

- [ ] Real sprite sheets and animations
- [ ] Betting UI for placing bets
- [ ] Multiple race results
- [ ] Sound effects
- [ ] Replay functionality
- [ ] Real-time race updates via WebSocket

## 📝 Notes

- Currently uses **placeholder graphics** generated programmatically
- For production, replace with actual sprite sheets
- Backend integration point is clearly marked in code
- All animation logic is handled by Phaser (not React)
- Mobile responsive out of the box

## 🤝 Contributing

This is an MVP. To extend:
1. Add real assets to `src/assets/`
2. Connect to actual Golang backend
3. Implement betting logic
4. Add more horses/lanes

---

**Enjoy the race! 🏁**
