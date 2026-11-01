/* ============================================================
   جلسه ۱۳ — مقدمه یادگیری تقویتی
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Agent-Environment Loop، Grid World، Epsilon-Greedy
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
   SIM 1 — AGENT-ENVIRONMENT LOOP
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const stepBtn = document.getElementById("sim1_step");
  const resetBtn = document.getElementById("sim1_reset");
  const infoEl = document.getElementById("sim1_info");

  // Simple grid world 5x5
  const GRID = 5;
  let agentPos = { x: 0, y: 0 };
  let goalPos = { x: 4, y: 4 };
  let totalReward = 0;
  let stepCount = 0;
  let lastAction = "—";
  let lastState = "—";
  let visitedPath = [];

  function reset(){
    agentPos = { x: 0, y: 0 };
    totalReward = 0;
    stepCount = 0;
    lastAction = "—";
    lastState = "(0,0)";
    visitedPath = [{ ...agentPos }];
    draw();
    infoEl.innerHTML = "<b>راهنما:</b> «گام بعدی» را بزنید تا Agent در محیط حرکت کند.";
  }

  function step(){
    // Choose random action
    const actions = [
      { name: "↑ بالا", dx: 0, dy: -1 },
      { name: "↓ پایین", dx: 0, dy: 1 },
      { name: "→ راست", dx: 1, dy: 0 },
      { name: "← چپ", dx: -1, dy: 0 }
    ];
    const a = actions[Math.floor(Math.random() * 4)];

    // Save previous state
    const prevState = `(${agentPos.x},${agentPos.y})`;

    // Apply action
    agentPos.x = Math.max(0, Math.min(GRID-1, agentPos.x + a.dx));
    agentPos.y = Math.max(0, Math.min(GRID-1, agentPos.y + a.dy));

    // Compute reward
    let reward = -0.1; // small penalty per step
    if(agentPos.x === goalPos.x && agentPos.y === goalPos.y){
      reward = 10;
    }

    totalReward += reward;
    stepCount++;
    lastAction = a.name;
    lastState = prevState;
    visitedPath.push({ ...agentPos });

    // Update UI
    document.getElementById("sim1_state").textContent = `(${agentPos.x},${agentPos.y})`;
    document.getElementById("sim1_action").textContent = a.name;
    document.getElementById("sim1_reward").textContent = totalReward.toFixed(1);
    document.getElementById("sim1_step_n").textContent = stepCount;

    if(agentPos.x === goalPos.x && agentPos.y === goalPos.y){
      infoEl.innerHTML = `<b>🎉 رسیدیم!</b> در ${stepCount} گام با پاداش تجمعی ${totalReward.toFixed(1)}.`;
    } else {
      infoEl.innerHTML = `<b>گام ${stepCount}:</b> از ${prevState} با عمل «${a.name}» به (${agentPos.x},${agentPos.y}). پاداش: ${reward.toFixed(1)}.`;
    }

    draw();
    playClick();
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    // Grid dimensions
    const cellSize = Math.min((w - 80) / GRID, (h - 80) / GRID, 70);
    const totalW = cellSize * GRID;
    const totalH = cellSize * GRID;
    const startX = (w - totalW) / 2;
    const startY = (h - totalH) / 2;

    // Draw grid cells
    for(let y=0; y<GRID; y++){
      for(let x=0; x<GRID; x++){
        const cx = startX + x * cellSize;
        const cy = startY + y * cellSize;

        // Cell background
        ctx.fillStyle = "rgba(77,212,255,0.05)";
        ctx.fillRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);

        // Border
        ctx.strokeStyle = "rgba(120,160,220,0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);
      }
    }

    // Draw path
    if(visitedPath.length > 1){
      ctx.strokeStyle = "rgba(167,139,250,0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      visitedPath.forEach((p, i) => {
        const cx = startX + p.x * cellSize + cellSize/2;
        const cy = startY + p.y * cellSize + cellSize/2;
        if(i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw goal
    const gx = startX + goalPos.x * cellSize + cellSize/2;
    const gy = startY + goalPos.y * cellSize + cellSize/2;
    ctx.beginPath();
    ctx.arc(gx, gy, cellSize * 0.3, 0, Math.PI*2);
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, cellSize*0.3);
    grad.addColorStop(0, "#f5c76a");
    grad.addColorStop(1, "rgba(245,199,106,0.2)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#f5c76a";
    ctx.font = `bold ${Math.floor(cellSize*0.4)}px Vazirmatn`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", gx, gy);

    // Draw agent
    const ax = startX + agentPos.x * cellSize + cellSize/2;
    const ay = startY + agentPos.y * cellSize + cellSize/2;
    ctx.beginPath();
    ctx.arc(ax, ay, cellSize * 0.3, 0, Math.PI*2);
    ctx.fillStyle = "#4dd4ff";
    ctx.shadowColor = "#4dd4ff";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Agent face (robot)
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.floor(cellSize*0.4)}px Vazirmatn`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🤖", ax, ay);

    // Labels
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("🤖 Agent", 15, 15);
    ctx.fillStyle = "#f5c76a";
    ctx.fillText("★ Goal", 15, 40);
    ctx.fillStyle = "#a78bfa";
    ctx.fillText("┄ Path", 15, 65);
  }

  stepBtn.onclick = step;
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = () => { reset(); };
})();

/* ============================================================
   SIM 2 — GRID WORLD RANDOM WALK
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const stepBtn = document.getElementById("sim2_step");
  const autoBtn = document.getElementById("sim2_auto");
  const resetBtn = document.getElementById("sim2_reset");
  const infoEl = document.getElementById("sim2_info");

  const GRID = 8;
  let agentPos = { x: 0, y: 0 };
  let goalPos = { x: 7, y: 7 };
  let obstacles = [];
  let steps = 0;
  let totalReward = 0;
  let found = false;
  let autoTimer = null;
  let visitedCounts = {};

  function generateObstacles(){
    obstacles = [];
    for(let i=0; i<10; i++){
      const ox = Math.floor(Math.random() * GRID);
      const oy = Math.floor(Math.random() * GRID);
      // Don't put obstacle on start, goal, or existing obstacle
      if((ox === 0 && oy === 0) || (ox === goalPos.x && oy === goalPos.y)) continue;
      if(obstacles.some(o => o.x === ox && o.y === oy)) continue;
      obstacles.push({ x: ox, y: oy });
    }
  }

  function reset(){
    agentPos = { x: 0, y: 0 };
    steps = 0;
    totalReward = 0;
    found = false;
    visitedCounts = {};
    generateObstacles();
    if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
    autoBtn.innerHTML = '<i data-lucide="play"></i> خودکار';
    lucide.createIcons();
    updateUI();
    draw();
    infoEl.innerHTML = "<b>راهنما:</b> «خودکار» را بزنید تا Agent تصادفی حرکت کند.";
  }

  function step(){
    if(found) return;

    const actions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 }
    ];
    const a = actions[Math.floor(Math.random() * 4)];

    const newX = Math.max(0, Math.min(GRID-1, agentPos.x + a.dx));
    const newY = Math.max(0, Math.min(GRID-1, agentPos.y + a.dy));

    // Check obstacle
    const isObstacle = obstacles.some(o => o.x === newX && o.y === newY);

    let reward = -0.1;
    if(!isObstacle){
      agentPos.x = newX;
      agentPos.y = newY;
      const key = `${newX},${newY}`;
      visitedCounts[key] = (visitedCounts[key] || 0) + 1;
    } else {
      reward = -1; // penalty for hitting obstacle
    }

    // Check goal
    if(agentPos.x === goalPos.x && agentPos.y === goalPos.y){
      reward = 10;
      found = true;
      totalReward += reward;
      steps++;
      if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
      autoBtn.innerHTML = '<i data-lucide="play"></i> خودکار';
      lucide.createIcons();
      infoEl.innerHTML = `<b>🎉 رسیدیم!</b> در ${steps} گام. پاداش تجمعی: ${totalReward.toFixed(1)}.`;
      updateUI();
      draw();
      return;
    }

    totalReward += reward;
    steps++;

    updateUI();
    draw();
  }

  function updateUI(){
    document.getElementById("sim2_pos").textContent = `(${agentPos.x},${agentPos.y})`;
    document.getElementById("sim2_steps").textContent = steps;
    document.getElementById("sim2_reward").textContent = totalReward.toFixed(1);
    const statusEl = document.getElementById("sim2_status");
    if(found){
      statusEl.textContent = "✓ رسید!";
      statusEl.style.color = "#5ee8a8";
    } else {
      statusEl.textContent = "در جست‌وجو";
      statusEl.style.color = "#f5c76a";
    }
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const cellSize = Math.min((w - 60) / GRID, (h - 60) / GRID, 50);
    const totalW = cellSize * GRID;
    const totalH = cellSize * GRID;
    const startX = (w - totalW) / 2;
    const startY = (h - totalH) / 2;

    // Draw cells
    for(let y=0; y<GRID; y++){
      for(let x=0; x<GRID; x++){
        const cx = startX + x * cellSize;
        const cy = startY + y * cellSize;

        // Visited cells get slight color
        const key = `${x},${y}`;
        const visits = visitedCounts[key] || 0;

        if(visits > 0){
          const alpha = Math.min(0.4, visits * 0.1);
          ctx.fillStyle = `rgba(167,139,250,${alpha})`;
        } else {
          ctx.fillStyle = "rgba(77,212,255,0.05)";
        }
        ctx.fillRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);

        // Border
        ctx.strokeStyle = "rgba(120,160,220,0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);
      }
    }

    // Draw obstacles
    obstacles.forEach(o => {
      const cx = startX + o.x * cellSize;
      const cy = startY + o.y * cellSize;
      ctx.fillStyle = "rgba(255,126,147,0.4)";
      ctx.fillRect(cx + 3, cy + 3, cellSize - 6, cellSize - 6);
      ctx.strokeStyle = "#ff7e93";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx + 3, cy + 3, cellSize - 6, cellSize - 6);

      ctx.fillStyle = "#ff7e93";
      ctx.font = `bold ${Math.floor(cellSize*0.4)}px Vazirmatn`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✕", cx + cellSize/2, cy + cellSize/2);
    });

    // Draw goal
    const gx = startX + goalPos.x * cellSize + cellSize/2;
    const gy = startY + goalPos.y * cellSize + cellSize/2;
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

    // Draw agent
    const ax = startX + agentPos.x * cellSize + cellSize/2;
    const ay = startY + agentPos.y * cellSize + cellSize/2;
    ctx.beginPath();
    ctx.arc(ax, ay, cellSize * 0.35, 0, Math.PI*2);
    ctx.fillStyle = found ? "#5ee8a8" : "#4dd4ff";
    ctx.shadowColor = found ? "#5ee8a8" : "#4dd4ff";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.floor(cellSize*0.45)}px Vazirmatn`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🤖", ax, ay);
  }

  function autoStep(){
    if(found){
      if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
      return;
    }
    step();
  }

  stepBtn.onclick = () => { step(); playClick(); };
  autoBtn.onclick = () => {
    if(autoTimer){
      clearInterval(autoTimer);
      autoTimer = null;
      autoBtn.innerHTML = '<i data-lucide="play"></i> خودکار';
      lucide.createIcons();
    } else {
      autoTimer = setInterval(autoStep, 200);
      autoBtn.innerHTML = '<i data-lucide="pause"></i> توقف';
      lucide.createIcons();
    }
    playClick();
  };
  resetBtn.onclick = () => { reset(); playClick(); };
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = () => { reset(); };
})();

/* ============================================================
   SIM 3 — EPSILON-GREEDY
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const eps_s = document.getElementById("sim3_eps");
  const stepBtn = document.getElementById("sim3_step");
  const autoBtn = document.getElementById("sim3_auto");
  const resetBtn = document.getElementById("sim3_reset");
  const infoEl = document.getElementById("sim3_info");

  // 5 arms with different true rewards
  const arms = [
    { id: 0, name: "A", trueMean: 0.3 },
    { id: 1, name: "B", trueMean: 0.5 },
    { id: 2, name: "C", trueMean: 0.8 },  // best
    { id: 3, name: "D", trueMean: 0.4 },
    { id: 4, name: "E", trueMean: 0.2 }
  ];

  let Q = [0, 0, 0, 0, 0];
  let N = [0, 0, 0, 0, 0];
  let exploration = 0;
  let exploitation = 0;
  let totalReward = 0;
  let steps = 0;
  let autoTimer = null;
  let history = [];

  function reset(){
    Q = [0, 0, 0, 0, 0];
    N = [0, 0, 0, 0, 0];
    exploration = 0;
    exploitation = 0;
    totalReward = 0;
    steps = 0;
    history = [];
    if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
    autoBtn.innerHTML = '<i data-lucide="play"></i> خودکار';
    lucide.createIcons();
    updateUI();
    draw();
    infoEl.innerHTML = "<b>راهنما:</b> ε را تغییر دهید و «گام» یا «خودکار» را بزنید.";
  }

  function step(){
    const eps = +eps_s.value;
    let chosenArm;
    let isExploration = false;

    // ε-greedy
    if(Math.random() < eps){
      chosenArm = Math.floor(Math.random() * 5);
      isExploration = true;
      exploration++;
    } else {
      chosenArm = Q.indexOf(Math.max(...Q));
      exploitation++;
    }

    // Sample reward
    const reward = Math.random() < arms[chosenArm].trueMean ? 1 : 0;
    totalReward += reward;
    N[chosenArm]++;
    steps++;

    // Update Q (sample average)
    Q[chosenArm] += (reward - Q[chosenArm]) / N[chosenArm];

    history.push(chosenArm);
    if(history.length > 100) history.shift();

    updateUI();
    draw();
    playClick();
  }

  function updateUI(){
    document.getElementById("sim3_eps_val").textContent = (+eps_s.value).toFixed(2);
    document.getElementById("sim3_exp").textContent = exploration;
    document.getElementById("sim3_expl").textContent = exploitation;
    document.getElementById("sim3_total").textContent = totalReward;
    document.getElementById("sim3_step_n").textContent = steps;

    // Recommendation
    if(steps > 0){
      const eps = +eps_s.value;
      if(eps < 0.05){
        infoEl.innerHTML = `<b>ε = ${eps}:</b> تقریباً همیشه Exploitation. خطر: در دام محلی می‌افتیم.`;
      } else if(eps > 0.5){
        infoEl.innerHTML = `<b>ε = ${eps}:</b> تقریباً همیشه Exploration. یادگیری کم است.`;
      } else {
        infoEl.innerHTML = `<b>ε = ${eps}:</b> تعادل خوب. در ${steps} گام، پاداش ${totalReward} (${(totalReward/steps*100).toFixed(0)}% برد).`;
      }
    }
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 && h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const padding = 60;
    const plotW = w - 2 * padding;
    const plotH = h - 2 * padding - 40;
    const barW = plotW / 5;
    const maxReward = 1.0;

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Q-Value هر Arm", w/2, 15);

    // Bars
    arms.forEach((arm, i) => {
      const x = padding + i * barW + barW * 0.1;
      const bw = barW * 0.8;

      // Q-value bar
      const qVal = Math.max(0, Q[i]);
      const barH = (qVal / maxReward) * plotH;
      const y = padding + plotH - barH;

      const grad = ctx.createLinearGradient(0, y, 0, padding + plotH);
      grad.addColorStop(0, "#f5c76a");
      grad.addColorStop(1, "rgba(245,199,106,0.3)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, bw, barH);

      // Border
      ctx.strokeStyle = "#f5c76a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, bw, barH);

      // True mean line (dashed)
      const trueY = padding + plotH - (arm.trueMean / maxReward) * plotH;
      ctx.strokeStyle = "rgba(77,212,255,0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x - 5, trueY);
      ctx.lineTo(x + bw + 5, trueY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(arm.name, x + bw/2, padding + plotH + 15);

      // Q value
      ctx.fillStyle = "#f5c76a";
      ctx.font = "bold 12px Vazirmatn";
      ctx.fillText(Q[i].toFixed(2), x + bw/2, padding + plotH + 40);

      // N (pulls)
      ctx.fillStyle = "#a8bcd4";
      ctx.font = "11px Vazirmatn";
      ctx.fillText(`n=${N[i]}`, x + bw/2, padding + plotH + 60);
    });

    // Legend
    ctx.fillStyle = "#f5c76a";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("● Q-Estimate", 15, h - 15);
    ctx.fillStyle = "#4dd4ff";
    ctx.fillText("┄ True Mean", 150, h - 15);
  }

  stepBtn.onclick = step;
  autoBtn.onclick = () => {
    if(autoTimer){
      clearInterval(autoTimer);
      autoTimer = null;
      autoBtn.innerHTML = '<i data-lucide="play"></i> خودکار';
      lucide.createIcons();
    } else {
      autoTimer = setInterval(step, 100);
      autoBtn.innerHTML = '<i data-lucide="pause"></i> توقف';
      lucide.createIcons();
    }
    playClick();
  };
  resetBtn.onclick = reset;
  eps_s.addEventListener("input", () => {
    document.getElementById("sim3_eps_val").textContent = (+eps_s.value).toFixed(2);
    updateUI();
  });
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim3 = () => { reset(); };
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