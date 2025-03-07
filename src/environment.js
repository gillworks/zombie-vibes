import * as THREE from 'three';

export function createEnvironment(scene) {
  // Create ground
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  
  // Rotate and position ground
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  
  scene.add(ground);
  
  // Add some buildings/obstacles
  addBuildings(scene);
  
  // Add some trees
  addTrees(scene);
  
  return {
    ground
  };
}

function addBuildings(scene) {
  // Building 1
  createBuilding(scene, -8, 0, -5, 4, 3, 4, 0x555555);
  
  // Building 2
  createBuilding(scene, 7, 0, -7, 5, 4, 5, 0x666666);
  
  // Building 3
  createBuilding(scene, -5, 0, 8, 6, 2, 3, 0x444444);
  
  // Building 4
  createBuilding(scene, 10, 0, 6, 3, 5, 3, 0x777777);
}

function createBuilding(scene, x, y, z, width, height, depth, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.7,
    metalness: 0.2
  });
  const building = new THREE.Mesh(geometry, material);
  
  building.position.set(x, y + height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  
  scene.add(building);
  
  // Add some windows
  const windowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x88CCFF,
    emissive: 0x112233,
    roughness: 0.1,
    metalness: 0.8
  });
  
  // Front windows
  for (let i = 0; i < Math.floor(width); i++) {
    for (let j = 0; j < Math.floor(height) - 1; j++) {
      if (Math.random() > 0.3) { // Some windows are broken/dark
        const windowGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1);
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(
          x - width / 2 + i + 0.5, 
          y + j + 0.5, 
          z + depth / 2 + 0.05
        );
        scene.add(windowMesh);
      }
    }
  }
  
  return building;
}

function addTrees(scene) {
  // Add some trees around the map
  for (let i = 0; i < 15; i++) {
    createTree(
      scene,
      Math.random() * 40 - 20,
      0,
      Math.random() * 40 - 20
    );
  }
}

function createTree(scene, x, y, z) {
  // Don't place trees too close to the center
  if (Math.abs(x) < 5 && Math.abs(z) < 5) return;
  
  // Tree trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513,
    roughness: 0.9,
    metalness: 0.1
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  
  trunk.position.set(x, y + 0.75, z);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  
  scene.add(trunk);
  
  // Tree top
  const topGeometry = new THREE.ConeGeometry(1, 2, 8);
  const topMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x006400,
    roughness: 0.8,
    metalness: 0.1
  });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  
  top.position.set(x, y + 2.5, z);
  top.castShadow = true;
  top.receiveShadow = true;
  
  scene.add(top);
  
  return { trunk, top };
}