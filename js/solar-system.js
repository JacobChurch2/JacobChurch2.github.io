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
    emissive: 0x000000,
    emissiveIntensity: 1,
    shininess: 30
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  window.scene.add(sun);
  window.TheSun = sun;
  
  // Add userData to sun for identification
  sun.userData = {
    name: 'about'
  };
  
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
              description: "Built in Unity with C#, featuring custom shader effects, advanced particle systems, and optimized networking for smooth multiplayer gameplay."
            },
            {
              position: new THREE.Vector3(0.5, -0.8, 0.3),
              title: "My Role",
              description: "Lead gameplay programmer responsible for weapon systems, player mechanics, and core gameplay features. Implemented advanced particle effects and shader systems."
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
        
      } else {
        // Default material for other planets
        planetMaterial = new THREE.MeshPhongMaterial({ 
          color: planetConfig.color,
          emissive: 0x000000,
          emissiveIntensity: 1,
          shininess: 30
        });
        
        planet = new THREE.Mesh(planetGeometry, planetMaterial);
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
        description: "This portfolio is built using Three.js for 3D graphics, modern JavaScript (ES6+), and HTML5/CSS3. It features responsive design, smooth animations, and interactive 3D elements. The project demonstrates expertise in WebGL, 3D mathematics, and modern web development practices.",
        contacts: []
      },
      {
        title: "My Role",
        description: "As the sole developer, I designed and implemented the entire interactive solar system, including the 3D models, animations, and user interactions. I created the custom shaders for planet effects, implemented the navigation system, and designed the user interface.",
        contacts: []
      },
      {
        title: "Key Features",
        description: "• Interactive 3D solar system with realistic planet orbits\n• Smooth camera transitions and animations\n• Dynamic lighting and glow effects\n• Responsive design that works across devices\n• Interactive information display system\n• Custom shaders for visual effects",
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
      description: "This portfolio is built using Three.js for 3D graphics, modern JavaScript (ES6+), and HTML5/CSS3. It features responsive design, smooth animations, and interactive 3D elements. The project demonstrates expertise in WebGL, 3D mathematics, and modern web development practices.",
      color: 0xff3366
    },
    {
      title: "My Role",
      description: "As the sole developer, I designed and implemented the entire interactive solar system, including the 3D models, animations, and user interactions. I created the custom shaders for planet effects, implemented the navigation system, and designed the user interface.",
      color: 0x33ff66
    },
    {
      title: "Key Features",
      description: "• Interactive 3D solar system with realistic planet orbits\n• Smooth camera transitions and animations\n• Dynamic lighting and glow effects\n• Responsive design that works across devices\n• Interactive information display system\n• Custom shaders for visual effects",
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