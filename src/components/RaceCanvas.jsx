import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import gameConfig from '../game/config';

/**
 * RaceCanvas Component
 * This React component manages the Phaser game lifecycle
 * - Mounts Phaser on component mount
 * - Passes race data from React to Phaser
 * - Destroys Phaser on unmount
 */
function RaceCanvas() {
  const gameRef = useRef(null); // Reference to Phaser game instance
  const containerRef = useRef(null); // Reference to DOM container
  const [raceData, setRaceData] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch mock race data on component mount
   * In production, replace with actual API call to Golang backend
   */
  useEffect(() => {
    const fetchRaceData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock race data (in production, fetch from: fetch('/api/race-data'))
        const mockData = {
          winner: 1,
          horses: [
            { id: 1, speed: 1.2 },
            { id: 2, speed: 1.05 },
            { id: 3, speed: 1.0 },
          ],
        };
        
        console.log('Race data fetched:', mockData);
        setRaceData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching race data:', error);
        setLoading(false);
      }
    };

    fetchRaceData();
  }, []);

  /**
   * Initialize Phaser game when race data is available
   */
  useEffect(() => {
    if (!raceData || gameRef.current) {
      return;
    }

    console.log('Initializing Phaser game with race data:', raceData);

    // Create Phaser game instance with config
    const config = {
      ...gameConfig,
      parent: containerRef.current, // Attach to our React container
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Wait for the scene to be fully ready before starting with data
    // This ensures init() receives the data properly
    game.events.once('ready', () => {
      console.log('Phaser ready, starting RaceScene with data:', raceData);
      // Stop any auto-started scene and restart with our data
      const scene = game.scene.getScene('RaceScene');
      if (scene) {
        game.scene.stop('RaceScene');
        game.scene.start('RaceScene', raceData);
      }
    });

    // Cleanup function - destroy Phaser when component unmounts
    return () => {
      console.log('Cleaning up Phaser game...');
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [raceData]);

  return (
    <div className="race-canvas-container">
      <div className="race-header">
        <h1>🏇 Horse Racing Simulator</h1>
        {loading && <p className="loading">Loading race data...</p>}
      </div>
      
      {/* Phaser will mount inside this div */}
      <div 
        ref={containerRef} 
        id="phaser-game" 
        className="phaser-container"
      />
      
      {raceData && (
        <div className="race-info">
          <h2>Race Information</h2>
          <div className="horses-list">
            {raceData.horses.map((horse) => (
              <div key={horse.id} className="horse-item">
                <span className="horse-number">#{horse.id}</span>
                <span className="horse-speed">Speed: {horse.speed}x</span>
                {horse.id === raceData.winner && (
                  <span className="winner-badge">🏆 Favorite</span>
                )}
              </div>
            ))}
          </div>
          <p className="race-tip">
            💡 Watch as the horses stay close until 75% of the race, 
            then the favorite pulls ahead!
          </p>
        </div>
      )}
    </div>
  );
}

export default RaceCanvas;
