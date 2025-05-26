// UI module for handling user interactions and UI elements

function setupUI() {
  console.log('Setting up UI...');
  
  // Verify required objects exist
  if (!window.TheSun) {
    console.error('Sun not initialized before UI setup');
    return;
  }
  if (!window.planets || !window.planets.length) {
    console.error('Planets not initialized before UI setup');
    return;
  }
  if (!window.renderer) {
    console.error('Renderer not initialized before UI setup');
    return;
  }
  
  console.log('Required objects verified for UI setup');
  
  // Set up interaction for planets
  setupPlanetInteractions();
  
  // Create back button for planet view
  createBackButton();
  
  // Set up enter button event
  setupEnterButton();
  
  console.log('UI setup completed');
}

function setupPlanetInteractions() {
  // Verify objects again just in case
  if (!window.TheSun || !window.planets || !window.planets.length) {
    console.error('Required objects missing in setupPlanetInteractions');
    return;
  }

  console.log('Setting up planet interactions with', window.planets.length, 'planets');

  // Raycaster for planet interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Planet click handler
  window.renderer.domElement.addEventListener('click', (event) => {
    if (window.currentView !== 'solar') {
      console.log('Click ignored - not in solar view. Current view:', window.currentView);
      return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, window.camera);
    const intersectedObjects = [...window.planets, window.TheSun].filter(obj => obj && obj.material);
    const intersects = raycaster.intersectObjects(intersectedObjects);

    console.log('Click detected, intersects:', intersects.length);

    if (intersects.length > 0) {
      const selectedObject = intersects[0].object;
      console.log('Selected object:', selectedObject.userData.name);
      
      // Clear any hover effects before transitioning
      resetHoverEffects();
      hideHoverContent();
      
      if (selectedObject === window.TheSun) {
        zoomToSun();
      } else {
        window.zoomToPlanet(selectedObject); // Use the navigation.js implementation
      }
    }
  });

  // Hover effects
  let hoverTimeout;
  let currentHoveredObject = null;

  window.renderer.domElement.addEventListener('mousemove', (event) => {
    if (window.currentView !== 'solar') {
      // If not in solar view, ensure hover effects are cleared
      resetHoverEffects();
      hideHoverContent();
      return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, window.camera);
    const intersectedObjects = [...window.planets, window.TheSun].filter(obj => obj && obj.material);
    const intersects = raycaster.intersectObjects(intersectedObjects);

    // Only reset effects if we're not hovering over any object
    if (intersects.length === 0) {
      resetHoverEffects();
      hideHoverContent();
      document.body.style.cursor = 'default';
      currentHoveredObject = null;
      return;
    }

    const hoveredObject = intersects[0].object;
    if (!hoveredObject || !hoveredObject.material) return;

    // Update hover content position even if it's the same object
    const planetName = hoveredObject === window.TheSun ? 'about' : hoveredObject.userData.name;
    showHoverContent(planetName, event.clientX, event.clientY);

    // Only apply effects if hovering over a new object
    if (currentHoveredObject !== hoveredObject) {
      resetHoverEffects();
      currentHoveredObject = hoveredObject;
      
      try {
        // Enhanced glow effect
        hoveredObject.material.emissive.setHex(0x444444);
        hoveredObject.material.emissiveIntensity = 2;
        
        // More noticeable scale increase
        hoveredObject.scale.set(1.3, 1.3, 1.3);
        
        // Add a pulsing animation
        const pulseAnimation = () => {
          if (currentHoveredObject === hoveredObject && 
              hoveredObject.material && 
              window.currentView === 'solar') {
            const scale = 1.3 + Math.sin(Date.now() * 0.005) * 0.1;
            hoveredObject.scale.set(scale, scale, scale);
            requestAnimationFrame(pulseAnimation);
          }
        };
        pulseAnimation();
      } catch (error) {
        console.error('Error applying hover effects:', error, hoveredObject);
      }
      
      // Change cursor
      document.body.style.cursor = 'pointer';
    }
  });

  // Handle mouse leave
  window.renderer.domElement.addEventListener('mouseleave', () => {
    if (window.currentView === 'solar') {
      resetHoverEffects();
      hideHoverContent();
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    }
  });

  console.log('Planet interactions setup complete');
}

// Helper function to reset hover effects
function resetHoverEffects() {
  try {
    // Reset sun if it exists and has material
    if (window.TheSun && window.TheSun.material && window.TheSun.material.emissive) {
      window.TheSun.material.emissive.setHex(0x000000);
      window.TheSun.material.emissiveIntensity = 1;
      window.TheSun.scale.set(1, 1, 1);
    }
    
    // Reset planets if they exist
    if (window.planets && window.planets.length > 0) {
      window.planets.forEach(planet => {
        if (planet && planet.material && planet.material.emissive) {
          planet.material.emissive.setHex(0x000000);
          planet.material.emissiveIntensity = 1;
          planet.scale.set(1, 1, 1);
        }
      });
    }
  } catch (error) {
    console.error('Error in resetHoverEffects:', error);
  }
}

