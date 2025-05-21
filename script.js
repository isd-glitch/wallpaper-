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

// 物理演算対応 粒子クラス
class Particle {
  constructor(x, y, dx, dy, color) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 6 + 3;
    this.color = color;
    this.opacity = 1;
    this.mass = 1;
    this.velocity = { x: dx, y: dy };
  }

  update(particles) {
    for (let other of particles) {
      if (this === other) continue;
      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const dist = Math.hypot(dx, dy);
      const minDist = this.radius + other.radius;

      if (dist < minDist && dist > 0) {
        // 弾性衝突: 反発力の簡易実装
        const angle = Math.atan2(dy, dx);
        const totalMass = this.mass + other.mass;

        const v1 = this.velocity;
        const v2 = other.velocity;

        // 単純な反射応答
        this.velocity.x -= (dx / dist) * 0.2;
        this.velocity.y -= (dy / dist) * 0.2;

        other.velocity.x += (dx / dist) * 0.2;
        other.velocity.y += (dy / dist) * 0.2;
      }
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.velocity.x *= 0.95;
    this.velocity.y *= 0.95;

    this.opacity *= 0.97;
    this.radius *= 0.98;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function animate() {
  ctx.fillStyle = "rgba(17, 17, 17, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const dx = mouse.x - prevMouse.x;
  const dy = mouse.y - prevMouse.y;
  const speed = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const spread = Math.min(speed / 3, 10);
  hue = (hue + 1) % 360;

  for (let i = 0; i < spread * 2; i++) {
    const angleOffset = (Math.random() - 0.5) * 0.5;
    const velocity = {
      x: Math.cos(angle + angleOffset) * speed * 0.1,
      y: Math.sin(angle + angleOffset) * speed * 0.1
    };
    particles.push(new Particle(
      mouse.x,
      mouse.y,
      velocity.x,
      velocity.y,
      `hsl(${hue + Math.random() * 30}, 100%, 60%)`
    ));
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update(particles);
    p.draw(ctx);
    if (p.opacity < 0.02 || p.radius < 0.5) {
      particles.splice(i, 1);
    }
  }

  prevMouse.x = mouse.x;
  prevMouse.y = mouse.y;

  requestAnimationFrame(animate);
}

animate();
