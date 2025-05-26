// Particles module for background effect
window.particlesMesh = null;

function createParticleBackground() {
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1500;
  
  const posArray = new Float32Array(particlesCount * 3);
  
  for (let i = 0; i < particlesCount * 3; i++) {
    // Create a sphere of particles
    posArray[i] = (Math.random() - 0.5) * 150;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  // Materials
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  
  // Mesh
  window.particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  window.scene.add(window.particlesMesh);
}

function animateParticles() {
  if (window.particlesMesh) {
    window.particlesMesh.rotation.x += 0.0005;
    window.particlesMesh.rotation.y += 0.0005;
  }
}