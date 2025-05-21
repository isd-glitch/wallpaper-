const canvas = document.getElementById("rainbowCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let hue = 0;
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let prevMouse = { x: mouse.x, y: mouse.y };

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.addEventListener("mousemove", (e) => {
  prevMouse.x = mouse.x;
  prevMouse.y = mouse.y;
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

class Particle {
  constructor(x, y, dx, dy, color) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 6 + 3;
    this.color = color;
    this.opacity = 1;
    this.speedX = dx + (Math.random() - 0.5) * 1.5;
    this.speedY = dy + (Math.random() - 0.5) * 1.5;
    this.rotation = Math.random() * 2 * Math.PI;
    this.angularVelocity = (Math.random() - 0.5) * 0.2;
  }

  update() {
    this.rotation += this.angularVelocity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity *= 0.96;
    this.radius *= 0.97;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

function animate() {
  // ブラー効果のために薄く塗り直す
  ctx.fillStyle = "rgba(17, 17, 17, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // マウスの移動速度を計算
  const dx = mouse.x - prevMouse.x;
  const dy = mouse.y - prevMouse.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speedFactor = Math.min(distance / 5, 10); // 最大粒子数制限

  hue = (hue + 2) % 360;

  for (let i = 0; i < speedFactor * 2; i++) {
    particles.push(new Particle(
      mouse.x,
      mouse.y,
      dx * 0.1,
      dy * 0.1,
      `hsl(${hue + Math.random() * 30}, 100%, 60%)`
    ));
  }

  // 粒子の更新・描画
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw(ctx);
    if (particles[i].opacity < 0.02 || particles[i].radius < 0.5) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();
