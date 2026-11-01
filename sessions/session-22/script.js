/* ============================================================
   جلسه ۲۲ — Digital Twin و Sensor Fusion
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: DT Architecture، Sensor Fusion، Kalman Filter
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
   SIM 1 — DIGITAL TWIN ARCHITECTURE
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const infoEl = document.getElementById("sim1_info");
  let selectedLayer = null;
  let hoveredLayer = null;

  const layers = [
    {
      id: "physical",
      name: "Physical System",
      nameFa: "سیستم فیزیکی",
      icon: "🏭",
      color: "#4dd4ff",
      role: "سیستم واقعی با سنسورها",
      x: 0.5, y: 0.88,
      w: 150, h: 50
    },
    {
      id: "data",
      name: "Data Acquisition",
      nameFa: "داده‌برداری",
      icon: "📡",
      color: "#a78bfa",
      role: "جمع‌آوری داده از سنسورها",
      x: 0.5, y: 0.7,
      w: 150, h: 50
    },
    {
      id: "model",
      name: "Digital Model",
      nameFa: "مدل دیجیتال",
      icon: "🧠",
      color: "#5ee8a8",
      role: "مدل ریاضی/فیزیکی/ML",
      x: 0.5, y: 0.52,
      w: 150, h: 50
    },
    {
      id: "simulation",
      name: "Simulation",
      nameFa: "شبیه‌سازی",
      icon: "⚙️",
      color: "#f5c76a",
      role: "پیش‌بینی و تحلیل",
      x: 0.5, y: 0.34,
      w: 150, h: 50
    },
    {
      id: "decision",
      name: "Decision",
      nameFa: "تصمیم‌گیری",
      icon: "🎯",
      color: "#f472b6",
      role: "کنترل و بازخورد",
      x: 0.5, y: 0.16,
      w: 150, h: 50
    }
  ];

  function getPositions(w, h){
    const positions = {};
    layers.forEach(l => {
      positions[l.id] = {
        x: l.x * w,
        y: l.y * h,
        w: l.w,
        h: l.h
      };
    });
    return positions;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const positions = getPositions(w, h);

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("معماری ۵ لایه Digital Twin", w/2, 15);

    // Arrows between layers (bidirectional)
    for(let i=0; i<layers.length - 1; i++){
      const c1 = positions[layers[i].id];
      const c2 = positions[layers[i+1].id];

      // Down arrow (from physical to digital)
      ctx.strokeStyle = "rgba(77,212,255,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c1.x - 15, c1.y - c1.h/2);
      ctx.lineTo(c2.x - 15, c2.y + c2.h/2);
      ctx.stroke();

      // Arrowhead down
      ctx.beginPath();
      ctx.moveTo(c2.x - 20, c2.y + c2.h/2 + 8);
      ctx.lineTo(c2.x - 15, c2.y + c2.h/2);
      ctx.lineTo(c2.x - 10, c2.y + c2.h/2 + 8);
      ctx.stroke();

      // Up arrow (from digital to physical - control)
      ctx.strokeStyle = "rgba(245,199,106,0.5)";
      ctx.beginPath();
      ctx.moveTo(c1.x + 15, c1.y - c1.h/2);
      ctx.lineTo(c2.x + 15, c2.y + c2.h/2);
      ctx.stroke();

      // Arrowhead up
      ctx.beginPath();
      ctx.moveTo(c2.x + 10, c2.y + c2.h/2 + 8);
      ctx.lineTo(c2.x + 15, c2.y + c2.h/2);
      ctx.lineTo(c2.x + 20, c2.y + c2.h/2 + 8);
      ctx.stroke();
    }

    // Draw layers
    layers.forEach(layer => {
      const pos = positions[layer.id];
      const isHovered = hoveredLayer === layer.id;
      const isSelected = selectedLayer === layer.id;
      const highlight = isHovered || isSelected;

      // Box
      ctx.fillStyle = layer.color + (highlight ? "55" : "22");
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(pos.x - pos.w/2, pos.y - pos.h/2, pos.w, pos.h, 8) : ctx.rect(pos.x - pos.w/2, pos.y - pos.h/2, pos.w, pos.h);
      ctx.fill();

      ctx.strokeStyle = layer.color;
      ctx.lineWidth = highlight ? 3 : 2;
      if(highlight){
        ctx.shadowColor = layer.color;
        ctx.shadowBlur = 15;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Icon
      ctx.font = "20px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = layer.color;
      ctx.fillText(layer.icon, pos.x - pos.w/2 + 25, pos.y);

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Vazirmatn";
      ctx.fillText(layer.nameFa, pos.x + 10, pos.y);
    });

    // Update UI
    if(selectedLayer || hoveredLayer){
      const id = selectedLayer || hoveredLayer;
      const layer = layers.find(l => l.id === id);
      document.getElementById("sim1_layer").textContent = layer.nameFa;
      document.getElementById("sim1_role").textContent = layer.role;
      infoEl.innerHTML = `<b>${layer.nameFa}:</b> ${layer.role}`;
    } else {
      document.getElementById("sim1_layer").textContent = "—";
      document.getElementById("sim1_role").textContent = "—";
      infoEl.innerHTML = "<b>راهنما:</b> روی هر لایه کلیک کنید.";
    }
  }

  function getPos(e){
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX || e.touches[0].clientX) - rect.left,
      y: (e.clientY || e.touches[0].clientY) - rect.top
    };
  }

  function findLayer(mx, my){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const positions = getPositions(w, h);
    for(const l of layers){
      const pos = positions[l.id];
      if(mx >= pos.x - pos.w/2 && mx <= pos.x + pos.w/2 &&
         my >= pos.y - pos.h/2 && my <= pos.y + pos.h/2){
        return l.id;
      }
    }
    return null;
  }

  canvas.addEventListener("mousemove", (e) => {
    const pos = getPos(e);
    const id = findLayer(pos.x, pos.y);
    if(id !== hoveredLayer){
      hoveredLayer = id;
      draw();
    }
    canvas.style.cursor = id ? "pointer" : "default";
  });

  canvas.addEventListener("mouseleave", () => {
    hoveredLayer = null;
    draw();
  });

  canvas.addEventListener("click", (e) => {
    const pos = getPos(e);
    const id = findLayer(pos.x, pos.y);
    if(id){
      selectedLayer = id;
      draw();
      playClick();
    }
  });

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const pos = getPos(e);
    const id = findLayer(pos.x, pos.y);
    if(id){
      selectedLayer = id;
      draw();
      playClick();
    }
  }, { passive: false });

  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = () => { selectedLayer = null; draw(); };
})();

/* ============================================================
   SIM 2 — SENSOR FUSION
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const w1_s = document.getElementById("sim2_w1");
  const w2_s = document.getElementById("sim2_w2");
  const w3_s = document.getElementById("sim2_w3");
  const infoEl = document.getElementById("sim2_info");

  // Simulated sensor readings (constant true value with noise offsets)
  const TRUE_VALUE = 10.0;
  const sensors = {
    IMU: { value: 10.3, noise: 0.5, color: "#4dd4ff" },
    GPS: { value: 11.2, noise: 1.5, color: "#a78bfa" },
    Camera: { value: 9.5, noise: 2.0, color: "#5ee8a8" }
  };

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 && h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const w1 = +w1_s.value;
    const w2 = +w2_s.value;
    const w3 = +w3_s.value;

    document.getElementById("sim2_w1_val").textContent = w1.toFixed(1);
    document.getElementById("sim2_w2_val").textContent = w2.toFixed(1);
    document.getElementById("sim2_w3_val").textContent = w3.toFixed(1);

    // Weighted fusion
    const wSum = w1 + w2 + w3;
    const fused = wSum > 0 ? (w1*sensors.IMU.value + w2*sensors.GPS.value + w3*sensors.Camera.value) / wSum : 0;

    document.getElementById("sim2_imu").textContent = sensors.IMU.value.toFixed(1);
    document.getElementById("sim2_gps").textContent = sensors.GPS.value.toFixed(1);
    document.getElementById("sim2_cam").textContent = sensors.Camera.value.toFixed(1);
    document.getElementById("sim2_fused").textContent = fused.toFixed(2);

    const error = Math.abs(fused - TRUE_VALUE);
    infoEl.innerHTML = `<b>Fused = ${fused.toFixed(2)}</b> (خطا از ${TRUE_VALUE}: ${error.toFixed(2)}) — وزن‌ها را تنظیم کنید.`;

    // Layout
    const padding = 60;
    const plotW = w - 2*padding - 100;
    const plotH = h - 2*padding - 40;
    const baseY = padding + plotH;

    // Axis
    ctx.strokeStyle = "rgba(120,160,220,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, baseY);
    ctx.lineTo(padding + plotW, baseY);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, baseY);
    ctx.stroke();

    // Y scale
    const minVal = 8;
    const maxVal = 13;
    const yScale = (val) => baseY - ((val - minVal) / (maxVal - minVal)) * plotH;

    // Y grid + labels
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "11px Vazirmatn";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for(let v=8; v<=13; v+=1){
      const y = yScale(v);
      ctx.strokeStyle = "rgba(120,160,220,0.1)";
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + plotW, y);
      ctx.stroke();
      ctx.fillStyle = "#a8bcd4";
      ctx.fillText(v.toString(), padding - 5, y);
    }

    // True value line
    ctx.strokeStyle = "rgba(94,232,168,0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, yScale(TRUE_VALUE));
    ctx.lineTo(padding + plotW, yScale(TRUE_VALUE));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#5ee8a8";
    ctx.font = "bold 11px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(`True: ${TRUE_VALUE}`, padding + 5, yScale(TRUE_VALUE) - 5);

    // Sensor bars
    const bars = [
      { name: "IMU", value: sensors.IMU.value, weight: w1, color: sensors.IMU.color },
      { name: "GPS", value: sensors.GPS.value, weight: w2, color: sensors.GPS.color },
      { name: "Camera", value: sensors.Camera.value, weight: w3, color: sensors.Camera.color }
    ];

    const barW = plotW / 5;
    bars.forEach((bar, i) => {
      const x = padding + barW * (i + 1);
      const y = yScale(bar.value);

      // Bar from baseY to value
      ctx.fillStyle = bar.color + "44";
      ctx.fillRect(x - barW * 0.3, y, barW * 0.6, baseY - y);
      ctx.strokeStyle = bar.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - barW * 0.3, y, barW * 0.6, baseY - y);

      // Value
      ctx.fillStyle = bar.color;
      ctx.font = "bold 13px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(bar.value.toFixed(1), x, y - 5);

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Vazirmatn";
      ctx.textBaseline = "top";
      ctx.fillText(bar.name, x, baseY + 10);

      // Weight
      ctx.fillStyle = bar.color;
      ctx.font = "10px Vazirmatn";
      ctx.fillText(`w=${bar.weight.toFixed(1)}`, x, baseY + 30);
    });

    // Fused bar (tall)
    const fx = padding + barW * 4.5;
    const fy = yScale(fused);
    ctx.fillStyle = "rgba(245,199,106,0.3)";
    ctx.fillRect(fx - barW * 0.4, fy, barW * 0.8, baseY - fy);
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#f5c76a";
    ctx.shadowBlur = 10;
    ctx.strokeRect(fx - barW * 0.4, fy, barW * 0.8, baseY - fy);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#f5c76a";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(fused.toFixed(2), fx, fy - 8);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textBaseline = "top";
    ctx.fillText("Fused", fx, baseY + 10);
  }

  [w1_s, w2_s, w3_s].forEach(s => {
    s.addEventListener("input", draw);
  });
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = draw;
})();

/* ============================================================
   SIM 3 — KALMAN FILTER
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const R_s = document.getElementById("sim3_R");
  const Q_s = document.getElementById("sim3_Q");
  const infoEl = document.getElementById("sim3_info");

  // True signal: a slowly varying signal
  const N = 100;
  const trueSignal = [];
  const measurements = [];
  for(let i=0; i<N; i++){
    const trueVal = 10 + 2 * Math.sin(i * 0.1) + 0.5 * Math.sin(i * 0.3);
    trueSignal.push(trueVal);
    // Raw measurement with noise
    const noise = (Math.random() - 0.5) * 2 * (+R_s.value);
    measurements.push(trueVal + noise);
  }

  function kalmanFilter(measurements, Q, R){
    let x = measurements[0];
    let P = 1;
    const estimates = [];

    for(let i=0; i<measurements.length; i++){
      // Predict
      P = P + Q;

      // Update
      const K = P / (P + R);
      x = x + K * (measurements[i] - x);
      P = (1 - K) * P;

      estimates.push(x);
    }
    return estimates;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const Q = +Q_s.value;
    const R = +R_s.value;

    document.getElementById("sim3_R_val").textContent = R.toFixed(1);
    document.getElementById("sim3_Q_val").textContent = Q.toFixed(2);

    const estimates = kalmanFilter(measurements, Q, R);

    // Compute RMSE
    let rawSum = 0, kfSum = 0;
    for(let i=0; i<N; i++){
      rawSum += Math.pow(measurements[i] - trueSignal[i], 2);
      kfSum += Math.pow(estimates[i] - trueSignal[i], 2);
    }
    const rmseRaw = Math.sqrt(rawSum / N);
    const rmseKF = Math.sqrt(kfSum / N);
    const improvement = ((rmseRaw - rmseKF) / rmseRaw * 100);

    document.getElementById("sim3_rmse_raw").textContent = rmseRaw.toFixed(3);
    document.getElementById("sim3_rmse_kf").textContent = rmseKF.toFixed(3);
    document.getElementById("sim3_improve").textContent = improvement.toFixed(1) + "%";

    infoEl.innerHTML = `<b>Kalman:</b> RMSE از ${rmseRaw.toFixed(3)} به ${rmseKF.toFixed(3)} کاهش یافت — ${improvement.toFixed(1)}٪ بهبود.`;

    // Layout
    const padding = 50;
    const plotW = w - 2*padding;
    const plotH = h - 2*padding - 40;
    const baseY = padding + plotH;

    // Find min/max
    const allVals = [...trueSignal, ...measurements, ...estimates];
    const minV = Math.min(...allVals) - 1;
    const maxV = Math.max(...allVals) + 1;
    const range = maxV - minV;

    const xScale = (i) => padding + (i / (N-1)) * plotW;
    const yScale = (v) => baseY - ((v - minV) / range) * plotH;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i=0; i<=10; i++){
      const x = padding + plotW * i / 10;
      const y = padding + plotH * i / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding); ctx.lineTo(x, baseY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y); ctx.lineTo(padding + plotW, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(120,160,220,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, baseY); ctx.lineTo(padding + plotW, baseY);
    ctx.moveTo(padding, baseY); ctx.lineTo(padding, padding);
    ctx.stroke();

    // True signal (green)
    ctx.strokeStyle = "#5ee8a8";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    for(let i=0; i<N; i++){
      const px = xScale(i);
      const py = yScale(trueSignal[i]);
      if(i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Measurements (red dots)
    ctx.fillStyle = "rgba(255,126,147,0.5)";
    for(let i=0; i<N; i++){
      const px = xScale(i);
      const py = yScale(measurements[i]);
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI*2);
      ctx.fill();
    }

    // Kalman estimates (gold line)
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#f5c76a";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for(let i=0; i<N; i++){
      const px = xScale(i);
      const py = yScale(estimates[i]);
      if(i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Legend
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillStyle = "#5ee8a8";
    ctx.fillText("┄ True Signal", padding + 10, padding + 10);

    ctx.fillStyle = "rgba(255,126,147,0.7)";
    ctx.fillText("● Measurements", padding + 10, padding + 28);

    ctx.fillStyle = "#f5c76a";
    ctx.fillText("— Kalman Estimate", padding + 10, padding + 46);
  }

  R_s.addEventListener("input", () => {
    // Regenerate measurements with new noise level
    for(let i=0; i<N; i++){
      const noise = (Math.random() - 0.5) * 2 * (+R_s.value);
      measurements[i] = trueSignal[i] + noise;
    }
    draw();
  });
  Q_s.addEventListener("input", draw);
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