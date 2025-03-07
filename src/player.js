import * as THREE from 'three';

export function createPlayer(scene) {
  // Create player mesh
  const geometry = new THREE.BoxGeometry(1, 2, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const player = new THREE.Mesh(geometry, material);
  
  // Position player
  player.position.set(0, 1, 0);
  player.castShadow = true;
  player.receiveShadow = true;
  
  // Add to scene
  scene.add(player);
  
  // Movement variables
  const speed = 0.1;
  const keys = {
    w: false,
    a: false,
    s: false,
    d: false
  };
  
  // Setup key listeners
  window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
      keys[e.key.toLowerCase()] = true;
    }
  });
  
  window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
      keys[e.key.toLowerCase()] = false;
    }
  });
  
  // Mouse controls for attacking
  window.addEventListener('click', () => {
    // Simple attack animation
    const originalScale = player.scale.clone();
    player.scale.set(1.2, 1.2, 1.2);
    
    setTimeout(() => {
      player.scale.copy(originalScale);
    }, 100);
    
    // Check for zombie hits in a radius around player
    const attackRadius = 2;
    const zombies = scene.children.filter(child => 
      child.userData.isZombie && 
      child.position.distanceTo(player.position) < attackRadius
    );
    
    // Damage zombies
    zombies.forEach(zombie => {
      if (zombie.userData.takeDamage) {
        zombie.userData.takeDamage(25);
      }
    });
  });
  
  // Update function
  player.update = function() {
    // Handle movement
    if (keys.w) player.position.z -= speed;
    if (keys.s) player.position.z += speed;
    if (keys.a) player.position.x -= speed;
    if (keys.d) player.position.x += speed;
    
    // Keep player on the ground
    player.position.y = 1;
  };
  
  return player;
}