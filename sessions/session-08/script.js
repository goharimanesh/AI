/* ============================================================
   جلسه ۸ — SVM و ارزیابی مدل
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: SVM Margin، Soft Margin C، Confusion Matrix
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

/* ============ FULLSCREEN ============ */
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
   SIM 1 — SVM MARGIN
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const slopeSlider = document.getElementById("sim1_slope");
  const intSlider = document.getElementById("sim1_intercept");
  const infoEl = document.getElementById("sim1_info");

  // Generate 2D classification data (two clusters)
  const data = [];
  for(let i=0; i<60; i++){
    const u1 = Math.random();
    const u2 = Math.random();
    const z1 = Math.sqrt(-2*Math.log(u1)) * Math.cos(2*Math.PI*u2);
    const z2 = Math.sqrt(-2*Math.log(u1)) * Math.sin(2*Math.PI*u2);
    data.push({ x: 3 + z1*1.0, y: 3 + z2*1.0, cls: 0 });
  }
  for(let i=0; i<60; i++){
    const u1 = Math.random();
    const u2 = Math.random();
    const z1 = Math.sqrt(-2*Math.log(u1)) * Math.cos(2*Math.PI*u2);
    const z2 = Math.sqrt(-2*Math.log(u1)) * Math.sin(2*Math.PI*u2);
    data.push({ x: 7 + z1*1.0, y: 7 + z2*1.0, cls: 1 });
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const slope = +slopeSlider.value;
    const intercept = +intSlider.value;

    // Line: y = slope * x + intercept (in plot coordinates)
    // Actually: w1*x + w2*y + b = 0
    // Let's define: a*x + b*y + c = 0 with a=slope, b=-1, c=-intercept (so y = slope*x + intercept)
    const a = slope, b = -1, c = -intercept;
    const norm = Math.sqrt(a*a + b*b);

    // Compute distance from each point to line
    const distances = data.map(p => (a*p.x + b*p.y + c) / norm);

    // Classify: sign of distance
    let errors = 0;
    data.forEach((p, i) => {
      const pred = distances[i] > 0 ? 1 : 0;
      if(pred !== p.cls) errors++;
    });

    // Margin = 2/norm (for canonical form) — but we use normalized distances
    // Actually margin = 2 * (1/norm) when ||w||=norm
    const margin = 2 / norm;

    document.getElementById("sim1_slope_val").textContent = slope.toFixed(2);
    document.getElementById("sim1_intercept_val").textContent = intercept.toFixed(1);
    document.getElementById("sim1_margin").textContent = margin.toFixed(2);
    document.getElementById("sim1_errors").textContent = errors;
    document.getElementById("sim1_status").textContent = errors === 0 ? "کامل جدا ✓" : errors + " خطا";
    document.getElementById("sim1_status").style.color = errors === 0 ? "#5ee8a8" : "#ff7e93";

    if(errors === 0){
      infoEl.innerHTML = `<b>✓ مدل کامل جدا می‌کند.</b> حاشیه = ${margin.toFixed(2)}. هرچه حاشیه بزرگ‌تر بهتر.`;
    } else {
      infoEl.innerHTML = `<b>⚠ ${errors} خطا:</b> ${errors} نقطه از حاشیه عبور کرده. سعی کنید شیب و عرض را طوری تنظیم کنید که خطا صفر شود.`;
    }

    // Plot range
    const xMin = 0, xMax = 10, yMin = 0, yMax = 10;
    const padding = 40;
    const plotW = w - 2*padding;
    const plotH = h - 2*padding;
    const xScale = plotW / (xMax - xMin);
    const yScale = plotH / (yMax - yMin);
    const xToPx = (x) => padding + (x - xMin) * xScale;
    const yToPx = (y) => h - padding - (y - yMin) * yScale;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i = 0; i <= 10; i++){
      ctx.beginPath();
      ctx.moveTo(xToPx(i), padding);
      ctx.lineTo(xToPx(i), h - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, yToPx(i));
      ctx.lineTo(w - padding, yToPx(i));
      ctx.stroke();
    }

    // Decision boundary
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#f5c76a";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(xToPx(xMin), yToPx(slope*xMin + intercept));
    ctx.lineTo(xToPx(xMax), yToPx(slope*xMax + intercept));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Margin lines (parallel, offset by ±margin*... in plot coords)
    // Offset in normalized form: b*x - a*y = ±margin*sqrt(a²+b²) ... actually lines: a*x - y + c = ±margin*norm
    const offsetInY = margin * norm / Math.abs(b);
    ctx.strokeStyle = "rgba(77,212,255,0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(xToPx(xMin), yToPx(slope*xMin + intercept + offsetInY));
    ctx.lineTo(xToPx(xMax), yToPx(slope*xMax + intercept + offsetInY));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xToPx(xMin), yToPx(slope*xMin + intercept - offsetInY));
    ctx.lineTo(xToPx(xMax), yToPx(slope*xMax + intercept - offsetInY));
    ctx.stroke();
    ctx.setLineDash([]);

    // Data points
    data.forEach((p, i) => {
      const px = xToPx(p.x);
      const py = yToPx(p.y);
      if(px < padding || px > w-padding || py < padding || py > h-padding) return;
      const pred = distances[i] > 0 ? 1 : 0;
      const correct = pred === p.cls;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI*2);
      ctx.fillStyle = p.cls === 0 ? "#4dd4ff" : "#a78bfa";
      ctx.fill();
      ctx.strokeStyle = correct ? "#fff" : "#ff7e93";
      ctx.lineWidth = correct ? 1.5 : 3;
      ctx.stroke();
    });
  }

  slopeSlider.addEventListener("input", draw);
  intSlider.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = draw;
})();

