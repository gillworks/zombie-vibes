import * as THREE from "three";

// Zombie types with unique behaviors and characteristics
const zombieTypes = [
  {
    name: "Shambler",
    color: 0x8b0000, // Dark red
    speed: 0.015,
    health: 50,
    damage: 5,
    attackRadius: 1.5,
    description: "Classic slow-moving zombie",
  },
  {
    name: "Runner",
    color: 0xff4500, // Orange-red
    speed: 0.035,
    health: 30,
    damage: 3,
    attackRadius: 1.2,
    description: "Fast but weaker zombie",
  },
  {
    name: "Tank",
    color: 0x800080, // Purple
    speed: 0.01,
    health: 100,
    damage: 10,
    attackRadius: 1.8,
    description: "Slow but very strong zombie",
  },
  {
    name: "Spitter",
    color: 0x00ff00, // Green
    speed: 0.02,
    health: 40,
    damage: 2,
    attackRadius: 4,
    description: "Can attack from a distance",
  },
  {
    name: "Screamer",
    color: 0xffff00, // Yellow
    speed: 0.025,
    health: 35,
    damage: 1,
    attackRadius: 2,
    description: "Attracts other zombies when near player",
  },
];

// Debug logging function
function logZombieMovement(zombie, oldPosition, newPosition, distance) {
  // Only log significant movements (potential teleports)
  if (distance > 0.5) {
    console.log(
      `[ZOMBIE DEBUG] ${zombie.userData.type} moved ${distance.toFixed(
        2
      )} units in one frame!`
    );
    console.log(
      `  From: (${oldPosition.x.toFixed(2)}, ${oldPosition.z.toFixed(2)})`
    );
    console.log(
      `  To: (${newPosition.x.toFixed(2)}, ${newPosition.z.toFixed(2)})`
    );
  }
}

