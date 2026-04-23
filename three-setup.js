// ============ THREE.JS SETUP (PREMIUM GLOW - NAIL ART EDITION) ============
let scene, camera, renderer;
let particles = [];
let mouseX = 0;
let mouseY = 0;

function initThree() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scene = new THREE.Scene();
    scene.background = null;

    // Camera
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Lighting (Professional Studio Setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(2, 4, 5);
    scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0xB76E79, 4); // Rose Gold
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xD4AF37, 2); // Gold
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Create Glitter Dust (Salon Finish)
    createGlitter();
    
    // Create Stylized Floating Nails
    createStylizedNails();

    // Mouse tracking
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

    animate();
}

function createGlitter() {
    // Layer 1: Fine Dust
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 4000;
    const dustPosArray = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount * 3; i++) {
        dustPosArray[i] = (Math.random() - 0.5) * 45;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPosArray, 3));

    const dustMaterial = new THREE.PointsMaterial({
        size: 0.03,
        sizeAttenuation: true,
        color: 0xB76E79,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    const dustMesh = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustMesh);
    particles.push({ mesh: dustMesh, type: 'dust', velocity: new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01) });

    // Layer 2: High Brilliance Sparkles (Brillos)
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 300;
    const sparklePosArray = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount * 3; i++) {
        sparklePosArray[i] = (Math.random() - 0.5) * 40;
    }

    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePosArray, 3));

    const sparkleMaterial = new THREE.PointsMaterial({
        size: 0.08,
        sizeAttenuation: true,
        color: 0xF7D9D9,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });

    const sparkleMesh = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkleMesh);
    particles.push({ mesh: sparkleMesh, type: 'dust', velocity: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02) });
}

function createStylizedNails() {
    const nailCount = 20;
    
    // Improved Nail Tip Shape: Almond/Stiletto style
    // We'll use a Sphere for the rounded tip and a Box for the body, or a custom Lathe
    const shape = new THREE.Shape();
    shape.moveTo(-0.2, -0.5);
    shape.lineTo(0.2, -0.5);
    shape.lineTo(0.2, 0.2);
    shape.quadraticCurveTo(0, 0.6, -0.2, 0.2); // Rounded top tip
    shape.lineTo(-0.2, -0.5);

    const extrudeSettings = {
        steps: 1,
        depth: 0.05,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 3
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    for (let i = 0; i < nailCount; i++) {
        const material = new THREE.MeshPhysicalMaterial({
            color: i % 2 === 0 ? 0xB76E79 : 0xF7D9D9, 
            metalness: 0.2,
            roughness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            transparent: true,
            opacity: 0.7,
            transmission: 0.5,
            thickness: 0.5,
            ior: 1.45
        });

        const nail = new THREE.Mesh(geometry, material);
        
        nail.position.set(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 12
        );

        nail.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        scene.add(nail);
        particles.push({
            mesh: nail,
            type: 'nail',
            rotVel: new THREE.Vector3(
                (Math.random() - 0.5) * 0.03,
                (Math.random() - 0.5) * 0.03,
                (Math.random() - 0.5) * 0.02
            ),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.008,
                (Math.random() - 0.5) * 0.008,
                (Math.random() - 0.5) * 0.008
            )
        });
    }
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);

    // Animate elements
    particles.forEach(p => {
        p.mesh.position.add(p.velocity);
        
        if (p.type === 'dust') {
            if (p.mesh.position.x > 20) p.mesh.position.x = -20;
            if (p.mesh.position.x < -20) p.mesh.position.x = 20;
            if (p.mesh.position.y > 20) p.mesh.position.y = -20;
            if (p.mesh.position.y < -20) p.mesh.position.y = 20;
        } else {
            p.mesh.rotation.x += p.rotVel.x;
            p.mesh.rotation.y += p.rotVel.y;
            p.mesh.rotation.z += p.rotVel.z;
            
            // Subtle float effect
            p.mesh.position.y += Math.sin(Date.now() * 0.001 + p.mesh.position.x) * 0.001;
        }
    });

    // Camera follow mouse (Luxury smooth tracking)
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
} else {
    initThree();
}