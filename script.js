// WebGL版：高パフォーマンスで美しく滑らかな接続型パーティクルエフェクト + ライン接続 + 波紋 + バウンド + 反射 + 波動伝播
import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
document.body.appendChild(renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 100;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const particleCount = 350;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const ripples = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * window.innerWidth;
  positions[i * 3 + 1] = (Math.random() - 0.5) * window.innerHeight;
  positions[i * 3 + 2] = 0;
  velocities[i * 3] = (Math.random() - 0.5) * 1;
  velocities[i * 3 + 1] = (Math.random() - 0.5) * 1;
  velocities[i * 3 + 2] = 0;
  sizes[i] = Math.random() * 3 + 1;
  ripples[i] = 0;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
particles.setAttribute('ripple', new THREE.BufferAttribute(ripples, 1));

const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    pointTexture: { value: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/circle.png') },
    uTime: { value: 0.0 }
  },
  vertexShader: `
    attribute float size;
    attribute float ripple;
    varying float vHue;
    varying float vRipple;
    void main() {
      vHue = mod(position.x + position.y, 360.0);
      vRipple = ripple;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + ripple);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D pointTexture;
    varying float vHue;
    varying float vRipple;
    void main() {
      vec3 baseColor = vec3(0.5 + 0.5 * cos(vHue * 0.05 + vec3(0.0, 2.0, 4.0)));
      vec3 color = mix(baseColor, vec3(1.0), clamp(vRipple, 0.0, 1.0));
      gl_FragColor = vec4(color, 1.0) * texture2D(pointTexture, gl_PointCoord);
    }
  `,
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true
});

const pointCloud = new THREE.Points(particles, shaderMaterial);
scene.add(pointCloud);

const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
const lineGeometry = new THREE.BufferGeometry();
const maxConnections = 1500;
const linePositions = new Float32Array(maxConnections * 3);
lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(linesMesh);

let mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX - window.innerWidth / 2;
  mouse.y = -(e.clientY - window.innerHeight / 2);
});

function animate() {
  shaderMaterial.uniforms.uTime.value += 0.01;
  const pos = particles.attributes.position.array;
  const ripple = particles.attributes.ripple.array;
  let lineIndex = 0;

  for (let i = 0; i < particleCount; i++) {
    let x = pos[i * 3];
    let y = pos[i * 3 + 1];
    let vx = velocities[i * 3];
    let vy = velocities[i * 3 + 1];

    x += vx;
    y += vy;

    if (x < -window.innerWidth / 2 || x > window.innerWidth / 2) velocities[i * 3] *= -1;
    if (y < -window.innerHeight / 2 || y > window.innerHeight / 2) velocities[i * 3 + 1] *= -1;

    pos[i * 3] = x;
    pos[i * 3 + 1] = y;

    ripple[i] *= 0.95;

    for (let j = i + 1; j < particleCount; j++) {
      let dx = pos[i * 3] - pos[j * 3];
      let dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100 && lineIndex < maxConnections * 3) {
        linePositions[lineIndex++] = pos[i * 3];
        linePositions[lineIndex++] = pos[i * 3 + 1];
        linePositions[lineIndex++] = pos[i * 3 + 2];
        linePositions[lineIndex++] = pos[j * 3];
        linePositions[lineIndex++] = pos[j * 3 + 1];
        linePositions[lineIndex++] = pos[j * 3 + 2];

        if (dist < 40) {
          ripple[i] = 1.0;
          ripple[j] = 1.0;
        }
      }
    }
  }

  for (; lineIndex < maxConnections * 3; lineIndex++) {
    linePositions[lineIndex] = 0;
  }

  lineGeometry.attributes.position.needsUpdate = true;
  particles.attributes.position.needsUpdate = true;
  particles.attributes.ripple.needsUpdate = true;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
