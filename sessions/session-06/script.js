/* ============================================================
   جلسه ۶ — درخت تصادفی و Ensemble
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۵ شبیه‌ساز: Galton، Averaging، Decision Tree، Forest، Boosting
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
   SIM GALTON — پارادوکس گالتون (خرد جمعی)
   ============================================================ */
(function(){
  const canvas = document.getElementById("simGaltonCanvas");
  if(!canvas) return;
  const nSlider = document.getElementById("simGalton_n");
  const noiseSlider = document.getElementById("simGalton_noise");
  const runBtn = document.getElementById("simGalton_run");
  const resetBtn = document.getElementById("simGalton_reset");
  const infoEl = document.getElementById("simGalton_info");

  const TRUE_VALUE = 1200; // پوند
  let guesses = [];
  let median = 0;
  let mean = 0;

  function generateGuesses(){
    const n = +nSlider.value;
    const noise = +noiseSlider.value;
    guesses = [];
    for(let i=0; i<n; i++){
      // Gaussian noise via Box-Muller
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      guesses.push(TRUE_VALUE + z * noise);
    }
    // Sort for median
    const sorted = [...guesses].sort((a,b) => a-b);
    const mid = Math.floor(sorted.length / 2);
    median = sorted.length % 2 === 0 ? (sorted[mid-1] + sorted[mid]) / 2 : sorted[mid];
    mean = guesses.reduce((a,b) => a+b, 0) / guesses.length;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i = 0; i <= 10; i++){
      ctx.beginPath();
      ctx.moveTo(w*i/10, 0); ctx.lineTo(w*i/10, h);
      ctx.stroke();
    }

    // Compute range
    const minV = Math.min(...guesses, TRUE_VALUE) - 100;
    const maxV = Math.max(...guesses, TRUE_VALUE) + 100;
    const range = maxV - minV;
    const xScale = w / range;
    const x0 = (v) => (v - minV) * xScale;

    // Histogram
    const bins = 40;
    const binW = range / bins;
    const counts = new Array(bins).fill(0);
    guesses.forEach(g => {
      const bin = Math.floor((g - minV) / binW);
      if(bin >= 0 && bin < bins) counts[bin]++;
    });
    const maxCount = Math.max(...counts, 1);
    const histHeight = h * 0.55;
    const baseY = h - 60;

    counts.forEach((c, i) => {
      if(c === 0) return;
      const barH = (c / maxCount) * histHeight;
      const x = i * binW * xScale;
      const grad = ctx.createLinearGradient(0, baseY - barH, 0, baseY);
      grad.addColorStop(0, "#4dd4ff");
      grad.addColorStop(1, "rgba(77,212,255,0.3)");
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, baseY - barH, binW * xScale - 2, barH);
    });

    // True value line
    const trueX = x0(TRUE_VALUE);
    ctx.strokeStyle = "#ff7e93";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6,4]);
    ctx.beginPath();
    ctx.moveTo(trueX, 20);
    ctx.lineTo(trueX, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Median line
    const medianX = x0(median);
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(medianX, 20);
    ctx.lineTo(medianX, baseY);
    ctx.stroke();

    // Mean line
    const meanX = x0(mean);
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2;
    ctx.setLineDash([3,3]);
    ctx.beginPath();
    ctx.moveTo(meanX, 20);
    ctx.lineTo(meanX, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = "#ff7e93";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("واقعی: ۱۲۰۰", trueX, 14);
    ctx.fillStyle = "#f5c76a";
    ctx.fillText("میانه: " + Math.round(median), medianX, baseY + 20);
    ctx.fillStyle = "#a78bfa";
    ctx.fillText("میانگین: " + Math.round(mean), meanX, baseY + 38);

    // Update UI
    const err = Math.abs(median - TRUE_VALUE) / TRUE_VALUE * 100;
    document.getElementById("simGalton_n_val").textContent = nSlider.value;
    document.getElementById("simGalton_noise_val").textContent = noiseSlider.value;
    document.getElementById("simGalton_true").textContent = TRUE_VALUE;
    document.getElementById("simGalton_median").textContent = Math.round(median);
    document.getElementById("simGalton_mean").textContent = Math.round(mean);
    document.getElementById("simGalton_error").textContent = err.toFixed(2) + "%";

    // Info
    const n = +nSlider.value;
    if(n < 10){
      infoEl.innerHTML = `<b>n = ${n}:</b> تعداد کم — میانه ممکن است خطای زیادی داشته باشد. حدس‌های تصادفی هنوز خنثی نشده‌اند.`;
    } else if(n < 50){
      infoEl.innerHTML = `<b>n = ${n}:</b> با افزایش تعداد، خطا کم‌تر می‌شود. اصل تجمیع شروع به کار کرده.`;
    } else if(n < 200){
      infoEl.innerHTML = `<b>n = ${n}:</b> خطای میانه کاهش یافت. خطاهای تصادفی از دو طرف در حال خنثی شدن هستند.`;
    } else {
      infoEl.innerHTML = `<b>n = ${n}:</b> دقت بسیار بالا. میانه به مقدار واقعی نزدیک شده — تجلی قانون اعداد بزرگ. خطای فعلی: ${err.toFixed(2)}%`;
    }
  }

  function run(){
    generateGuesses();
    draw();
    playClick();
  }
  function reset(){
    guesses = [];
    median = 0; mean = 0;
    draw();
  }

  nSlider.addEventListener("input", () => {
    document.getElementById("simGalton_n_val").textContent = nSlider.value;
    if(guesses.length) run();
    else draw();
  });
  noiseSlider.addEventListener("input", () => {
    document.getElementById("simGalton_noise_val").textContent = noiseSlider.value;
    if(guesses.length) run();
    else draw();
  });
  runBtn.onclick = run;
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });

  simsInit.galton = () => {
    if(guesses.length === 0) run();
    else draw();
  };
})();

