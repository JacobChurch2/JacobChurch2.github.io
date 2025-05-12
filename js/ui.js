// UI module for handling user interactions and UI elements

function setupUI() {
    // Set up interaction for planets
    setupPlanetInteractions();
    
    // Create back button for planet view
    createBackButton();
    
    // Set up enter button event
    setupEnterButton();
  }
  
  function setupPlanetInteractions() {
    // Raycaster for planet interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
  
    // Planet click handler
    renderer.domElement.addEventListener('click', (event) => {
      if (currentView !== 'solar') return;
  
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
      raycaster.setFromCamera(mouse, camera);
      const intersectedObjects = [...planets, TheSun];
      const intersects = raycaster.intersectObjects(intersectedObjects);
  
      if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (selectedObject === TheSun) {
          zoomToSun();
        } else {
          zoomToPlanet(selectedObject);
        }
      }
    });
  
    // Hover effects
    renderer.domElement.addEventListener('mousemove', (event) => {
      if (currentView !== 'solar') return;
  
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
      raycaster.setFromCamera(mouse, camera);
      const intersectedObjects = [...planets, TheSun];
      const intersects = raycaster.intersectObjects(intersectedObjects);
  
      // Reset all planets and sun
      resetHoverEffects();
  
      // Highlight hovered object
      if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        
        // Glow effect
        hoveredObject.material.emissive.setHex(0x222222);
        
        // Slight scale increase
        hoveredObject.scale.set(1.15, 1.15, 1.15);
        
        // Change cursor
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    });
  }
  
  // Helper function to reset hover effects
  function resetHoverEffects() {
    // Reset sun
    TheSun.material.emissive.setHex(0x000000);
    TheSun.scale.set(1, 1, 1);
    
    // Reset planets
    planets.forEach(planet => {
      planet.material.emissive.setHex(0x000000);
      planet.scale.set(1, 1, 1);
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
    
    // Calculate target position (slightly offset from the sun)
    const targetPosition = TheSun.position.clone().add(new THREE.Vector3(0, 3, 10));
    
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
      
      // Look at the sun
      camera.lookAt(TheSun.position);
      
      if (progress === 1) {
        clearInterval(zoomInterval);
        
        // Enable orbit controls focused on the sun
        if (orbitControls) {
          orbitControls.target.copy(TheSun.position);
          orbitControls.enabled = true;
          orbitControls.update();
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
      if (currentView === 'planet') {
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
      <div class="contacts">
        <h3>Contact Information</h3>
        ${contactsHTML}
      </div>
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