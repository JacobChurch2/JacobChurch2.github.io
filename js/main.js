// Global variables
window.scene = null;
window.camera = null;
window.renderer = null;
window.orbitControls = null;
window.currentView = 'intro'; // 'intro', 'solar', 'planet'
window.selectedPlanet = null;
window.TheSun = null;
window.planets = [];

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
    window.scene = new THREE.Scene();
    window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    window.camera.position.z = 50;
    
    window.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    window.renderer.setSize(window.innerWidth, window.innerHeight);
    window.renderer.setClearColor(0x000000, 0);
    container.appendChild(window.renderer.domElement);
    
    // Setup OrbitControls
    setupOrbitControls();
    
    // Create particle background
    createParticleBackground();
    
    // Initialize empty arrays/objects
    window.planets = [];
    window.TheSun = null;
    
    // Create solar system (initially hidden)
    createSolarSystem();
    
    // Verify solar system was created
    if (!window.TheSun || !window.planets.length) {
      throw new Error('Solar system failed to initialize properly');
    }
    console.log('Solar system initialized with', window.planets.length, 'planets and sun:', window.TheSun ? 'present' : 'missing');
    
    hideSolarSystem();
    
    // Setup UI elements and interactions AFTER solar system is created
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
    window.orbitControls = new THREE.OrbitControls(window.camera, window.renderer.domElement);
    window.orbitControls.enableDamping = true;
    window.orbitControls.dampingFactor = 0.05;
    window.orbitControls.rotateSpeed = 0.5;
    window.orbitControls.minPolarAngle = -Math.PI;
    window.orbitControls.maxPolarAngle = Math.PI;
    window.orbitControls.enabled = false; // Start disabled
  } else {
    console.warn("OrbitControls not available. Some functionality will be limited.");
    window.orbitControls = {
      enabled: false,
      update: function() {},
      target: new THREE.Vector3()
    };
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  try {
    if (window.currentView === 'intro') {
      // Animate particles
      animateParticles();
    } else if (window.currentView === 'solar') {
      // Rotate planets around the sun
      animatePlanets();
      //orbit controls
      if (window.orbitControls && window.orbitControls.enabled) {
        window.orbitControls.update();
      }
    } else if (window.currentView === 'planet') {
      // Update controls when looking at a planet
      if (window.orbitControls && window.orbitControls.enabled) {
        window.orbitControls.update();
      }
    }
    
    window.renderer.render(window.scene, window.camera);
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
  window.camera.aspect = window.innerWidth / window.innerHeight;
  window.camera.updateProjectionMatrix();
  window.renderer.setSize(window.innerWidth, window.innerHeight);
});