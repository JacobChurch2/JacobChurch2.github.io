// UI module for handling user interactions and UI elements

// Add these variables at the top of the file, after the existing variables
let hoverTimeout = null;
let currentHoveredSpot = null;
let spotsGroup = null;

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
  
  // Set up spot interactions
  setupSpotInteractions();
  
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
  let currentHoveredObject = null;
  let hoverTimeout = null;

  // Planet click handler
  window.renderer.domElement.addEventListener('click', (event) => {
    if (window.currentView !== 'solar') {
      return; // Only handle clicks in solar view
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, window.camera);
    const intersects = raycaster.intersectObjects(getAllInteractiveObjects());

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
        window.zoomToPlanet(selectedObject);
      }
    }
  });

  // Hover effects
  window.renderer.domElement.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, window.camera);
    const intersects = raycaster.intersectObjects(getAllInteractiveObjects());

    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    if (intersects.length === 0) {
      // Add a small delay before hiding hover effects
      hoverTimeout = setTimeout(() => {
        resetHoverEffects();
        hideHoverContent();
        document.body.style.cursor = 'default';
        currentHoveredObject = null;
      }, 50);
      return;
    }

    const hoveredObject = intersects[0].object;
    if (!hoveredObject || !hoveredObject.material) return;

    // Only update if we're hovering over a new object
    if (currentHoveredObject !== hoveredObject) {
      resetHoverEffects();
      currentHoveredObject = hoveredObject;
      
      try {
        // Enhanced glow effect with smoother transition
        hoveredObject.material.emissive.setHex(0x444444);
        hoveredObject.material.emissiveIntensity = 2;
        
        // Smoother scale increase while preserving original scale
        const originalScale = hoveredObject.scale.clone();
        const targetScale = new THREE.Vector3(
          originalScale.x * 1.3,
          originalScale.y * 1.3,
          originalScale.z * 1.3
        );
        const duration = 200; // ms
        const startTime = Date.now();
        
        const scaleAnimation = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const scale = new THREE.Vector3().lerpVectors(originalScale, targetScale, progress);
          
          if (currentHoveredObject === hoveredObject && 
              hoveredObject.material && 
              (window.currentView === 'solar' || window.currentView === 'planet')) {
            hoveredObject.scale.copy(scale);
            if (progress < 1) {
              requestAnimationFrame(scaleAnimation);
            } else {
              // Start pulsing animation after scale is complete
              const pulseAnimation = () => {
                if (currentHoveredObject === hoveredObject && 
                    hoveredObject.material && 
                    (window.currentView === 'solar' || window.currentView === 'planet')) {
                  const pulseScale = new THREE.Vector3(
                    targetScale.x + Math.sin(Date.now() * 0.003) * 0.05,
                    targetScale.y + Math.sin(Date.now() * 0.003) * 0.05,
                    targetScale.z + Math.sin(Date.now() * 0.003) * 0.05
                  );
                  hoveredObject.scale.copy(pulseScale);
                  requestAnimationFrame(pulseAnimation);
                }
              };
              pulseAnimation();
            }
          }
        };
        scaleAnimation();
      } catch (error) {
        console.error('Error applying hover effects:', error, hoveredObject);
      }
      
      // Change cursor
      document.body.style.cursor = 'pointer';
    }

    // Show hover content with a small delay
    if (hoveredObject.userData && hoveredObject.userData.name) {
      hoverTimeout = setTimeout(() => {
        showHoverContent(hoveredObject.userData.name, null, event);
      }, 50);
    }
  });

  // Handle mouse leave
  window.renderer.domElement.addEventListener('mouseleave', () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    resetHoverEffects();
    hideHoverContent();
  });

  console.log('Planet interactions setup complete');
}

function getAllInteractiveObjects() {
  const objects = [];
  
  if (window.currentView === 'solar') {
    // In solar view, include all planets and the sun
    window.planets.forEach(planet => {
      objects.push(planet);
    });
    if (window.TheSun) {
      objects.push(window.TheSun);
    }
  } else if (window.currentView === 'planet') {
    // In planet view, only include mini planets of the first planet
    window.planets.forEach(planet => {
      if (planet.userData.name === 'project1' && planet.userData.miniPlanets) {
        objects.push(...planet.userData.miniPlanets);
      }
    });
  }
  
  return objects;
}

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
          // Preserve original scale for slime planet
          if (planet.userData.name === 'project2') {
            planet.scale.set(1, 1.2, 1);
          } else {
          planet.scale.set(1, 1, 1);
          }
          
          // Reset mini planets if they exist
          if (planet.userData && planet.userData.miniPlanets) {
            planet.userData.miniPlanets.forEach(miniPlanet => {
              if (miniPlanet && miniPlanet.material && miniPlanet.material.emissive) {
                miniPlanet.material.emissive.setHex(0x000000);
                miniPlanet.material.emissiveIntensity = 0.3;
                miniPlanet.scale.set(1, 1, 1);
              }
            });
          }
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

