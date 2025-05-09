// Global variables
let scene, camera, renderer;
let orbitControls;
let currentView = 'intro'; // 'intro', 'solar', 'planet'
let selectedPlanet = null;
let TheSun = null;

// Wait for page to load, then initialize
window.addEventListener('load', () => {
  console.log('Page loaded, waiting to initialize scene...');
  
  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded');
    document.getElementById('loading').innerHTML = 'Error: Three.js library not loaded. Please check your internet connection.';
    return;
  }
  
  setTimeout(() => {
    try {
      const loading = document.getElementById('loading');
      loading.classList.add('fade-out');
      setTimeout(() => {
        loading.style.display = 'none';
        initializeScene();
      }, 1000);
    } catch (error) {
      console.error('Error during initialization:', error);
      document.getElementById('loading').innerHTML = 'Error: ' + error.message;
    }
  }, 1000);
});

function initializeScene() {
  console.log('Initializing scene...');
  
  try {
    // Three.js scene setup
    const container = document.getElementById('canvas-container');
    
    // Create scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Setup OrbitControls
    setupOrbitControls();
    
    // Create particle background
    createParticleBackground();
    
    // Create solar system (initially hidden)
    createSolarSystem();
    hideSolarSystem();
    
    // Setup UI elements and interactions
    setupUI();
    
    // Animation loop
    animate();
    
    // Animate content appearance
    animateContentAppearance();
    
    console.log('Scene initialized successfully');
  } catch (error) {
    console.error('Error in initializeScene:', error);
    document.getElementById('loading').style.display = 'block';
    document.getElementById('loading').classList.remove('fade-out');
    document.getElementById('loading').innerHTML = 'Error initializing: ' + error.message;
  }
}

function setupOrbitControls() {
  if (typeof THREE.OrbitControls === 'function') {
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.rotateSpeed = 0.5;
    orbitControls.minPolarAngle = -Math.PI;
    orbitControls.maxPolarAngle = Math.PI;
    orbitControls.enabled = false; // Start disabled
  } else {
    console.warn("OrbitControls not available. Some functionality will be limited.");
    orbitControls = {
      enabled: false,
      update: function() {},
      target: new THREE.Vector3()
    };
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  try {
    if (currentView === 'intro') {
      // Animate particles
      animateParticles();
    } else if (currentView === 'solar') {
      // Rotate planets around the sun
      animatePlanets();
      //orbit controls
      if (orbitControls && orbitControls.enabled) {
        orbitControls.update();
      }
    } else if (currentView === 'planet') {
      // Update controls when looking at a planet
      if (orbitControls && orbitControls.enabled) {
        orbitControls.update();
      }
    }
    
    renderer.render(scene, camera);
  } catch (error) {
    console.error('Error in animation loop:', error);
  }
}

function animateContentAppearance() {
  setTimeout(() => {
    const title = document.getElementById('main-title');
    const subtitle = document.getElementById('subtitle');
    const enterBtn = document.getElementById('enter-btn');
    
    if (title) {
      title.classList.add('visible');
      console.log('Added visible class to title');
    }
    
    if (subtitle) {
      subtitle.classList.add('visible');
      console.log('Added visible class to subtitle');
    }
    
    if (enterBtn) {
      enterBtn.classList.add('visible');
      console.log('Added visible class to enter button');
    } else {
      console.error('Enter button not found!');
    }
  }, 500);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});