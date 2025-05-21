const canvas = document.getElementById("rainbowCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseX = 0;
let mouseY = 0;
let hue = 0;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function drawRainbowTrail() {
  ctx.fillStyle = "rgba(17, 17, 17, 0.1)"; // 黒に近い背景を薄く残す
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(mouseX, mouseY, 15, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
  ctx.fill();

  hue += 2;
  if (hue > 360) hue = 0;

  requestAnimationFrame(drawRainbowTrail);
}

drawRainbowTrail();