function createInteractiveSpots(planet) {
  // Create a group to hold all interactive spots
  const spotsGroup = new THREE.Group();
  
  // Define spots with their positions, content, and orbital parameters
  const spots = [
    {
      position: new THREE.Vector3(2.5, 1.2, 0),
      content: {
        title: "Technical Details",
        description: "Technologies and frameworks used in this project"
      },
      orbit: {
        radius: 2.5,
        speed: 0.2,
        tilt: Math.PI / 6,  // 30 degrees
        phase: 0
      }
    },
    {
      position: new THREE.Vector3(-2.0, 0.8, 1.2),
      content: {
        title: "My Role",
        description: "My contributions and responsibilities"
      },
      orbit: {
        radius: 2.2,
        speed: 0.15,
        tilt: -Math.PI / 4,  // -45 degrees
        phase: Math.PI / 2
      }
    },
    {
      position: new THREE.Vector3(0, -2.0, 1.5),
      content: {
        title: "Key Features",
        description: "Notable features and achievements"
      },
      orbit: {
        radius: 2.3,
        speed: 0.18,
        tilt: Math.PI / 3,  // 60 degrees
        phase: Math.PI
      }
    }
  ];
  
  // Determine spot color based on the planet
  let spotColor = 0xff14b5; // Default pink
  if (planet.userData.name === 'project2') {
    spotColor = 0xff0000; // Red for project2
  }

  // Create visual indicators for each spot
  spots.forEach(spot => {
    // Create the glowing sphere
    const geometry = new THREE.SphereGeometry(0.15, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: spotColor,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.9
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    
    // Store the orbital parameters in the sphere's userData
    sphere.userData = {
      ...spot.content,
      orbit: spot.orbit,
      originalPosition: spot.position.clone()
    };
    
    // Add a point light to make it glow
    const light = new THREE.PointLight(spotColor, 1, 2);
    light.position.copy(sphere.position);
    sphere.add(light);
    
    spotsGroup.add(sphere);
  });
  
  // Add the spots group to the planet
  planet.add(spotsGroup);

  // Create orbital animation
  const animateOrbits = () => {
    if (window.currentView === 'planet') {
      spotsGroup.children.forEach(sphere => {
        const orbit = sphere.userData.orbit;
        const time = Date.now() * 0.001;
        
        // Calculate orbital position
        const angle = time * orbit.speed + orbit.phase;
        const x = Math.cos(angle) * orbit.radius;
        const y = Math.sin(angle) * Math.sin(orbit.tilt) * orbit.radius;
        const z = Math.sin(angle) * Math.cos(orbit.tilt) * orbit.radius;
        
        // Update position
        sphere.position.set(x, y, z);
        
        // Add floating motion
        sphere.position.y += Math.sin(time * 2) * 0.05;
        
        // Rotate the sphere
        sphere.rotation.y += 0.01;
      });
      
      requestAnimationFrame(animateOrbits);
    }
  };
  
  animateOrbits();
  
  return spotsGroup;
}

function setupSpotInteractions() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  window.renderer.domElement.addEventListener('mousemove', (event) => {
    // Handle eye tracking for slime planet
    if (window.currentView === 'planet' && window.selectedPlanet && window.selectedPlanet.userData.name === 'project2') {
      const eyes = window.selectedPlanet.userData.eyes;
      if (eyes) {
        // Convert mouse position to normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Calculate eye rotation based on mouse position
        const maxRotation = Math.PI / 6; // 30 degrees max rotation
        eyes.forEach(eye => {
          // Calculate target rotation (invert Y for correct up/down tracking)
          const targetRotationX = -mouse.y * maxRotation;
          const targetRotationY = mouse.x * maxRotation;
          
          // Smoothly interpolate current rotation to target
          eye.rotation.x += (targetRotationX - eye.rotation.x) * 0.1;
          eye.rotation.y += (targetRotationY - eye.rotation.y) * 0.1;
        });
      }
    }
    
    // Existing spot interaction code
    if (window.currentView !== 'planet' || !spotsGroup) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, window.camera);
    const intersects = raycaster.intersectObjects(spotsGroup.children);
    
    if (intersects.length > 0) {
      const spot = intersects[0].object;
      
      // Clear any existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      
      // Only update if we're hovering over a different spot
      if (currentHoveredSpot !== spot) {
        // Reset previous spot if it exists
        if (currentHoveredSpot) {
          currentHoveredSpot.material.emissiveIntensity = 1;
          currentHoveredSpot.material.opacity = 0.9;
          currentHoveredSpot.children[0].intensity = 1;
        }
        
        // Update current spot
        currentHoveredSpot = spot;
        spot.material.emissiveIntensity = 2;
        spot.material.opacity = 1;
        spot.children[0].intensity = 2;
        document.body.style.cursor = 'pointer';
        
        // Show content immediately
        showSpotContent(spot.userData, event.clientX, event.clientY);
      } else {
        // Update position of existing content
        const spotContent = document.getElementById('spot-content');
        if (spotContent) {
          const padding = 20;
          spotContent.style.left = `${event.clientX + padding}px`;
          spotContent.style.top = `${event.clientY + padding}px`;
        }
      }
    } else {
      // Only hide if we're not already in the process of hiding
      if (!hoverTimeout && currentHoveredSpot) {
        hoverTimeout = setTimeout(() => {
          hideSpotContent();
          if (currentHoveredSpot) {
            currentHoveredSpot.material.emissiveIntensity = 1;
            currentHoveredSpot.material.opacity = 0.9;
            currentHoveredSpot.children[0].intensity = 1;
          }
          currentHoveredSpot = null;
          document.body.style.cursor = 'default';
          hoverTimeout = null;
        }, 100); // Small delay before hiding
      }
    }
  });
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
    
    ${planetName !== 'project1' && planetName !== 'project3' ? `
      <div class="interactive-spots-info">
        <p>Hover over the glowing spots on the planet to learn more about different aspects of this project.</p>
      </div>
    ` : ''}
  `;
  
  // Show with animation
  planetContent.style.opacity = '0';
  planetContent.style.display = 'block';
  
  setTimeout(() => {
    planetContent.style.opacity = '1';
  }, 100);
  
  // Create interactive spots if we're in planet view and it's not the first project or project3
  if (window.currentView === 'planet' && window.selectedPlanet && planetName !== 'project1' && planetName !== 'project3') {
    // Remove existing spots if any
    if (spotsGroup) {
      window.selectedPlanet.remove(spotsGroup);
    }
    
    // Create new spots
    spotsGroup = createInteractiveSpots(window.selectedPlanet);
  }
}

function showSpotContent(content, x, y) {
  let spotContent = document.getElementById('spot-content');
  if (!spotContent) {
    spotContent = document.createElement('div');
    spotContent.id = 'spot-content';
    document.body.appendChild(spotContent);
  }
  
  spotContent.innerHTML = `
    <h3>${content.title}</h3>
    <p>${content.description}</p>
  `;
  
  // Position the content near the mouse
  const padding = 20;
  spotContent.style.left = `${x + padding}px`;
  spotContent.style.top = `${y + padding}px`;
  spotContent.style.display = 'block';
  spotContent.style.opacity = '0';
  
  requestAnimationFrame(() => {
    spotContent.style.opacity = '1';
  });
}

function hideSpotContent() {
  const spotContent = document.getElementById('spot-content');
  if (spotContent) {
    spotContent.style.opacity = '0';
    setTimeout(() => {
      if (spotContent.style.opacity === '0') { // Only hide if still fading out
        spotContent.style.display = 'none';
      }
    }, 200);
  }
}

function hidePlanetContent() {
  const planetContent = document.getElementById('planet-content');
  if (planetContent) {
    planetContent.style.opacity = '0';
    setTimeout(() => {
      planetContent.style.display = 'none';
    }, 500);
  }
  
  // Clean up spots
  if (spotsGroup && window.selectedPlanet) {
    window.selectedPlanet.remove(spotsGroup);
    spotsGroup = null;
  }
  
  // Reset hover state
  if (currentHoveredSpot) {
    currentHoveredSpot = null;
  }
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
}

function showHoverContent(planetName, description, event) {
  let content;
  
  // Get content for the planet
  content = getPlanetContent(planetName);
  
  if (!content) return;
  
  // Create or get hover content element
  let hoverContent = document.getElementById('hover-content');
  if (!hoverContent) {
    hoverContent = document.createElement('div');
    hoverContent.id = 'hover-content';
    document.body.appendChild(hoverContent);
  }

  // Set content with enhanced styling
  hoverContent.innerHTML = `
    <div class="hover-title">${content.title}</div>
    <div class="hover-description">${content.description}</div>
    ${!planetName.startsWith('project1_mini_') ? '<div class="hover-hint">Click to learn more</div>' : ''}
  `;

  // Position the hover content
  const padding = 20;
  hoverContent.style.left = `${event.clientX + padding}px`;
  hoverContent.style.top = `${event.clientY + padding}px`;
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

  // Find the pink slime planet (project2) and start its moving lights animation
  const pinkSlimePlanet = window.planets.find(planet => planet.userData.name === 'project2');
  if (pinkSlimePlanet && pinkSlimePlanet.userData.movingLights) {
    const movingLights = pinkSlimePlanet.userData.movingLights;

    const animateMovingLights = () => {
      if (window.currentView === 'solar' || window.currentView === 'planet') {
        // Use a frame counter to apply randomness periodically
        // if (!animateMovingLights.frameCounter) {
        //     animateMovingLights.frameCounter = 0;
        // }
        // animateMovingLights.frameCounter++;

        // const applyRandomThisFrame = animateMovingLights.frameCounter % 120 === 0; // Apply random movement every 120 frames (adjust as needed for frequency)
        // const randomStrength = 0.5; // Adjust this value for the magnitude of the random jump

        movingLights.forEach(light => {
          // Update orbital position around the planet's local origin
          light.userData.angle += light.userData.speed; // Increase the angle based on speed
          
          // Calculate position with non-straight orbit (adding vertical oscillation)
          const distance = light.userData.distance;
          const angle = light.userData.angle;
          const orbitHeight = distance * 0.3; // Adjust for vertical range of orbit
          const verticalSpeed = light.userData.speed * 0.5; // Adjust vertical movement speed

          const baseX = Math.cos(angle) * distance;
          const baseY = Math.sin(angle * 2) * orbitHeight; // Vertical oscillation based on angle
          const baseZ = Math.sin(angle) * distance;
          
          // Apply the base orbital position
          light.position.set(baseX, baseY, baseZ);

          // // Apply random jump periodically (removed for now)
          // if (applyRandomThisFrame) {
          //    light.position.x += (Math.random() - 0.5) * randomStrength;
          //    light.position.y += (Math.random() - 0.5) * randomStrength;
          //    light.position.z += (Math.random() - 0.5) * randomStrength;
          // }

          // Handle blinking
          if (light.userData.blinkState === 'on') {
              light.userData.blinkTimer += 1/60; // Assuming 60 frames per second
              if (light.userData.blinkTimer >= light.userData.blinkDurationOn) {
                  light.userData.blinkState = 'fadeOut';
                  light.userData.blinkTimer = 0;
                  // Generate new random duration for next on cycle
                  light.userData.blinkDurationOn = light.userData.minDurationOn + Math.random() * (light.userData.maxDurationOn - light.userData.minDurationOn);
              }
          } else if (light.userData.blinkState === 'fadeOut') {
              light.userData.blinkTimer += 1/60;
              const fadeProgress = light.userData.blinkTimer / 0.5; // 0.5 seconds fade out
              light.intensity = light.userData.originalIntensity * (1 - Math.min(fadeProgress, 1));
              
              if (fadeProgress >= 1) {
                  light.userData.blinkState = 'off';
                  light.userData.blinkTimer = 0;
                  light.intensity = 0;
                  // Generate new random duration for off cycle
                  light.userData.blinkDurationOff = light.userData.minDurationOff + Math.random() * (light.userData.maxDurationOff - light.userData.minDurationOff);
              }
          } else if (light.userData.blinkState === 'off') {
              light.userData.blinkTimer += 1/60;
              if (light.userData.blinkTimer >= light.userData.blinkDurationOff) {
                  light.userData.blinkState = 'fadeIn';
                  light.userData.blinkTimer = 0;
              }
          } else if (light.userData.blinkState === 'fadeIn') {
              light.userData.blinkTimer += 1/60;
              const fadeProgress = light.userData.blinkTimer / 0.5; // 0.5 seconds fade in
              light.intensity = light.userData.originalIntensity * Math.min(fadeProgress, 1);
              
              if (fadeProgress >= 1) {
                  light.userData.blinkState = 'on';
                  light.userData.blinkTimer = 0;
                  light.intensity = light.userData.originalIntensity;
              }
          }

         });

        // Reset counter if it gets too large (removed for now)
        // if (animateMovingLights.frameCounter > 10000) {
        //     animateMovingLights.frameCounter = 0;
        // }

        requestAnimationFrame(animateMovingLights);
      }
    };
    animateMovingLights(); // Start the animation loop
  }
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
    
    // Store original scale if it's the slime planet
    const originalScale = planet.userData.name === 'project2' ? planet.scale.clone() : null;
    
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
        
        // Restore original scale if it was stored
        if (originalScale) {
          planet.scale.copy(originalScale);
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

// Add styles for the futuristic popup
const style = document.createElement('style');
style.textContent = `
  .info-popup {
    position: fixed;
    background: rgba(51, 102, 255, 0.15);
    backdrop-filter: blur(15px);
    border: 2px solid rgba(51, 102, 255, 0.5);
    border-radius: 10px;
    padding: 20px;
    color: #fff;
    font-family: 'Arial', sans-serif;
    max-width: 300px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    box-shadow: 0 0 30px rgba(51, 102, 255, 0.4),
                inset 0 0 20px rgba(51, 102, 255, 0.2);
    z-index: 1000;
  }

  .info-popup.visible {
    opacity: 1;
  }

  .info-popup h3 {
    color: #3366ff;
    margin: 0 0 10px 0;
    font-size: 1.2em;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(51, 102, 255, 0.5);
  }

  .info-popup p {
    margin: 0;
    line-height: 1.4;
    font-size: 0.9em;
    text-shadow: 0 0 5px rgba(51, 102, 255, 0.3);
  }

  .info-popup::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid rgba(51, 102, 255, 0.5);
  }

  .connection-line {
    position: fixed;
    pointer-events: none;
    z-index: 999;
    opacity: 0;
    transition: opacity 0.3s ease;
    height: 4px !important;
    box-shadow: 0 0 10px rgba(51, 102, 255, 0.5);
  }

  .connection-line.visible {
    opacity: 1;
  }