function zoomToSun() {
  const sunName = 'about';
  
  // Clear any hover effects before transitioning
  resetHoverEffects();
  hideHoverContent();
  
  // Update view state
  window.currentView = 'planet';
  
  // Show back button
  const backButton = document.getElementById('back-button');
  if (backButton) backButton.style.display = 'block';
  
  // Store the current camera position for the zoom animation
  const startPosition = window.camera.position.clone();
  
  // Calculate target position (slightly offset from the sun)
  const targetPosition = window.TheSun.position.clone().add(new THREE.Vector3(0, 3, 10));
  
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
    window.camera.position.lerpVectors(startPosition, targetPosition, eased);
    
    // Look at the sun
    window.camera.lookAt(window.TheSun.position);
    
    if (progress === 1) {
      clearInterval(zoomInterval);
      
      // Enable orbit controls focused on the sun
      if (window.orbitControls) {
        window.orbitControls.target.copy(window.TheSun.position);
        window.orbitControls.enabled = true;
        window.orbitControls.update();
      }
      
      // Show project content for the sun (about me)
      showPlanetContent(sunName);
    }
  }, 16);
}

function createBackButton() {
  // Check if back button already exists
  if (document.getElementById('back-button')) {
    return;
  }
  
  const backButton = document.createElement('button');
  backButton.textContent = 'Back to Solar System';
  backButton.id = 'back-button';
  document.body.appendChild(backButton);

  backButton.addEventListener('click', () => {
    if (window.currentView === 'planet') {
      zoomOutToSolarSystem();
    }
  });
}

function setupEnterButton() {
  const enterBtn = document.getElementById('enter-btn');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      transitionToSolarSystem();
    });
  } else {
    console.error('Enter button not found for click event!');
  }
}

function showPlanetContent(planetName) {
  // Create a div for planet content if it doesn't exist
  let planetContent = document.getElementById('planet-content');
  if (!planetContent) {
    planetContent = document.createElement('div');
    planetContent.id = 'planet-content';
    document.body.appendChild(planetContent);
  }
  
  // Get content for this planet
  const content = getPlanetContent(planetName);
  
  // Construct project explore button (optional)
  const projectButton = content.projectLink 
    ? `<button id="explore-project" onclick="window.open('${content.projectLink}', '_blank')">Explore Project</button>` 
    : '';
    
  // Construct contact links HTML with buttons
  const contactsHTML = content.contacts ? content.contacts.map(contact => {
    return `
      <button class="social-link" onclick="window.open('${contact.link}', '_blank')">
        <img src="/api/placeholder/20/20" alt="${contact.type}" /> 
        ${contact.value}
      </button>
    `;
  }).join('') : '';
  
  // Set content
  planetContent.innerHTML = `
    <h2>${content.title}</h2>
    <p>${content.description}</p>
    
    ${projectButton}
    
    ${content.contacts ? `
      <div class="contacts">
        <h3>Contact Information</h3>
        ${contactsHTML}
      </div>
    ` : ''}
  `;
  
  // Show with animation
  planetContent.style.opacity = '0';
  planetContent.style.display = 'block';
  
  setTimeout(() => {
    planetContent.style.opacity = '1';
  }, 100);
}

function hidePlanetContent() {
  const planetContent = document.getElementById('planet-content');
  if (planetContent) {
    planetContent.style.opacity = '0';
    setTimeout(() => {
      planetContent.style.display = 'none';
    }, 500);
  }
}

function showHoverContent(planetName, x, y) {
  const content = getPlanetContent(planetName);
  
  // Create or get hover content element
  let hoverContent = document.getElementById('hover-content');
  if (!hoverContent) {
    hoverContent = document.createElement('div');
    hoverContent.id = 'hover-content';
    document.body.appendChild(hoverContent);
  }

  // Set content
  hoverContent.innerHTML = `
    <div class="hover-title">${content.title}</div>
    <div class="hover-description">${content.description.substring(0, 100)}...</div>
    <div class="hover-hint">Click to learn more</div>
  `;

  // Position the hover content
  const padding = 20;
  
  // Fixed position relative to viewport
  hoverContent.style.left = `${x + padding}px`;
  hoverContent.style.top = `${y + padding}px`;
  hoverContent.style.display = 'block';
  
  // Fade in animation
  hoverContent.style.opacity = '0';
  requestAnimationFrame(() => {
    hoverContent.style.opacity = '1';
  });
}

function hideHoverContent() {
  const hoverContent = document.getElementById('hover-content');
  if (hoverContent) {
    hoverContent.style.opacity = '0';
    setTimeout(() => {
      hoverContent.style.display = 'none';
    }, 200);
  }
}

function transitionToSolarSystem() {
  console.log('Transitioning to solar system view');
  
  // Hide intro content
  const content = document.getElementById('content');
  if (content) {
    content.style.opacity = '0';
    content.style.transition = 'opacity 1s ease';
    setTimeout(() => {
      content.style.display = 'none';
    }, 1000);
  }

  // Show solar system
  showSolarSystem();
  
  // Update current view
  window.currentView = 'solar';
  console.log('View updated to:', window.currentView);

  // Enable orbit controls
  if (window.orbitControls) {
    window.orbitControls.enabled = true;
  }
}