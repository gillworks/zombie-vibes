import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createPlayer } from './player.js';
import { createZombie } from './zombie.js';
import { createEnvironment } from './environment.js';

// Game state
const gameState = {
  health: 100,
  zombieCount: 0,
  zombies: [],
  player: null,
  isGameOver: false
};

// Initialize Three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Add fog for atmosphere
scene.fog = new THREE.FogExp2(0x111111, 0.05);

// Setup camera (isometric-like view)
const camera = new THREE.PerspectiveCamera(
  45, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// Setup renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// Add controls for development
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Create environment
const environment = createEnvironment(scene);

// Create player
gameState.player = createPlayer(scene);

// Create initial zombies
for (let i = 0; i < 5; i++) {
  const zombie = createZombie(
    scene, 
    Math.random() * 20 - 10, 
    0, 
    Math.random() * 20 - 10,
    gameState
  );
  gameState.zombies.push(zombie);
  gameState.zombieCount++;
}

// Update UI
function updateUI() {
  document.getElementById('health').textContent = gameState.health;
  document.getElementById('zombieCount').textContent = gameState.zombieCount;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  if (!gameState.isGameOver) {
    // Update zombies
    gameState.zombies.forEach(zombie => {
      zombie.update(gameState.player.position);
    });
    
    // Update player
    gameState.player.update();
    
    // Update UI
    updateUI();
    
    // Check game over condition
    if (gameState.health <= 0) {
      gameState.isGameOver = true;
      alert('Game Over! Refresh to play again.');
    }
  }
  
  controls.update();
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Hide loading screen
window.addEventListener('load', () => {
  document.getElementById('loading').style.display = 'none';
  animate();
});