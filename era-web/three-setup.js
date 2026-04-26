let scene, camera, renderer;
let sparkleObjects = [];
let dustLayers = [];
let mouseX = 0, mouseY = 0;

function initThree() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(3, 5, 6);
    scene.add(keyLight);

    const roseLight = new THREE.PointLight(0xB76E79, 8, 40);
    roseLight.position.set(6, 5, 5);
    scene.add(roseLight);

    const goldLight = new THREE.PointLight(0xFFD700, 5, 40);
    goldLight.position.set(-6, -4, 5);
    scene.add(goldLight);

    const fillLight = new THREE.PointLight(0xF7D9D9, 3, 30);
    fillLight.position.set(0, 0, 8);
    scene.add(fillLight);

    createDust();
    createSparkles();

    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('resize', onResize);

    animate();
}

// ── Dust Particles ────────────────────────────────────────────────────────────

function createDust() {
    const specs = [
        { count: 3000, size: 0.035, color: 0xF7C5C5, opacity: 0.45, vel: new THREE.Vector3(0.002, 0.001, 0) },
        { count: 1500, size: 0.05,  color: 0xFFD700, opacity: 0.3,  vel: new THREE.Vector3(-0.001, 0.002, 0) },
        { count: 800,  size: 0.07,  color: 0xffffff, opacity: 0.25, vel: new THREE.Vector3(0.0015, -0.001, 0) }
    ];

    specs.forEach(s => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(s.count * 3);
        for (let i = 0; i < s.count * 3; i++) pos[i] = (Math.random() - 0.5) * 45;
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.PointsMaterial({
            size: s.size, color: s.color,
            transparent: true, opacity: s.opacity,
            blending: THREE.AdditiveBlending, sizeAttenuation: true
        });

        const mesh = new THREE.Points(geo, mat);
        scene.add(mesh);
        dustLayers.push({ mesh, vel: s.vel });
    });
}


// ── Star Sparkles (Brillos) ───────────────────────────────────────────────────

function makeStarShape(outerR, innerR, points) {
    const shape = new THREE.Shape();
    const total = points * 2;
    for (let i = 0; i < total; i++) {
        const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
}

function createSparkles() {
    // 6-pointed star (brillo clásico)
    const starGeo = new THREE.ExtrudeGeometry(makeStarShape(0.12, 0.05, 6), {
        steps: 1, depth: 0.03,
        bevelEnabled: true, bevelThickness: 0.01,
        bevelSize: 0.01, bevelSegments: 2
    });

    const sparkleColors = [0xFFD700, 0xFFFACD, 0xFFFFFF, 0xF7D9D9, 0xFFEC8B, 0xE8C85C];

    for (let i = 0; i < 40; i++) {
        const col = sparkleColors[i % sparkleColors.length];
        const mat = new THREE.MeshPhysicalMaterial({
            color: col,
            metalness: 0.95,
            roughness: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            emissive: new THREE.Color(col),
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });

        const star = new THREE.Mesh(starGeo, mat);
        star.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 10
        );
        star.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        const s = 0.4 + Math.random() * 0.6;
        star.scale.set(s, s, s);

        scene.add(star);
        sparkleObjects.push({
            mesh: star,
            rotVel: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.03
            ),
            vel: new THREE.Vector3(
                (Math.random() - 0.5) * 0.006,
                (Math.random() - 0.5) * 0.006,
                0
            ),
            pulseOffset: Math.random() * Math.PI * 2,
            pulseSpeed: 1.0 + Math.random() * 2.0
        });
    }
}

// ── Resize ────────────────────────────────────────────────────────────────────

function onResize() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

// ── Animation Loop ────────────────────────────────────────────────────────────

function wrapAt(pos, limit) {
    if (pos.x >  limit) pos.x = -limit;
    if (pos.x < -limit) pos.x =  limit;
    if (pos.y >  limit) pos.y = -limit;
    if (pos.y < -limit) pos.y =  limit;
}

function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.001;

    sparkleObjects.forEach(s => {
        s.mesh.rotation.x += s.rotVel.x;
        s.mesh.rotation.y += s.rotVel.y;
        s.mesh.rotation.z += s.rotVel.z;
        s.mesh.position.x += s.vel.x;
        s.mesh.position.y += s.vel.y;
        // Pulse glow
        const pulse = 0.25 + Math.abs(Math.sin(t * s.pulseSpeed + s.pulseOffset)) * 0.65;
        s.mesh.material.emissiveIntensity = pulse;
        wrapAt(s.mesh.position, 15);
    });

    dustLayers.forEach(d => {
        d.mesh.position.add(d.vel);
        wrapAt(d.mesh.position, 24);
    });

    // Camera follows mouse
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// ── Init ──────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
} else {
    initThree();
}
