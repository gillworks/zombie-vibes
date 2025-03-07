import * as THREE from "three";

export function createPlayer(scene, camera) {
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
    d: false,
  };

  // Setup key listeners
  window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
      keys[e.key.toLowerCase()] = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
      keys[e.key.toLowerCase()] = false;
    }
  });

  // Mouse controls for attacking
  window.addEventListener("click", () => {
    // Simple attack animation
    const originalScale = player.scale.clone();
    player.scale.set(1.2, 1.2, 1.2);

    setTimeout(() => {
      player.scale.copy(originalScale);
    }, 100);

    // Check for zombie hits in a radius around player
    const attackRadius = 2;
    const zombies = scene.children.filter(
      (child) =>
        child.userData.isZombie &&
        child.position.distanceTo(player.position) < attackRadius
    );

    // Damage zombies
    zombies.forEach((zombie) => {
      if (zombie.userData.takeDamage) {
        zombie.userData.takeDamage(25);
      }
    });
  });

  // Update function
  player.update = function () {
    // Calculate movement direction based on camera orientation
    const moveDirection = new THREE.Vector3();

    // Get camera's forward and right vectors (projected onto XZ plane for top-down movement)
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    cameraForward.y = 0; // Project onto XZ plane
    cameraForward.normalize();

    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(
      camera.quaternion
    );
    cameraRight.y = 0; // Project onto XZ plane
    cameraRight.normalize();

    // Combine key presses to determine movement direction
    if (keys.w) moveDirection.add(cameraForward);
    if (keys.s) moveDirection.sub(cameraForward);
    if (keys.a) moveDirection.sub(cameraRight);
    if (keys.d) moveDirection.add(cameraRight);

    // Normalize and apply movement if there is any
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      player.position.x += moveDirection.x * speed;
      player.position.z += moveDirection.z * speed;
    }

    // Keep player on the ground
    player.position.y = 1;
  };

  return player;
}
