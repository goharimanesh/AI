/* ============================================================
   جلسه ۲۰ — مقدمه Scientific AI
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Three Paradigms، Neural Operator، Surrogate Speed
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
   SIM 1 — THREE PARADIGMS
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  let mode = "physics";

  const paradigms = {
    physics: {
      name: "Pure Physics",
      nameFa: "فیزیک خالص",
      color: "#4dd4ff",
      speed: "کند",
      accuracy: "بالا",
      data: "کم",
      speedScore: 2,
      accuracyScore: 9,
      dataScore: 2,
      description: "معادلات دقیق (Navier-Stokes, Newton) — تفسیرپذیر اما کند"
    },
    data: {
      name: "Pure Data (ML)",
      nameFa: "داده خالص",
      color: "#a78bfa",
      speed: "سریع",
      accuracy: "متوسط",
      data: "بسیار زیاد",
      speedScore: 9,
      accuracyScore: 6,
      dataScore: 9,
      description: "شبکه عصبی — سریع اما جعبه سیاه، نیاز به داده زیاد"
    },
    scientific: {
      name: "Scientific AI",
      nameFa: "AI علمی",
      color: "#f5c76a",
      speed: "سریع",
      accuracy: "بالا",
      data: "متوسط",
      speedScore: 8,
      accuracyScore: 9,
      dataScore: 5,
      description: "ترکیب فیزیک و داده — دقیق، سریع، تفسیرپذیر"
    }
  };

  const criteria = [
    { key: "speedScore", label: "سرعت", icon: "⚡" },
    { key: "accuracyScore", label: "دقت", icon: "🎯" },
    { key: "dataScore", label: "داده", icon: "📊" }
  ];

  // Button handlers
  document.querySelectorAll("#sim1_btns button").forEach(btn => {
    btn.onclick = () => {
      mode = btn.dataset.mode;
      document.querySelectorAll("#sim1_btns button").forEach(b => {
        b.classList.remove("btnPrimary");
        b.classList.add("btnSecondary");
      });
      btn.classList.remove("btnSecondary");
      btn.classList.add("btnPrimary");
      draw();
      playClick();
    };
  });

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const p = paradigms[mode];

    document.getElementById("sim1_mode").textContent = p.name;
    document.getElementById("sim1_speed").textContent = p.speed;
    document.getElementById("sim1_acc").textContent = p.accuracy;
    document.getElementById("sim1_data").textContent = p.data;

    // Title
    ctx.fillStyle = p.color;
    ctx.font = "bold 16px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(p.nameFa, w/2, 15);

    // Description
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "13px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(p.description, w/2, 45);

    // 3 bars for criteria
    const padding = 60;
    const plotW = w - 2*padding;
    const plotH = h - 160;
    const baseY = padding + plotH;
    const barW = plotW / 3 * 0.6;
    const gap = plotW / 3;

    criteria.forEach((c, i) => {
      const x = padding + i * gap + (gap - barW) / 2;
      const val = p[c.key] / 10;
      const barH = val * plotH;
      const y = baseY - barH;

      // Bar
      const grad = ctx.createLinearGradient(0, y, 0, baseY);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, p.color + "33");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      // Border
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barW, barH);

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(c.icon + " " + c.label, x + barW/2, baseY + 15);

      // Value
      ctx.fillStyle = p.color;
      ctx.font = "bold 16px Vazirmatn";
      ctx.textBaseline = "bottom";
      ctx.fillText(p[c.key], x + barW/2, y - 10);
    });

    // Axis
    ctx.strokeStyle = "rgba(120,160,220,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, baseY);
    ctx.lineTo(w - padding, baseY);
    ctx.stroke();
  }

  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = draw;
})();

/* ============================================================
   SIM 2 — NEURAL OPERATOR
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const freq_s = document.getElementById("sim2_freq");
  const amp_s = document.getElementById("sim2_amp");
  const infoEl = document.getElementById("sim2_info");

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const freq = +freq_s.value;
    const amp = +amp_s.value;

    document.getElementById("sim2_freq_val").textContent = freq.toFixed(1);
    document.getElementById("sim2_amp_val").textContent = amp.toFixed(1);
    document.getElementById("sim2_input").textContent = `${amp.toFixed(1)}·sin(${freq.toFixed(1)}x)`;

    // Compute output: derivative (simple)
    const outputStr = `${(amp*freq).toFixed(2)}·cos(${freq.toFixed(1)}x)`;
    document.getElementById("sim2_output").textContent = outputStr;

    infoEl.innerHTML = `<b>عملگر:</b> مشتق‌گیر. ورودی ${amp.toFixed(1)}·sin(${freq.toFixed(1)}x) → خروجی ${outputStr}`;

    // Layout: two plots
    const padding = 50;
    const plotW = w - 2*padding;
    const plotH = (h - 2*padding - 40) / 2;

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Neural Operator: Function → Function", w/2, 15);

    // === Top plot: input ===
    const topY = padding + plotH/2 + 20;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i=0; i<=10; i++){
      const x = padding + plotW * i / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding + 40);
      ctx.lineTo(x, padding + 40 + plotH);
      ctx.stroke();
    }

    // Axis
    ctx.strokeStyle = "rgba(120,160,220,0.3)";
    ctx.beginPath();
    ctx.moveTo(padding, topY);
    ctx.lineTo(padding + plotW, topY);
    ctx.stroke();

    // Input curve
    ctx.strokeStyle = "#4dd4ff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#4dd4ff";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    const N = 200;
    for(let i=0; i<=N; i++){
      const x = (i / N) * 2 * Math.PI;
      const y = amp * Math.sin(freq * x);
      const px = padding + (i / N) * plotW;
      const py = topY - y * (plotH / 2) * 0.4;
      if(i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("ورودی: f(x)", padding, padding + 20);

    // === Bottom plot: output ===
    const botY = padding + plotH + 40 + plotH/2 + 20;

    // Grid
    for(let i=0; i<=10; i++){
      const x = padding + plotW * i / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding + plotH + 80);
      ctx.lineTo(x, padding + 2*plotH + 40);
      ctx.stroke();
    }

    // Axis
    ctx.strokeStyle = "rgba(120,160,220,0.3)";
    ctx.beginPath();
    ctx.moveTo(padding, botY);
    ctx.lineTo(padding + plotW, botY);
    ctx.stroke();

    // Output curve
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#f5c76a";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for(let i=0; i<=N; i++){
      const x = (i / N) * 2 * Math.PI;
      const y = amp * freq * Math.cos(freq * x);
      const px = padding + (i / N) * plotW;
      const py = botY - y * (plotH / 2) * 0.15;
      if(i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = "#f5c76a";
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("خروجی: G[f](x)", padding, padding + plotH + 60);

    // Arrow between
    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold 20px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("↓", w/2, padding + plotH + 40);

    // Neural operator label
    ctx.fillStyle = "#a78bfa";
    ctx.font = "11px Vazirmatn";
    ctx.fillText("Neural Operator", w/2, padding + plotH + 65);
  }

  freq_s.addEventListener("input", draw);
  amp_s.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = draw;
})();

/* ============================================================
   SIM 3 — SURROGATE SPEED
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const runBtn = document.getElementById("sim3_run");
  const resetBtn = document.getElementById("sim3_reset");
  const infoEl = document.getElementById("sim3_info");

  let simTime = 0;
  let surTime = 0;
  let running = false;
  let timer = null;

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("سرعت: Simulator vs Surrogate", w/2, 15);

    // Layout
    const padding = 40;
    const centerY = h/2 + 20;
    const barMaxW = w - 2*padding - 200;
    const startX = padding + 200;

    // Simulator bar
    const simY = centerY - 60;
    const simProgress = Math.min(1, simTime / 5); // 5 seconds max

    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("🖥 Simulator", startX - 20, simY);

    // Background
    ctx.fillStyle = "rgba(120,140,160,0.1)";
    ctx.fillRect(startX, simY - 20, barMaxW, 40);
    ctx.strokeStyle = "rgba(120,160,220,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, simY - 20, barMaxW, 40);

    // Progress
    const simW = simProgress * barMaxW;
    ctx.fillStyle = "rgba(255,126,147,0.6)";
    ctx.fillRect(startX, simY - 20, simW, 40);
    ctx.strokeStyle = "#ff7e93";
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, simY - 20, simW, 40);

    // Time
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(simTime.toFixed(2) + "s", startX + simW/2, simY);

    // Surrogate bar
    const surY = centerY + 40;
    const surProgress = Math.min(1, surTime / 0.05); // 50ms max

    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("⚡ Surrogate", startX - 20, surY);

    // Background
    ctx.fillStyle = "rgba(120,140,160,0.1)";
    ctx.fillRect(startX, surY - 20, barMaxW, 40);
    ctx.strokeStyle = "rgba(120,160,220,0.4)";
    ctx.strokeRect(startX, surY - 20, barMaxW, 40);

    // Progress
    const surW = Math.max(surProgress * barMaxW, 5);
    ctx.fillStyle = "rgba(94,232,168,0.6)";
    ctx.fillRect(startX, surY - 20, surW, 40);
    ctx.strokeStyle = "#5ee8a8";
    ctx.strokeRect(startX, surY - 20, surW, 40);

    // Time
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText((surTime*1000).toFixed(0) + "ms", startX + surW/2, surY);

    // Speedup
    if(surTime > 0 && simTime > 0){
      const speedup = simTime / surTime;
      ctx.fillStyle = "#f5c76a";
      ctx.font = "bold 20px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`${speedup.toFixed(0)}× سریع‌تر`, w/2, h - 40);

      document.getElementById("sim3_speedup").textContent = speedup.toFixed(0) + "×";
    }

    // Update UI
    document.getElementById("sim3_sim_time").textContent = simTime.toFixed(2) + "s";
    document.getElementById("sim3_sur_time").textContent = (surTime*1000).toFixed(0) + "ms";
  }

  function start(){
    if(running) return;
    running = true;
    simTime = 0;
    surTime = 0;
    infoEl.innerHTML = "<b>در حال شبیه‌سازی...</b>";

    // Surrogate finishes almost immediately
    setTimeout(() => {
      surTime = 0.003; // 3 ms
      draw();
    }, 50);

    // Simulator takes longer
    timer = setInterval(() => {
      simTime += 0.1;
      draw();

      if(simTime >= 5){
        clearInterval(timer);
        running = false;
        infoEl.innerHTML = `<b>✓ کامل شد!</b> Simulator: ${simTime.toFixed(2)}s — Surrogate: ${(surTime*1000).toFixed(0)}ms. Speedup: ${(simTime/surTime).toFixed(0)}×`;
      }
    }, 100);

    playClick();
  }

  function reset(){
    if(timer) clearInterval(timer);
    running = false;
    simTime = 0;
    surTime = 0;
    document.getElementById("sim3_sim_time").textContent = "0.0s";
    document.getElementById("sim3_sur_time").textContent = "0ms";
    document.getElementById("sim3_speedup").textContent = "—";
    infoEl.innerHTML = "<b>راهنما:</b> «اجرا» را بزنید.";
    draw();
    playClick();
  }

  runBtn.onclick = start;
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim3 = () => { simTime = 0; surTime = 0; draw(); };
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