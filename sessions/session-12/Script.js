/* ============================================================
   جلسه ۱۲ — Transfer Learning
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Freeze/Unfreeze، Learning Curves، Dataset Size
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
   SIM 1 — FREEZE / UNFREEZE LAYERS
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const infoEl = document.getElementById("sim1_info");
  let mode = "head"; // head, last2, last4, all

  // 8 layers total, each with approximate parameter count
  const LAYERS = [
    { name: "Conv 1", params: 0.05 },
    { name: "Conv 2", params: 0.15 },
    { name: "Conv 3", params: 0.6 },
    { name: "Conv 4", params: 2.4 },
    { name: "Conv 5", params: 6.0 },
    { name: "FC 1", params: 8.0 },
    { name: "FC 2", params: 6.0 },
    { name: "Head", params: 1.8 }
  ];

  function getFrozenCount(){
    switch(mode){
      case "head": return LAYERS.length - 1;
      case "last2": return LAYERS.length - 2;
      case "last4": return LAYERS.length - 4;
      case "all": return 0;
      default: return LAYERS.length - 1;
    }
  }

  function getTrainableParams(){
    const frozen = getFrozenCount();
    let trainable = 0;
    for(let i = frozen; i < LAYERS.length; i++){
      trainable += LAYERS[i].params;
    }
    return trainable;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const frozen = getFrozenCount();
    const trainableCount = LAYERS.length - frozen;
    const trainableParams = getTrainableParams();

    // Update UI
    document.getElementById("sim1_frozen").textContent = frozen + " / " + LAYERS.length;
    document.getElementById("sim1_trainable").textContent = trainableCount;
    document.getElementById("sim1_params").textContent = trainableParams.toFixed(1) + "M";

    // Layout
    const padding = 60;
    const layerW = 70;
    const totalW = LAYERS.length * layerW + (LAYERS.length - 1) * 15;
    const startX = (w - totalW) / 2;
    const y = h / 2 - 60;

    // Draw connection lines
    for(let i=0; i<LAYERS.length-1; i++){
      const x1 = startX + (i + 1) * layerW + i * 15;
      const x2 = startX + (i + 1) * (layerW + 15);
      ctx.strokeStyle = "rgba(120,160,220,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y + 40);
      ctx.lineTo(x2, y + 40);
      ctx.stroke();
    }

    // Draw layers
    LAYERS.forEach((layer, i) => {
      const x = startX + i * (layerW + 15);
      const isFrozen = i < frozen;
      const color = isFrozen ? "#4dd4ff" : "#f5c76a";
      const bgColor = isFrozen ? "rgba(77,212,255,0.15)" : "rgba(245,199,106,0.25)";

      // Box (size proportional to params)
      const boxH = 40 + layer.params * 8;
      const boxY = y + 40 - boxH / 2;

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, boxY, layerW, boxH);
      ctx.strokeStyle = color;
      ctx.lineWidth = isFrozen ? 2 : 3;
      ctx.strokeRect(x, boxY, layerW, boxH);

      // Lock/flame icon
      ctx.fillStyle = color;
      ctx.font = "16px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isFrozen ? "🔒" : "🔥", x + layerW/2, boxY + 15);

      // Layer name
      ctx.font = "bold 11px Vazirmatn";
      ctx.fillStyle = "#fff";
      ctx.fillText(layer.name, x + layerW/2, boxY + 32);

      // Params
      ctx.font = "10px Vazirmatn";
      ctx.fillStyle = color;
      ctx.fillText(layer.params + "M", x + layerW/2, boxY + 48);
    });

    // Legend
    const legendY = h - 70;
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#4dd4ff";
    ctx.fillText("🔒  یخ‌زده (Freeze)", 30, legendY);

    ctx.fillStyle = "#f5c76a";
    ctx.fillText("🔥  آموزش‌دیده (Trainable)", 30, legendY + 25);

    // Title above layers
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("مدل ResNet50 (ساده‌شده)", w/2, 20);

    // Update info
    if(mode === "head"){
      infoEl.innerHTML = `<b>فقط Head:</b> ${frozen} لایه یخ‌زده، فقط لایه آخر آموزش. مناسب برای داده کم (< ۱۰۰۰ تصویر).`;
    } else if(mode === "last2"){
      infoEl.innerHTML = `<b>آخرین ۲ لایه:</b> ${frozen} لایه یخ‌زده، ۲ لایه آموزش. تعادل خوب برای داده متوسط.`;
    } else if(mode === "last4"){
      infoEl.innerHTML = `<b>آخرین ۴ لایه:</b> ${frozen} لایه یخ‌زده، ۴ لایه آموزش. مناسب برای داده زیاد.`;
    } else {
      infoEl.innerHTML = `<b>همه Trainable:</b> هیچ لایه‌ای یخ‌زده نیست. مثل آموزش از صفر — نیاز به داده زیاد و GPU.`;
    }
  }

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

  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = draw;
})();

/* ============================================================
   SIM 2 — LEARNING CURVES COMPARISON
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const runBtn = document.getElementById("sim2_run");
  const resetBtn = document.getElementById("sim2_reset");
  const infoEl = document.getElementById("sim2_info");

  let progress = 0; // 0 to 100
  let timer = null;

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;
    const baseY = padding.top + plotH;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i = 0; i <= 10; i++){
      const y = padding.top + plotH * i / 10;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotW, y);
      ctx.stroke();

      const x = padding.left + plotW * i / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, baseY);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(120,160,220,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, baseY);
    ctx.moveTo(padding.left, baseY);
    ctx.lineTo(padding.left + plotW, baseY);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("Epoch", padding.left + plotW/2, h - 20);
    ctx.save();
    ctx.translate(20, padding.top + plotH/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText("Loss", 0, 0);
    ctx.restore();

    // Generate curves
    const epochs = 50;
    const maxProgress = progress / 100 * epochs;

    // From scratch: slow convergence
    function lossScratch(epoch){
      if(epoch > maxProgress) return null;
      return 2.5 * Math.exp(-epoch / 25) + 0.5;
    }
    // Transfer: fast convergence
    function lossTransfer(epoch){
      if(epoch > maxProgress) return null;
      return 2.5 * Math.exp(-epoch / 5) + 0.15;
    }

    // Draw curves
    const xToPx = (epoch) => padding.left + (epoch / epochs) * plotW;
    const lossToPx = (loss) => baseY - (loss / 3) * plotH;

    // From scratch
    ctx.strokeStyle = "#ff7e93";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#ff7e93";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    let started = false;
    for(let e = 0; e <= maxProgress; e += 0.5){
      const loss = lossScratch(e);
      if(loss === null) break;
      const px = xToPx(e);
      const py = lossToPx(loss);
      if(!started){ ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Transfer
    ctx.strokeStyle = "#5ee8a8";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#5ee8a8";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    started = false;
    for(let e = 0; e <= maxProgress; e += 0.5){
      const loss = lossTransfer(e);
      if(loss === null) break;
      const px = xToPx(e);
      const py = lossToPx(loss);
      if(!started){ ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Legend
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#ff7e93";
    ctx.fillText("● From Scratch (آموزش از صفر)", padding.left + 20, padding.top + 20);

    ctx.fillStyle = "#5ee8a8";
    ctx.fillText("● Transfer Learning", padding.left + 20, padding.top + 45);

    // Update UI
    if(progress > 0){
      const lastScratch = lossScratch(Math.min(maxProgress, epochs));
      const lastTransfer = lossTransfer(Math.min(maxProgress, epochs));
      if(lastScratch !== null){
        document.getElementById("sim2_loss_scratch").textContent = lastScratch.toFixed(3);
      }
      if(lastTransfer !== null){
        document.getElementById("sim2_loss_transfer").textContent = lastTransfer.toFixed(3);
      }
      document.getElementById("sim2_speed").textContent = progress < 20 ? "—" :
        (lastScratch && lastTransfer ? (lastScratch / lastTransfer).toFixed(1) + "×" : "—");
    }

    if(progress === 0){
      infoEl.innerHTML = "<b>راهنما:</b> «اجرا» را بزنید تا هر دو منحنی رسم شوند.";
    } else if(progress < 100){
      infoEl.innerHTML = `<b>در حال آموزش...</b> Epoch ${Math.round(maxProgress)} از ${epochs}`;
    } else {
      const scratchLoss = lossScratch(epochs);
      const transferLoss = lossTransfer(epochs);
      infoEl.innerHTML = `<b>✓ پایان:</b> آموزش از صفر Loss = ${scratchLoss.toFixed(3)}، Transfer Loss = ${transferLoss.toFixed(3)}. Transfer ${((scratchLoss/transferLoss - 1) * 100).toFixed(0)}٪ بهتر.`;
    }
  }

  function run(){
    if(timer) clearInterval(timer);
    progress = 0;
    draw();
    timer = setInterval(() => {
      progress += 2;
      if(progress > 100) progress = 100;
      draw();
      if(progress >= 100){
        clearInterval(timer);
        timer = null;
      }
    }, 100);
  }

  function reset(){
    if(timer) clearInterval(timer);
    progress = 0;
    document.getElementById("sim2_loss_scratch").textContent = "—";
    document.getElementById("sim2_loss_transfer").textContent = "—";
    document.getElementById("sim2_speed").textContent = "—";
    draw();
    playClick();
  }

  runBtn.onclick = run;
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = () => { progress = 0; draw(); };
})();

/* ============================================================
   SIM 3 — DATASET SIZE MATTERS
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const n_s = document.getElementById("sim3_n");
  const infoEl = document.getElementById("sim3_info");

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const n = +n_s.value;
    document.getElementById("sim3_n_val").textContent = n;

    // Simulate accuracy for each approach based on n
    const feAcc = Math.min(0.95, 0.70 + 0.25 * (1 - Math.exp(-n / 500)));
    const ftAcc = Math.min(0.97, 0.65 + 0.32 * (1 - Math.exp(-n / 1500)));
    const scratchAcc = Math.min(0.93, 0.40 + 0.53 * (1 - Math.exp(-n / 3000)));

    document.getElementById("sim3_fe").textContent = (feAcc * 100).toFixed(1) + "%";
    document.getElementById("sim3_ft").textContent = (ftAcc * 100).toFixed(1) + "%";

    // Recommendation
    let rec, recColor;
    if(n < 500){
      rec = "Feature Extraction";
      recColor = "#4dd4ff";
    } else if(n < 2000){
      rec = "Fine-Tuning";
      recColor = "#5ee8a8";
    } else {
      rec = "Fine-Tuning + Augmentation";
      recColor = "#f5c76a";
    }
    const recEl = document.getElementById("sim3_rec");
    recEl.textContent = rec;
    recEl.style.color = recColor;

    // Draw bar chart
    const padding = { top: 40, right: 40, bottom: 60, left: 120 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;
    const barH = plotH / 4;

    const bars = [
      { label: "آموزش از صفر", value: scratchAcc, color: "#ff7e93" },
      { label: "Feature Extraction", value: feAcc, color: "#4dd4ff" },
      { label: "Fine-Tuning", value: ftAcc, color: "#5ee8a8" }
    ];

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i = 0; i <= 10; i++){
      const x = padding.left + plotW * i / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + plotH);
      ctx.stroke();
    }

    // Bars
    bars.forEach((bar, i) => {
      const y = padding.top + i * barH + 10;
      const barW = bar.value * plotW;
      const bh = barH - 20;

      // Background
      ctx.fillStyle = "rgba(120,140,160,0.1)";
      ctx.fillRect(padding.left, y, plotW, bh);

      // Bar
      const grad = ctx.createLinearGradient(padding.left, 0, padding.left + barW, 0);
      grad.addColorStop(0, bar.color + "aa");
      grad.addColorStop(1, bar.color);
      ctx.fillStyle = grad;
      ctx.fillRect(padding.left, y, barW, bh);

      // Border
      ctx.strokeStyle = bar.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(padding.left, y, barW, bh);

      // Label
      ctx.fillStyle = bar.color;
      ctx.font = "bold 13px Vazirmatn";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(bar.label, padding.left - 10, y + bh/2);

      // Value
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Vazirmatn";
      ctx.textAlign = "left";
      ctx.fillText((bar.value * 100).toFixed(1) + "%", padding.left + barW + 10, y + bh/2);
    });

    // X axis labels
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "11px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for(let i = 0; i <= 10; i+=2){
      const x = padding.left + plotW * i / 10;
      ctx.fillText((i * 10) + "%", x, padding.top + plotH + 10);
    }

    // Title
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`دقت مدل با ${n} تصویر آموزشی`, w/2, 15);

    // Info
    if(n < 500){
      infoEl.innerHTML = `<b>داده کم (${n}):</b> Feature Extraction بهترین گزینه. مدل پایه یخ‌زده، فقط head آموزش.`;
    } else if(n < 2000){
      infoEl.innerHTML = `<b>داده متوسط (${n}):</b> Fine-Tuning می‌تواند دقت را بهتر کند. چند لایه آخر را باز کنید.`;
    } else {
      infoEl.innerHTML = `<b>داده زیاد (${n}):</b> با Fine-Tuning کامل و Data Augmentation به بالاترین دقت می‌رسید.`;
    }
  }

  n_s.addEventListener("input", draw);
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