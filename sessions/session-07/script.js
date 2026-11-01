/* ============================================================
   جلسه ۷ — ANOVA و Taguchi
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: ANOVA، Orthogonal Array، S/N Ratio
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
   SIM 1 — ANOVA INTERACTIVE
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const mA_s = document.getElementById("sim1_mA");
  const mB_s = document.getElementById("sim1_mB");
  const mC_s = document.getElementById("sim1_mC");
  const noise_s = document.getElementById("sim1_noise");
  const infoEl = document.getElementById("sim1_info");

  // Fixed sample sizes
  const nPerGroup = 20;
  let groupData = [[], [], []];

  function generateData(){
    const noise = +noise_s.value;
    const means = [+mA_s.value, +mB_s.value, +mC_s.value];
    groupData = [[], [], []];
    for(let g=0; g<3; g++){
      for(let i=0; i<nPerGroup; i++){
        // Box-Muller
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        groupData[g].push(means[g] + z * noise);
      }
    }
  }

  function computeStats(){
    const means = groupData.map(g => g.reduce((a,b) => a+b, 0) / g.length);
    const grandMean = groupData.flat().reduce((a,b) => a+b, 0) / (nPerGroup * 3);

    // SSB
    let SSB = 0;
    groupData.forEach((g, i) => {
      SSB += g.length * Math.pow(means[i] - grandMean, 2);
    });

    // SSW
    let SSW = 0;
    groupData.forEach((g, i) => {
      g.forEach(v => SSW += Math.pow(v - means[i], 2));
    });

    const dfB = 3 - 1;
    const dfW = 3 * nPerGroup - 3;
    const MSB = SSB / dfB;
    const MSW = SSW / dfW;
    const F = MSB / MSW;

    return { means, grandMean, SSB, SSW, dfB, dfW, MSB, MSW, F };
  }

  function fDistCDF(F, df1, df2){
    // Approximate p-value via F-distribution
    // Use approximation: p ≈ 1 - I_x(df1/2, df2/2) where x = df1*F/(df1*F+df2)
    // For simplicity, use empirical approximation
    if(F < 1) return 0.5;
    // Simple approximation for F-test p-value
    const x = df1 * F / (df1 * F + df2);
    // Use incomplete beta approximation (rough)
    // Fallback: use chi-square-like approximation
    const p = Math.exp(-df1 * (F - 1) / 2);
    return Math.max(0.0001, Math.min(0.9999, p));
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const stats = computeStats();

    // Stats
    const F = stats.F;
    const p = fDistCDF(F, stats.dfB, stats.dfW);

    document.getElementById("sim1_mA_val").textContent = (+mA_s.value).toFixed(1);
    document.getElementById("sim1_mB_val").textContent = (+mB_s.value).toFixed(1);
    document.getElementById("sim1_mC_val").textContent = (+mC_s.value).toFixed(1);
    document.getElementById("sim1_noise_val").textContent = (+noise_s.value).toFixed(1);
    document.getElementById("sim1_F").textContent = F.toFixed(2);
    document.getElementById("sim1_p").textContent = p < 0.0001 ? "<0.0001" : p.toFixed(4);

    const resultEl = document.getElementById("sim1_result");
    if(p < 0.05){
      resultEl.textContent = "معنی‌دار ✓";
      resultEl.style.color = "#5ee8a8";
      infoEl.innerHTML = "<b>p &lt; 0.05:</b> تفاوت میانگین‌ها معنی‌دار است. گروه‌ها واقعاً متفاوتند.";
    } else {
      resultEl.textContent = "غیرمعنی‌دار";
      resultEl.style.color = "#ff7e93";
      infoEl.innerHTML = "<b>p &gt; 0.05:</b> تفاوت‌ها ناشی از نویز است. گروه‌ها تفاوت معنی‌دار ندارند.";
    }

    // Draw box plots for each group
    const padding = {top: 40, bottom: 80, left: 20, right: 20};
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const groupW = chartW / 3;

    const allData = groupData.flat();
    const yMin = Math.min(...allData) - 1;
    const yMax = Math.max(...allData) + 1;
    const yScale = chartH / (yMax - yMin);
    const yPos = (v) => padding.top + chartH - (v - yMin) * yScale;

    // Grid lines
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let v = Math.ceil(yMin); v <= yMax; v += 2){
      const y = yPos(v);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = "#7a8fa8";
      ctx.font = "11px Vazirmatn";
      ctx.textAlign = "right";
      ctx.fillText(v.toString(), padding.left - 4, y + 4);
    }

    // Grand mean line
    const grandY = yPos(stats.grandMean);
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, grandY);
    ctx.lineTo(w - padding.right, grandY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Group colors
    const colors = ["#4dd4ff", "#a78bfa", "#5ee8a8"];

    // Draw each group
    groupData.forEach((g, i) => {
      const cx = padding.left + groupW * (i + 0.5);

      // Scatter points (jittered)
      g.forEach(v => {
        const jitter = (Math.random() - 0.5) * groupW * 0.5;
        const px = cx + jitter;
        const py = yPos(v);
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI*2);
        ctx.fillStyle = colors[i];
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Box
      const sorted = [...g].sort((a,b) => a-b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const median = sorted[Math.floor(sorted.length * 0.5)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const boxWidth = groupW * 0.4;
      const x1 = cx - boxWidth / 2;
      const y1 = yPos(q3);
      const y2 = yPos(q1);

      ctx.fillStyle = colors[i] + "33";
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      ctx.fillRect(x1, y1, boxWidth, y2 - y1);
      ctx.strokeRect(x1, y1, boxWidth, y2 - y1);

      // Median line
      ctx.beginPath();
      ctx.moveTo(x1, yPos(median));
      ctx.lineTo(x1 + boxWidth, yPos(median));
      ctx.lineWidth = 3;
      ctx.stroke();

      // Mean marker
      ctx.beginPath();
      ctx.arc(cx, yPos(stats.means[i]), 5, 0, Math.PI*2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = colors[i];
      ctx.font = "bold 14px Vazirmatn";
      ctx.textAlign = "center";
      ctx.fillText("گروه " + ["A","B","C"][i], cx, h - padding.bottom + 25);
      ctx.font = "11px Vazirmatn";
      ctx.fillStyle = "#a8bcd4";
      ctx.fillText("میانگین: " + stats.means[i].toFixed(2), cx, h - padding.bottom + 45);
    });

    // Axis label
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.fillText("مقدار مشاهده", padding.left, 20);
  }

  [mA_s, mB_s, mC_s, noise_s].forEach(s => {
    s.addEventListener("input", () => { generateData(); draw(); });
  });
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = () => { generateData(); draw(); };
})();

/* ============================================================
   SIM 2 — ORTHOGONAL ARRAY
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const resetBtn = document.getElementById("sim2_reset");

  // L9 array
  const L9 = [
    [1,1,1,1],
    [1,2,2,2],
    [1,3,3,3],
    [2,1,2,3],
    [2,2,3,1],
    [2,3,1,2],
    [3,1,3,2],
    [3,2,1,3],
    [3,3,2,1]
  ];

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 16px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("آرایه متعامد L9(3⁴)", w/2, 30);

    // Column headers
    const cols = 4;
    const rows = 9;
    const colW = Math.min((w - 80) / cols, 100);
    const rowH = Math.min((h - 100) / (rows + 1), 40);
    const startX = (w - cols * colW) / 2;
    const startY = 60;

    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "center";
    for(let c = 0; c < cols; c++){
      ctx.fillText("فاکتور " + (c+1), startX + colW * (c + 0.5), startY - 8);
    }

    // Row labels
    ctx.fillStyle = "#7a8fa8";
    ctx.font = "11px Vazirmatn";
    ctx.textAlign = "right";
    for(let r = 0; r < rows; r++){
      ctx.fillText("آزمایش " + (r+1), startX - 8, startY + rowH * (r + 0.5) + 4);
    }

    // Grid
    const levelColors = {
      1: "#4dd4ff",
      2: "#f5c76a",
      3: "#a78bfa"
    };

    for(let r = 0; r < rows; r++){
      for(let c = 0; c < cols; c++){
        const x = startX + c * colW;
        const y = startY + r * rowH;
        const val = L9[r][c];
        const color = levelColors[val];

        // Cell background
        ctx.fillStyle = color + "22";
        ctx.fillRect(x + 1, y + 1, colW - 2, rowH - 2);

        // Cell border
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 1, y + 1, colW - 2, rowH - 2);

        // Value
        ctx.fillStyle = color;
        ctx.font = "bold 15px Vazirmatn";
        ctx.textAlign = "center";
        ctx.fillText(val, x + colW/2, y + rowH/2 + 5);
      }
    }

    // Legend
    ctx.font = "12px Vazirmatn";
    ctx.textAlign = "center";
    const legendY = startY + rows * rowH + 25;
    ctx.fillStyle = "#4dd4ff";
    ctx.fillText("● سطح ۱", startX + 30, legendY);
    ctx.fillStyle = "#f5c76a";
    ctx.fillText("● سطح ۲", startX + colW + 30, legendY);
    ctx.fillStyle = "#a78bfa";
    ctx.fillText("● سطح ۳", startX + colW*2 + 30, legendY);

    // Info
    ctx.fillStyle = "#7a8fa8";
    ctx.font = "11px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("هر سطح دقیقاً ۳ بار در هر ستون ظاهر می‌شود", w/2, legendY + 24);
  }

  resetBtn.onclick = () => { draw(); playClick(); };
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = draw;
})();

/* ============================================================
   SIM 3 — S/N RATIO
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const sig_s = document.getElementById("sim3_sig");
  const noise_s = document.getElementById("sim3_noise");
  const infoEl = document.getElementById("sim3_info");

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const sig = +sig_s.value;
    const noise = +noise_s.value;

    // S/N for "larger is better"
    const snLarger = 20 * Math.log10(sig) - 10 * Math.log10(1 + (noise/sig)**2);
    const snValue = -10 * Math.log10((1/sig**2) + (noise**2)/(sig**4));
    // Simpler: -10*log10(mean(1/y^2)) for larger-better
    const sn = -10 * Math.log10(1/(sig*sig) + (noise*noise)/(sig**4));

    document.getElementById("sim3_sig_val").textContent = sig.toFixed(1);
    document.getElementById("sim3_noise_val").textContent = noise.toFixed(1);
    document.getElementById("sim3_sn").textContent = isFinite(sn) ? sn.toFixed(2) + " dB" : "—";

    const ratingEl = document.getElementById("sim3_rating");
    if(noise / sig < 0.1){
      ratingEl.textContent = "عالی";
      ratingEl.style.color = "#5ee8a8";
      infoEl.innerHTML = `<b>نویز بسیار کم:</b> سیگنال تقریباً خالص است. S/N بالاست — مقاوم‌سازی عالی.`;
    } else if(noise / sig < 0.3){
      ratingEl.textContent = "خوب";
      ratingEl.style.color = "#f5c76a";
      infoEl.innerHTML = `<b>نویز متوسط:</b> S/N قابل قبول. اما می‌توان با کاهش نویز بهتر کرد.`;
    } else {
      ratingEl.textContent = "ضعیف";
      ratingEl.style.color = "#ff7e93";
      infoEl.innerHTML = `<b>نویز بالا:</b> S/N پایین. نیاز به کاهش نویز یا افزایش سیگنال.`;
    }

    // Draw signal + noise
    const padding = 40;
    const plotW = w - 2 * padding;
    const plotH = h - 2 * padding - 60;
    const baseY = padding + plotH / 2;
    const yScale = plotH / (2 * Math.max(sig + 3*noise, 10));

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i=0; i<=10; i++){
      const x = padding + plotW * i / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + plotH);
      ctx.stroke();
    }
    // Center line
    ctx.beginPath();
    ctx.moveTo(padding, baseY);
    ctx.lineTo(padding + plotW, baseY);
    ctx.strokeStyle = "rgba(120,160,220,0.3)";
    ctx.stroke();

    // Signal (sine) + noise
    const N = 200;
    ctx.beginPath();
    for(let i=0; i<=N; i++){
      const x = padding + plotW * i / N;
      const t = i / N * 4 * Math.PI;
      const signal = sig * Math.sin(t);
      const noiseVal = (Math.random() - 0.5) * 2 * noise;
      const y = baseY - (signal + noiseVal) * yScale;
      if(i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#4dd4ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pure signal
    ctx.beginPath();
    for(let i=0; i<=N; i++){
      const x = padding + plotW * i / N;
      const t = i / N * 4 * Math.PI;
      const signal = sig * Math.sin(t);
      const y = baseY - signal * yScale;
      if(i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.fillText("سیگنال + نویز", padding, padding - 10);
    ctx.fillStyle = "#f5c76a";
    ctx.fillText("سیگنال خالص", padding + 120, padding - 10);

    // S/N indicator
    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText(`S/N = ${isFinite(sn) ? sn.toFixed(2) : "—"} dB`, w/2, h - 20);
  }

  [sig_s, noise_s].forEach(s => {
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