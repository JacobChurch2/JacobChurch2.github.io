// Solar system module
let planets = [];
let planetTextures = {
  'project1': { color: 0x3366ff, size: 2.5 },  // Blue
  'project2': { color: 0xff6633, size: 2.0 },  // Orange
  'project3': { color: 0x66cc99, size: 1.8 },  // Teal
  'project4': { color: 0xcc33ff, size: 1.6 },  // Purple
  'project5': { color: 0xffcc33, size: 2.2 }   // Yellow
};

function createSolarSystem() {
  // Create a sun (center of the solar system)
  const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffdd00
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);
  
  // Add a point light at the sun's position
  const sunLight = new THREE.PointLight(0xffffff, 1.5, 100);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);
  
  // Create planets
  let orbitRadius = 12;
  const orbitStep = 8;
  
  Object.keys(planetTextures).forEach((planetId, index) => {
    const planetConfig = planetTextures[planetId];
    
    // Create planet
    const planetGeometry = new THREE.SphereGeometry(planetConfig.size, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({ 
      color: planetConfig.color,
      shininess: 30
    });
    
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    
    // Position planet in orbit
    const angle = (index / Object.keys(planetTextures).length) * Math.PI * 2;
    planet.position.x = Math.cos(angle) * orbitRadius;
    planet.position.z = Math.sin(angle) * orbitRadius;
    
    // Add orbit visual
    const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.1, orbitRadius + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      opacity: 0.2,
      transparent: true,
      side: THREE.DoubleSide
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    
    // Store orbit radius and angle for animation
    planet.userData = {
      orbitRadius: orbitRadius,
      orbitSpeed: 0.005 - (index * 0.0005), // Planets farther from the sun move slower
      orbitAngle: angle,
      name: planetId
    };
    
    scene.add(planet);
    scene.add(orbit);
    planets.push(planet);
    
    orbitRadius += orbitStep;
  });
}

function hideSolarSystem() {
  // Hide planets and sun
  scene.children.forEach(child => {
    if (child !== particlesMesh) {
      child.visible = false;
    }
  });
}

function showSolarSystem() {
  // Show planets and sun
  scene.children.forEach(child => {
    child.visible = true;
  });
}

function animatePlanets() {
  planets.forEach(planet => {
    // Update orbit angle
    planet.userData.orbitAngle += planet.userData.orbitSpeed;
    
    // Calculate new position
    planet.position.x = Math.cos(planet.userData.orbitAngle) * planet.userData.orbitRadius;
    planet.position.z = Math.sin(planet.userData.orbitAngle) * planet.userData.orbitRadius;
    
    // Rotate the planet on its axis
    planet.rotation.y += 0.01;
  });
}

function getPlanetContent(planetName) {
  // Planet content definitions
  const planetContents = {
    'project1': {
      title: 'Web Development',
      description: 'Frontend and backend web development projects showcasing modern frameworks and techniques.'
    },
    'project2': {
      title: 'Mobile Applications',
      description: 'Native and cross-platform mobile applications for iOS and Android.'
    },
    'project3': {
      title: 'UI/UX Design',
      description: 'User interface and experience design projects, including wireframes, prototypes, and final designs.'
    },
    'project4': {
      title: 'Data Visualization',
      description: 'Interactive data visualization projects using D3.js, Three.js, and other libraries.'
    },
    'project5': {
      title: 'Machine Learning',
      description: 'Machine learning and AI projects, including natural language processing and computer vision.'
    }
  };
  
  return planetContents[planetName];
}