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
      const intersects = raycaster.intersectObjects(planets);
  
      if (intersects.length > 0) {
        const planet = intersects[0].object;
        zoomToPlanet(planet);
      }
    });
  
    // Planet hover effects
    renderer.domElement.addEventListener('mousemove', (event) => {
      if (currentView !== 'solar') return;
  
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planets);
  
      // Reset all planets
      planets.forEach(planet => {
        planet.material.emissive.setHex(0x000000);
        planet.scale.set(1, 1, 1);
      });
  
      // Highlight hovered planet
      if (intersects.length > 0) {
        const planet = intersects[0].object;
        planet.material.emissive.setHex(0x111111);
        planet.scale.set(1.1, 1.1, 1.1);
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    });
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
    
    // Set content
    planetContent.innerHTML = `
      <h2>${content.title}</h2>
      <p>${content.description}</p>
      <button id="explore-project">Explore Project</button>
    `;
    
    // Show with animation
    planetContent.style.opacity = '0';
    planetContent.style.display = 'block';
    
    setTimeout(() => {
      planetContent.style.opacity = '1';
    }, 100);
    
    // Add click handler for the explore button
    document.getElementById('explore-project').addEventListener('click', () => {
      alert(`Navigate to detailed page for ${content.title}`);
      // In a real implementation, you would redirect to a project page
      // window.location.href = `projects/${planetName}.html`;
    });
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