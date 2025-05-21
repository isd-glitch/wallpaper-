import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // 完全に透明
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === パーティクル設定 ===
const particleCount = 300;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const ripples = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 100;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
  positions[i * 3 + 2] = 0;
  velocities[i * 3] = (Math.random() - 0.5) * 0.5;
  velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
  velocities[i * 3 + 2] = 0;
  sizes[i] = Math.random() * 2 + 1;
  ripples[i] = 0;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute('ripple', new THREE.BufferAttribute(ripples, 1));

// === マテリアル（Shader） ===
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 },
    pointTexture: { value: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/circle.png') }
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
      gl_PointSize = size * (200.0 / -mvPosition.z) * (1.0 + ripple);
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

const points = new THREE.Points(geometry, material);
scene.add(points);

// === 接続ライン ===
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
const maxLines = 1000;
const linePositions = new Float32Array(maxLines * 6);
const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lineMesh);

// === マウス入力 ===
let mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 100;
  mouse.y = -(e.clientY / window.innerHeight - 0.5) * 100;
});

// === アニメーションループ ===
function animate() {
  material.uniforms.uTime.value += 0.01;

  const pos = geometry.attributes.position.array;
  const ripple = geometry.attributes.ripple.array;

  let lineIndex = 0;
  for (let i = 0; i < particleCount; i++) {
    let ix = i * 3;
    pos[ix] += velocities[ix];
    pos[ix + 1] += velocities[ix + 1];

    // 画面端でバウンド
    if (pos[ix] < -50 || pos[ix] > 50) velocities[ix] *= -1;
    if (pos[ix + 1] < -50 || pos[ix + 1] > 50) velocities[ix + 1] *= -1;

    // マウス近接で波動追加
    let dx = pos[ix] - mouse.x;
    let dy = pos[ix + 1] - mouse.y;
    if (Math.sqrt(dx * dx + dy * dy) < 10) ripple[i] = 1.0;

    ripple[i] *= 0.96;

    for (let j = i + 1; j < particleCount; j++) {
      let jx = j * 3;
      let dx = pos[ix] - pos[jx];
      let dy = pos[ix + 1] - pos[jx + 1];
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10 && lineIndex < maxLines * 6) {
        let li = lineIndex;
        linePositions[li] = pos[ix];
        linePositions[li + 1] = pos[ix + 1];
        linePositions[li + 2] = 0;
        linePositions[li + 3] = pos[jx];
        linePositions[li + 4] = pos[jx + 1];
        linePositions[li + 5] = 0;
        lineIndex += 6;

        if (dist < 5) {
          ripple[i] = 1.0;
          ripple[j] = 1.0;
        }
      }
    }
  }

  for (; lineIndex < maxLines * 6; lineIndex++) {
    linePositions[lineIndex] = 0;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.ripple.needsUpdate = true;
  lineGeometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
