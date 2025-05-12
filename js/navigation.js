// Navigation module for camera movement and view transitions

function createSmoothCameraTransition(startPosition, endPosition, startLookAt, endLookAt, duration, onComplete) {
  const startTime = Date.now();
  
  // Create quaternions for rotation interpolation
  const startQuaternion = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().lookAt(startPosition, startLookAt, new THREE.Vector3(0, 1, 0))
  );
  
  const endQuaternion = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().lookAt(endPosition, endLookAt, new THREE.Vector3(0, 1, 0))
  );
  
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
    
    // Interpolate rotation using quaternion slerp
    const currentQuaternion = new THREE.Quaternion();
    THREE.Quaternion.slerp(startQuaternion, endQuaternion, currentQuaternion, eased);
    
    // Create a matrix from the interpolated quaternion
    const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(currentQuaternion);
    
    // Extract the look-at point from this rotation
    const lookAtPoint = new THREE.Vector3(0, 0, -1)
      .applyMatrix4(rotationMatrix)
      .add(camera.position);
    
    camera.lookAt(lookAtPoint);
    
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
    createSmoothCameraTransition(
      startPosition, 
      targetPosition, 
      startLookAt, 
      targetLookAt, 
      2000, 
      () => {
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
    );
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
    const startLookAt = new THREE.Vector3();
    camera.getWorldDirection(startLookAt);
    startLookAt.multiplyScalar(50).add(camera.position);
    
    // Calculate target position (offset from the planet)
    const targetOffset = new THREE.Vector3(0, 3, 10);
    const targetPosition = planet.position.clone().add(targetOffset);
    
    // Calculate a smooth look-at point
    const targetLookAt = planet.position.clone();
    
    // Transition camera
    createSmoothCameraTransition(
      startPosition, 
      targetPosition, 
      startLookAt, 
      targetLookAt, 
      2000, 
      () => {
        // Enable orbit controls focused on the planet
        if (orbitControls) {
          orbitControls.target.copy(planet.position);
          orbitControls.enabled = true;
          orbitControls.update();
        }
        
        // Show project content for this planet
        showPlanetContent(planetName);
      }
    );
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
    createSmoothCameraTransition(
      startPosition, 
      targetPosition, 
      startLookAt, 
      targetLookAt, 
      2000, 
      () => {
        // Enable orbit controls
        if (orbitControls) orbitControls.enabled = true;
        orbitControls.target.copy(TheSun.position);
        
        // Update view state
        currentView = 'solar';
        selectedPlanet = null;
      }
    );
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
    
    // Calculate a smooth look-at point
    const targetLookAt = TheSun.position.clone();
    
    // Transition camera
    createSmoothCameraTransition(
      startPosition, 
      targetPosition, 
      startLookAt, 
      targetLookAt, 
      2000, 
      () => {
        // Enable orbit controls focused on the sun
        if (orbitControls) {
          orbitControls.target.copy(TheSun.position);
          orbitControls.enabled = true;
          orbitControls.update();
        }
        
        // Show project content for the sun (about me)
        showPlanetContent(sunName);
      }
    );
  }