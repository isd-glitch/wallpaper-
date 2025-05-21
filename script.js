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
  constructor(x, y, dx, dy, hueShift = 0) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 8 + 4;
    this.color = `hsl(${(hue + hueShift) % 360}, 100%, 70%)`;
    this.opacity = 1;
    this.mass = 1;
    this.velocity = { x: dx, y: dy };
  }

  update(particles) {
    // 衝突反応
    for (let other of particles) {
      if (this === other) continue;
      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const dist = Math.hypot(dx, dy);
      const minDist = this.radius + other.radius;

      if (dist < minDist && dist > 0) {
        const angle = Math.atan2(dy, dx);
        const force = 0.2;
        const fx = Math.cos(angle) * force;
        const fy = Math.sin(angle) * force;

        this.velocity.x -= fx;
        this.velocity.y -= fy;
        other.velocity.x += fx;
        other.velocity.y += fy;
      }
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // 摩擦と減衰
    this.velocity.x *= 0.92;
    this.velocity.y *= 0.92;

    this.opacity *= 0.97;
    this.radius *= 0.985;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function animate() {
  // 背景：光の残像を活かした半透明
  ctx.fillStyle = "rgba(10, 10, 20, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const dx = mouse.x - prevMouse.x;
  const dy = mouse.y - prevMouse.y;
  const speed = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const intensity = Math.min(speed / 2, 10);
  hue = (hue + 1) % 360;

  for (let i = 0; i < intensity * 2; i++) {
    const offsetAngle = (Math.random() - 0.5) * 1.5;
    const velocity = {
      x: Math.cos(angle + offsetAngle) * speed * 0.1 + (Math.random() - 0.5),
      y: Math.sin(angle + offsetAngle) * speed * 0.1 + (Math.random() - 0.5)
    };
    const shift = Math.random() * 60 - 30;
    particles.push(new Particle(mouse.x, mouse.y, velocity.x, velocity.y, shift));
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update(particles);
    p.draw(ctx);
    if (p.opacity < 0.01 || p.radius < 0.5) {
      particles.splice(i, 1);
    }
  }

  prevMouse.x = mouse.x;
  prevMouse.y = mouse.y;

  requestAnimationFrame(animate);
}

animate();