`;
document.head.appendChild(style);

// Create popup element
const popup = document.createElement('div');
popup.className = 'info-popup';
document.body.appendChild(popup);

// Create connection line element
const connectionLine = document.createElement('div');
connectionLine.className = 'connection-line';
document.body.appendChild(connectionLine);

// Add raycaster for spot interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to update popup position and content
function updatePopup(event, title, description, spotPosition) {
  const x = event.clientX;
  const y = event.clientY;
  
  // Position popup near cursor but ensure it stays within viewport
  const popupWidth = 300;
  const popupHeight = 150;
  const padding = 20;
  
  let popupX = x + 20;
  let popupY = y + 20;
  
  // Adjust if popup would go off screen
  if (popupX + popupWidth > window.innerWidth) {
    popupX = x - popupWidth - 20;
  }
  if (popupY + popupHeight > window.innerHeight) {
    popupY = y - popupHeight - 20;
  }
  
  popup.style.left = `${popupX}px`;
  popup.style.top = `${popupY}px`;
  popup.innerHTML = `
    <h3>${title}</h3>
    <p>${description}</p>
  `;
  popup.classList.add('visible');

  // Update connection line
  if (spotPosition) {
    const spotScreenPos = spotPosition.clone().project(window.camera);
    const spotX = (spotScreenPos.x * 0.5 + 0.5) * window.innerWidth;
    const spotY = (-spotScreenPos.y * 0.5 + 0.5) * window.innerHeight;

    // Calculate line properties
    const dx = popupX - spotX;
    const dy = popupY - spotY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    // Style the connection line
    connectionLine.style.width = `${length}px`;
    connectionLine.style.background = 'linear-gradient(90deg, rgba(51, 102, 255, 0.8), rgba(51, 102, 255, 0.3))';
    connectionLine.style.transform = `translate(${spotX}px, ${spotY}px) rotate(${angle}deg)`;
    connectionLine.style.transformOrigin = '0 0';
    connectionLine.classList.add('visible');
  }
}

// Function to hide popup
function hidePopup() {
  popup.classList.remove('visible');
  connectionLine.classList.remove('visible');
}

// Add mouse move handler for spot interaction
document.addEventListener('mousemove', (event) => {
  // Update mouse position
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Only check for interactions if we're in planet view
  if (window.currentView === 'planet' && window.selectedPlanet && window.selectedPlanet.userData.name === 'project3') {
    raycaster.setFromCamera(mouse, window.camera);
    
    // Check for intersections with interactive spots
    const spots = window.selectedPlanet.userData.spotsGroup.children;
    const intersects = raycaster.intersectObjects(spots);
    
    if (intersects.length > 0) {
      const spot = intersects[0].object;
      updatePopup(event, spot.userData.title, spot.userData.description, spot.position);
      // Hide connection line while hovering
      connectionLine.classList.remove('visible');
    } else {
      // Hide popup and connection line when not hovering over any spot
      hidePopup();
    }
  } else {
    hidePopup();
  }
});