/* ============================================================
   SIM AVERAGING — میانگین‌گیری تعاملی
   ============================================================ */
(function(){
  const canvas = document.getElementById("simAvgCanvas");
  if(!canvas) return;
  const trueSlider = document.getElementById("simAvg_trueVal");
  const nSlider = document.getElementById("simAvg_n");
  const noiseSlider = document.getElementById("simAvg_noise");
  const infoEl = document.getElementById("simAvg_info");

  let numbers = [];

  function generateNumbers(){
    const trueVal = +trueSlider.value;
    const n = +nSlider.value;
    const noise = +noiseSlider.value;
    numbers = [];
    for(let i=0; i<n; i++){
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      numbers.push(trueVal + z * noise);
    }
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const trueVal = +trueSlider.value;
    const n = +nSlider.value;

    // Stats
    const mean = numbers.reduce((a,b) => a+b, 0) / numbers.length;
    const sorted = [...numbers].sort((a,b) => a-b);
    const median = sorted.length % 2 === 0 ?
      (sorted[Math.floor(sorted.length/2)-1] + sorted[Math.floor(sorted.length/2)]) / 2 :
      sorted[Math.floor(sorted.length/2)];
    const err = Math.abs(mean - trueVal) / trueVal * 100;

    // Draw
    const minV = Math.min(...numbers, trueVal) - 100;
    const maxV = Math.max(...numbers, trueVal) + 100;
    const range = maxV - minV;
    const xScale = w / range;
    const x0 = (v) => (v - minV) * xScale;

    // True value line
    const trueX = x0(trueVal);
    ctx.strokeStyle = "#ff7e93";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6,4]);
    ctx.beginPath();
    ctx.moveTo(trueX, 10); ctx.lineTo(trueX, h - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Mean line
    const meanX = x0(mean);
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(meanX, 10); ctx.lineTo(meanX, h - 30);
    ctx.stroke();

    // Scatter points
    const baseY = h - 30;
    numbers.forEach(v => {
      const x = x0(v);
      ctx.beginPath();
      ctx.arc(x, baseY - 20 - Math.random()*10, 4, 0, Math.PI*2);
      ctx.fillStyle = "rgba(77,212,255,0.7)";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Labels
    ctx.fillStyle = "#ff7e93";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("واقعی: " + trueVal, trueX, h - 10);
    ctx.fillStyle = "#f5c76a";
    ctx.fillText("میانگین: " + Math.round(mean), meanX, h - 10);

    // Update UI
    document.getElementById("simAvg_trueVal_val").textContent = trueVal;
    document.getElementById("simAvg_n_val").textContent = n;
    document.getElementById("simAvg_noise_val").textContent = noiseSlider.value;
    document.getElementById("simAvg_true").textContent = trueVal;
    document.getElementById("simAvg_mean").textContent = Math.round(mean);
    document.getElementById("simAvg_median").textContent = Math.round(median);
    document.getElementById("simAvg_error").textContent = err.toFixed(2) + "%";

    if(n < 10){
      infoEl.innerHTML = `<b>n = ${n}:</b> تعداد کم. میانگین تحت تأثیر نویز. خطا: ${err.toFixed(2)}%`;
    } else if(n < 50){
      infoEl.innerHTML = `<b>n = ${n}:</b> میانگین در حال نزدیک شدن. اصل تجمیع کار می‌کند. خطا: ${err.toFixed(2)}%`;
    } else {
      infoEl.innerHTML = `<b>n = ${n}:</b> خطای کم — قانون اعداد بزرگ. خطا: ${err.toFixed(2)}%`;
    }
  }

  trueSlider.addEventListener("input", () => { generateNumbers(); draw(); });
  nSlider.addEventListener("input", () => { generateNumbers(); draw(); });
  noiseSlider.addEventListener("input", () => { generateNumbers(); draw(); });
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });

  simsInit.avg = () => { generateNumbers(); draw(); };
})();

