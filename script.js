
// --- Three.js Background & "Crazy" Effects ---

document.addEventListener('DOMContentLoaded', () => {
    // Fake loader
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) loader.style.opacity = '0';
        setTimeout(() => { if (loader) loader.style.display = 'none'; }, 500);
        initThreeJS();
    }, 1000); // 1s fake load for effect

    initTabs();
});

function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // --- Neural Network Particles ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 80; // Fewer particles but connected
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15; // Spread
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x64ffda,
        transparent: true,
        opacity: 0.8,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lines for Neural Network
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x64ffda, transparent: true, opacity: 0.15 });
    const linesGeometry = new THREE.BufferGeometry();
    const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(linesMesh);

    // --- Complex "Cyber Core" Object ---
    const coreGroup = new THREE.Group();
    // Inner Icosahedron
    const geo1 = new THREE.IcosahedronGeometry(1.2, 0);
    const mat1 = new THREE.MeshBasicMaterial({ color: 0x64ffda, wireframe: true, opacity: 0.3, transparent: true });
    const mesh1 = new THREE.Mesh(geo1, mat1);
    
    // Outer Torus Knot
    const geo2 = new THREE.TorusKnotGeometry(0.8, 0.1, 100, 16);
    const mat2 = new THREE.MeshBasicMaterial({ color: 0xe6f1ff, wireframe: true, opacity: 0.1, transparent: true });
    const mesh2 = new THREE.Mesh(geo2, mat2);
    
    coreGroup.add(mesh1);
    coreGroup.add(mesh2);
    
    coreGroup.position.set(2.5, 0, 0); // Desktop position
    if (window.innerWidth < 768) {
        coreGroup.position.set(0, 2, -2); // Mobile position
    }

    scene.add(coreGroup);

    camera.position.z = 5;

    // --- Interaction ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Rotate Cyber Core
        coreGroup.rotation.y += 0.005;
        coreGroup.rotation.x += 0.002;
        coreGroup.rotation.y += 0.05 * (targetX - coreGroup.rotation.y);
        coreGroup.rotation.x += 0.05 * (targetY - coreGroup.rotation.x);

        // Float effect for Core
        coreGroup.position.y += Math.sin(elapsedTime) * 0.002;

        // Particle Rotation
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Update Lines
        updateLines();

        renderer.render(scene, camera);
    }

    function updateLines() {
        // Calculate line positions based on particle proximity
        // Note: For high performance, we'd do this in a shader or less frequently.
        // For <100 particles, CPU is fine.
        
        // Transform local particle positions to world space to check dist? 
        // Simpler: Just check relative index since they rotate together in a group? 
        // Actually points move as a group. So we check local distance.
        
        const positions = particlesMesh.geometry.attributes.position.array;
        const linePositions = [];
        
        // Transform the group rotation to local points
        // To simplify: we'll just draw lines between points in their local space
        // and let the LineSegments object rotate with the Points object?
        
        // Actually, let's just create connections based on index for stability + some noise
        // Dynamic distance check:
        for (let i = 0; i < particlesCount; i++) {
            const x1 = positions[i * 3];
            const y1 = positions[i * 3 + 1];
            const z1 = positions[i * 3 + 2];

            for (let j = i + 1; j < particlesCount; j++) {
                const x2 = positions[j * 3];
                const y2 = positions[j * 3 + 1];
                const z2 = positions[j * 3 + 2];

                const dist = Math.sqrt((x1-x2)**2 + (y1-y2)**2 + (z1-z2)**2);

                if (dist < 3.5) { // Connection threshold
                    linePositions.push(x1, y1, z1);
                    linePositions.push(x2, y2, z2);
                }
            }
        }

        linesMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        
        // Match rotation
        linesMesh.rotation.x = particlesMesh.rotation.x;
        linesMesh.rotation.y = particlesMesh.rotation.y;
    }

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (window.innerWidth < 768) {
            coreGroup.position.set(0, 2, -2);
        } else {
            coreGroup.position.set(2.5, 0, 0);
        }
    });
}

function initTabs() {
    const tabs = document.querySelectorAll('.job-btn');
    const contents = document.querySelectorAll('.job-detail');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const id = tab.getAttribute('data-id');
            document.getElementById(id).classList.add('active');
        });
    });
}
