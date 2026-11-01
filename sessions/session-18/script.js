/* ============================================================
   جلسه ۱۸ — LLM و Prompt Engineering
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: LLM Scaling، LLM Comparison، Prompt Builder
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
   SIM 1 — LLM SCALING
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const idx_s = document.getElementById("sim1_idx");
  const infoEl = document.getElementById("sim1_info");

  const models = [
    { name: "GPT-1", year: 2018, params: 117e6, paramsLabel: "117M" },
    { name: "GPT-2", year: 2019, params: 1.5e9, paramsLabel: "1.5B" },
    { name: "GPT-3", year: 2020, params: 175e9, paramsLabel: "175B" },
    { name: "GPT-4", year: 2023, params: 1.7e12, paramsLabel: "~1.7T" }
  ];

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const idx = +idx_s.value;
    const current = models[idx];

    document.getElementById("sim1_idx_val").textContent = idx;
    document.getElementById("sim1_model").textContent = current.name;
    document.getElementById("sim1_params").textContent = current.paramsLabel;
    document.getElementById("sim1_year").textContent = current.year;

    infoEl.innerHTML = `<b>${current.name} (${current.year}):</b> ${current.paramsLabel} پارامتر. رشد نمایی قدرت مدل‌ها.`;

    // Chart layout
    const padding = { top: 50, right: 40, bottom: 60, left: 80 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;
    const baseY = padding.top + plotH;

    // Log scale for params
    const maxLog = Math.log10(1.7e12);
    const minLog = Math.log10(1e8);
    const yScale = (logVal) => padding.top + plotH - ((logVal - minLog) / (maxLog - minLog)) * plotH;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i=0; i<=5; i++){
      const logVal = minLog + (maxLog - minLog) * i / 5;
      const y = yScale(logVal);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotW, y);
      ctx.stroke();

      ctx.fillStyle = "#a8bcd4";
      ctx.font = "11px Vazirmatn";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const label = Math.pow(10, logVal);
      let labelStr;
      if(label >= 1e12) labelStr = (label/1e12).toFixed(1) + "T";
      else if(label >= 1e9) labelStr = (label/1e9).toFixed(1) + "B";
      else if(label >= 1e6) labelStr = (label/1e6).toFixed(0) + "M";
      else labelStr = label.toString();
      ctx.fillText(labelStr, padding.left - 10, y);
    }

    // X axis
    ctx.strokeStyle = "rgba(120,160,220,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, baseY);
    ctx.lineTo(padding.left + plotW, baseY);
    ctx.stroke();

    // Bars
    models.forEach((m, i) => {
      const x = padding.left + plotW * (i + 0.5) / models.length;
      const barW = plotW / models.length * 0.5;
      const barY = yScale(Math.log10(m.params));
      const barH = baseY - barY;

      const isCurrent = i === idx;
      const color = isCurrent ? "#f5c76a" : (i <= idx ? "#4dd4ff" : "rgba(77,212,255,0.3)");

      const grad = ctx.createLinearGradient(0, barY, 0, baseY);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + "33");
      ctx.fillStyle = grad;
      ctx.fillRect(x - barW/2, barY, barW, barH);

      ctx.strokeStyle = color;
      ctx.lineWidth = isCurrent ? 3 : 1.5;
      ctx.strokeRect(x - barW/2, barY, barW, barH);

      // Label
      ctx.fillStyle = isCurrent ? "#f5c76a" : "#fff";
      ctx.font = isCurrent ? "bold 13px Vazirmatn" : "12px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(m.name, x, baseY + 10);

      ctx.fillStyle = "#a8bcd4";
      ctx.font = "10px Vazirmatn";
      ctx.fillText(m.year, x, baseY + 28);

      // Params label
      ctx.fillStyle = color;
      ctx.font = "bold 11px Vazirmatn";
      ctx.textBaseline = "bottom";
      ctx.fillText(m.paramsLabel, x, barY - 5);
    });

    // Y axis label
    ctx.save();
    ctx.translate(20, padding.top + plotH/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("تعداد پارامتر (log scale)", 0, 0);
    ctx.restore();
  }

  idx_s.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = draw;
})();

/* ============================================================
   SIM 2 — LLM COMPARISON
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const infoEl = document.getElementById("sim2_info");
  let currentModel = "gpt";

  const models = {
    gpt: {
      name: "GPT-4o",
      company: "OpenAI",
      color: "#10a37f",
      scores: { quality: 9.5, speed: 8, cost: 4, context: 8, multimodal: 9 },
      description: "قوی‌ترین مدل عمومی، چندوجهی، سریع، اما گران"
    },
    claude: {
      name: "Claude 3.5",
      company: "Anthropic",
      color: "#d97757",
      scores: { quality: 9.3, speed: 8.5, cost: 5, context: 9.5, multimodal: 8 },
      description: "عالی برای متون طولانی، ایمن، با Context بزرگ"
    },
    gemini: {
      name: "Gemini 1.5",
      company: "Google",
      color: "#4285f4",
      scores: { quality: 9.2, speed: 8, cost: 6, context: 10, multimodal: 9.5 },
      description: "Context عظیم (۲ میلیون توکن)، چندوجهی، رایگان"
    },
    deepseek: {
      name: "DeepSeek-V3",
      company: "DeepSeek",
      color: "#6366f1",
      scores: { quality: 9, speed: 7.5, cost: 10, context: 7, multimodal: 5 },
      description: "باز، رایگان، عالی در کد و ریاضی"
    },
    llama: {
      name: "LLaMA 3",
      company: "Meta",
      color: "#1877f2",
      scores: { quality: 8.5, speed: 8, cost: 10, context: 7, multimodal: 4 },
      description: "باز، قابل اجرا محلی، قابل تنظیم"
    }
  };

  const criteria = [
    { key: "quality", label: "کیفیت" },
    { key: "speed", label: "سرعت" },
    { key: "cost", label: "صرفه‌جویی" },
    { key: "context", label: "Context" },
    { key: "multimodal", label: "چندوجهی" }
  ];

  // Button handlers
  document.querySelectorAll("#sim2_btns button").forEach(btn => {
    btn.onclick = () => {
      currentModel = btn.dataset.model;
      document.querySelectorAll("#sim2_btns button").forEach(b => {
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

    const model = models[currentModel];

    document.getElementById("sim2_model").textContent = model.name;
    document.getElementById("sim2_quality").textContent = model.scores.quality.toFixed(1) + "/10";
    document.getElementById("sim2_speed").textContent = model.scores.speed.toFixed(1) + "/10";
    document.getElementById("sim2_cost").textContent = model.scores.cost.toFixed(1) + "/10";
    infoEl.innerHTML = `<b>${model.name} (${model.company}):</b> ${model.description}`;

    // Layout: left radar, right bars
    const leftW = w * 0.45;
    const rightW = w * 0.55;
    const cx = leftW / 2 + 20;
    const cy = h / 2 + 20;
    const maxR = Math.min(leftW, h) * 0.32;

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`${model.name} — ${model.company}`, w/2, 15);

    // Radar
    const n = criteria.length;

    // Grid rings
    for(let ring=1; ring<=5; ring++){
      ctx.beginPath();
      const r = maxR * ring / 5;
      for(let i=0; i<=n; i++){
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
    for(let i=0; i<n; i++){
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = "rgba(120,160,220,0.2)";
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    criteria.forEach((c, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      const r = maxR * (model.scores[c.key] / 10);
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if(i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = model.color + "44";
    ctx.fill();
    ctx.strokeStyle = model.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = model.color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Data points
    criteria.forEach((c, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      const r = maxR * (model.scores[c.key] / 10);
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI*2);
      ctx.fillStyle = model.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Labels
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    criteria.forEach((c, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      const lx = cx + Math.cos(angle) * (maxR + 22);
      const ly = cy + Math.sin(angle) * (maxR + 22);
      ctx.fillText(c.label, lx, ly);
    });

    // Right side: detailed bars
    const barsX = leftW + 40;
    const barsY = 80;
    const barsW = rightW - 80;
    const barH = 25;
    const gap = 15;

    criteria.forEach((c, i) => {
      const y = barsY + i * (barH + gap);
      const val = model.scores[c.key];
      const barW = (val / 10) * barsW;

      // Label
      ctx.fillStyle = "#a8bcd4";
      ctx.font = "bold 12px Vazirmatn";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(c.label, barsX - 10, y + barH/2);

      // Background
      ctx.fillStyle = "rgba(120,140,160,0.1)";
      ctx.fillRect(barsX, y, barsW, barH);

      // Bar
      const grad = ctx.createLinearGradient(barsX, 0, barsX + barW, 0);
      grad.addColorStop(0, model.color + "aa");
      grad.addColorStop(1, model.color);
      ctx.fillStyle = grad;
      ctx.fillRect(barsX, y, barW, barH);

      // Border
      ctx.strokeStyle = model.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barsX, y, barW, barH);

      // Value
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Vazirmatn";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(val.toFixed(1), barsX + barW + 8, y + barH/2);
    });
  }

  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = draw;
})();

/* ============================================================
   SIM 3 — PROMPT BUILDER
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const infoEl = document.getElementById("sim3_info");

  const parts = {
    role: {
      name: "Role",
      nameFa: "نقش",
      color: "#4dd4ff",
      content: "تو یک مهندس مکانیک ارشد هستی...",
      icon: "👨‍💼"
    },
    task: {
      name: "Task",
      nameFa: "وظیفه",
      color: "#a78bfa",
      content: "کد Python برای شبیه‌سازی جرم-فنر-دمپر بنویس...",
      icon: "🎯"
    },
    context: {
      name: "Context",
      nameFa: "زمینه",
      color: "#5ee8a8",
      content: "m=1kg، k=10N/m، c=0.5Ns/m، شرایط اولیه x₀=0.1m",
      icon: "📋"
    },
    format: {
      name: "Format",
      nameFa: "قالب",
      color: "#f5c76a",
      content: "با Matplotlib، همراه با توضیحات فارسی، کد قابل اجرا",
      icon: "📐"
    }
  };

  let selected = new Set();

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const keys = Object.keys(parts);
    const count = selected.size;

    document.getElementById("sim3_count").textContent = `${count} / 4`;

    const qualityEl = document.getElementById("sim3_quality");
    if(count === 0){
      qualityEl.textContent = "ضعیف";
      qualityEl.style.color = "#ff7e93";
    } else if(count === 1){
      qualityEl.textContent = "ساده";
      qualityEl.style.color = "#f5c76a";
    } else if(count === 2){
      qualityEl.textContent = "متوسط";
      qualityEl.style.color = "#4dd4ff";
    } else if(count === 3){
      qualityEl.textContent = "خوب";
      qualityEl.style.color = "#5ee8a8";
    } else {
      qualityEl.textContent = "عالی ✓";
      qualityEl.style.color = "#5ee8a8";
    }

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Prompt Builder — ساخت Prompt", w/2, 15);

    // Prompt preview box
    const boxY = 50;
    const boxH = 80;
    const boxX = 40;
    const boxW = w - 80;

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = count === 4 ? "#5ee8a8" : "rgba(120,160,220,0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("Prompt نهایی:", boxX + boxW - 10, boxY + 8);

    // Compose prompt text
    let promptText = "";
    keys.forEach(k => {
      if(selected.has(k)){
        promptText += parts[k].content + " ";
      }
    });

    ctx.fillStyle = count === 4 ? "#5ee8a8" : "#fff";
    ctx.font = "13px Vazirmatn";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    if(promptText === ""){
      ctx.fillStyle = "#ff7e93";
      ctx.fillText("(هیچ جزئی انتخاب نشده)", boxX + boxW - 15, boxY + 35);
    } else {
      // Wrap text
      const maxWidth = boxW - 30;
      const words = promptText.split(" ");
      let line = "";
      let lineY = boxY + 30;
      words.forEach(word => {
        const test = line + word + " ";
        if(ctx.measureText(test).width > maxWidth && line !== ""){
          ctx.fillText(line, boxX + boxW - 15, lineY);
          line = word + " ";
          lineY += 20;
        } else {
          line = test;
        }
      });
      if(line !== ""){
        ctx.fillText(line, boxX + boxW - 15, lineY);
      }
    }

    // Component cards (4 cards in a row)
    const cardY = boxY + boxH + 40;
    const cardW = (w - 100) / 4;
    const cardH = cardY + 120 < h ? 120 : h - cardY - 20;
    const gap = 20;

    keys.forEach((k, i) => {
      const p = parts[k];
      const x = 40 + i * (cardW + gap);
      const isSelected = selected.has(k);

      // Card background
      ctx.fillStyle = isSelected ? p.color + "33" : p.color + "11";
      ctx.fillRect(x, cardY, cardW, cardH);

      // Border
      ctx.strokeStyle = p.color;
      ctx.lineWidth = isSelected ? 3 : 1.5;
      if(isSelected){
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
      }
      ctx.strokeRect(x, cardY, cardW, cardH);
      ctx.shadowBlur = 0;

      // Icon
      ctx.font = "28px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(p.icon, x + cardW/2, cardY + 15);

      // Name (English)
      ctx.fillStyle = p.color;
      ctx.font = "bold 14px Vazirmatn";
      ctx.fillText(p.name, x + cardW/2, cardY + 55);

      // Name (Persian)
      ctx.fillStyle = "#fff";
      ctx.font = "12px Vazirmatn";
      ctx.fillText(p.nameFa, x + cardW/2, cardY + 78);

      // Checkmark if selected
      if(isSelected){
        ctx.fillStyle = "#5ee8a8";
        ctx.font = "bold 24px Vazirmatn";
        ctx.fillText("✓", x + cardW/2, cardY + cardH - 35);
      }

      // Button label
      ctx.fillStyle = "#a8bcd4";
      ctx.font = "10px Vazirmatn";
      ctx.fillText(isSelected ? "انتخاب شده" : "کلیک کنید", x + cardW/2, cardY + cardH - 15);
    });

    // Info
    if(count === 0){
      infoEl.innerHTML = "<b>راهنما:</b> روی هر جزء کلیک کنید تا Prompt غنی‌تر شود.";
    } else if(count === 4){
      infoEl.innerHTML = "<b>✓ Prompt کامل!</b> همه ۴ جزء انتخاب شده. این Prompt بهترین نتیجه را می‌دهد.";
    } else {
      infoEl.innerHTML = `<b>${count} از ۴ جزء</b> انتخاب شده. برای Prompt کامل، همه اجزا را اضافه کنید.`;
    }
  }

  // Button handlers
  document.querySelectorAll("#sim3_btns button").forEach(btn => {
    btn.onclick = () => {
      const part = btn.dataset.part;
      if(selected.has(part)){
        selected.delete(part);
        btn.classList.remove("btnPrimary");
        btn.classList.add("btnSecondary");
      } else {
        selected.add(part);
        btn.classList.remove("btnSecondary");
        btn.classList.add("btnPrimary");
      }
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