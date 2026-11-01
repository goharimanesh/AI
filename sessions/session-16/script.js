/* ============================================================
   جلسه ۱۶ — RL در مکانیک
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Inverted Pendulum، Path Planning، Algorithm Comparison
   ============================================================ */

/* ============ GALAXY BACKGROUND ============ */
const galaxyCanvas = document.getElementById("galaxyCanvas");
const gctx = galaxyCanvas.getContext("2d");
let gStars = [];

function initGalaxy(){
  galaxyCanvas.width = window.innerWidth;
  galaxyCanvas.height = window.innerHeight;
  gStars = [];
  const count = Math.min(200, Math.floor(window.innerWidth * window.innerHeight / 6000));
  for(let i=0; i<count; i++){
    gStars.push({
      x: Math.random() * galaxyCanvas.width,
      y: Math.random() * galaxyCanvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.7 + 0.2,
      color: Math.random() > 0.7 ? "#f5c76a" : (Math.random() > 0.5 ? "#4dd4ff" : "#eaf2ff"),
      pulse: Math.random() * Math.PI * 2
    });
  }
}
function drawGalaxy(){
  gctx.clearRect(0, 0, galaxyCanvas.width, galaxyCanvas.height);
  const g1 = gctx.createRadialGradient(
    galaxyCanvas.width*0.3, galaxyCanvas.height*0.4, 50,
    galaxyCanvas.width*0.3, galaxyCanvas.height*0.4, galaxyCanvas.width*0.4
  );
  g1.addColorStop(0, "rgba(77,212,255,0.06)");
  g1.addColorStop(1, "transparent");
  gctx.fillStyle = g1;
  gctx.fillRect(0, 0, galaxyCanvas.width, galaxyCanvas.height);
  gStars.forEach(s => {
    s.x += s.vx; s.y += s.vy; s.pulse += 0.02;
    if(s.x < 0) s.x = galaxyCanvas.width;
    if(s.x > galaxyCanvas.width) s.x = 0;
    if(s.y < 0) s.y = galaxyCanvas.height;
    if(s.y > galaxyCanvas.height) s.y = 0;
    gctx.beginPath();
    gctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    gctx.fillStyle = s.color;
    gctx.globalAlpha = s.alpha * (0.6 + Math.sin(s.pulse)*0.4);
    gctx.fill();
    gctx.globalAlpha = 1;
  });
  requestAnimationFrame(drawGalaxy);
}
initGalaxy(); drawGalaxy();
window.addEventListener("resize", initGalaxy);

/* ============ SLIDES NAVIGATION ============ */
const slides = document.querySelectorAll(".slide");
const totalSlides = slides.length;
let currentSlide = 0;
const simsInit = {};

const dotsContainer = document.getElementById("dots");
const topicBar = document.getElementById("topicBar");
const progressFill = document.getElementById("progressFill");
const currentNum = document.getElementById("currentNum");
const totalNum = document.getElementById("totalNum");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const star = document.getElementById("star");

function toFa(n){
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).replace(/\d/g, d => fa[d]);
}
totalNum.textContent = toFa(totalSlides);

slides.forEach((s, i) => {
  const dot = document.createElement("button");
  dot.className = "dot" + (i === 0 ? " active" : "");
  dot.onclick = () => goToSlide(i);
  dotsContainer.appendChild(dot);
});
slides.forEach((s, i) => {
  const topic = s.dataset.topic || `اسلاید ${i+1}`;
  const pill = document.createElement("button");
  pill.className = "topicPill" + (i === 0 ? " active" : "");
  pill.textContent = toFa(i+1) + ". " + topic;
  pill.onclick = () => goToSlide(i);
  topicBar.appendChild(pill);
});

