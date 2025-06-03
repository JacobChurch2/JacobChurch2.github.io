// Solar system module
const planetTextures = {
  'project1': { color: 0x3366ff, size: 2.5 },  // Blue
  'project2': { color: 0xff69b4, size: 2.0 },  // Hot Pink for Slime
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
    emissive: 0xffdd00,
    emissiveIntensity: 2,
    shininess: 30
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  window.scene.add(sun);
  window.TheSun = sun;
  
  // Add userData to sun for identification
  sun.userData = {
    name: 'about'
  };
  
  // Create a glowing aura around the sun
  const auraGeometry = new THREE.SphereGeometry(4.5, 32, 32); // Slightly larger than the sun
  const auraMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdd00, // Same color as the sun
    transparent: true,
    opacity: 0.6, // Increased opacity for brighter aura
    side: THREE.BackSide // Render the back side to make the aura appear from the center
  });
  const aura = new THREE.Mesh(auraGeometry, auraMaterial);
  sun.add(aura); // Add aura as a child of the sun so it moves with it

  // Create a simple turtle model
  const createTurtle = (size) => {
    const turtleGroup = new THREE.Group();

    // Shell (slightly flattened sphere)
    const shellGeometry = new THREE.SphereGeometry(size * 0.6, 16, 16); // Further reduced base size
    const shellMaterial = new THREE.MeshPhongMaterial({
      color: 0x228B22, // Forest Green
      emissive: 0x004400,
      shininess: 10
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    shell.scale.set(1.1, 0.6, 1.1); // Slightly wider and less flat shell (scale remains same)
    turtleGroup.add(shell);

    // Body (smaller cylinder, positioned inside shell)
    const bodyGeometry = new THREE.CylinderGeometry(size * 0.4, size * 0.5, size * 0.3, 8); // Shorter body
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513, // SaddleBrown
        emissive: 0x442200,
        shininess: 10
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -size * 0.2; // Position slightly inside and below shell
    turtleGroup.add(body);

    // Head (slightly larger sphere, positioned forward)
    const headGeometry = new THREE.SphereGeometry(size * 0.35, 8, 8); // Slightly larger head
    const headMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513, // SaddleBrown
        emissive: 0x442200,
        shininess: 10
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, -size * 0.05, size * 0.6); // Position lower and further forward
    turtleGroup.add(head);

    // Legs (small boxes, adjusted positions)
    const legGeometry = new THREE.BoxGeometry(size * 0.2, size * 0.2, size * 0.4);
    const legMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513, // SaddleBrown
        emissive: 0x442200,
        shininess: 10
    });

    const legPositions = [
        new THREE.Vector3(size * 0.5, -size * 0.5, size * 0.2), // Front right - adjusted position
        new THREE.Vector3(-size * 0.5, -size * 0.5, size * 0.2), // Front left - adjusted position
        new THREE.Vector3(size * 0.5, -size * 0.5, -size * 0.2), // Back right - adjusted position
        new THREE.Vector3(-size * 0.5, -size * 0.5, -size * 0.2) // Back left - adjusted position
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.copy(pos);
        turtleGroup.add(leg);
    });

    // Tail (small cone, adjusted position and rotation)
    const tailGeometry = new THREE.ConeGeometry(size * 0.1, size * 0.3, 8);
    const tailMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513, // SaddleBrown
        emissive: 0x442200,
        shininess: 10
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.rotation.x = Math.PI / 2; // Orient backward
    tail.position.set(0, -size * 0.2, -size * 0.6); // Position lower and further back
    turtleGroup.add(tail);

    return turtleGroup;
  };

  // Create a group for the orbiting turtles
  const orbitingTurtlesGroup = new THREE.Group();
  sun.add(orbitingTurtlesGroup); // Add turtle group as child of the sun

  // Create and position multiple orbiting turtles
  const turtleCount = 5; // Number of orbiting turtles
  const baseOrbitDistance = 5; // Base distance from the sun
  const turtleSize = 0.5; // Size of the turtles

  for (let i = 0; i < turtleCount; i++) {
    const orbitingTurtle = createTurtle(turtleSize);

    // Give each turtle a unique orbit
    const angle = (i / turtleCount) * Math.PI * 2; // Evenly spaced starting angles
    const orbitDistance = baseOrbitDistance + (i * 0.5); // Each turtle has a different orbit radius
    const orbitSpeed = 0.008 + (i * 0.002); // Each turtle has a different speed
    const height = (i - 2) * 0.5; // Vary the height of each turtle's orbit plane

    orbitingTurtle.position.set(
      Math.cos(angle) * orbitDistance,
      height, // Set initial height
      Math.sin(angle) * orbitDistance
    );
    
    // Store orbit data in each turtle's userData
    orbitingTurtle.userData.orbitAngle = angle;
    orbitingTurtle.userData.orbitSpeed = orbitSpeed;
    orbitingTurtle.userData.orbitDistance = orbitDistance;
    orbitingTurtle.userData.height = height; // Store height for animation

    orbitingTurtlesGroup.add(orbitingTurtle);
  }

  // Animation function for the orbiting turtles
  const animateOrbitingTurtles = () => {
    orbitingTurtlesGroup.children.forEach(turtle => {
      if (turtle.userData.orbitAngle !== undefined) {
        turtle.userData.orbitAngle += turtle.userData.orbitSpeed;
        
        const x = Math.cos(turtle.userData.orbitAngle) * turtle.userData.orbitDistance;
        const z = Math.sin(turtle.userData.orbitAngle) * turtle.userData.orbitDistance;
        
        // Use the stored height for this turtle
        const y = turtle.userData.height;

        turtle.position.set(x, y, z);
        
        // Make the turtle look in the direction of its orbit
        const nextAngle = turtle.userData.orbitAngle + turtle.userData.orbitSpeed;
        const nextX = Math.cos(nextAngle) * turtle.userData.orbitDistance;
        const nextZ = Math.sin(nextAngle) * turtle.userData.orbitDistance;
        const nextPosition = new THREE.Vector3(nextX, y, nextZ);
        
        turtle.lookAt(nextPosition);
        turtle.rotation.y += Math.PI / 2;
      }
    });
    requestAnimationFrame(animateOrbitingTurtles);
  };

  // Start the orbiting animation
  animateOrbitingTurtles();

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
    
    let planet;
    let planetMaterial;
    
    if (planetId === 'project1') {
      // Create mini solar system for the first planet
      const position = new THREE.Vector3(
        Math.cos((index / Object.keys(planetTextures).length) * Math.PI * 2) * orbitRadius,
        0,
        Math.sin((index / Object.keys(planetTextures).length) * Math.PI * 2) * orbitRadius
      );
      
      // Create the mini system and get both the system and the interactive sun
      const { miniSystem, sun } = createMiniSolarSystem(position, planetConfig.size);
      
      // Add the mini system to the scene
      window.scene.add(miniSystem);
      
      // Use the sun as the interactive planet
      planet = sun;
      
      // Store reference to mini system in the sun's userData
      planet.userData.miniSystem = miniSystem;
      
    } else {
      // Create regular planet
      const planetGeometry = new THREE.SphereGeometry(planetConfig.size, 32, 32);
      
      if (planetId === 'project2') {
        // Special material for the pink slime planet
        planetMaterial = new THREE.MeshPhongMaterial({
          color: planetConfig.color,
          emissive: planetConfig.color,
          emissiveIntensity: 0.3,
          shininess: 150,
          specular: 0xffffff
        });
        
        planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // Make the planet slightly elongated vertically
        planet.scale.set(1, 1.1, 1);
        
        // Add eyes
        const eyeSizeBlue = planetConfig.size * 0.23;
        const eyeSizeWhite = planetConfig.size * 0.3;
        
        const eyeGeometryBlue = new THREE.SphereGeometry(eyeSizeBlue, 16, 16);
        const eyeMaterialBlue = new THREE.MeshPhongMaterial({
          color: 0x0000ff,
          emissive: 0x000088,
          emissiveIntensity: 1,
          shininess: 50
        });
        
        const eyeGeometryWhite = new THREE.SphereGeometry(eyeSizeWhite, 24, 24);
        const whiteEyeMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          emissive: 0xaaaaaa,
          emissiveIntensity: 0.5,
          shininess: 20
        });
        
        // Create groups for each eye
        const eyeGroup1 = new THREE.Group();
        const eyeGroup2 = new THREE.Group();
        
        const blueEye1 = new THREE.Mesh(eyeGeometryBlue, eyeMaterialBlue);
        const blueEye2 = new THREE.Mesh(eyeGeometryBlue, eyeMaterialBlue);
        
        const whiteEye1 = new THREE.Mesh(eyeGeometryWhite, whiteEyeMaterial);
        const whiteEye2 = new THREE.Mesh(eyeGeometryWhite, whiteEyeMaterial);
        
        // Make eyes flatter
        const flatnessScale = 0.75;
        blueEye1.scale.z = flatnessScale;
        blueEye2.scale.z = flatnessScale;
        whiteEye1.scale.z = flatnessScale;
        whiteEye2.scale.z = flatnessScale;

        // Position white eye behind blue eye
        const blueEyeLocalZ = (eyeSizeBlue * flatnessScale) * 0.25;
        const whiteEyeLocalZ = -(eyeSizeWhite * flatnessScale) * 0.5;
        
        blueEye1.position.set(0, 0, blueEyeLocalZ);
        blueEye2.position.set(0, 0, blueEyeLocalZ);
        
        whiteEye1.position.set(0, 0, whiteEyeLocalZ);
        whiteEye2.position.set(0, 0, whiteEyeLocalZ);

        eyeGroup1.add(whiteEye1);
        eyeGroup1.add(blueEye1);
        
        eyeGroup2.add(whiteEye2);
        eyeGroup2.add(blueEye2);
        
        // Position eye groups on the planet surface
        const eyePairOffsetZ = planetConfig.size * 0.85;
        const eyePairOffsetY = planetConfig.size * 0.25;
        const eyePairOffsetX = planetConfig.size * 0.35;
        
        eyeGroup1.position.set(eyePairOffsetX, eyePairOffsetY, eyePairOffsetZ);
        eyeGroup2.position.set(-eyePairOffsetX, eyePairOffsetY, eyePairOffsetZ);
        
        // Add eye groups to the planet
        planet.add(eyeGroup1);
        planet.add(eyeGroup2);

        // Store eye groups in userData for tracking
        planet.userData.eyes = [eyeGroup1, eyeGroup2];

        // Add drips to the bottom of the planet
        const dripMaterial = new THREE.MeshPhongMaterial({
          color: planetConfig.color,
          emissive: planetConfig.color,
          emissiveIntensity: 0.3,
          shininess: 150,
          specular: 0xffffff
        });

        // Create a group to hold all drips
        const dripsGroup = new THREE.Group();
        planet.add(dripsGroup);

        // Function to create and animate a falling sphere
        const createFallingSphere = (radius, startPosition) => {
          // Create the sphere
          const sphereGeometry = new THREE.SphereGeometry(radius, 16, 16);
          const sphere = new THREE.Mesh(sphereGeometry, dripMaterial);
          sphere.position.set(0, 0, 0);
          sphere.userData.fallSpeed = 0.005 + Math.random() * 0.005;
          sphere.userData.initialY = startPosition.y;
          sphere.userData.maxFallDistance = 3.0;
          sphere.userData.radius = radius;

          // Create the connecting cylinder
          const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, 1, 16);
          const cylinder = new THREE.Mesh(cylinderGeometry, dripMaterial);
          cylinder.position.set(0, 0, 0);
          
          // Create a group to hold both the sphere and cylinder
          const dripGroup = new THREE.Group();
          dripGroup.position.set(startPosition.x, startPosition.y, startPosition.z);
          dripGroup.add(sphere);
          dripGroup.add(cylinder);
          
          // Store references for animation
          dripGroup.userData = {
            fallSpeed: sphere.userData.fallSpeed,
            initialY: startPosition.y,
            maxFallDistance: sphere.userData.maxFallDistance,
            sphere: sphere,
            cylinder: cylinder,
            radius: radius,
            startX: startPosition.x,
            startZ: startPosition.z,
            currentFallDistance: 0
          };

          dripsGroup.add(dripGroup);
          return dripGroup;
        };

        // Function to animate falling spheres
        const animateFallingSpheres = () => {
          // Always animate, regardless of view
          dripsGroup.children.forEach((dripGroup) => {
            const fallDistance = dripGroup.userData.fallSpeed;
            
            // Update cylinder to connect sphere to planet
            const cylinder = dripGroup.userData.cylinder;
            const sphere = dripGroup.userData.sphere;
            const radius = dripGroup.userData.radius;
            
            // Update the total fall distance
            dripGroup.userData.currentFallDistance += fallDistance;
            
            // Check if cylinder should disconnect (at 70% of max fall distance)
            const disconnectThreshold = dripGroup.userData.maxFallDistance * 0.7;
            
            if (dripGroup.userData.currentFallDistance > disconnectThreshold) {
              // Start shrinking the cylinder if not already shrinking
              if (!dripGroup.userData.isShrinking) {
                dripGroup.userData.isShrinking = true;
                dripGroup.userData.shrinkStartTime = Date.now();
                dripGroup.userData.initialCylinderHeight = cylinder.scale.y;
                dripGroup.userData.topPosition = 0;
              }
              
              // Calculate cylinder shrink progress (over 0.5 seconds)
              const shrinkProgress = Math.min(1, (Date.now() - dripGroup.userData.shrinkStartTime) / 500);
              
              // Calculate new height and position
              const newCylinderHeight = dripGroup.userData.initialCylinderHeight * (1 - shrinkProgress);
              
              // Update cylinder height
              cylinder.scale.y = newCylinderHeight;
              
              // Position cylinder so top stays fixed and bottom moves up
              cylinder.position.y = -newCylinderHeight / 2;
              
              // Remove cylinder when fully shrunk
              if (shrinkProgress >= 1) {
                dripGroup.remove(cylinder);
              }
            } else {
              // Normal cylinder behavior before disconnection
              cylinder.scale.y = dripGroup.userData.currentFallDistance;
              cylinder.position.y = -dripGroup.userData.currentFallDistance / 2;
            }
            
            // Move sphere to be at the bottom of the cylinder
            sphere.position.y = -dripGroup.userData.currentFallDistance;
            
            // Delete if fallen too far
            if (dripGroup.userData.currentFallDistance > dripGroup.userData.maxFallDistance) {
              dripsGroup.remove(dripGroup);
            }
          });

          // Randomly create new spheres at the base of the planet
          if (Math.random() < 0.067) {
            const radius = 0.03 + Math.random() * 0.16;
            const angle = Math.random() * Math.PI * 2;
            const distance = 0.1 + Math.random() * 1.2;
            const startPosition = new THREE.Vector3(
              Math.cos(angle) * distance,
              -planetConfig.size * 0.7,
              Math.sin(angle) * distance
            );
            createFallingSphere(radius, startPosition);
          }

          requestAnimationFrame(animateFallingSpheres);
        };

        // Create initial spheres
        for (let i = 0; i < 5; i++) {
          const radius = 0.03 + Math.random() * 0.16;
          const angle = Math.random() * Math.PI * 2;
          const distance = 0.1 + Math.random() * 1.2;
          const startPosition = new THREE.Vector3(
            Math.cos(angle) * distance,
            -planetConfig.size * 0.7,
            Math.sin(angle) * distance
          );
          createFallingSphere(radius, startPosition);
        }

        // Start the falling sphere animation
        animateFallingSpheres();

        // Store the drips group in the planet's userData for cleanup
        planet.userData.dripsGroup = dripsGroup;
        
      } else if (planetId === 'project3') {
        // Create the base planet
        const planetGeometry = new THREE.SphereGeometry(planetConfig.size, 32, 32);
        planetMaterial = new THREE.MeshPhongMaterial({ 
          color: planetConfig.color,
          emissive: 0x000000,
          emissiveIntensity: 1,
          shininess: 30
        });
        
        planet = new THREE.Mesh(planetGeometry, planetMaterial);

        // Create missile group
        const missilesGroup = new THREE.Group();
        planet.add(missilesGroup);

        // Create interactive spots for project information
        const createInteractiveSpots = () => {
          const spotsGroup = new THREE.Group();
          planet.add(spotsGroup);

          // Define spot positions and information
          const spots = [
            {
              position: new THREE.Vector3(1.2, 0.5, 0.8),
              title: "Game Overview",
              description: "A fast-paced first-person battleground shooter developed by a team of 5 in 10 weeks. Features intense combat, unique weapons, and dynamic environments."
            },
            {
              position: new THREE.Vector3(-1.0, 0.3, -0.7),
              title: "Technical Details",
              description: "Built in Unreal, featuring custom made assets, advanced combat system, advanced AIs, and optimized networking for smooth multiplayer gameplay."
            },
            {
              position: new THREE.Vector3(0.5, -0.8, 0.3),
              title: "My Role",
              description: "Lead Developer for the AI. Implemented the AI system, including pathfinding, decision-making, and combat strategies."
            }
          ];

          // Create each spot
          spots.forEach(spot => {
            // Create spot geometry (flattened sphere)
            const spotGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            const spotMaterial = new THREE.MeshPhongMaterial({
              color: 0x3366ff,
              emissive: 0x3366ff,
              emissiveIntensity: 0.5,
              transparent: true,
              opacity: 0.8
            });
            const spotMesh = new THREE.Mesh(spotGeometry, spotMaterial);
            
            // Flatten the spot by scaling it
            spotMesh.scale.set(1, 0.2, 1); // Made even flatter

            // Add glow effect (also flattened)
            const glowGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            const glowMaterial = new THREE.MeshPhongMaterial({
              color: 0x3366ff,
              emissive: 0x3366ff,
              emissiveIntensity: 0.3,
              transparent: true,
              opacity: 0.3
            });
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            glowMesh.scale.set(1, 0.2, 1); // Made even flatter
            spotMesh.add(glowMesh);

            // Add point light
            const spotLight = new THREE.PointLight(0x3366ff, 1, 2);
            spotLight.position.set(0, 0, 0);
            spotMesh.add(spotLight);

            // Position the spot
            spotMesh.position.copy(spot.position);
            spotMesh.position.normalize().multiplyScalar(planetConfig.size + 0.02); // Closer to surface

            // Orient the spot to face outward from the planet
            spotMesh.lookAt(new THREE.Vector3(0, 0, 0));
            spotMesh.rotateX(Math.PI / 2); // Rotate to lay flat

            // Store spot information
            spotMesh.userData = {
              isInteractive: true,
              title: spot.title,
              description: spot.description
            };

            // Add pulsing animation
            const animateSpot = () => {
              const time = Date.now() * 0.001;
              const scale = 1 + Math.sin(time * 2) * 0.1;
              spotMesh.scale.set(scale, 0.2 * scale, scale); // Maintain flatness during pulse
              glowMesh.scale.set(1.2 * scale, 0.2 * 1.2 * scale, 1.2 * scale); // Maintain flatness during pulse
              requestAnimationFrame(animateSpot);
            };
            animateSpot();

            spotsGroup.add(spotMesh);
          });

          // Store spots group in planet's userData
          planet.userData.spotsGroup = spotsGroup;
        };

        // Create the interactive spots
        createInteractiveSpots();

        // Function to create a missile
        const createMissile = (startPosition) => {
          const missileGroup = new THREE.Group();
          
          // Create missile body (cylinder)
          const bodyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
          const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            emissive: 0x444444,
            shininess: 50
          });
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.rotation.x = Math.PI / 2;
          missileGroup.add(body);

          // Create missile tip (cone)
          const tipGeometry = new THREE.ConeGeometry(0.05, 0.15, 8);
          const tipMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            emissive: 0x333333,
            shininess: 50
          });
          const tip = new THREE.Mesh(tipGeometry, tipMaterial);
          tip.rotation.x = Math.PI / 2;
          tip.position.z = 0.275;
          missileGroup.add(tip);

          // Create fins (triangles)
          const finGeometry = new THREE.ConeGeometry(0.08, 0.15, 3);
          const finMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            emissive: 0x444444,
            shininess: 50
          });

          // Create four fins
          for (let i = 0; i < 4; i++) {
            const fin = new THREE.Mesh(finGeometry, finMaterial);
            fin.rotation.x = Math.PI / 2;
            fin.rotation.z = (i * Math.PI / 2);
            fin.position.z = -0.15;
            fin.scale.set(0.5, 0.5, 0.5);
            missileGroup.add(fin);
          }

          // Add engine glow
          const engineLight = new THREE.PointLight(0xff4400, 1, 1);
          engineLight.position.set(0, 0, -0.2);
          missileGroup.add(engineLight);

          // Set initial position and calculate trajectory
          missileGroup.position.copy(startPosition);
          
          // Calculate random target position on planet surface
          const targetTheta = Math.random() * Math.PI * 2;
          const targetPhi = Math.random() * Math.PI;
          const targetPosition = new THREE.Vector3(
            planetConfig.size * Math.sin(targetPhi) * Math.cos(targetTheta),
            planetConfig.size * Math.sin(targetPhi) * Math.sin(targetTheta),
            planetConfig.size * Math.cos(targetPhi)
          );

          // Calculate control point for arc
          const midPoint = new THREE.Vector3().addVectors(startPosition, targetPosition).multiplyScalar(0.5);
          midPoint.y += 2; // Arc height

          // Store missile data
          missileGroup.userData = {
            startPosition: startPosition.clone(),
            targetPosition: targetPosition,
            controlPoint: midPoint,
            progress: 0,
            speed: 0.005
          };

          missilesGroup.add(missileGroup);
          return missileGroup;
        };

        // Function to create a large explosion
        const createLargeExplosion = (position) => {
          // Create explosion light
          const light = new THREE.PointLight(0xff4400, 6, 6); // Doubled intensity and range
          light.position.copy(position);
          planet.add(light);

          // Create particle group for this explosion
          const particleGroup = new THREE.Group();
          particleGroup.position.copy(position);
          explosionParticles.add(particleGroup);

          // Create particles
          const particleCount = 32; // Doubled particle count
          const particles = [];
          const particleGeometry = new THREE.SphereGeometry(0.06, 8, 8); // Doubled particle size
          const particleMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4400,
            emissive: 0xff4400,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 1
        });

          // Calculate normal vector at explosion point
          const normal = position.clone().normalize();

          for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            const randomSpread = 0.1; // Doubled spread
            const baseVelocity = normal.clone().multiplyScalar(0.16); // Doubled velocity
            const randomOffset = new THREE.Vector3(
              (Math.random() - 0.5) * randomSpread,
              (Math.random() - 0.5) * randomSpread,
              (Math.random() - 0.5) * randomSpread
            );
            
            particle.userData = {
              velocity: baseVelocity.add(randomOffset),
              life: 1.0,
              maxLife: 1.0,
              maxDistance: 0.6, // Doubled distance
              initialScale: 1.0 + Math.random() * 0.8
            };
            
            particle.scale.setScalar(particle.userData.initialScale);
            particleGroup.add(particle);
            particles.push(particle);
          }

          // Animation function for this explosion
          const animateExplosion = () => {
            let allDead = true;
            particles.forEach(particle => {
              if (particle.userData.life > 0) {
                const distance = particle.position.length();
                
                if (distance < particle.userData.maxDistance) {
                  particle.position.add(particle.userData.velocity.multiplyScalar(0.6));
                  particle.userData.velocity.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.005,
                    (Math.random() - 0.5) * 0.005,
                    (Math.random() - 0.5) * 0.005
                  ));
                }
                
                particle.userData.life -= 0.003;
                
                const lifeRatio = particle.userData.life / particle.userData.maxLife;
                const scale = particle.userData.initialScale * (1 + (1 - lifeRatio) * 0.5);
                particle.scale.setScalar(scale);
                particle.material.opacity = lifeRatio * lifeRatio;
                
                allDead = false;
              }
            });

            light.intensity = Math.max(0, light.intensity - 0.015);

            if (!allDead) {
              requestAnimationFrame(animateExplosion);
            } else {
              planet.remove(light);
              explosionParticles.remove(particleGroup);
            }
          };

          animateExplosion();
        };

        // Function to animate missiles
        const animateMissiles = () => {
          missilesGroup.children.forEach(missile => {
            if (missile.userData.progress < 1) {
              // Update progress
              missile.userData.progress += missile.userData.speed;
              
              // Calculate position along quadratic Bezier curve
              const t = missile.userData.progress;
              const p0 = missile.userData.startPosition;
              const p1 = missile.userData.controlPoint;
              const p2 = missile.userData.targetPosition;
              
              const x = Math.pow(1-t, 2) * p0.x + 2 * (1-t) * t * p1.x + Math.pow(t, 2) * p2.x;
              const y = Math.pow(1-t, 2) * p0.y + 2 * (1-t) * t * p1.y + Math.pow(t, 2) * p2.y;
              const z = Math.pow(1-t, 2) * p0.z + 2 * (1-t) * t * p1.z + Math.pow(t, 2) * p2.z;
              
              missile.position.set(x, y, z);
              
              // Calculate direction for missile orientation
              const nextT = Math.min(1, t + 0.01);
              const nextX = Math.pow(1-nextT, 2) * p0.x + 2 * (1-nextT) * nextT * p1.x + Math.pow(nextT, 2) * p2.x;
              const nextY = Math.pow(1-nextT, 2) * p0.y + 2 * (1-nextT) * nextT * p1.y + Math.pow(nextT, 2) * p2.y;
              const nextZ = Math.pow(1-nextT, 2) * p0.z + 2 * (1-nextT) * nextT * p1.z + Math.pow(nextT, 2) * p2.z;
              
              const direction = new THREE.Vector3(nextX - x, nextY - y, nextZ - z).normalize();
              missile.lookAt(missile.position.clone().add(direction));
              
              // Create impact explosion when missile reaches target
              if (missile.userData.progress >= 1) {
                createLargeExplosion(missile.userData.targetPosition);
                missilesGroup.remove(missile);
              }
            }
          });
          
          requestAnimationFrame(animateMissiles);
        };

        // Start missile animation
        animateMissiles();

        // Function to launch a missile
        const launchMissile = () => {
          // Random position on sphere surface for launch
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const startPosition = new THREE.Vector3(
            planetConfig.size * Math.sin(phi) * Math.cos(theta),
            planetConfig.size * Math.sin(phi) * Math.sin(theta),
            planetConfig.size * Math.cos(phi)
          );
          
          createMissile(startPosition);
        };

        // Start random missile launches
        const startMissileLaunches = () => {
          if (Math.random() < 0.008) { // Reduced from 0.02 to 0.008 (0.8% chance per frame)
            launchMissile();
          }
          requestAnimationFrame(startMissileLaunches);
        };

        // Start the missile launch system
        startMissileLaunches();

        // Store missile system in userData for cleanup
        planet.userData.missilesGroup = missilesGroup;

        // Create explosion particle system
        const explosionParticles = new THREE.Group();
        planet.add(explosionParticles);

        // Function to create a single explosion
        const createExplosion = (position) => {
          // Create explosion light
          const light = new THREE.PointLight(0xff4400, 3, 3); // Reduced light range
          light.position.copy(position);
          planet.add(light);

          // Create particle group for this explosion
          const particleGroup = new THREE.Group();
          particleGroup.position.copy(position);
          explosionParticles.add(particleGroup);

          // Create particles
          const particleCount = 16;
          const particles = [];
          const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
          const particleMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4400,
            emissive: 0xff4400,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 1
          });

          // Calculate normal vector at explosion point (pointing outward from planet)
          const normal = position.clone().normalize();

          for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Create a more controlled velocity with bias towards the normal direction
            const randomSpread = 0.05; // Reduced spread
            const baseVelocity = normal.clone().multiplyScalar(0.08); // Reduced base velocity
            const randomOffset = new THREE.Vector3(
              (Math.random() - 0.5) * randomSpread,
              (Math.random() - 0.5) * randomSpread,
              (Math.random() - 0.5) * randomSpread
            );
            
            particle.userData = {
              velocity: baseVelocity.add(randomOffset),
              life: 1.0,
              maxLife: 1.0,
              maxDistance: 0.3, // Reduced maximum distance
              initialScale: 0.8 + Math.random() * 0.4
            };
            
            particle.scale.setScalar(particle.userData.initialScale);
            particleGroup.add(particle);
            particles.push(particle);
          }

          // Animation function for this explosion
          const animateExplosion = () => {
            let allDead = true;
            particles.forEach(particle => {
              if (particle.userData.life > 0) {
                // Calculate distance from start position
                const distance = particle.position.length();
                
                // Only move if within max distance
                if (distance < particle.userData.maxDistance) {
                  // Update position with slower movement
                  particle.position.add(particle.userData.velocity.multiplyScalar(0.6)); // Added velocity multiplier
                  // Add gentler turbulence
                  particle.userData.velocity.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.005, // Reduced turbulence
                    (Math.random() - 0.5) * 0.005,
                    (Math.random() - 0.5) * 0.005
                  ));
                }
                
                // Update life (slower fade)
                particle.userData.life -= 0.003; // Slower decay
                
                // Update scale and opacity with more dynamic changes
                const lifeRatio = particle.userData.life / particle.userData.maxLife;
                const scale = particle.userData.initialScale * (1 + (1 - lifeRatio) * 0.5);
                particle.scale.setScalar(scale);
                particle.material.opacity = lifeRatio * lifeRatio;
                
                allDead = false;
              }
            });

            // Update light intensity with more dramatic fade
            light.intensity = Math.max(0, light.intensity - 0.015); // Slower light decay

            if (!allDead) {
              requestAnimationFrame(animateExplosion);
            } else {
              // Clean up
              planet.remove(light);
              explosionParticles.remove(particleGroup);
            }
          };

          animateExplosion();
        };

        // Function to create random explosions
        const createRandomExplosion = () => {
          // Random position on sphere surface
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const radius = planetConfig.size;

          const position = new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          );

          createExplosion(position);
        };

        // Start random explosion generation
        const startExplosions = () => {
          // Random chance to create explosion
          if (Math.random() < 0.02) { // Reduced from 0.07 to 0.02 (2% chance per frame)
            createRandomExplosion();
          }
          requestAnimationFrame(startExplosions);
        };

        // Start the explosion system
        startExplosions();

        // Store explosion system in userData for cleanup
        planet.userData.explosionParticles = explosionParticles;

      } else if (planetId === 'project4') {
        // Create the base planet
        const planetGeometry = new THREE.SphereGeometry(planetConfig.size, 32, 32);
        const planetMaterial = new THREE.MeshPhongMaterial({
          color: planetConfig.color,
          emissive: planetConfig.color,
          emissiveIntensity: 0.3,
          shininess: 30
        });
        planet = new THREE.Mesh(planetGeometry, planetMaterial);

        // Define strap material
        const strapMaterial = new THREE.MeshPhongMaterial({
          color: 0x666666,
          emissive: 0x333333,
          shininess: 30
        });

        // Create the main horizontal strap that wraps around the planet
        const mainStrapGeometry = new THREE.CylinderGeometry(planetConfig.size * 1.1, planetConfig.size * 1.1, planetConfig.size * 0.2, 64);
        const mainStrap = new THREE.Mesh(mainStrapGeometry, strapMaterial);
        mainStrap.rotation.set(0, 0, 0); // Reset rotations
        mainStrap.rotation.y = Math.PI / 2; // Rotate 90 degrees around Y-axis
        mainStrap.position.y = 0; // Position it around the planet's equator
        planet.add(mainStrap); // Add strap directly to the planet

        // Create the adjustment mechanism (small box with cylinder) and attach to the main strap
        const adjusterGeometry = new THREE.BoxGeometry(planetConfig.size * 0.2, planetConfig.size * 0.3, planetConfig.size * 0.2);
        const adjuster = new THREE.Mesh(adjusterGeometry, strapMaterial);
        // Position at the back of the strap, relative to the strap's local origin (which is the planet's origin)
        // Since strap is rotated on Y, its local -X is world -X, local -Z is world -Z
        adjuster.position.set(-planetConfig.size * 1.1, 0, 0); // Position behind the strap's outer radius in its local X (world X)
        adjuster.rotation.z = Math.PI / 2; // Rotate adjuster to face backward along the strap
        mainStrap.add(adjuster);

        const adjusterCylinderGeometry = new THREE.CylinderGeometry(planetConfig.size * 0.05, planetConfig.size * 0.05, planetConfig.size * 0.3, 8);
        const adjusterCylinder = new THREE.Mesh(adjusterCylinderGeometry, strapMaterial);
        adjusterCylinder.rotation.x = Math.PI / 2; // Rotate cylinder to be horizontal relative to adjuster
        adjusterCylinder.position.set(0, -planetConfig.size * 0.1, 0); // Adjust cylinder position relative to adjuster
        adjuster.add(adjusterCylinder);

        // Create VR headset group
        const headsetGroup = new THREE.Group();

        // Main headset body (curved box)
        const bodyGeometry = new THREE.BoxGeometry(planetConfig.size * 1.5, planetConfig.size * 1.0, planetConfig.size * 0.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({
          color: 0x666666,
          emissive: 0x333333,
          shininess: 50
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        headsetGroup.add(body);

        // Create the top strap connector
        const topConnectorGeometry = new THREE.BoxGeometry(planetConfig.size * 0.25, planetConfig.size * 0.25, planetConfig.size * 0.25);
        const topConnector = new THREE.Mesh(topConnectorGeometry, bodyMaterial);
        topConnector.position.set(0, planetConfig.size * 0.625, 0);
        headsetGroup.add(topConnector);

        // Left controller (box with sphere)
        const controllerGeometry = new THREE.BoxGeometry(planetConfig.size * 0.4, planetConfig.size * 0.4, planetConfig.size * 0.4);
        const controllerMaterial = new THREE.MeshPhongMaterial({
          color: 0x666666,
          emissive: 0x333333,
          shininess: 30
        });
        const leftController = new THREE.Mesh(controllerGeometry, controllerMaterial);
        leftController.position.set(-planetConfig.size * 1.5, -planetConfig.size * 0.5, 0);
        headsetGroup.add(leftController);

        // Left controller button (sphere)
        const buttonGeometry = new THREE.SphereGeometry(planetConfig.size * 0.1, 16, 16);
        const buttonMaterial = new THREE.MeshPhongMaterial({
          color: 0xcc33ff,
          emissive: 0xcc33ff,
          emissiveIntensity: 0.5,
          shininess: 50
        });
        const leftButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        leftButton.position.set(0, planetConfig.size * 0.2, planetConfig.size * 0.2);
        leftController.add(leftButton);

        // Right controller (box with sphere)
        const rightController = new THREE.Mesh(controllerGeometry, controllerMaterial);
        rightController.position.set(planetConfig.size * 1.5, -planetConfig.size * 0.5, 0);
        headsetGroup.add(rightController);

        // Right controller button (sphere)
        const rightButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        rightButton.position.set(0, planetConfig.size * 0.2, planetConfig.size * 0.2);
        rightController.add(rightButton);

        // Add lights to make it glow
        const headsetLight = new THREE.PointLight(0xcc33ff, 1, 5);
        headsetLight.position.set(0, 0, 0);
        headsetGroup.add(headsetLight);

        // Add pulsing animation to the buttons
        const animateButtons = () => {
          const time = Date.now() * 0.001;
          const scale = 1 + Math.sin(time * 2) * 0.2;
          leftButton.scale.setScalar(scale);
          rightButton.scale.setScalar(scale);
          requestAnimationFrame(animateButtons);
        };
        animateButtons();

        // Position the headset on the front of the planet, visually connecting to the strap
        headsetGroup.position.z = planetConfig.size * 0.95; // Position in front of the planet's surface
        headsetGroup.position.y = 0; // Vertically centered with the strap
        headsetGroup.rotation.x = 0; 
        headsetGroup.rotation.y = 0; 
        headsetGroup.rotation.z = 0; 

        // Add the headset group as a child of the planet
        planet.add(headsetGroup);

        // Store necessary data in userData
        planet.userData = {
          name: 'project4',
          isInteractive: true,
          orbitRadius: orbitRadius,
          orbitSpeed: 0.005 - (index * 0.0005),
          orbitAngle: (index / Object.keys(planetTextures).length) * Math.PI * 2,
          headsetGroup: headsetGroup
        };

      } else {
        // --- Project 5: Space Golf Planet ---

        // Create the base planet (invisible) that will handle interactions
        const planetGeometry = new THREE.SphereGeometry(planetConfig.size, 32, 32);
        const planetMaterial = new THREE.MeshPhongMaterial({ 
          color: planetConfig.color,
          emissive: 0x000000,
          emissiveIntensity: 1,
          shininess: 30,
          transparent: true,
          opacity: 0 // Make the base sphere invisible
        });
        planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // Create a group for the visual Space Golf planet and its features
        const golfPlanetGroup = new THREE.Group();

        // Create the base golf ball sphere
        const golfBallGeometry = new THREE.SphereGeometry(planetConfig.size, 64, 64); // Higher segments for smoother surface
        const golfBallMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff, // White golf ball
          emissive: 0x111111,
          emissiveIntensity: 0.5,
          shininess: 80
        });
        const golfBall = new THREE.Mesh(golfBallGeometry, golfBallMaterial);
        golfPlanetGroup.add(golfBall);

        // Add dimples (simplified by adding small indentations - visually)
        const dimpleGeometry = new THREE.SphereGeometry(planetConfig.size * 0.05, 8, 8);
        const dimpleMaterial = new THREE.MeshPhongMaterial({
          color: 0xcccccc, // Slightly darker for visual indentation
          emissive: 0x080808,
          emissiveIntensity: 0.5,
          shininess: 20
        });

        // Simple distribution of dimples
        const dimpleCount = 150;
        for (let i = 0; i < dimpleCount; i++) {
            const dimple = new THREE.Mesh(dimpleGeometry, dimpleMaterial);
            // Position dimples on the surface of the sphere
            const phi = Math.acos(-1 + (2 * i) / dimpleCount);
            const theta = Math.sqrt(dimpleCount * Math.PI) * phi;
            
            dimple.position.set(
                planetConfig.size * Math.sin(phi) * Math.cos(theta),
                planetConfig.size * Math.sin(phi) * Math.sin(theta),
                planetConfig.size * Math.cos(phi)
            );
            
            // Scale down slightly to look more like an indentation
            dimple.scale.setScalar(0.8);

            golfPlanetGroup.add(dimple);
        }

        // Add a golf hole and flag
        // Flagpole (cylinder)
        const flagpoleGeometry = new THREE.CylinderGeometry(planetConfig.size * 0.03, planetConfig.size * 0.03, planetConfig.size * 0.8, 8);
        const flagpoleMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            emissive: 0x444444,
            shininess: 20
        });
        const flagpole = new THREE.Mesh(flagpoleGeometry, flagpoleMaterial);

        // Position flagpole on the surface
        const flagpolePosition = new THREE.Vector3(planetConfig.size * 0.8, planetConfig.size * 0.8, 0); // Example position
        flagpole.position.copy(flagpolePosition);
        
        // Orient flagpole to stand upright on the surface
        // Calculate the normal vector at this position on the sphere
        const surfaceNormal = flagpolePosition.clone().normalize();
        // Create a quaternion to align the flagpole's default up (Y) with the normal
        const quaternion = new THREE.Quaternion();
        // Use a helper vector to represent the flagpole's default up (Y)
        const upVector = new THREE.Vector3(0, 1, 0);
        quaternion.setFromUnitVectors(upVector, surfaceNormal);
        flagpole.rotation.setFromQuaternion(quaternion);

        // Adjust rotation to have the flagpole pointing outwards correctly
        // The default cylinder points along Y. We want it to point away from the center (along normal).
        // Since normal is aligned with flagpole's Y, the flagpole is already standing upright.
        // We might need a small adjustment to point it slightly upwards relative to the horizon if desired.
        // For now, let's just ensure the base is at the surface.
        flagpole.position.add(surfaceNormal.clone().multiplyScalar(flagpoleGeometry.parameters.height / 2)); // Move up so base is on surface

        golfPlanetGroup.add(flagpole);

        // Flag (box or plane)
        const flagGeometry = new THREE.BoxGeometry(planetConfig.size * 0.4, planetConfig.size * 0.3, planetConfig.size * 0.05);
        const flagMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000, // Red flag
            emissive: 0x880000,
            shininess: 50
        });
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        // Position flag at the top of the flagpole
        flag.position.set(0, planetConfig.size * 0.4, 0); // Relative to flagpole top
        flagpole.add(flag);
        
        // Golf hole (small cylinder indentation)
        const holeGeometry = new THREE.CylinderGeometry(planetConfig.size * 0.1, planetConfig.size * 0.1, planetConfig.size * 0.05, 16);
        const holeMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000, // Black hole
            emissive: 0x000000,
            shininess: 10
        });
        const golfHole = new THREE.Mesh(holeGeometry, holeMaterial);
        // Position golf hole on the surface near the flagpole
        golfHole.position.set(planetConfig.size * 0.7, planetConfig.size * 0.7, 0); // Example position near flagpole
        golfHole.lookAt(0, 0, 0); // Orient hole into the surface
         golfHole.rotation.x += Math.PI / 2; // Adjust rotation to face inward
        golfPlanetGroup.add(golfHole);

        // Create a small orbiting golf ball
        const orbitingBallGeometry = new THREE.SphereGeometry(planetConfig.size * 0.1, 32, 32);
        const orbitingBallMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff, // White
            emissive: 0x222222,
            shininess: 50
        });
        const orbitingBall = new THREE.Mesh(orbitingBallGeometry, orbitingBallMaterial);
        
        // Set initial position for orbiting ball
        const orbitDistance = planetConfig.size * 1.5; // Orbit radius
        orbitingBall.position.set(orbitDistance, 0, 0);
        
        golfPlanetGroup.add(orbitingBall);

        // Store orbiting ball and orbit data for animation
        golfPlanetGroup.userData.orbitingBall = orbitingBall;
        golfPlanetGroup.userData.orbitSpeed = 0.01; // Speed of orbit
        golfPlanetGroup.userData.orbitAngle = 0; // Initial angle

        // Animation function for the orbiting ball
        const animateOrbitingBall = () => {
          // Check if the orbitingBall object exists before animating
          if (golfPlanetGroup.userData.orbitingBall) {
            golfPlanetGroup.userData.orbitAngle += golfPlanetGroup.userData.orbitSpeed;
            const x = Math.cos(golfPlanetGroup.userData.orbitAngle) * orbitDistance;
            const z = Math.sin(golfPlanetGroup.userData.orbitAngle) * orbitDistance;
            golfPlanetGroup.userData.orbitingBall.position.set(x, 0, z);
          }
          // Request next frame regardless of whether ball exists, animation stops when group is removed
          requestAnimationFrame(animateOrbitingBall);
        };

        // Start the orbiting animation
        animateOrbitingBall();

        // Add the visual golf planet group as a child of the invisible base planet
        planet.add(golfPlanetGroup);

        // Store necessary data in userData for interaction and animation
        planet.userData = {
          name: 'project5',
          isInteractive: true,
          orbitRadius: orbitRadius,
          orbitSpeed: 0.005 - (index * 0.0005),
          orbitAngle: (index / Object.keys(planetTextures).length) * Math.PI * 2,
          golfPlanetGroup: golfPlanetGroup // Store reference to the group
        };

        // Default material (kept for other potential future planets)
        // planetMaterial = new THREE.MeshPhongMaterial({ 
        //   color: planetConfig.color,
        //   emissive: 0x000000,
        //   emissiveIntensity: 1,
        //   shininess: 30
        // });
        
        // planet = new THREE.Mesh(planetGeometry, planetMaterial);
      }
    }
    
    // Add orbit visual for the main orbit
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
      ...planet.userData,
      orbitRadius: orbitRadius,
      orbitSpeed: 0.005 - (index * 0.0005),
      orbitAngle: (index / Object.keys(planetTextures).length) * Math.PI * 2,
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
    const newX = Math.cos(planet.userData.orbitAngle) * planet.userData.orbitRadius;
    const newZ = Math.sin(planet.userData.orbitAngle) * planet.userData.orbitRadius;
    
    // Update planet position
    planet.position.x = newX;
    planet.position.z = newZ;
    
    // If this is the mini system sun, update the mini system position
    if (planet.userData.miniSystem) {
      planet.userData.miniSystem.position.x = newX;
      planet.userData.miniSystem.position.z = newZ;
    }
    
    // Rotate the planet on its axis
    planet.rotation.y += 0.01;
  });
}

