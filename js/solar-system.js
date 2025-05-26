// Solar system module
const planetTextures = {
  'project1': { color: 0x3366ff, size: 2.5 },  // Blue
  'project2': { color: 0xff6633, size: 2.0 },  // Orange
  'project3': { color: 0x66cc99, size: 1.8 },  // Teal
  'project4': { color: 0xcc33ff, size: 1.6 },  // Purple
  'project5': { color: 0xffcc33, size: 2.2 }   // Yellow
};

function createSolarSystem() {
  console.log('Creating solar system...');
  
  // Create a sun (center of the solar system)
  const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
  const sunMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffdd00,
    emissive: 0x000000,
    emissiveIntensity: 1,
    shininess: 30
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  window.scene.add(sun);
  window.TheSun = sun;
  
  // Add userData to sun for identification
  sun.userData = {
    name: 'about'
  };
  
  console.log('Sun created with material:', sun.material);
  
  // Add a point light at the sun's position
  const sunLight = new THREE.PointLight(0xffffff, 1.5, 100);
  sunLight.position.set(0, 0, 0);
  window.scene.add(sunLight);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x333333);
  window.scene.add(ambientLight);
  
  // Clear existing planets array
  window.planets = [];
  
  // Create planets
  let orbitRadius = 12;
  const orbitStep = 8;
  
  Object.keys(planetTextures).forEach((planetId, index) => {
    const planetConfig = planetTextures[planetId];
    
    // Create planet
    const planetGeometry = new THREE.SphereGeometry(planetConfig.size, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({ 
      color: planetConfig.color,
      emissive: 0x000000,
      emissiveIntensity: 1,
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
    
    window.scene.add(planet);
    window.scene.add(orbit);
    window.planets.push(planet);
    
    console.log(`Planet ${planetId} created with material:`, planet.material);
    
    orbitRadius += orbitStep;
  });

  console.log('Solar system created with', window.planets.length, 'planets');
}

function hideSolarSystem() {
  // Hide planets and sun
  window.scene.children.forEach(child => {
    if (child !== window.particlesMesh) {
      child.visible = false;
    }
  });
}

function showSolarSystem() {
  // Show planets and sun
  window.scene.children.forEach(child => {
    child.visible = true;
  });
}

function animatePlanets() {
  if (!window.planets) return;
  
  window.planets.forEach(planet => {
    if (!planet || !planet.userData) return;
    
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
    'about': {
      title: 'Jacob Church',
      description: 'Software Developer and Game Designer with a passion for creating immersive interactive experiences. I specialize in game development, web technologies, and innovative digital solutions.',
      contacts: [
        { 
          type: 'LinkedIn', 
          value: 'LinkedIn', 
          link: 'https://www.linkedin.com/in/jacob-church-872887252'
        },
        { 
          type: 'GitHub', 
          value: 'GitHub', 
          link: 'https://github.com/JacobChurch2'
        },
        { 
          type: 'Email', 
          value: 'jacob.work.church@gmail.com', 
          link: 'mailto:jacob.work.church@gmail.com'
        }
      ]
    },
    'project1': {
      title: 'Solar System Portfolio',
      description: 'An interactive 3D portfolio website using Three.js, showcasing my projects through a unique solar system metaphor. Demonstrates creative web development and interactive design skills.',
      projectLink: 'https://jacobchurch2.github.io'
    },
    'project2': {
      title: 'Innerworks',
      description: 'A story-driven platformer developed as a Senior Capstone Project. Explores innovative gameplay mechanics and narrative design.',
      projectLink: 'https://jacobchurch.itch.io/innerworks-ch1'
    },
    'project3': {
      title: 'Warmonger45',
      description: 'A fast-paced first-person battleground shooter developed by a team of 5 in 10 weeks. Demonstrates collaborative game development skills.',
      projectLink: 'https://store.steampowered.com/app/3512780/WARMONGER45/'
    },
    'project4': {
      title: 'DragonFiAR',
      description: 'An innovative VR game concept featuring interaction with a 2D arcade machine. Showcases creative game design and cross-platform development.',
      projectLink: 'https://www.dragonfiar.com'
    },
    'project5': {
      title: 'Space Golf',
      description: 'A unique mobile golf game that challenges players\' skills in a space-themed environment. Demonstrates mobile game development expertise.',
      projectLink: 'https://github.com/The-Innominate/Space-Golf'
    }
  };
  
  return planetContents[planetName];
}