// Wait for Three.js to load
window.addEventListener('load', () => {
    setTimeout(() => {
      const loading = document.getElementById('loading');
      loading.classList.add('fade-out');
      setTimeout(() => {
        loading.style.display = 'none';
        initializeScene();
      }, 1000);
    }, 1000);
  });
  
  function initializeScene() {
    // Three.js scene setup
    const container = document.getElementById('canvas-container');
    
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      // Create a sphere of particles
      posArray[i] = (Math.random() - 0.5) * 100;
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
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Interactive elements
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate particles based on mouse position
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      
      // Interactive mouse effect
      particlesMesh.rotation.x += mouseY * 0.0005;
      particlesMesh.rotation.y += mouseX * 0.0005;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Animate content appearance
    setTimeout(() => {
      const title = document.getElementById('main-title');
      const subtitle = document.getElementById('subtitle');
      const enterBtn = document.getElementById('enter-btn');
      
      title.classList.add('visible');
      subtitle.classList.add('visible');
      enterBtn.classList.add('visible');
    }, 500);
    
    // Button event
    document.getElementById('enter-btn').addEventListener('click', () => {
      // Here you would typically redirect to the main portfolio page
      // window.location.href = 'portfolio.html';
      alert('Navigate to main portfolio section');
    });
  }