function goToSlide(n){
  if(n < 0 || n >= totalSlides) return;
  slides[currentSlide].classList.remove("active");
  currentSlide = n;
  slides[currentSlide].classList.add("active");
  slides[currentSlide].scrollTop = 0;
  if(currentSlide === 0) star.classList.add("visible");
  else star.classList.remove("visible");
  updateUI();
  playTransition();
  if(window.MathJax && MathJax.typesetPromise){
    setTimeout(() => MathJax.typesetPromise().catch(()=>{}), 200);
  }
  setTimeout(initVisibleSims, 120);
}

function updateUI(){
  currentNum.textContent = toFa(currentSlide + 1);
  progressFill.style.width = ((currentSlide + 1) / totalSlides * 100) + "%";
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === totalSlides - 1;
  document.querySelectorAll(".dot").forEach((d, i) => {
    d.classList.remove("active", "done");
    if(i < currentSlide) d.classList.add("done");
    if(i === currentSlide) d.classList.add("active");
  });
  document.querySelectorAll(".topicPill").forEach((p, i) => {
    p.classList.remove("active", "done");
    if(i < currentSlide) p.classList.add("done");
    if(i === currentSlide){
      p.classList.add("active");
      p.scrollIntoView({behavior:"smooth", inline:"center", block:"nearest"});
    }
  });
}

prevBtn.onclick = () => goToSlide(currentSlide - 1);
nextBtn.onclick = () => goToSlide(currentSlide + 1);
document.addEventListener("keydown", (e) => {
  if(e.key === "ArrowLeft") goToSlide(currentSlide + 1);
  else if(e.key === "ArrowRight") goToSlide(currentSlide - 1);
  else if(e.key === " ") { e.preventDefault(); goToSlide(currentSlide + 1); }
  else if(e.key === "Home") goToSlide(0);
  else if(e.key === "End") goToSlide(totalSlides - 1);
  else if(e.key === "Escape") closeImage();
});
let touchStartX = 0;
document.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; });
document.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if(Math.abs(dx) > 50){
    if(dx > 0) goToSlide(currentSlide - 1);
    else goToSlide(currentSlide + 1);
  }
});
updateUI();

/* ============ THEME ============ */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const savedTheme = localStorage.getItem("ai-session-theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);
themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("ai-session-theme", next);
  updateThemeIcon(next);
  playClick();
};
function updateThemeIcon(theme){
  themeIcon.setAttribute("data-lucide", theme === "dark" ? "sun" : "moon");
  lucide.createIcons();
}

/* ============ SOUND ============ */
let soundEnabled = localStorage.getItem("ai-session-sound") !== "off";
const soundToggle = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");
updateSoundIcon();
soundToggle.onclick = () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem("ai-session-sound", soundEnabled ? "on" : "off");
  updateSoundIcon();
  if(soundEnabled) playClick();
};
function updateSoundIcon(){
  soundIcon.setAttribute("data-lucide", soundEnabled ? "volume-2" : "volume-x");
  lucide.createIcons();
}
let audioCtx = null;
function getAudioCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playClick(){
  if(!soundEnabled) return;
  try{
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 620;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  } catch(e){}
}
function playTransition(){
  if(!soundEnabled) return;
  try{
    const ctx = getAudioCtx();
    [520, 720].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.04, ctx.currentTime + i*0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.05 + 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i*0.05);
      osc.stop(ctx.currentTime + i*0.05 + 0.1);
    });
  } catch(e){}
}