/* ============================================================
   SIM 2 — SOFT MARGIN C
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const cSlider = document.getElementById("sim2_C");
  const infoEl = document.getElementById("sim2_info");

  // Generate data with slight overlap (noisy boundary)
  const data = [];
  for(let i=0; i<50; i++){
    const u1 = Math.random(), u2 = Math.random();
    const z1 = Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);
    const z2 = Math.sqrt(-2*Math.log(u1))*Math.sin(2*Math.PI*u2);
    data.push({ x: 3 + z1*1.5, y: 3 + z2*1.5, cls: 0 });
  }
  for(let i=0; i<50; i++){
    const u1 = Math.random(), u2 = Math.random();
    const z1 = Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);
    const z2 = Math.sqrt(-2*Math.log(u1))*Math.sin(2*Math.PI*u2);
    data.push({ x: 7 + z1*1.5, y: 7 + z2*1.5, cls: 1 });
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const C = +cSlider.value;

    // Simple boundary: y = x + offset. Use C to control slope.
    // Small C: shallow slope (wide margin)
    // Large C: steep slope (tight margin, more complex)
    const slope = 1 + (1 - 1/(1 + C)) * 0.5;
    const intercept = -slope * 5 + 5;
    const a = slope, b = -1, c = -intercept;
    const norm = Math.sqrt(a*a + b*b);
    const distances = data.map(p => (a*p.x + b*p.y + c) / norm);

    let errors = 0;
    data.forEach((p, i) => {
      const pred = distances[i] > 0 ? 1 : 0;
      if(pred !== p.cls) errors++;
    });

    const margin = 2 / norm;

    document.getElementById("sim2_C_val").textContent = C.toFixed(2);
    document.getElementById("sim2_margin").textContent = margin.toFixed(2);
    document.getElementById("sim2_err").textContent = errors;

    const statusEl = document.getElementById("sim2_status");
    if(C < 0.3){
      statusEl.textContent = "C کم — حاشیه پهن";
      statusEl.style.color = "#4dd4ff";
      infoEl.innerHTML = `<b>C کوچک:</b> حاشیه پهن، مدل ساده. ممکن است نتواند همه را درست جدا کند (ریسک Underfitting).`;
    } else if(C < 3){
      statusEl.textContent = "C متوسط — تعادل";
      statusEl.style.color = "#5ee8a8";
      infoEl.innerHTML = `<b>C متوسط:</b> تعادل خوب بین حاشیه و خطا. معمولاً بهترین انتخاب.`;
    } else {
      statusEl.textContent = "C زیاد — Overfit";
      statusEl.style.color = "#ff7e93";
      infoEl.innerHTML = `<b>C بزرگ:</b> حاشیه باریک، مدل پیچیده. تلاش برای جدا کردن همه (ریسک Overfitting).`;
    }

    const xMin = 0, xMax = 10, yMin = 0, yMax = 10;
    const padding = 40;
    const plotW = w - 2*padding;
    const plotH = h - 2*padding;
    const xScale = plotW / (xMax - xMin);
    const yScale = plotH / (yMax - yMin);
    const xToPx = (x) => padding + (x - xMin) * xScale;
    const yToPx = (y) => h - padding - (y - yMin) * yScale;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i = 0; i <= 10; i++){
      ctx.beginPath();
      ctx.moveTo(xToPx(i), padding); ctx.lineTo(xToPx(i), h - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, yToPx(i)); ctx.lineTo(w - padding, yToPx(i));
      ctx.stroke();
    }

    // Boundary
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#f5c76a";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(xToPx(xMin), yToPx(slope*xMin + intercept));
    ctx.lineTo(xToPx(xMax), yToPx(slope*xMax + intercept));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Margins
    const offsetInY = margin * norm / Math.abs(b);
    ctx.strokeStyle = "rgba(77,212,255,0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(xToPx(xMin), yToPx(slope*xMin + intercept + offsetInY));
    ctx.lineTo(xToPx(xMax), yToPx(slope*xMax + intercept + offsetInY));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xToPx(xMin), yToPx(slope*xMin + intercept - offsetInY));
    ctx.lineTo(xToPx(xMax), yToPx(slope*xMax + intercept - offsetInY));
    ctx.stroke();
    ctx.setLineDash([]);

    // Points
    data.forEach((p, i) => {
      const px = xToPx(p.x), py = yToPx(p.y);
      if(px < padding || px > w-padding || py < padding || py > h-padding) return;
      const pred = distances[i] > 0 ? 1 : 0;
      const correct = pred === p.cls;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI*2);
      ctx.fillStyle = p.cls === 0 ? "#4dd4ff" : "#a78bfa";
      ctx.fill();
      ctx.strokeStyle = correct ? "#fff" : "#ff7e93";
      ctx.lineWidth = correct ? 1.5 : 3;
      ctx.stroke();
    });
  }

  cSlider.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = draw;
})();

/* ============================================================
   SIM 3 — CONFUSION MATRIX
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const tp_s = document.getElementById("sim3_tp");
  const fp_s = document.getElementById("sim3_fp");
  const fn_s = document.getElementById("sim3_fn");
  const tn_s = document.getElementById("sim3_tn");

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const TP = +tp_s.value;
    const FP = +fp_s.value;
    const FN = +fn_s.value;
    const TN = +tn_s.value;

    document.getElementById("sim3_tp_val").textContent = TP;
    document.getElementById("sim3_fp_val").textContent = FP;
    document.getElementById("sim3_fn_val").textContent = FN;
    document.getElementById("sim3_tn_val").textContent = TN;

    const total = TP + FP + FN + TN;
    const accuracy = total > 0 ? (TP + TN) / total : 0;
    const precision = (TP + FP) > 0 ? TP / (TP + FP) : 0;
    const recall = (TP + FN) > 0 ? TP / (TP + FN) : 0;
    const f1 = (precision + recall) > 0 ? 2 * precision * recall / (precision + recall) : 0;

    document.getElementById("sim3_acc").textContent = (accuracy * 100).toFixed(1) + "%";
    document.getElementById("sim3_prec").textContent = (precision * 100).toFixed(1) + "%";
    document.getElementById("sim3_rec").textContent = (recall * 100).toFixed(1) + "%";
    document.getElementById("sim3_f1").textContent = (f1 * 100).toFixed(1) + "%";

    // Interpretation
    const infoEl = document.getElementById("sim3_info");
    if(accuracy > 0.9 && f1 > 0.85){
      infoEl.innerHTML = `<b>✓ مدل عالی:</b> هر چهار معیار بالا. مدل قابل اعتماد است.`;
    } else if(accuracy > 0.8 && f1 > 0.7){
      infoEl.innerHTML = `<b>مدل خوب:</b> Accuracy بالا. F1 متوسط — تعادل بین Precision و Recall.`;
    } else if(recall < 0.5){
      infoEl.innerHTML = `<b>⚠ Recall پایین:</b> مدل بسیاری از موارد مثبت را از دست می‌دهد. در کاربردهای حساس (پزشکی) خطرناک است.`;
    } else if(precision < 0.5){
      infoEl.innerHTML = `<b>⚠ Precision پایین:</b> مدل هشدارهای کاذب زیادی می‌دهد. FP زیاد است.`;
    } else {
      infoEl.innerHTML = `<b>مدل متوسط:</b> معیارها بهبود نیاز دارند.`;
    }

    // Draw confusion matrix
    const padding = 60;
    const plotW = w - 2*padding;
    const plotH = h - 2*padding - 40;
    const cellW = plotW / 2;
    const cellH = plotH / 2;
    const startX = padding;
    const startY = padding;

    const matrix = [
      [{label: "TP", value: TP, color: "#5ee8a8"}, {label: "FN", value: FN, color: "#ff7e93"}],
      [{label: "FP", value: FP, color: "#f5c76a"}, {label: "TN", value: TN, color: "#4dd4ff"}]
    ];

    const maxVal = Math.max(TP, FP, FN, TN, 1);

    for(let r = 0; r < 2; r++){
      for(let c = 0; c < 2; c++){
        const cell = matrix[r][c];
        const x = startX + c * cellW;
        const y = startY + r * cellH;
        const intensity = cell.value / maxVal;

        ctx.fillStyle = cell.color + Math.floor(20 + intensity * 100).toString(16).padStart(2, "0");
        ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
        ctx.strokeStyle = cell.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4);

        ctx.fillStyle = cell.color;
        ctx.font = "bold 13px Vazirmatn";
        ctx.textAlign = "center";
        ctx.fillText(cell.label, x + cellW/2, y + 25);

        ctx.font = "bold 28px Vazirmatn";
        ctx.fillText(cell.value, x + cellW/2, y + cellH/2 + 10);
      }
    }

    // Row/col labels
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("پیش‌بینی مثبت", startX + cellW/2, padding - 15);
    ctx.fillText("پیش‌بینی منفی", startX + cellW*1.5, padding - 15);

    ctx.save();
    ctx.translate(padding - 40, startY + cellH/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText("واقعی مثبت", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(padding - 40, startY + cellH*1.5);
    ctx.rotate(-Math.PI/2);
    ctx.fillText("واقعی منفی", 0, 0);
    ctx.restore();

    // Metrics bar
    const metricY = h - 30;
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText(`Accuracy: ${(accuracy*100).toFixed(1)}% | Precision: ${(precision*100).toFixed(1)}% | Recall: ${(recall*100).toFixed(1)}% | F1: ${(f1*100).toFixed(1)}%`, w/2, metricY);
  }

  [tp_s, fp_s, fn_s, tn_s].forEach(s => {
    s.addEventListener("input", draw);
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