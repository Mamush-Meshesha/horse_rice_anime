import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import trackTextureImg from '../assets/3d track.png';
const horseModelPath = '/animated_horse__3d_animal_model_free_download.glb';
import finishLineTextureImg from '../assets/3d finish line.png';

/**
 * Race3DCanvas - Professional 3D Horse Racing Experience
 * Now with Real 3D GLB Models!
 */
function Race3DCanvas() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs for cleanup
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const horsesRef = useRef([]);
  const mixersRef = useRef([]); 
  const raceDataRef = useRef(null);
  const finishLineX = useRef(250); // Race along X-axis now
  const cameraRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const clock = new THREE.Clock();

    const cleanupScene = () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      if (rendererRef.current) {
        const domElement = rendererRef.current.domElement;
        if (containerRef.current && domElement && domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(domElement);
        }
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      mixersRef.current = [];
    };

    // Resize Handler
    const handleResize = () => {
       if (cameraRef.current && rendererRef.current && containerRef.current) {
         // Full screen handling: rely on window size or container size (now 100vw/vh)
         const width = window.innerWidth;
         const height = window.innerHeight;
         
         cameraRef.current.aspect = width / height;
         cameraRef.current.updateProjectionMatrix();
         rendererRef.current.setSize(width, height);
       }
    };
    window.addEventListener('resize', handleResize);

    const init = async () => {
      if (containerRef.current) {
         Array.from(containerRef.current.children).forEach(child => {
           if (child.tagName === 'CANVAS') containerRef.current.removeChild(child);
         });
      }

      try {
        // Race Data
        raceDataRef.current = {
          winner: 1,
          horses: [
            { id: 1, speed: 1.2 },
            { id: 2, speed: 1.05 },
            { id: 3, speed: 1.0 },
            { id: 4, speed: 1.1 },
            { id: 5, speed: 1.15 },
            { id: 6, speed: 0.95 },
            { id: 7, speed: 1.08 },
            { id: 8, speed: 1.02 },
          ],
        };

        if (!containerRef.current) return;

        // ===== SCENE =====
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 20, 500);
        sceneRef.current = scene;

        // ===== CAMERA (Side View +X) =====
        const camera = new THREE.PerspectiveCamera(60, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
        camera.position.set(-50, 20, 80); // Start behind, looking side
        camera.lookAt(0, 5, 0);
        cameraRef.current = camera;

        // ===== RENDERER =====
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // ===== LIGHTING =====
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // ===== GROUND =====
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(1000, 200),
          new THREE.MeshStandardMaterial({ color: 0x4C9A2A })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        scene.add(ground);

        // ===== LOADING =====
        const manager = new THREE.LoadingManager();
        const gltfLoader = new GLTFLoader(manager);
        const texLoader = new THREE.TextureLoader(manager);
        
        let horseModel = null;
        let horseAnimations = null;

        gltfLoader.load(horseModelPath, (gltf) => {
          const model = gltf.scene;
          horseAnimations = gltf.animations; // Array of clips
          
          // Log available animations
          if (horseAnimations && horseAnimations.length > 0) {
            console.log("🐴 Available Animations:");
            horseAnimations.forEach((clip, idx) => {
              console.log(`  ${idx}: "${clip.name}" - Duration: ${clip.duration.toFixed(2)}s`);
            });
          } else {
            console.warn("⚠️ No animations found in GLB!");
          }
          
          // AUTO-SCALE & CENTER LOGIC
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          
          console.log("🐴 Original Model Size:", size);
          
          // Target Height: 10.0 units (Increased from 8.0)
          const targetHeight = 10.0; 
          const scaleFactor = targetHeight / size.y;
          
          model.scale.set(scaleFactor, scaleFactor, scaleFactor);
          
          // RE-CALCULATE BOX AFTER SCALING
          model.updateMatrixWorld();
          const scaledBox = new THREE.Box3().setFromObject(model);
          const scaledMinY = scaledBox.min.y;
          
          // DYNAMIC GROUND ALIGNMENT
          const groundLevel = 0;
          const buffer = 0.2;
          const yOffset = groundLevel - scaledMinY + buffer;
          model.userData.yCorrection = yOffset;
          
          // ORIENTATION CORRECTION
          // Rotate 180 degrees to face forward (horses were running backward)
          model.rotation.y = Math.PI;

          // Ensure shadows
          model.traverse(o => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          
          horseModel = model;
        });

        const trackTex = texLoader.load(trackTextureImg, (tex) => {
          tex.wrapS = THREE.RepeatWrapping; 
          tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(10, 1);
          // Try rotating texture 90 degrees to align lines
          tex.center.set(0.5, 0.5);
          tex.rotation = -Math.PI / 2; 
          tex.colorSpace = THREE.SRGBColorSpace;
        });
        
        const finishTex = texLoader.load(finishLineTextureImg);

        manager.onLoad = () => {
          console.log('✅ 3D Model & Assets Loaded');
          if (mounted) {
            setupRace();
            setLoading(false);
            animate();
          }
        };

        const setupRace = () => {
           // 1. Track (Floor Graphic) (Wider for 8 lanes)
           const track = new THREE.Mesh(
             new THREE.PlaneGeometry(600, 160), 
             new THREE.MeshStandardMaterial({ map: trackTex })
           );
           track.rotation.x = -Math.PI / 2;
           track.position.set(150, 0.1, 0); // Offset X to cover race
           track.receiveShadow = true;
           scene.add(track);

           // 2. Finish Line (Wider)
           const finish = new THREE.Mesh(
             new THREE.PlaneGeometry(10, 160),
             new THREE.MeshStandardMaterial({ map: finishTex, transparent: true, side: THREE.DoubleSide })
           );
           finish.rotation.x = -Math.PI / 2;
           finish.position.set(finishLineX.current, 0.2, 0); // X-axis finish
           scene.add(finish);

           // 3. Horses
           // Dynamic Lane Calculation for 8 horses
           const laneSpacing = 15;
           const totalWidth = laneSpacing * 8;
           const startZ = -(totalWidth / 2) + (laneSpacing / 2);
           
           horsesRef.current = [];
           mixersRef.current = [];

           raceDataRef.current.horses.forEach((hData, i) => {
             const lanePos = startZ + (i * laneSpacing);
             // Clone the model properly for animation
             const horseInstance = SkeletonUtils.clone(horseModel);
             
             // Apply Dynamic Ground Alignment
             const startY = horseModel.userData.yCorrection || 0;
             horseInstance.position.set(-50, startY, lanePos); // Start X=-50
             
             // Apply Unique Color/Texture (Realistic Coats)
             const coatColors = [
               0x462c1d, // Bay (Dark Brown)
               0x2a1d17, // Dark Bay / Black
               0x783515, // Chestnut (Red-Brown)
               0xccac68, // Palomino (Gold)
               0xdadada, // Grey / White
               0x8c6239, // Buckskin (Tan)
               0x6d4033, // Roan
               0x1a1a1a, // True Black
             ];
             const color = coatColors[i % coatColors.length];
             
             horseInstance.traverse((child) => {
               if (child.isMesh) {
                 // Clone material to ensure unique color per horse
                 child.material = child.material.clone(); 
                 child.material.color.setHex(color);
                 // Improve Material Realism
                 child.material.roughness = 0.9; // Fur is rough, not shiny
                 child.material.metalness = 0.0; // Fur is not metallic
               }
             });
             
             // Scale handled by auto-scale logic above
             
             scene.add(horseInstance);
             
             // Animation Mixer
             const mixer = new THREE.AnimationMixer(horseInstance);
             if (horseAnimations && horseAnimations.length > 0) {
               // Find the specific running animation (note semicolon in name)
               const runAnimation = horseAnimations.find(clip => 
                 clip.name === "HorseALL_RunLoop"
               );
               
               if (runAnimation) {
                 console.log(`🏇 Playing Animation for Horse ${i}:`, runAnimation.name, `Duration: ${runAnimation.duration.toFixed(2)}s`);
                 const action = mixer.clipAction(runAnimation);
                 action.setLoop(THREE.LoopRepeat); // Loop indefinitely
                 action.play();
               } else {
                 console.warn(`⚠️ HorseAll_RunLoop not found for horse ${i}. Available:`, horseAnimations.map(c => c.name));
                 // Fallback to first animation
                 const action = mixer.clipAction(horseAnimations[0]);
                 action.setLoop(THREE.LoopRepeat);
                 action.play();
               }
             } else {
               console.warn("⚠️ No animations found in GLB!");
             }
             mixersRef.current.push(mixer);

             // Store Data
             horseInstance.userData = {
               id: hData.id,
               speed: hData.speed,
               finished: false,
             };
             
             // ID Label On Side
             const canvas = document.createElement('canvas');
             const ctx = canvas.getContext('2d');
             canvas.width = 64; canvas.height = 64; // Smaller canvas
             
             // No Circle Background - Transparent
             
             // Black Number (Smaller)
             ctx.fillStyle = '#FFFFFF'; // White text for better contrast against dark/brown horses
             ctx.font = 'bold 40px Arial'; // Smaller font
             ctx.textAlign = 'center'; 
             ctx.textBaseline = 'middle';
             ctx.fillText(hData.id.toString(), 32, 32);
             
             const label = new THREE.Mesh(
               new THREE.PlaneGeometry(0.8, 0.8), // Smaller plane
               new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, side: THREE.DoubleSide })
             );
             
             // Position on the side facing camera (+Z)
             // Horse is at (0,0,0) locally.
             // If horse runs +X, and camera is at +Z.
             // We put label at z = +0.6 (approx width of horse), y = 1.6 (shoulder height)
             label.position.set(0, 1.6, 0.6); 
             
             // Rotate to face camera? Plane default faces +Z.
             // Horse is rotated Math.PI. So Horse's +Z is World -Z.
             // So Label attached to Horse: Label's +Z is World -Z.
             // We want Label to Face World +Z.
             // So Rotate Label Math.PI relative to Horse.
             label.rotation.y = Math.PI;
             
             horseInstance.add(label);

             horsesRef.current.push(horseInstance);
           });
        };

        const animate = () => {
          if (!mounted) return;
          requestAnimationFrame(animate);
          
          const delta = clock.getDelta();
          let leaderX = -100;

          // Update Mixers (Animations)
          mixersRef.current.forEach(mixer => mixer.update(delta));

          // Move Horses along X
          horsesRef.current.forEach((horse, idx) => {
            if (horse.userData.finished) return;

            let speed = horse.userData.speed * 10 * delta; // Adjust speed scale
            
            // Boost logic
            if (Math.abs(finishLineX.current - horse.position.x) < 50 && horse.userData.id === raceDataRef.current.winner) {
                 speed *= 1.3;
            }

            horse.position.x += speed;
            
            if (horse.position.x > leaderX) leaderX = horse.position.x;
            if (horse.position.x >= finishLineX.current) {
               horse.userData.finished = true;
            }
            
            // Orient Horse: Face the Finish Line (+X)
            // If model is +Z forward, we rotate -90 Y to face +X?
            // User insisted "Forward direction must be correct".
            // Let's assume standard behavior: lookAt target.
            // horse.lookAt(horse.position.x + 10, horse.position.y, horse.position.z);
            
            // Actually, if the model IS +X forward, we don't need to rotate.
            // If it's +Z forward (most common), we need rotation.
            // Since User said "No code rotation", let's try leaving it alone first (Rotation 0,0,0).
            // It will point in its "Natural" direction.
            // Since we established Z is long axis (0.99 vs 0.22), it's likely a +Z or -Z model.
            // If it runs X, it WILL be sideways if we don't rotate.
            // But I will respect "No code rotation" for now and let the user see it sideways if necessary, then fix.
            // Removed the `lookAt(camera)` line which was definitely wrong.
          });
          
          // Camera Follow X
          const camTargetX = Math.min(leaderX + 20, finishLineX.current + 20);
          
          camera.position.x += (camTargetX - camera.position.x) * 0.1;
          camera.position.z = 50; 
          camera.lookAt(camera.position.x, 2, 0);

          if (rendererRef.current && sceneRef.current) {
            rendererRef.current.render(sceneRef.current, camera);
          }
        };

      } catch (err) {
        console.error("Setup Loop Error", err);
        setError(err.message);
      }
    };

    cleanupScene();
    init();

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      cleanupScene();
    };
  }, []);

  return (
    <div className="race-canvas-container">
       <div className="race-header">
         <h1>🏇 3D Horse Racing Simulator</h1>
         <p className="dimension-badge">⚡ Real-Time 3D Models</p>
       </div>
       <div ref={containerRef} className="threejs-container" style={{ width: '100%', height: '600px', background: '#000', borderRadius: '20px', overflow: 'hidden' }}>
         {loading && <div style={{position:'absolute',color:'white',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}>Loading 3D Models...</div>}
       </div>
    </div>
  );
}

export default Race3DCanvas;
