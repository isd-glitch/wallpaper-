const canvas = document.getElementById("rainbowCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let hue = 0;
let particles = [];
let mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// 粒子クラス
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 6 + 2;
    this.color = color;
    this.opacity = 1;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.radius *= 0.96;
    this.opacity -= 0.01;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function animate() {
  // 少しずつ消して残像効果
  ctx.fillStyle = "rgba(17, 17, 17, 0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 色相を更新
  hue += 2;
  if (hue > 360) hue = 0;

  // 新しいパーティクルを生成
  for (let i = 0; i < 5; i++) {
    particles.push(
      new Particle(mouse.x, mouse.y, `hsl(${hue}, 100%, 60%)`)
    );
  }

  // パーティクルを更新・描画
  particles.forEach((p, index) => {
    p.update();
    p.draw(ctx);
    if (p.opacity <= 0.01 || p.radius <= 0.5) {
      particles.splice(index, 1);
    }
  });

  requestAnimationFrame(animate);
}

animate();