document.getElementById("fullscreenBtn").onclick = () => {
  if(!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};

/* ============ CODE TABS ============ */
document.querySelectorAll(".codeTabBtn").forEach(btn => {
  btn.onclick = () => {
    const target = btn.dataset.code;
    const parent = btn.closest(".codeTabs");
    parent.querySelectorAll(".codeTabBtn").forEach(b => b.classList.remove("active"));
    parent.querySelectorAll(".codePane").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    parent.querySelector("#code-" + target).classList.add("active");
    playClick();
  };
});

/* ============ IMAGE ZOOM ============ */
function openImage(src){
  const modal = document.getElementById("modal");
  document.getElementById("modalImg").src = src;
  modal.classList.add("open");
  playClick();
}
function closeImage(){
  document.getElementById("modal").classList.remove("open");
}
document.getElementById("modal").onclick = (e) => {
  if(e.target.id === "modal") closeImage();
};

/* ============ CANVAS SETUP ============ */
function setupCanvas(canvas){
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* ============================================================
   SIM 1 — INVERTED PENDULUM RL CONTROL
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const power_s = document.getElementById("sim1_power");
  const runBtn = document.getElementById("sim1_run");
  const pauseBtn = document.getElementById("sim1_pause");
  const resetBtn = document.getElementById("sim1_reset");
  const infoEl = document.getElementById("sim1_info");

  // Physics parameters
  const gravity = 9.81;
  const cartMass = 1.0;
  const poleMass = 0.1;
  const poleLength = 0.5;
  const dt = 0.02;

  // State
  let cartX = 0;
  let cartV = 0;
  let poleAngle = 0.05; // small initial angle
  let poleV = 0;
  let time = 0;
  let running = false;
  let animationId = null;
  let steps = 0;

  function step(action){
    const power = +power_s.value;
    const force = action * power * 10;

    // Physics equations (simplified)
    const cosA = Math.cos(poleAngle);
    const sinA = Math.sin(poleAngle);
    const totalMass = cartMass + poleMass;
    const poleMassLength = poleMass * poleLength;

    const temp = (force + poleMassLength * poleV * poleV * sinA) / totalMass;
    const thetaAcc = (gravity * sinA - cosA * temp) /
                     (poleLength * (4/3 - poleMass * cosA * cosA / totalMass));
    const xAcc = temp - poleMassLength * thetaAcc * cosA / totalMass;

    cartV += xAcc * dt;
    cartX += cartV * dt;
    poleV += thetaAcc * dt;
    poleAngle += poleV * dt;

    time += dt;
    steps++;
  }

  function rlController(){
    // Simple PD-like policy (learned policy approximation)
    const angleThreshold = 0.05;
    const cartThreshold = 0.5;
    if(poleAngle > angleThreshold || (Math.abs(poleAngle) < angleThreshold && cartX > cartThreshold)){
      return 1; // push right
    } else if(poleAngle < -angleThreshold || (Math.abs(poleAngle) < angleThreshold && cartX < -cartThreshold)){
      return -1; // push left
    }
    return 0;
  }

  function loop(){
    if(!running) return;
    const action = rlController();
    step(action);

    document.getElementById("sim1_time").textContent = time.toFixed(1) + "s";
    document.getElementById("sim1_angle").textContent = (poleAngle * 180 / Math.PI).toFixed(1) + "°";

    // Check failure
    if(Math.abs(poleAngle) > Math.PI / 4 || Math.abs(cartX) > 2){
      running = false;
      document.getElementById("sim1_status").textContent = "شکست";
      document.getElementById("sim1_status").style.color = "#ff7e93";
      infoEl.innerHTML = `<b>شکست در ${time.toFixed(1)}s:</b> چوب افتاد. RL همیشه کامل نیست — ولی با آموزش بهتر می‌شود.`;
      draw();
      return;
    }

    draw();
    animationId = requestAnimationFrame(loop);
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    document.getElementById("sim1_power_val").textContent = (+power_s.value).toFixed(1);

    const cx = w/2;
    const cy = h - 80;
    const scaleX = 80; // pixels per meter
    const scaleA = 200; // pixels for pole

    // Ground line
    ctx.strokeStyle = "rgba(120,160,220,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    // Draw tracks
    for(let i=0; i<w; i+=20){
      ctx.strokeStyle = "rgba(120,160,220,0.1)";
      ctx.beginPath();
      ctx.moveTo(i, cy);
      ctx.lineTo(i + 10, cy);
      ctx.stroke();
    }

    const cartScreenX = cx + cartX * scaleX;

    // Pole
    const poleX = cartScreenX + Math.sin(poleAngle) * scaleA;
    const poleY = cy - Math.cos(poleAngle) * scaleA;

    ctx.strokeStyle = poleAngle > 0.1 || poleAngle < -0.1 ? "#ff7e93" : "#f5c76a";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cartScreenX, cy - 15);
    ctx.lineTo(poleX, poleY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pole top circle
    ctx.beginPath();
    ctx.arc(poleX, poleY, 10, 0, Math.PI*2);
    ctx.fillStyle = "#f5c76a";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cart
    ctx.fillStyle = "#4dd4ff";
    ctx.fillRect(cartScreenX - 30, cy - 15, 60, 30);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cartScreenX - 30, cy - 15, 60, 30);

    // Cart wheels
    [-20, 20].forEach(dx => {
      ctx.beginPath();
      ctx.arc(cartScreenX + dx, cy + 15, 8, 0, Math.PI*2);
      ctx.fillStyle = "#a8bcd4";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    });

    // Angle indicator
    ctx.strokeStyle = "rgba(167,139,250,0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cartScreenX, cy - 15);
    ctx.lineTo(cartScreenX, cy - 15 - scaleA);
    ctx.stroke();
    ctx.setLineDash([]);

    // Angle arc
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cartScreenX, cy - 15, 50, -Math.PI/2, -Math.PI/2 + poleAngle, poleAngle < 0);
    ctx.stroke();

    // Angle label
    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`θ = ${(poleAngle * 180 / Math.PI).toFixed(1)}°`, cartScreenX + 60, cy - 40);

    // Status
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`⏱ ${time.toFixed(1)}s`, 15, 15);
    ctx.fillText(`🎯 Reward: ${steps}`, 15, 40);
  }

  function start(){
    if(running) return;
    running = true;
    document.getElementById("sim1_status").textContent = "در حال اجرا";
    document.getElementById("sim1_status").style.color = "#f5c76a";
    infoEl.innerHTML = "<b>در حال اجرا...</b> RL در حال کنترل CartPole است.";
    loop();
    playClick();
  }

  function pause(){
    running = false;
    if(animationId) cancelAnimationFrame(animationId);
    document.getElementById("sim1_status").textContent = "متوقف";
    document.getElementById("sim1_status").style.color = "#a8bcd4";
    playClick();
  }

  function reset(){
    running = false;
    if(animationId) cancelAnimationFrame(animationId);
    cartX = 0;
    cartV = 0;
    poleAngle = 0.05;
    poleV = 0;
    time = 0;
    steps = 0;
    document.getElementById("sim1_time").textContent = "0.0s";
    document.getElementById("sim1_angle").textContent = "0°";
    document.getElementById("sim1_status").textContent = "آماده";
    document.getElementById("sim1_status").style.color = "#a8bcd4";
    infoEl.innerHTML = "<b>راهنما:</b> «اجرا» را بزنید.";
    draw();
    playClick();
  }

  runBtn.onclick = start;
  pauseBtn.onclick = pause;
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = () => { reset(); };
})();

