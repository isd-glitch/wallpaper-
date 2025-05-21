// 一貫性と接続感のある美しいパーティクルシステム（ラグ軽減・反射対応）
const canvas = document.getElementById("rainbowCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let hue = 0;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.addEventListener("mousemove", (e) => {
  for (let i = 0; i < 3; i++) {
    particles.push(new Particle(e.clientX, e.clientY));
  }
});

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 4 + 2;
    this.color = `hsl(${hue}, 100%, 70%)`;
    this.opacity = 1;
    this.velocity = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    };
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // 壁反射（物理的反応）
    if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
      this.velocity.x *= -1;
      this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
    }
    if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
      this.velocity.y *= -1;
      this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));
    }

    this.opacity *= 0.98;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < 100) {
        ctx.strokeStyle = `hsla(${hue}, 100%, 80%, ${1 - dist / 100})`;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.fillStyle = "rgba(10, 10, 20, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  hue = (hue + 1) % 360;

  particles.forEach((p, i) => {
    p.update();
    p.draw(ctx);
  });

  connectParticles();

  // パフォーマンス維持のため粒子上限
  if (particles.length > 400) {
    particles.splice(0, particles.length - 400);
  }

  requestAnimationFrame(animate);
}

animate();
