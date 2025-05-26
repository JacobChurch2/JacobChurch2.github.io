// Navigation module for camera movement and view transitions

function createSmoothCameraTransition(params) {
  const {
    startPosition, 
    endPosition, 
    startLookAt, 
    endLookAt, 
    duration = 2000, 
    onComplete,
    onUpdate
  } = params;
  
  const startTime = Date.now();
  
  // Tween function
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  const transitionInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    
    // Interpolate position
    const currentPosition = new THREE.Vector3().lerpVectors(startPosition, endPosition, eased);
    camera.position.copy(currentPosition);
    
    // Interpolate look-at point
    const currentLookAt = new THREE.Vector3().lerpVectors(startLookAt, endLookAt, eased);
    
    // Look at the interpolated point
    camera.lookAt(currentLookAt);
    
    // Custom update callback
    if (onUpdate) onUpdate(eased);
    
    // Update projection matrix
    camera.updateProjectionMatrix();
    
    if (progress === 1) {
      clearInterval(transitionInterval);
      
      // Ensure final position and look-at
      camera.position.copy(endPosition);
      camera.lookAt(endLookAt);
      
      // Call completion callback
      if (onComplete) onComplete();
    }
  }, 16);
}

function transitionToSolarSystem() {
    // Hide intro content
    const content = document.getElementById('content');
    if (content) {
      content.style.opacity = '0';
      content.style.transition = 'opacity 1s ease';
    }

    // Prepare start and target camera states
    const startPosition = camera.position.clone();
    const startLookAt = new THREE.Vector3();
    camera.getWorldDirection(startLookAt);
    startLookAt.multiplyScalar(50).add(camera.position);
    
    const targetPosition = new THREE.Vector3(0, 0, 70);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    
    // Transition camera
    createSmoothCameraTransition({
      startPosition, 
      endPosition: targetPosition, 
      startLookAt, 
      endLookAt: targetLookAt, 
      onComplete: () => {
        //Enable Orbit controls
        orbitControls.target.copy(TheSun.position);
        orbitControls.enabled = true;
        
        // Show solar system
        showSolarSystem();
        
        // Update current view
        currentView = 'solar';
        
        // Hide content completely
        if (content) content.style.display = 'none';
      }
    });
  }
  
  function zoomToPlanet(planet) {
    const planetName = planet.userData.name;
    selectedPlanet = planet;
    
    // Update view state
    currentView = 'planet';
    
    // Show back button
    const backButton = document.getElementById('back-button');
    if (backButton) backButton.style.display = 'block';
    
    // Store the current camera position and target
    const startPosition = camera.position.clone();
    const startLookAt = orbitControls.target.clone();
    
    // Calculate target position based on planet's size and position
    const planetRadius = planet.geometry.boundingSphere ? planet.geometry.boundingSphere.radius : 1;
    const distanceFromPlanet = planetRadius * 5; // Closer view of the planet
    
    // Calculate a position above and slightly behind the planet relative to the sun
    const planetToSun = planet.position.clone().negate().normalize();
    const upVector = new THREE.Vector3(0, 1, 0);
    const rightVector = new THREE.Vector3().crossVectors(planetToSun, upVector).normalize();
    
    // Combine vectors to position camera at an angle
    const targetOffset = new THREE.Vector3()
      .addScaledVector(planetToSun, -distanceFromPlanet * 0.5) // Behind
      .addScaledVector(upVector, distanceFromPlanet * 0.3) // Above
      .addScaledVector(rightVector, distanceFromPlanet * 0.2); // Slight angle
    
    const targetPosition = planet.position.clone().add(targetOffset);
    const targetLookAt = planet.position.clone();
    
    // Disable orbit controls during transition
    if (orbitControls) orbitControls.enabled = false;
    
    // Transition camera
    createSmoothCameraTransition({
      startPosition,
      endPosition: targetPosition,
      startLookAt,
      endLookAt: targetLookAt,
      duration: 2000,
      onComplete: () => {
        // Re-enable and update orbit controls
        if (orbitControls) {
          orbitControls.target.copy(planet.position);
          orbitControls.enabled = true;
          orbitControls.update();
        }
        
        // Show project content for this planet
        showPlanetContent(planetName);
      },
      onUpdate: (progress) => {
        // Continuously update orbit controls target during transition
        if (orbitControls) {
          const interpolatedTarget = new THREE.Vector3().lerpVectors(startLookAt, targetLookAt, progress);
          orbitControls.target.copy(interpolatedTarget);
          orbitControls.update();
        }
      }
    });
  }
  
  function zoomOutToSolarSystem() {
    // Hide planet content
    hidePlanetContent();
    
    // Hide back button
    const backButton = document.getElementById('back-button');
    if (backButton) backButton.style.display = 'none';
    
    // Store current position for animation
    const startPosition = camera.position.clone();
    const startLookAt = new THREE.Vector3();
    camera.getWorldDirection(startLookAt);
    startLookAt.multiplyScalar(50).add(camera.position);
    
    // Calculate a good viewpoint for the solar system
    const targetPosition = new THREE.Vector3(0, 40, 70);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    
    // Transition camera
    createSmoothCameraTransition({
      startPosition, 
      endPosition: targetPosition, 
      startLookAt, 
      endLookAt: targetLookAt, 
      onComplete: () => {
        // Enable orbit controls
        if (orbitControls) orbitControls.enabled = true;
        orbitControls.target.copy(TheSun.position);
        
        // Update view state
        currentView = 'solar';
        selectedPlanet = null;
      },
      onUpdate: (progress) => {
        // Continuously update orbit controls target during transition
        if (orbitControls) {
          const interpolatedTarget = new THREE.Vector3().lerpVectors(startLookAt, targetLookAt, progress);
          orbitControls.target.copy(interpolatedTarget);
        }
      }
    });
  }
  
  function zoomToSun() {
    const sunName = 'about';
    
    // Update view state
    currentView = 'planet';
    
    // Show back button
    const backButton = document.getElementById('back-button');
    if (backButton) backButton.style.display = 'block';
    
    // Store the current camera position for the zoom animation
    const startPosition = camera.position.clone();
    const startLookAt = new THREE.Vector3();
    camera.getWorldDirection(startLookAt);
    startLookAt.multiplyScalar(50).add(camera.position);
    
    // Calculate target position (slightly offset from the sun)
    const targetOffset = new THREE.Vector3(0, 3, 10);
    const targetPosition = TheSun.position.clone().add(targetOffset);
    
    // Use the sun's position as the constant look-at point
    const targetLookAt = TheSun.position.clone();
    
    // Transition camera
    createSmoothCameraTransition({
      startPosition, 
      endPosition: targetPosition, 
      startLookAt, 
      endLookAt: targetLookAt, 
      onComplete: () => {
        // Enable orbit controls focused on the sun
        if (orbitControls) {
          orbitControls.target.copy(TheSun.position);
          orbitControls.enabled = true;
          orbitControls.update();
        }
        
        // Show project content for the sun (about me)
        showPlanetContent(sunName);
      },
      onUpdate: (progress) => {
        // Continuously update orbit controls target during transition
        if (orbitControls) {
          const interpolatedTarget = new THREE.Vector3().lerpVectors(startLookAt, targetLookAt, progress);
          orbitControls.target.copy(interpolatedTarget);
        }
      }
    });
  }