/* ============================================================
   SIM 1 — DECISION TREE BUILDING
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const nextBtn = document.getElementById("sim1_next");
  const resetBtn = document.getElementById("sim1_reset");
  const autoBtn = document.getElementById("sim1_auto");
  const infoEl = document.getElementById("sim1_info");

  const data = [];
  for(let i=0; i<100; i++){
    const x = Math.random() * 10;
    const y = Math.random() * 10;
    const dist = Math.sqrt(Math.pow(x-5,2) + Math.pow(y-5,2));
    const cls = dist < 3.5 ? 0 : 1;
    data.push({x, y, cls});
  }

  let depth = 0;
  let autoTimer = null;
  const maxDepth = 5;

  function computeLeaves(){
    const leaves = [];
    function recurse(xMin, xMax, yMin, yMax, d){
      if(d >= depth || depth === 0){
        let c0=0, c1=0;
        data.forEach(p => {
          if(p.x >= xMin && p.x < xMax && p.y >= yMin && p.y < yMax){
            if(p.cls === 0) c0++; else c1++;
          }
        });
        leaves.push({xMin, xMax, yMin, yMax, c0, c1, cls: c0 >= c1 ? 0 : 1});
        return;
      }
      if(d % 2 === 0){
        const mid = (xMin + xMax) / 2;
        recurse(xMin, mid, yMin, yMax, d+1);
        recurse(mid, xMax, yMin, yMax, d+1);
      } else {
        const mid = (yMin + yMax) / 2;
        recurse(xMin, xMax, yMin, mid, d+1);
        recurse(xMin, xMax, mid, yMax, d+1);
      }
    }
    recurse(0, 10, 0, 10, 0);
    return leaves;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const leaves = computeLeaves();

    leaves.forEach(L => {
      const xp = L.xMin / 10 * w;
      const yp = h - L.yMax / 10 * h;
      const wp = (L.xMax - L.xMin) / 10 * w;
      const hp = (L.yMax - L.yMin) / 10 * h;
      ctx.fillStyle = L.cls === 0 ? "rgba(77,212,255,0.22)" : "rgba(245,199,106,0.22)";
      ctx.fillRect(xp, yp, wp, hp);
      ctx.strokeStyle = L.cls === 0 ? "rgba(77,212,255,0.5)" : "rgba(245,199,106,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(xp, yp, wp, hp);
    });

    let correct = 0;
    data.forEach(p => {
      const px = p.x / 10 * w;
      const py = h - p.y / 10 * h;
      let pred = 0;
      for(const L of leaves){
        if(p.x >= L.xMin && p.x < L.xMax && p.y >= L.yMin && p.y < L.yMax){
          pred = L.cls;
          break;
        }
      }
      if(pred === p.cls) correct++;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.cls === 0 ? "#4dd4ff" : "#f5c76a";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    const acc = correct / data.length;
    document.getElementById("sim1_depth").textContent = depth;
    document.getElementById("sim1_leaves").textContent = leaves.length;
    document.getElementById("sim1_acc").textContent = (acc * 100).toFixed(1) + "%";

    if(depth === 0){
      infoEl.innerHTML = "<b>گام ۰:</b> هنوز تقسیمی انجام نشده.";
    } else if(depth === 1){
      infoEl.innerHTML = "<b>گام ۱:</b> اولین تقسیم بر اساس x=5.";
    } else if(depth === 2){
      infoEl.innerHTML = "<b>گام ۲:</b> هر نیمه بر اساس y=5 تقسیم شد.";
    } else if(depth === 3){
      infoEl.innerHTML = "<b>گام ۳:</b> نواحی خالص‌تر شدند.";
    } else if(depth <= 4){
      infoEl.innerHTML = `<b>گام ${depth}:</b> مدل پیچیده‌تر.`;
    } else {
      infoEl.innerHTML = `<b>گام ${depth}:</b> مدل خیلی پیچیده — ریسک Overfitting.`;
    }
  }

  nextBtn.onclick = () => { if(depth < maxDepth) { depth++; draw(); playClick(); } };
  resetBtn.onclick = () => {
    depth = 0;
    if(autoTimer) clearInterval(autoTimer);
    draw(); playClick();
  };
  autoBtn.onclick = () => {
    if(autoTimer){ clearInterval(autoTimer); autoTimer = null; return; }
    resetBtn.onclick();
    autoTimer = setInterval(() => {
      if(depth >= maxDepth){ clearInterval(autoTimer); autoTimer = null; return; }
      depth++; draw();
    }, 900);
  };
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = () => { depth = 0; draw(); };
})();

/* ============================================================
   SIM 2 — RANDOM FOREST VOTING
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const treesSlider = document.getElementById("sim2_trees");
  const noiseSlider = document.getElementById("sim2_noise");

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const B = +treesSlider.value;
    const noise = +noiseSlider.value;

    document.getElementById("sim2_trees_val").textContent = B;
    document.getElementById("sim2_noise_val").textContent = noise.toFixed(2);

    const treeAcc = 0.72;
    const forestAcc = Math.min(0.99, treeAcc + (1 - 1/Math.sqrt(B)) * 0.26 - noise * 0.3);

    document.getElementById("sim2_single").textContent = (treeAcc * 100).toFixed(1) + "%";
    document.getElementById("sim2_forest").textContent = (Math.max(treeAcc, forestAcc) * 100).toFixed(1) + "%";
    document.getElementById("sim2_improve").textContent = "+" + (Math.max(0, forestAcc - treeAcc) * 100).toFixed(1) + "%";

    const treeY = 80;
    const treeRadius = 22;
    const cols = Math.min(B, 10);
    const rows = Math.ceil(B / cols);
    const spacing = Math.min(w / (cols + 1), 80);
    const startX = (w - (cols-1) * spacing) / 2;

    let votes0 = 0, votes1 = 0;
    for(let i=0; i<B; i++){
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * spacing;
      const cy = treeY + row * (treeRadius * 2 + 12);
      if(cy > h/2 - 40) continue;

      const vote = Math.random() > (0.5 - noise*0.3) ? 1 : 0;
      if(vote === 1) votes1++; else votes0++;

      ctx.beginPath();
      ctx.arc(cx, cy, treeRadius, 0, Math.PI*2);
      ctx.fillStyle = vote === 0 ? "rgba(77,212,255,0.3)" : "rgba(245,199,106,0.3)";
      ctx.fill();
      ctx.strokeStyle = vote === 0 ? "#4dd4ff" : "#f5c76a";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = vote === 0 ? "#4dd4ff" : "#f5c76a";
      ctx.font = "bold 12px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(vote, cx, cy);
    }

    const winner = votes1 > votes0 ? 1 : 0;
    const winnerColor = winner === 0 ? "#4dd4ff" : "#f5c76a";
    const winnerLabel = winner === 0 ? "کلاس ۰" : "کلاس ۱";

    const boxY = h - 80;
    ctx.fillStyle = "rgba(167,139,250,0.2)";
    ctx.strokeStyle = winnerColor;
    ctx.lineWidth = 3;
    ctx.fillRect(w/2 - 100, boxY - 30, 200, 60);
    ctx.strokeRect(w/2 - 100, boxY - 30, 200, 60);

    ctx.fillStyle = winnerColor;
    ctx.font = "bold 18px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(winnerLabel, w/2, boxY - 8);
    ctx.font = "bold 14px Vazirmatn";
    ctx.fillStyle = "#a8bcd4";
    ctx.fillText(`آرا: ${votes0} به ${votes1}`, w/2, boxY + 16);

    ctx.strokeStyle = "rgba(120,160,220,0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,4]);
    ctx.beginPath();
    ctx.moveTo(w/2, treeY + rows * 50);
    ctx.lineTo(w/2, boxY - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("🌲 هر دایره = یک درخت", 10, 10);
  }

  treesSlider.addEventListener("input", draw);
  noiseSlider.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = draw;
})();

/* ============================================================
   SIM 3 — GRADIENT BOOSTING STEP-BY-STEP
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const iterSlider = document.getElementById("sim3_iter");
  const infoEl = document.getElementById("sim3_info");

  const data = [];
  const N = 50;
  for(let i=0; i<N; i++){
    const x = i / (N-1) * 2 * Math.PI;
    const y = Math.sin(x) + (Math.random() - 0.5) * 0.25;
    data.push({x, y});
  }

  function buildBoosting(stages){
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    let pred = ys.map(() => ys.reduce((a,b)=>a+b,0)/N);
    const history = [pred.slice()];

    for(let s=0; s<stages; s++){
      const residuals = ys.map((y, i) => y - pred[i]);
      const medianX = xs[Math.floor(N/2)];
      const left = [], right = [];
      for(let i=0; i<N; i++){
        if(xs[i] < medianX) left.push(residuals[i]);
        else right.push(residuals[i]);
      }
      const leftMean = left.length ? left.reduce((a,b)=>a+b,0)/left.length : 0;
      const rightMean = right.length ? right.reduce((a,b)=>a+b,0)/right.length : 0;

      for(let i=0; i<N; i++){
        const h = xs[i] < medianX ? leftMean : rightMean;
        pred[i] += 0.4 * h;
      }
      history.push(pred.slice());
    }
    return history;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const iter = +iterSlider.value;
    document.getElementById("sim3_iter_val").textContent = iter;
    document.getElementById("sim3_n").textContent = iter;

    const history = buildBoosting(iter);
    const pred = history[history.length - 1];

    let mse = 0;
    for(let i=0; i<N; i++) mse += Math.pow(data[i].y - pred[i], 2);
    mse /= N;

    document.getElementById("sim3_mse").textContent = mse.toFixed(4);
    const status = document.getElementById("sim3_status");
    if(mse > 0.15){ status.textContent = "Underfitting"; status.style.color = "#4dd4ff"; }
    else if(mse > 0.04){ status.textContent = "Good Fit"; status.style.color = "#5ee8a8"; }
    else { status.textContent = "Overfitting?"; status.style.color = "#ff7e93"; }

    if(iter === 0){
      infoEl.innerHTML = "<b>مرحله ۰:</b> مدل اولیه = میانگین. خط افقی.";
    } else if(iter === 1){
      infoEl.innerHTML = "<b>مرحله ۱:</b> درخت اول یک پله روی داده فیت کرد.";
    } else if(iter <= 3){
      infoEl.innerHTML = `<b>مرحله ${iter}:</b> درخت‌های بعدی روی باقیمانده‌ها. MSE کاهش می‌یابد.`;
    } else if(iter <= 8){
      infoEl.innerHTML = `<b>مرحله ${iter}:</b> مدل تقریباً منحنی سینوس را یاد گرفته.`;
    } else {
      infoEl.innerHTML = `<b>مرحله ${iter}:</b> افزایش مراحل — ریسک Overfitting با نویز.`;
    }

    const xScale = w / (2 * Math.PI);
    const y0 = h/2;
    const yScale = h/3;

    data.forEach(p => {
      const px = p.x * xScale;
      const py = y0 - p.y * yScale;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI*2);
      ctx.fillStyle = "#4dd4ff";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#f5c76a";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for(let i=0; i<N; i++){
      const px = data[i].x * xScale;
      const py = y0 - pred[i] * yScale;
      if(i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "right";
    ctx.fillText("● داده", w - 20, 25);
    ctx.fillStyle = "#f5c76a";
    ctx.fillText("— پیش‌بینی مدل", w - 20, 45);
  }

  iterSlider.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim3 = draw;
})();

/* ============ INIT VISIBLE SIMS ============ */
function initVisibleSims(){
  const active = slides[currentSlide];
  if(!active) return;
  const topic = active.dataset.topic;
  if(topic === "شبیه‌ساز گالتون" && simsInit.galton) simsInit.galton();
  else if(topic === "شبیه‌ساز جمع اعداد" && simsInit.avg) simsInit.avg();
  else if(topic === "شبیه‌ساز ۱" && simsInit.sim1) simsInit.sim1();
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