// WebGL版：高パフォーマンスで美しく滑らかな接続型パーティクルエフェクト（光・反射・尾・バウンド）
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

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * window.innerWidth;
  positions[i * 3 + 1] = (Math.random() - 0.5) * window.innerHeight;
  positions[i * 3 + 2] = 0;
  velocities[i * 3] = (Math.random() - 0.5) * 1;
  velocities[i * 3 + 1] = (Math.random() - 0.5) * 1;
  velocities[i * 3 + 2] = 0;
  sizes[i] = Math.random() * 3 + 1;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    pointTexture: { value: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/circle.png') },
    uTime: { value: 0.0 },
    uHue: { value: 0.0 }
  },
  vertexShader: `
    attribute float size;
    varying float vHue;
    void main() {
      vHue = mod(position.x + position.y, 360.0);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D pointTexture;
    varying float vHue;
    void main() {
      vec3 color = vec3(0.5 + 0.5 * cos(vHue * 0.05 + vec3(0.0, 2.0, 4.0)));
      gl_FragColor = vec4(color, 1.0) * texture2D(pointTexture, gl_PointCoord);
    }
  `,
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true
});

const pointCloud = new THREE.Points(particles, shaderMaterial);
scene.add(pointCloud);

let mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX - window.innerWidth / 2;
  mouse.y = -(e.clientY - window.innerHeight / 2);
});

function animate() {
  shaderMaterial.uniforms.uTime.value += 0.01;

  const pos = particles.attributes.position.array;
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
  }
  particles.attributes.position.needsUpdate = true;

  pointCloud.rotation.y += 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