export function createZombie(scene, x, y, z, gameState) {
  // Randomly select a zombie type
  const zombieType =
    zombieTypes[Math.floor(Math.random() * zombieTypes.length)];

  // Create zombie mesh
  const geometry = new THREE.BoxGeometry(0.8, 1.8, 0.8);
  const material = new THREE.MeshStandardMaterial({ color: zombieType.color });
  const zombie = new THREE.Mesh(geometry, material);

  // Position zombie
  zombie.position.set(x, y + 0.9, z);
  zombie.castShadow = true;
  zombie.receiveShadow = true;

  // Add zombie metadata
  zombie.userData = {
    isZombie: true,
    type: zombieType.name,
    health: zombieType.health,
    speed: zombieType.speed,
    damage: zombieType.damage,
    attackRadius: zombieType.attackRadius,
    lastAttackTime: 0,
    attackCooldown: 1000, // 1 second between attacks
    lastPosition: new THREE.Vector3(x, y + 0.9, z), // For tracking movement

    // Damage function
    takeDamage: function (amount) {
      this.health -= amount;

      // Visual feedback for damage
      zombie.material.color.set(0xffffff);
      setTimeout(() => {
        zombie.material.color.set(zombieType.color);
      }, 100);

      // Check if zombie is dead
      if (this.health <= 0) {
        scene.remove(zombie);
        gameState.zombies = gameState.zombies.filter((z) => z !== zombie);
        gameState.zombieCount--;

        // Log zombie death and respawn
        console.log(
          `[ZOMBIE DEBUG] ${zombie.userData.type} died and will respawn in 5 seconds`
        );

        // Spawn a new zombie after some time
        setTimeout(() => {
          const newX = Math.random() * 30 - 15;
          const newZ = Math.random() * 30 - 15;
          console.log(
            `[ZOMBIE DEBUG] Respawning new zombie at (${newX.toFixed(
              2
            )}, ${newZ.toFixed(2)})`
          );

          const newZombie = createZombie(scene, newX, 0, newZ, gameState);
          gameState.zombies.push(newZombie);
          gameState.zombieCount++;
        }, 5000);
      }
    },
  };

  // Log zombie creation
  console.log(
    `[ZOMBIE DEBUG] Created ${zombieType.name} at (${x.toFixed(2)}, ${z.toFixed(
      2
    )})`
  );

  // Add to scene
  scene.add(zombie);

  // Update function with unique behaviors based on zombie type
  zombie.update = function (playerPosition) {
    // Store current position before movement
    const oldPosition = zombie.position.clone();

    // Calculate direction to player
    const direction = new THREE.Vector3();
    direction.subVectors(playerPosition, zombie.position).normalize();

    // Move towards player with zombie's speed
    zombie.position.x += direction.x * zombie.userData.speed;
    zombie.position.z += direction.z * zombie.userData.speed;

    // Keep zombie on the ground
    zombie.position.y = 0.9;

    // Calculate distance moved this frame
    const distanceMoved = oldPosition.distanceTo(zombie.position);

    // Log movement if significant
    logZombieMovement(zombie, oldPosition, zombie.position, distanceMoved);

    // Update last position
    zombie.userData.lastPosition = zombie.position.clone();

    // Check if close enough to attack
    const distanceToPlayer = zombie.position.distanceTo(playerPosition);

    if (distanceToPlayer < zombie.userData.attackRadius) {
      const now = Date.now();

      // Attack if cooldown has passed
      if (
        now - zombie.userData.lastAttackTime >
        zombie.userData.attackCooldown
      ) {
        zombie.userData.lastAttackTime = now;

        // Deal damage to player
        gameState.health -= zombie.userData.damage;

        // Log attack
        console.log(
          `[ZOMBIE DEBUG] ${zombie.userData.type} attacked player for ${zombie.userData.damage} damage`
        );

        // Visual feedback for attack
        const originalScale = zombie.scale.clone();
        zombie.scale.set(1.2, 1.2, 1.2);

        setTimeout(() => {
          zombie.scale.copy(originalScale);
        }, 100);
      }
    }

    // Special behaviors based on zombie type
    switch (zombie.userData.type) {
      case "Screamer":
        // Screamers attract nearby zombies when close to player
        if (distanceToPlayer < 5) {
          gameState.zombies.forEach((otherZombie) => {
            if (
              otherZombie !== zombie &&
              otherZombie.position.distanceTo(zombie.position) < 10
            ) {
              // Temporarily increase other zombies' speed
              otherZombie.userData.speed *= 1.2;

              // Log speed boost
              console.log(
                `[ZOMBIE DEBUG] Screamer boosted ${otherZombie.userData.type}'s speed`
              );

              setTimeout(() => {
                otherZombie.userData.speed /= 1.2;
                console.log(
                  `[ZOMBIE DEBUG] ${otherZombie.userData.type}'s speed boost ended`
                );
              }, 2000);
            }
          });
        }
        break;

      case "Spitter":
        // Spitters can attack from a distance
        if (
          distanceToPlayer < zombie.userData.attackRadius &&
          distanceToPlayer > 2
        ) {
          const now = Date.now();

          if (
            now - zombie.userData.lastAttackTime >
            zombie.userData.attackCooldown * 2
          ) {
            zombie.userData.lastAttackTime = now;

            // Log spit attack
            console.log(
              `[ZOMBIE DEBUG] Spitter launched projectile at player from distance ${distanceToPlayer.toFixed(
                2
              )}`
            );

            // "Spit" at player (visual effect)
            const spitGeometry = new THREE.SphereGeometry(0.2);
            const spitMaterial = new THREE.MeshBasicMaterial({
              color: 0x00ff00,
            });
            const spit = new THREE.Mesh(spitGeometry, spitMaterial);

            spit.position.copy(zombie.position);
            spit.position.y += 1;
            scene.add(spit);

            // Animate spit towards player
            const spitDirection = new THREE.Vector3();
            spitDirection.subVectors(playerPosition, spit.position).normalize();

            const animateSpit = function () {
              spit.position.x += spitDirection.x * 0.5;
              spit.position.y += spitDirection.y * 0.5;
              spit.position.z += spitDirection.z * 0.5;

              // Check if spit hit player
              if (spit.position.distanceTo(playerPosition) < 1) {
                gameState.health -= zombie.userData.damage;
                console.log(
                  `[ZOMBIE DEBUG] Spitter projectile hit player for ${zombie.userData.damage} damage`
                );
                scene.remove(spit);
                return;
              }

              // Remove spit if it goes too far
              if (
                spit.position.distanceTo(zombie.position) >
                zombie.userData.attackRadius
              ) {
                console.log(
                  `[ZOMBIE DEBUG] Spitter projectile missed and dissipated`
                );
                scene.remove(spit);
                return;
              }

              requestAnimationFrame(animateSpit);
            };

            animateSpit();
          }
        }
        break;
    }
  };

  return zombie;
}
