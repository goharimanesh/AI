/* ============================================================
   جلسه ۱۹ — RAG و AI Agent
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: RAG Pipeline، Vector Search، Agent Loop
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
   SIM 1 — RAG PIPELINE
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const stepBtn = document.getElementById("sim1_step");
  const resetBtn = document.getElementById("sim1_reset");
  const queryInput = document.getElementById("sim1_query");
  const infoEl = document.getElementById("sim1_info");

  const stages = [
    { name: "Query", nameFa: "سؤال", icon: "❓", desc: "سؤال کاربر دریافت شد" },
    { name: "Embed", nameFa: "بردارسازی", icon: "🔢", desc: "سؤال به بردار تبدیل شد" },
    { name: "Search", nameFa: "جست‌وجو", icon: "🔍", desc: "جست‌وجو در Vector DB" },
    { name: "Retrieve", nameFa: "بازیابی", icon: "📄", desc: "۳ سند مرتبط پیدا شد" },
    { name: "Generate", nameFa: "تولید", icon: "💬", desc: "LLM پاسخ را تولید کرد" }
  ];

  let currentStage = 0;

  function reset(){
    currentStage = 0;
    document.getElementById("sim1_stage").textContent = "0 / 5";
    document.getElementById("sim1_docs").textContent = "0";
    document.getElementById("sim1_status").textContent = "آماده";
    document.getElementById("sim1_status").style.color = "#a8bcd4";
    infoEl.innerHTML = "<b>راهنما:</b> «گام بعدی» را بزنید تا مراحل RAG را ببینید.";
    draw();
    playClick();
  }

  function step(){
    if(currentStage >= stages.length) return;
    currentStage++;
    document.getElementById("sim1_stage").textContent = `${currentStage} / 5`;

    if(currentStage === 4){
      document.getElementById("sim1_docs").textContent = "3";
    }

    if(currentStage === 5){
      document.getElementById("sim1_status").textContent = "✓ کامل";
      document.getElementById("sim1_status").style.color = "#5ee8a8";
    } else {
      document.getElementById("sim1_status").textContent = "در حال اجرا";
      document.getElementById("sim1_status").style.color = "#f5c76a";
    }

    infoEl.innerHTML = `<b>مرحله ${currentStage}:</b> ${stages[currentStage-1].desc}`;
    draw();
    playClick();
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const query = queryInput.value || "سؤال شما";

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("RAG Pipeline", w/2, 15);

    // Query display
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "13px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText(`Query: "${query}"`, w/2, 40);

    // Pipeline layout
    const padding = 40;
    const stageW = (w - 2*padding - 4*15) / 5;
    const stageY = h/2 - 30;
    const stageH = 80;

    stages.forEach((stage, i) => {
      const x = padding + i * (stageW + 15);
      const isDone = i < currentStage;
      const isActive = i === currentStage - 1;
      const isNext = i === currentStage;

      // Color
      let color = "#607694";
      if(isDone) color = "#5ee8a8";
      else if(isActive) color = "#f5c76a";
      else if(isNext) color = "#4dd4ff";

      // Box
      ctx.fillStyle = isDone ? "rgba(94,232,168,0.15)" :
                       isActive ? "rgba(245,199,106,0.2)" :
                       isNext ? "rgba(77,212,255,0.1)" :
                       "rgba(120,140,160,0.08)";
      ctx.fillRect(x, stageY, stageW, stageH);

      ctx.strokeStyle = color;
      ctx.lineWidth = isDone || isActive ? 3 : 1.5;
      if(isActive){
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
      }
      ctx.strokeRect(x, stageY, stageW, stageH);
      ctx.shadowBlur = 0;

      // Icon
      ctx.font = "24px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = color;
      ctx.fillText(stage.icon, x + stageW/2, stageY + 10);

      // Name (English)
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Vazirmatn";
      ctx.fillText(stage.name, x + stageW/2, stageY + 45);

      // Name (Persian)
      ctx.fillStyle = "#a8bcd4";
      ctx.font = "10px Vazirmatn";
      ctx.fillText(stage.nameFa, x + stageW/2, stageY + 62);

      // Arrow between stages
      if(i < stages.length - 1){
        const arrowX = x + stageW + 7;
        const arrowY = stageY + stageH/2;
        ctx.strokeStyle = i < currentStage - 1 ? "#5ee8a8" : "rgba(120,160,220,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(arrowX - 5, arrowY);
        ctx.lineTo(arrowX + 5, arrowY);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(arrowX + 2, arrowY - 3);
        ctx.lineTo(arrowX + 5, arrowY);
        ctx.lineTo(arrowX + 2, arrowY + 3);
        ctx.stroke();
      }
    });

    // Documents display
    if(currentStage >= 4){
      const docY = stageY + stageH + 30;
      ctx.fillStyle = "#a8bcd4";
      ctx.font = "bold 12px Vazirmatn";
      ctx.textAlign = "center";
      ctx.fillText("📄 اسناد بازیابی‌شده:", w/2, docY);

      const docs = [
        "سند ۱: قانون هوک — F = kx",
        "سند ۲: کشش فنر و انرژی",
        "سند ۳: کاربردهای قانون هوک"
      ];

      docs.forEach((doc, i) => {
        const dy = docY + 20 + i * 22;
        ctx.fillStyle = "rgba(94,232,168,0.15)";
        ctx.fillRect(w/2 - 180, dy, 360, 18);
        ctx.strokeStyle = "#5ee8a8";
        ctx.lineWidth = 1;
        ctx.strokeRect(w/2 - 180, dy, 360, 18);
        ctx.fillStyle = "#fff";
        ctx.font = "11px Vazirmatn";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(doc, w/2 + 170, dy + 9);
      });
    }

    // Final answer
    if(currentStage >= 5){
      const ansY = stageY + stageH + 130;
      ctx.fillStyle = "#f5c76a";
      ctx.font = "bold 12px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("💬 پاسخ نهایی (با ارجاع):", w/2, ansY);

      ctx.fillStyle = "rgba(245,199,106,0.15)";
      ctx.fillRect(w/2 - 200, ansY + 20, 400, 50);
      ctx.strokeStyle = "#f5c76a";
      ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 200, ansY + 20, 400, 50);

      ctx.fillStyle = "#fff";
      ctx.font = "12px Vazirmatn";
      ctx.textAlign = "center";
      ctx.fillText("«قانون هوک: F = kx (سند ۱ و ۳)»", w/2, ansY + 40);
    }
  }

  stepBtn.onclick = step;
  resetBtn.onclick = reset;
  queryInput.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = () => { currentStage = 0; draw(); };
})();

/* ============================================================
   SIM 2 — VECTOR SEARCH
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const q_s = document.getElementById("sim2_q");
  const infoEl = document.getElementById("sim2_info");

  // Documents with 2D embeddings (x, y)
  const documents = [
    { id: "D1", text: "قانون هوک و کشش فنر", x: 2.0, y: 2.5, color: "#4dd4ff" },
    { id: "D2", text: "معادلات حرکت نیوتن", x: 3.5, y: 3.0, color: "#a78bfa" },
    { id: "D3", text: "الگوریتم ژنتیک و بهینه‌سازی", x: 7.5, y: 7.0, color: "#5ee8a8" },
    { id: "D4", text: "شبکه عصبی و یادگیری عمیق", x: 8.0, y: 6.5, color: "#f5c76a" },
    { id: "D5", text: "میرایی و ارتعاشات", x: 2.5, y: 3.2, color: "#f472b6" }
  ];

  const queries = [
    { text: "کشش فنر", x: 2.2, y: 2.6 },
    { text: "شبکه عصبی", x: 7.8, y: 6.8 },
    { text: "بهینه‌سازی", x: 7.2, y: 7.2 },
    { text: "ارتعاشات", x: 2.8, y: 3.0 },
    { text: "دینامیک", x: 3.3, y: 3.1 }
  ];

  function cosineSim(a, b){
    const dot = a.x*b.x + a.y*b.y;
    const magA = Math.sqrt(a.x*a.x + a.y*a.y);
    const magB = Math.sqrt(b.x*b.x + b.y*b.y);
    return dot / (magA * magB);
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const qIdx = +q_s.value;
    const query = queries[qIdx];

    document.getElementById("sim2_q_val").textContent = qIdx;
    document.getElementById("sim2_query").textContent = query.text;

    // Compute similarities
    const sims = documents.map(d => ({
      ...d,
      sim: cosineSim(d, query)
    })).sort((a, b) => b.sim - a.sim);

    document.getElementById("sim2_top").textContent = sims[0].id;
    document.getElementById("sim2_sim").textContent = (sims[0].sim * 100).toFixed(1) + "%";

    infoEl.innerHTML = `<b>نزدیک‌ترین سند:</b> ${sims[0].id} — "${sims[0].text}" با شباهت ${(sims[0].sim * 100).toFixed(1)}%`;

    // Layout
    const padding = 60;
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

    // Convert data coords to screen
    const toPx = (x, y) => ({
      px: padding + (x / 10) * plotW,
      py: baseY - (y / 10) * plotH
    });

    // Draw connection line from query to nearest
    const qPx = toPx(query.x, query.y);
    const topPx = toPx(sims[0].x, sims[0].y);

    ctx.strokeStyle = "rgba(245,199,106,0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(qPx.px, qPx.py);
    ctx.lineTo(topPx.px, topPx.py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw documents
    documents.forEach(doc => {
      const pos = toPx(doc.x, doc.y);
      const isTop = doc.id === sims[0].id;

      // Glow if top
      if(isTop){
        ctx.beginPath();
        ctx.arc(pos.px, pos.py, 20, 0, Math.PI*2);
        const grad = ctx.createRadialGradient(pos.px, pos.py, 0, pos.px, pos.py, 20);
        grad.addColorStop(0, "rgba(245,199,106,0.5)");
        grad.addColorStop(1, "rgba(245,199,106,0)");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Point
      ctx.beginPath();
      ctx.arc(pos.px, pos.py, isTop ? 12 : 8, 0, Math.PI*2);
      ctx.fillStyle = doc.color;
      ctx.fill();
      ctx.strokeStyle = isTop ? "#f5c76a" : "#fff";
      ctx.lineWidth = isTop ? 3 : 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(doc.id, pos.px, pos.py);

      // Text label below
      ctx.fillStyle = doc.color;
      ctx.font = "9px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const shortText = doc.text.length > 12 ? doc.text.substring(0, 12) + "…" : doc.text;
      ctx.fillText(shortText, pos.px, pos.py + 15);
    });

    // Draw query
    ctx.beginPath();
    ctx.arc(qPx.px, qPx.py, 10, 0, Math.PI*2);
    ctx.fillStyle = "#f5c76a";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Q", qPx.px, qPx.py);

    // Query label
    ctx.fillStyle = "#f5c76a";
    ctx.font = "bold 11px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`Query: ${query.text}`, qPx.px, qPx.py - 15);

    // Legend
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("● اسناد", 15, 15);
    ctx.fillStyle = "#f5c76a";
    ctx.fillText("● Query", 15, 40);
    ctx.fillText("┄ نزدیک‌ترین", 15, 65);
  }

  q_s.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = draw;
})();

/* ============================================================
   SIM 3 — AGENT LOOP
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const stepBtn = document.getElementById("sim3_step");
  const resetBtn = document.getElementById("sim3_reset");
  const infoEl = document.getElementById("sim3_info");

  const phases = [
    { name: "Observe", nameFa: "مشاهده", icon: "👁", desc: "Agent محیط را مشاهده می‌کند — سؤال کاربر" },
    { name: "Think", nameFa: "تفکر", icon: "🧠", desc: "Agent تصمیم می‌گیرد چه کاری انجام دهد" },
    { name: "Plan", nameFa: "برنامه‌ریزی", icon: "📋", desc: "Agent مراحل را می‌سازد" },
    { name: "Act", nameFa: "اقدام", icon: "🎯", desc: "Agent ابزار (جست‌وجو، کد، ...) را فرا می‌خواند" },
    { name: "Observe Result", nameFa: "بررسی نتیجه", icon: "🔍", desc: "Agent نتیجه را می‌بیند" },
    { name: "Repeat or Answer", nameFa: "تکرار یا پاسخ", icon: "💡", desc: "اگر کافی است پاسخ می‌دهد، وگرنه تکرار" }
  ];

  let currentPhase = 0;

  function reset(){
    currentPhase = 0;
    document.getElementById("sim3_step_n").textContent = "0";
    document.getElementById("sim3_phase").textContent = "—";
    document.getElementById("sim3_status").textContent = "آماده";
    document.getElementById("sim3_status").style.color = "#a8bcd4";
    infoEl.innerHTML = "<b>راهنما:</b> «گام بعدی» را بزنید.";
    draw();
    playClick();
  }

  function step(){
    if(currentPhase >= phases.length) return;
    currentPhase++;
    document.getElementById("sim3_step_n").textContent = currentPhase;
    document.getElementById("sim3_phase").textContent = phases[currentPhase-1].nameFa;

    if(currentPhase === phases.length){
      document.getElementById("sim3_status").textContent = "✓ پاسخ داده شد";
      document.getElementById("sim3_status").style.color = "#5ee8a8";
    } else {
      document.getElementById("sim3_status").textContent = "در حال اجرا";
      document.getElementById("sim3_status").style.color = "#f5c76a";
    }

    infoEl.innerHTML = `<b>${phases[currentPhase-1].name}:</b> ${phases[currentPhase-1].desc}`;
    draw();
    playClick();
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 && h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const cx = w/2;
    const cy = h/2;
    const radius = Math.min(w, h) * 0.3;

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Agent Loop — حلقه Agent", w/2, 15);

    // Draw circular phases
    const n = phases.length;
    phases.forEach((phase, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI/2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      const isDone = i < currentPhase - 1;
      const isActive = i === currentPhase - 1;

      let color = "#607694";
      if(isDone) color = "#5ee8a8";
      else if(isActive) color = "#f5c76a";

      // Glow if active
      if(isActive){
        ctx.beginPath();
        ctx.arc(px, py, 40, 0, Math.PI*2);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 40);
        grad.addColorStop(0, "rgba(245,199,106,0.5)");
        grad.addColorStop(1, "rgba(245,199,106,0)");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Circle
      ctx.beginPath();
      ctx.arc(px, py, 30, 0, Math.PI*2);
      ctx.fillStyle = color + "33";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = isActive ? 3 : 2;
      ctx.stroke();

      // Icon
      ctx.font = "22px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.fillText(phase.icon, px, py - 5);

      // Label
      ctx.fillStyle = isActive ? "#f5c76a" : "#fff";
      ctx.font = "bold 9px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(phase.nameFa, px, py + 18);
    });

    // Draw arrows between phases (circular)
    phases.forEach((phase, i) => {
      const nextI = (i + 1) % n;
      const angle1 = (i / n) * Math.PI * 2 - Math.PI/2;
      const angle2 = (nextI / n) * Math.PI * 2 - Math.PI/2;

      const startX = cx + Math.cos(angle1) * (radius + 25);
      const startY = cy + Math.sin(angle1) * (radius + 25);
      const endX = cx + Math.cos(angle2) * (radius + 25);
      const endY = cy + Math.sin(angle2) * (radius + 25);

      const isDone = i < currentPhase - 1;
      ctx.strokeStyle = isDone ? "rgba(94,232,168,0.6)" : "rgba(120,160,220,0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });

    // Center: status
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if(currentPhase === 0){
      ctx.fillText("آماده", cx, cy);
    } else if(currentPhase < phases.length){
      ctx.fillStyle = "#f5c76a";
      ctx.fillText(`مرحله ${currentPhase}`, cx, cy);
    } else {
      ctx.fillStyle = "#5ee8a8";
      ctx.fillText("✓", cx, cy - 10);
      ctx.font = "bold 12px Vazirmatn";
      ctx.fillText("پاسخ داده شد", cx, cy + 15);
    }

    // Mission text
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "11px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("مأموریت: «قیمت فولاد را پیدا کن و هزینه ۱۰۰ کیلو را حساب کن»", w/2, h - 30);
  }

  stepBtn.onclick = step;
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim3 = () => { currentPhase = 0; draw(); };
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