function getPlanetContent(planetName) {
  // Check if this is a mini planet
  if (planetName.startsWith('project1_mini_')) {
    const index = parseInt(planetName.split('_').pop());
    const planetInfo = [
      {
        title: "Technical Details",
        description: "This portfolio is built using Three.js for 3D graphics, modern JavaScript (ES6+), and HTML5/CSS3. It features responsive design, smooth animations, and interactive 3D elements. The project was designed by me and created using AI. The base of it was built using Claude AI and the rest was built using Cursor AI, with a bit of manual tweaking.",
        contacts: []
      },
      {
        title: "My Role",
        description: "As the sole developer, I designed and implemented the entire interactive solar system, including the 3D models, animations, and user interactions. I then prompted the AIs to actually create everything going through many different iterations.",
        contacts: []
      },
      {
        title: "Key Features",
        description: "• Interactive 3D solar system with realistic planet orbits\n• Smooth camera transitions and animations\n• Dynamic lighting and glow effects\n• Responsive design that works across devices\n• Interactive information display system\n• Custom shaders for visual effects\n• Custom Designed 3D Models",
        contacts: []
      }
    ];
    return planetInfo[index];
  }
  
  // Regular planet content definitions
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

function createMiniSolarSystem(position, size) {
  // Create a group to hold the mini solar system
  const miniSystem = new THREE.Group();
  
  // Create the central "sun" (main planet)
  const sunGeometry = new THREE.SphereGeometry(size * 0.6, 32, 32);
  const sunMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x3366ff,
    emissive: 0x3366ff,
    emissiveIntensity: 0.5,
    shininess: 30
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  
  // Add userData to the sun for interaction
  sun.userData = {
    name: 'project1',
    isInteractive: true,
    isMainPlanet: true,
    orbitRadius: position.length(),
    orbitSpeed: 0.005,
    orbitAngle: Math.atan2(position.z, position.x)
  };
  
  miniSystem.add(sun);
  
  // Add a point light at the sun's position
  const sunLight = new THREE.PointLight(0x3366ff, 0.5, 10);
  sunLight.position.set(0, 0, 0);
  sun.add(sunLight);
  
  // Create orbiting planets with info sphere content
  const planetInfo = [
    {
      title: "Technical Details",
      description: "This portfolio is built using Three.js for 3D graphics, modern JavaScript (ES6+), and HTML5/CSS3. It features responsive design, smooth animations, and interactive 3D elements. The project was designed by me and created using AI. The base of it was built using Claude AI and the rest was built using Cursor AI, with a bit of manual tweaking.",
      color: 0xff3366
    },
    {
      title: "My Role",
      description: "As the sole developer, I designed and implemented the entire interactive solar system, including the 3D models, animations, and user interactions. I then prompted the AIs to actually create everything going through many different iterations.",
      color: 0x33ff66
    },
    {
      title: "Key Features",
      description: "• Interactive 3D solar system with realistic planet orbits\n• Smooth camera transitions and animations\n• Dynamic lighting and glow effects\n• Responsive design that works across devices\n• Interactive information display system\n• Custom shaders for visual effects\n• Custom Designed 3D Models",
      color: 0x6633ff
    }
  ];
  
  const planetCount = planetInfo.length;
  const orbitRadius = size * 1.2;
  
  // Create a group for mini planets
  const miniPlanetsGroup = new THREE.Group();
  miniSystem.add(miniPlanetsGroup);
  
  for (let i = 0; i < planetCount; i++) {
    // Create planet
    const planetSize = size * (0.15 - (i * 0.02));
    const planetGeometry = new THREE.SphereGeometry(planetSize, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({ 
      color: planetInfo[i].color,
      emissive: planetInfo[i].color,
      emissiveIntensity: 0.3,
      shininess: 30
    });
    
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    
    // Position planet in orbit
    const angle = (i / planetCount) * Math.PI * 2;
    planet.position.x = Math.cos(angle) * orbitRadius;
    planet.position.z = Math.sin(angle) * orbitRadius;
    
    // Add orbit visual
    const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.05, orbitRadius + 0.05, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ 
      color: planetInfo[i].color,
      opacity: 0.2,
      transparent: true,
      side: THREE.DoubleSide
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    
    // Store orbit data and info for animation and interaction
    planet.userData = {
      orbitRadius: orbitRadius,
      orbitSpeed: 0.02 + (i * 0.01),
      orbitAngle: angle,
      isInteractive: true,
      name: `project1_mini_${i}`,
      title: planetInfo[i].title,
      description: planetInfo[i].description,
      color: planetInfo[i].color
    };
    
    // Add a point light to make it glow
    const light = new THREE.PointLight(planetInfo[i].color, 1, 2);
    light.position.set(0, 0, 0);
    planet.add(light);
    
    // Add to mini planets group
    miniPlanetsGroup.add(planet);
    miniSystem.add(orbit);
  }
  
  // Position the entire mini system
  miniSystem.position.copy(position);
  
  // Add rotation animation
  const animate = () => {
    if (window.currentView === 'solar') {
      // Rotate the entire system
      miniSystem.rotation.y += 0.005;
      
      // Animate orbiting planets
      miniPlanetsGroup.children.forEach(planet => {
        if (planet.userData && planet.userData.orbitRadius) {
          planet.userData.orbitAngle += planet.userData.orbitSpeed;
          planet.position.x = Math.cos(planet.userData.orbitAngle) * planet.userData.orbitRadius;
          planet.position.z = Math.sin(planet.userData.orbitAngle) * planet.userData.orbitRadius;
        }
      });
      
      requestAnimationFrame(animate);
    }
  };
  animate();
  
  // Store mini planets in the sun's userData for easy access
  sun.userData.miniPlanets = miniPlanetsGroup.children;
  
  return { miniSystem, sun };
}