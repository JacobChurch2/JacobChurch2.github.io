// Navigation module for camera movement and view transitions

function transitionToSolarSystem() {
    // Hide intro content
    const content = document.getElementById('content');
    if (content) {
      content.style.opacity = '0';
      content.style.transition = 'opacity 1s ease';
    }

    //Enable Orbit controls
    orbitControls.target.copy(TheSun.position);
    orbitControls.enabled = true;
    
    // Zoom out camera
    const targetZ = 70;
    const zoomDuration = 2000; // ms
    const startZ = camera.position.z;
    const startTime = Date.now();
    
    const zoomOutInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / zoomDuration, 1);
      
      camera.position.z = startZ + (targetZ - startZ) * progress;
      
      if (progress === 1) {
        clearInterval(zoomOutInterval);
        
        // Show solar system
        showSolarSystem();
        //if (particlesMesh) particlesMesh.visible = false;
        
        // Update current view
        currentView = 'solar';
        
        // Hide content completely
        if (content) content.style.display = 'none';
      }
    }, 16);
  }
  
  function zoomToPlanet(planet) {
    const planetName = planet.userData.name;
    selectedPlanet = planet;
    
    // Update view state
    currentView = 'planet';
    
    // Show back button
    const backButton = document.getElementById('back-button');
    if (backButton) backButton.style.display = 'block';
    
    // Store the current camera position for the zoom animation
    const startPosition = camera.position.clone();
    
    // Calculate target position (slightly offset from the planet)
    const targetPosition = planet.position.clone().add(new THREE.Vector3(0, 3, 10));
    
    // Animation variables
    const duration = 2000; // ms
    const startTime = Date.now();
    
    // Create a tween function
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    const zoomInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      
      // Interpolate position
      camera.position.lerpVectors(startPosition, targetPosition, eased);
      
      // Look at the planet
      camera.lookAt(planet.position);
      
      if (progress === 1) {
        clearInterval(zoomInterval);
        
        // Enable orbit controls focused on the planet
        if (orbitControls) {
          orbitControls.target.copy(planet.position);
          orbitControls.enabled = true;
          orbitControls.update();
        }
        
        // Show project content for this planet
        showPlanetContent(planetName);
      }
    }, 16);
  }
  
  function zoomOutToSolarSystem() {
    // Hide planet content
    hidePlanetContent();
    
    // Hide back button
    const backButton = document.getElementById('back-button');
    if (backButton) backButton.style.display = 'none';
    
    // Enable orbit controls
    if (orbitControls) orbitControls.enabled = true;
    orbitControls.target.copy(TheSun.position);
    
    // Store current position for animation
    const startPosition = camera.position.clone();
    
    // Calculate a good viewpoint for the solar system
    // Position above the solar system looking down
    const targetPosition = new THREE.Vector3(0, 40, 70);
    
    // Animation variables
    const duration = 2000; // ms
    const startTime = Date.now();
    
    // Create a tween function
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    const zoomInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      
      // Interpolate position
      camera.position.lerpVectors(startPosition, targetPosition, eased);
      
      // Look at the center of the solar system
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      
      if (progress === 1) {
        clearInterval(zoomInterval);
        
        // Update view state
        currentView = 'solar';
        selectedPlanet = null;
      }
    }, 16);
  }