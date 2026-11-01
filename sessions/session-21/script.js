/* ============================================================
   جلسه ۲۱ — PINN: شبکه‌های عصبی فیزیک‌محور
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Loss Anatomy، Collocation، Heat Equation
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
   SIM 1 — PINN LOSS ANATOMY (Chart.js + Live Animation)
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;

  const ld_s = document.getElementById("sim1_ld");
  const lp_s = document.getElementById("sim1_lp");
  const lb_s = document.getElementById("sim1_lb");
  const infoEl = document.getElementById("sim1_info");

  // Create Chart.js chart
  const chartCanvas = document.createElement("canvas");
  chartCanvas.style.width = "100%";
  chartCanvas.style.height = "100%";
  chartCanvas.style.display = "block";
  canvas.parentElement.replaceChild(chartCanvas, canvas);

  const ctx = chartCanvas.getContext("2d");

  // Training loss history
  let lossHistory = {
    L_data: [],
    L_PDE: [],
    L_BC: [],
    total: []
  };

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "L_data",
          data: [],
          borderColor: "#4dd4ff",
          backgroundColor: "rgba(77,212,255,0.1)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: "L_PDE",
          data: [],
          borderColor: "#a78bfa",
          backgroundColor: "rgba(167,139,250,0.1)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: "L_BC",
          data: [],
          borderColor: "#5ee8a8",
          backgroundColor: "rgba(94,232,168,0.1)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: "Total",
          data: [],
          borderColor: "#f5c76a",
          backgroundColor: "rgba(245,199,106,0.1)",
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: {
          labels: {
            color: "#eaf2ff",
            font: { family: "Vazirmatn", size: 12 }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#a8bcd4", font: { family: "Vazirmatn", size: 10 } },
          grid: { color: "rgba(120,160,220,0.1)" }
        },
        y: {
          type: "logarithmic",
          ticks: { color: "#a8bcd4", font: { family: "Vazirmatn", size: 10 } },
          grid: { color: "rgba(120,160,220,0.1)" }
        }
      }
    }
  });

  let epoch = 0;
  let training = true;
  let animId = null;

  function simulateTraining(){
    if(!training || epoch >= 200) return;
    epoch++;

    const lambda = +ld_s.value;
    const mu = +lp_s.value;
    const nu = +lb_s.value;

    // Simulated loss decay (with imbalance effects)
    const baseData = 1.0;
    const basePDE = 10.0;
    const baseBC = 2.0;

    const decay = Math.exp(-epoch / 50);
    const noise = 0.9 + Math.random() * 0.2;

    const L_data = baseData * decay * noise / Math.sqrt(lambda + 0.1);
    const L_PDE = basePDE * decay * noise / Math.sqrt(mu + 0.1);
    const L_BC = baseBC * decay * noise / Math.sqrt(nu + 0.1);
    const total = lambda * L_data + mu * L_PDE + nu * L_BC;

    chart.data.labels.push(epoch);
    chart.data.datasets[0].data.push(L_data);
    chart.data.datasets[1].data.push(L_PDE);
    chart.data.datasets[2].data.push(L_BC);
    chart.data.datasets[3].data.push(total);

    if(chart.data.labels.length > 200){
      chart.data.labels.shift();
      chart.data.datasets.forEach(d => d.data.shift());
    }

    chart.update("none");

    // Update UI
    document.getElementById("sim1_ld_val").textContent = lambda.toFixed(1);
    document.getElementById("sim1_lp_val").textContent = mu.toFixed(1);
    document.getElementById("sim1_lb_val").textContent = nu.toFixed(1);
    document.getElementById("sim1_total").textContent = total.toFixed(3);

    const ratio = Math.max(lambda, mu, nu) / Math.min(lambda, mu, nu);
    const balanceEl = document.getElementById("sim1_balance");
    const statusEl = document.getElementById("sim1_status");

    if(ratio < 2){
      balanceEl.textContent = "متوازن";
      balanceEl.style.color = "#5ee8a8";
      statusEl.textContent = "✓ پایدار";
      statusEl.style.color = "#5ee8a8";
    } else if(ratio < 5){
      balanceEl.textContent = "کمی نامتوازن";
      balanceEl.style.color = "#f5c76a";
      statusEl.textContent = "متوسط";
      statusEl.style.color = "#f5c76a";
    } else {
      balanceEl.textContent = "ناپایدار";
      balanceEl.style.color = "#ff7e93";
      statusEl.textContent = "⚠ ناپایدار";
      statusEl.style.color = "#ff7e93";
    }

    if(ratio > 5){
      infoEl.innerHTML = `<b>⚠ هشدار:</b> وزن‌ها نامتوازن هستند. آموزش ناپایدار می‌شود — یکی از بزرگ‌ترین چالش‌های PINN است .`;
    } else {
      infoEl.innerHTML = `<b>مرحله ${epoch}:</b> Loss در حال کاهش. تعادل: ${ratio.toFixed(2)}. برای شروع مجدد صفحه را رفرش کنید.`;
    }

    animId = setTimeout(simulateTraining, 100);
  }

  simulateTraining();

  window.addEventListener("resize", () => {
    chart.resize();
  });

  simsInit.sim1 = () => {
    chart.resize();
  };
})();

/* ============================================================
   SIM 2 — COLLOCATION SAMPLING
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const n_s = document.getElementById("sim2_n");
  const infoEl = document.getElementById("sim2_info");

  let points = [];

  function generatePoints(n){
    points = [];
    for(let i=0; i<n; i++){
      points.push({
        x: Math.random(),
        y: Math.random(),
        type: "collocation"
      });
    }
    // Add boundary points
    for(let i=0; i<20; i++){
      points.push({ x: 0, y: i/20, type: "boundary" });
      points.push({ x: 1, y: i/20, type: "boundary" });
      points.push({ x: i/20, y: 0, type: "boundary" });
      points.push({ x: i/20, y: 1, type: "boundary" });
    }
    // Add initial condition points (t=0)
    for(let i=0; i<20; i++){
      points.push({ x: i/20, y: 0, type: "initial" });
    }
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const n = +n_s.value;
    generatePoints(n);

    document.getElementById("sim2_n_val").textContent = n;
    document.getElementById("sim2_count").textContent = points.length;

    // Coverage estimate
    const coverage = Math.min(100, (n / 500) * 100);
    document.getElementById("sim2_cover").textContent = coverage.toFixed(0) + "%";

    const statusEl = document.getElementById("sim2_status");
    if(n < 30){
      statusEl.textContent = "کم — آموزش ضعیف";
      statusEl.style.color = "#ff7e93";
    } else if(n < 100){
      statusEl.textContent = "متوسط";
      statusEl.style.color = "#f5c76a";
    } else {
      statusEl.textContent = "✓ کافی";
      statusEl.style.color = "#5ee8a8";
    }

    infoEl.innerHTML = `<b>${n} نقطه:</b> Collocation (آبی) + ${points.filter(p => p.type === "boundary").length} مرز (طلایی) + ${points.filter(p => p.type === "initial").length} اولیه (بنفش)`;

    // Plot area
    const padding = 40;
    const plotW = w - 2*padding;
    const plotH = h - 2*padding - 40;
    const startX = padding;
    const startY = padding;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i=0; i<=10; i++){
      const x = startX + plotW * i / 10;
      const y = startY + plotH * i / 10;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + plotH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + plotW, y);
      ctx.stroke();
    }

    // Domain boundary
    ctx.strokeStyle = "rgba(245,199,106,0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, plotW, plotH);

    // Draw points
    points.forEach(p => {
      const px = startX + p.x * plotW;
      const py = startY + plotH - p.y * plotH;

      if(p.type === "collocation"){
        ctx.fillStyle = "rgba(77,212,255,0.7)";
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI*2);
        ctx.fill();
      } else if(p.type === "boundary"){
        ctx.fillStyle = "#f5c76a";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = "#a78bfa";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Axis labels
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("x", startX + plotW/2, startY + plotH + 15);
    ctx.save();
    ctx.translate(startX - 20, startY + plotH/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText("t", 0, 0);
    ctx.restore();

    // Legend
    ctx.font = "11px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#4dd4ff";
    ctx.fillText("● Collocation", startX + plotW + 10, startY + 10);
    ctx.fillStyle = "#f5c76a";
    ctx.fillText("● Boundary", startX + plotW + 10, startY + 30);
    ctx.fillStyle = "#a78bfa";
    ctx.fillText("● Initial", startX + plotW + 10, startY + 50);
  }

  n_s.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = draw;
})();

/* ============================================================
   SIM 3 — HEAT EQUATION SOLUTION
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const alpha_s = document.getElementById("sim3_alpha");
  const t_s = document.getElementById("sim3_t");
  const infoEl = document.getElementById("sim3_info");

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const alpha = +alpha_s.value;
    const t = +t_s.value;

    document.getElementById("sim3_alpha_val").textContent = alpha.toFixed(3);
    document.getElementById("sim3_t_val").textContent = t.toFixed(2);
    document.getElementById("sim3_alpha_disp").textContent = alpha.toFixed(3);
    document.getElementById("sim3_t_disp").textContent = t.toFixed(2);

    // Exact solution: u(x,t) = exp(-alpha * pi^2 * t) * sin(pi * x)
    const decay = Math.exp(-alpha * Math.PI * Math.PI * t);
    const maxU = decay;

    document.getElementById("sim3_max").textContent = maxU.toFixed(4);

    infoEl.innerHTML = `<b>حل تحلیلی:</b> u(x,t) = e^(-απ²t) · sin(πx) = ${decay.toFixed(4)} · sin(πx)`;

    // Plot area
    const padding = 50;
    const plotW = w - 2*padding;
    const plotH = h - 2*padding - 40;
    const baseY = padding + plotH;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i=0; i<=10; i++){
      const x = padding + plotW * i / 10;
      const y = padding + plotH * i / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, baseY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + plotW, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(120,160,220,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, baseY); ctx.lineTo(padding + plotW, baseY);
    ctx.moveTo(padding, baseY); ctx.lineTo(padding, padding);
    ctx.stroke();

    // Y-axis ticks
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "11px Vazirmatn";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for(let v=0; v<=1; v+=0.25){
      const y = baseY - v * plotH * 0.85;
      ctx.fillText(v.toFixed(2), padding - 5, y);
    }

    // X-axis ticks
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for(let x=0; x<=1; x+=0.25){
      const px = padding + x * plotW;
      ctx.fillText(x.toFixed(2), px, baseY + 5);
    }

    // Draw initial condition (dashed, faint)
    ctx.strokeStyle = "rgba(167,139,250,0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for(let i=0; i<=100; i++){
      const x = i / 100;
      const u = Math.sin(Math.PI * x);
      const px = padding + x * plotW;
      const py = baseY - u * plotH * 0.85;
      if(i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw current solution (solid, glowing)
    const grad = ctx.createLinearGradient(padding, 0, padding + plotW, 0);
    grad.addColorStop(0, "#4dd4ff");
    grad.addColorStop(0.5, "#f5c76a");
    grad.addColorStop(1, "#4dd4ff");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.shadowColor = "#f5c76a";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    for(let i=0; i<=100; i++){
      const x = i / 100;
      const u = decay * Math.sin(Math.PI * x);
      const px = padding + x * plotW;
      const py = baseY - u * plotH * 0.85;
      if(i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill under curve
    ctx.lineTo(padding + plotW, baseY);
    ctx.lineTo(padding, baseY);
    ctx.closePath();
    ctx.fillStyle = "rgba(245,199,106,0.1)";
    ctx.fill();

    // Legend
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("— u(x,t) — حل فعلی", padding + 10, padding + 10);

    ctx.fillStyle = "rgba(167,139,250,0.6)";
    ctx.fillText("┄ u(x,0) — شرط اولیه", padding + 10, padding + 30);

    // Info box
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(padding + plotW - 180, padding + 10, 170, 70);
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 1;
    ctx.strokeRect(padding + plotW - 180, padding + 10, 170, 70);

    ctx.fillStyle = "#f5c76a";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("معادله گرما 1D:", padding + plotW - 15, padding + 18);
    ctx.fillStyle = "#fff";
    ctx.font = "11px Vazirmatn";
    ctx.fillText("u_t = α · u_xx", padding + plotW - 15, padding + 38);
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "10px Vazirmatn";
    ctx.fillText(`α = ${alpha.toFixed(3)}`, padding + plotW - 15, padding + 58);

    // Axis labels
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("x", padding + plotW/2, baseY + 25);
    ctx.save();
    ctx.translate(padding - 30, padding + plotH/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText("u(x,t)", 0, 0);
    ctx.restore();
  }

  alpha_s.addEventListener("input", draw);
  t_s.addEventListener("input", draw);
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