/* ============================================================
   SIM 2 — PATH PLANNING
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const trainBtn = document.getElementById("sim2_train");
  const stepBtn = document.getElementById("sim2_step");
  const resetBtn = document.getElementById("sim2_reset");
  const infoEl = document.getElementById("sim2_info");

  const GRID = 8;
  const obstacles = [
    [2, 1], [2, 2], [2, 3],
    [4, 4], [4, 5], [4, 6],
    [6, 2], [6, 3]
  ];
  const start = [0, 0];
  const goal = [7, 7];

  let agentPos = [...start];
  let path = [start];
  let episode = 0;
  let reward = 0;
  let steps = 0;
  let autoTimer = null;
  let training = false;

  // Simulated Q-table for the grid (simplified)
  let qTable = {};

  function isObstacle(x, y){
    return obstacles.some(([ox, oy]) => ox === x && oy === y);
  }

  function isValidMove(x, y){
    return x >= 0 && x < GRID && y >= 0 && y < GRID && !isObstacle(x, y);
  }

  // Simple policy: prefer direction towards goal, avoid obstacles
  function smartPolicy(x, y){
    const moves = [
      { dx: 1, dy: 0, name: "right" },
      { dx: 0, dy: 1, name: "down" },
      { dx: -1, dy: 0, name: "left" },
      { dx: 0, dy: -1, name: "up" }
    ];

    // Filter valid moves
    const valid = moves.filter(m => isValidMove(x + m.dx, y + m.dy));
    if(valid.length === 0) return null;

    // Score each move by distance to goal
    valid.forEach(m => {
      const nx = x + m.dx;
      const ny = y + m.dy;
      m.dist = Math.abs(nx - goal[0]) + Math.abs(ny - goal[1]);
    });

    valid.sort((a, b) => a.dist - b.dist);
    return valid[0];
  }

  function step(){
    if(agentPos[0] === goal[0] && agentPos[1] === goal[1]) return;

    const move = smartPolicy(agentPos[0], agentPos[1]);
    if(!move) return;

    agentPos = [agentPos[0] + move.dx, agentPos[1] + move.dy];
    path.push([...agentPos]);
    steps++;

    if(agentPos[0] === goal[0] && agentPos[1] === goal[1]){
      reward = 10 - steps * 0.1;
      document.getElementById("sim2_status").textContent = "✓ رسید!";
      document.getElementById("sim2_status").style.color = "#5ee8a8";
      infoEl.innerHTML = `<b>🎉 رسید!</b> در ${steps} گام با پاداش ${reward.toFixed(1)}. این همان مسیری است که RL یاد می‌گیرد.`;
      if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
    } else {
      document.getElementById("sim2_status").textContent = "در حال حرکت";
      document.getElementById("sim2_status").style.color = "#f5c76a";
    }

    document.getElementById("sim2_steps").textContent = steps;
    document.getElementById("sim2_rew").textContent = (10 - steps * 0.1).toFixed(1);
    draw();
    playClick();
  }

  function train(){
    if(training) return;
    training = true;
    reset();
    trainBtn.innerHTML = '<i data-lucide="pause"></i> توقف';
    lucide.createIcons();
    autoTimer = setInterval(() => {
      step();
      if(agentPos[0] === goal[0] && agentPos[1] === goal[1]){
        clearInterval(autoTimer);
        autoTimer = null;
        training = false;
        trainBtn.innerHTML = '<i data-lucide="play"></i> آموزش';
        lucide.createIcons();
      }
    }, 300);
    playClick();
  }

  function reset(){
    if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
    training = false;
    trainBtn.innerHTML = '<i data-lucide="play"></i> آموزش';
    lucide.createIcons();
    agentPos = [...start];
    path = [start];
    steps = 0;
    reward = 0;
    document.getElementById("sim2_steps").textContent = "0";
    document.getElementById("sim2_rew").textContent = "0";
    document.getElementById("sim2_status").textContent = "آماده";
    document.getElementById("sim2_status").style.color = "#a8bcd4";
    infoEl.innerHTML = "<b>راهنما:</b> «آموزش» را بزنید تا ربات مسیر بهینه را یاد بگیرد.";
    draw();
    playClick();
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const cellSize = Math.min((w - 100) / GRID, (h - 100) / GRID, 50);
    const totalW = cellSize * GRID;
    const startX = (w - totalW) / 2;
    const startY = (h - totalW) / 2;

    // Draw cells
    for(let y=0; y<GRID; y++){
      for(let x=0; x<GRID; x++){
        const cx = startX + x * cellSize;
        const cy = startY + y * cellSize;

        ctx.fillStyle = "rgba(77,212,255,0.05)";
        ctx.fillRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);

        ctx.strokeStyle = "rgba(120,160,220,0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);
      }
    }

    // Obstacles
    obstacles.forEach(([x, y]) => {
      const cx = startX + x * cellSize;
      const cy = startY + y * cellSize;
      ctx.fillStyle = "rgba(255,126,147,0.4)";
      ctx.fillRect(cx + 3, cy + 3, cellSize - 6, cellSize - 6);
      ctx.strokeStyle = "#ff7e93";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx + 3, cy + 3, cellSize - 6, cellSize - 6);

      ctx.fillStyle = "#ff7e93";
      ctx.font = `bold ${Math.floor(cellSize * 0.4)}px Vazirmatn`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✕", cx + cellSize/2, cy + cellSize/2);
    });

    // Path
    if(path.length > 1){
      ctx.strokeStyle = "rgba(167,139,250,0.6)";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      path.forEach(([x, y], i) => {
        const cx = startX + x * cellSize + cellSize/2;
        const cy = startY + y * cellSize + cellSize/2;
        if(i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Start
    const sx = startX + start[0] * cellSize + cellSize/2;
    const sy = startY + start[1] * cellSize + cellSize/2;
    ctx.beginPath();
    ctx.arc(sx, sy, cellSize * 0.3, 0, Math.PI*2);
    ctx.fillStyle = "rgba(94,232,168,0.5)";
    ctx.fill();
    ctx.strokeStyle = "#5ee8a8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Goal
    const gx = startX + goal[0] * cellSize + cellSize/2;
    const gy = startY + goal[1] * cellSize + cellSize/2;
    ctx.beginPath();
    ctx.arc(gx, gy, cellSize * 0.35, 0, Math.PI*2);
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, cellSize*0.35);
    grad.addColorStop(0, "#f5c76a");
    grad.addColorStop(1, "rgba(245,199,106,0.2)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.fillStyle = "#f5c76a";
    ctx.font = `bold ${Math.floor(cellSize*0.5)}px Vazirmatn`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", gx, gy);

    // Agent
    const ax = startX + agentPos[0] * cellSize + cellSize/2;
    const ay = startY + agentPos[1] * cellSize + cellSize/2;
    ctx.beginPath();
    ctx.arc(ax, ay, cellSize * 0.3, 0, Math.PI*2);
    ctx.fillStyle = "#4dd4ff";
    ctx.shadowColor = "#4dd4ff";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.floor(cellSize*0.4)}px Vazirmatn`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🤖", ax, ay);

    // Legend
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("🤖 Agent", 15, 15);
    ctx.fillStyle = "#f5c76a";
    ctx.fillText("★ Goal", 15, 40);
    ctx.fillStyle = "#ff7e93";
    ctx.fillText("✕ Obstacle", 15, 65);
  }

  trainBtn.onclick = train;
  stepBtn.onclick = step;
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = () => { reset(); };
})();

/* ============================================================
   SIM 3 — ALGORITHM COMPARISON
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const infoEl = document.getElementById("sim3_info");
  let currentAlgo = "dqn";

  const algorithms = {
    dqn: {
      name: "DQN",
      space: "گسسته",
      spaceEn: "Discrete",
      stability: "متوسط",
      stabilityEn: "Medium",
      scores: { discrete: 9, continuous: 2, stability: 6, sampleEff: 8, simplicity: 7 },
      color: "#4dd4ff",
      description: "Deep Q-Network — برای فضای عمل گسسته، Off-policy، کارایی داده بالا"
    },
    ppo: {
      name: "PPO",
      space: "گسسته و پیوسته",
      spaceEn: "Both",
      stability: "بالا",
      stabilityEn: "High",
      scores: { discrete: 8, continuous: 8, stability: 9, sampleEff: 5, simplicity: 8 },
      color: "#f5c76a",
      description: "Proximal Policy Optimization — همه‌کاره، پایدار، On-policy"
    },
    sac: {
      name: "SAC",
      space: "پیوسته",
      spaceEn: "Continuous",
      stability: "بالا",
      stabilityEn: "High",
      scores: { discrete: 3, continuous: 10, stability: 9, sampleEff: 8, simplicity: 5 },
      color: "#5ee8a8",
      description: "Soft Actor-Critic — بهترین برای کنترل پیوسته، Off-policy، با آنتروپی"
    },
    td3: {
      name: "TD3",
      space: "پیوسته",
      spaceEn: "Continuous",
      stability: "بالا",
      stabilityEn: "High",
      scores: { discrete: 2, continuous: 9, stability: 8, sampleEff: 8, simplicity: 5 },
      color: "#a78bfa",
      description: "Twin Delayed DDPG — برای کنترل پیوسته، پایدارتر از DDPG"
    }
  };

  const criteria = [
    { key: "discrete", label: "فضای گسسته", icon: "🎯" },
    { key: "continuous", label: "فضای پیوسته", icon: "🌊" },
    { key: "stability", label: "پایداری آموزش", icon: "🛡" },
    { key: "sampleEff", label: "کارایی داده", icon: "📊" },
    { key: "simplicity", label: "سادگی", icon: "✨" }
  ];

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const algo = algorithms[currentAlgo];

    // Update UI
    document.getElementById("sim3_algo").textContent = algo.name;
    document.getElementById("sim3_space").textContent = algo.space;
    document.getElementById("sim3_stability").textContent = algo.stability;
    infoEl.innerHTML = `<b>${algo.name}:</b> ${algo.description}`;

    // Radar chart
    const cx = w/2;
    const cy = h/2;
    const maxR = Math.min(w, h) * 0.35;
    const n = criteria.length;

    // Grid
    for(let ring = 1; ring <= 5; ring++){
      ctx.beginPath();
      const r = maxR * ring / 5;
      for(let i = 0; i <= n; i++){
        const angle = (i / n) * Math.PI * 2 - Math.PI/2;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if(i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = "rgba(120,160,220,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axes
    for(let i = 0; i < n; i++){
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = "rgba(120,160,220,0.25)";
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    criteria.forEach((c, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      const r = maxR * (algo.scores[c.key] / 10);
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if(i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = algo.color + "44";
    ctx.fill();
    ctx.strokeStyle = algo.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = algo.color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Data points
    criteria.forEach((c, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      const r = maxR * (algo.scores[c.key] / 10);
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI*2);
      ctx.fillStyle = algo.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Labels
    ctx.fillStyle = "#eaf2ff";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    criteria.forEach((c, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      const lx = cx + Math.cos(angle) * (maxR + 30);
      const ly = cy + Math.sin(angle) * (maxR + 30);
      ctx.fillText(`${c.icon} ${c.label}`, lx, ly);
    });

    // Title
    ctx.fillStyle = algo.color;
    ctx.font = "bold 16px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(algo.name, cx, 15);
  }

  document.querySelectorAll("#sim3_btns button").forEach(btn => {
    btn.onclick = () => {
      currentAlgo = btn.dataset.algo;
      document.querySelectorAll("#sim3_btns button").forEach(b => {
        b.classList.remove("btnPrimary");
        b.classList.add("btnSecondary");
      });
      btn.classList.remove("btnSecondary");
      btn.classList.add("btnPrimary");
      draw();
      playClick();
    };
  });

  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim3 = draw;
})();

/* ============ INIT VISIBLE SIMS ============ */
function initVisibleSims(){
  const active = slides[currentSlide];
  if(!active) return;
  const topic = active.dataset.topic;
  if(topic === "شبیه‌ساز ۱" && simsInit.sim1) simsInit.sim1();
  else if(topic === "شبیه‌ساز ۲" && simsInit.sim2) simsInit.sim2();
  else if(topic === "شبیه‌ساز ۳" && simsInit.sim3) simsInit.sim3();
}

/* ============ INIT ============ */
lucide.createIcons();
setTimeout(() => {
  if(window.MathJax && MathJax.typesetPromise){
    MathJax.typesetPromise().catch(()=>{});
  }
}, 800);