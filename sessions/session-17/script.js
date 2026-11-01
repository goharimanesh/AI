/* ============================================================
   جلسه ۱۷ — NLP و Transformer
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Tokenizer، Attention، Transformer Components
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
   SIM 1 — TOKENIZER
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const input_s = document.getElementById("sim1_input");
  const infoEl = document.getElementById("sim1_info");

  // Simple word-level tokenizer with fake token IDs
  function tokenize(text){
    // Split by whitespace and punctuation
    const words = text.match(/[a-zA-Z\u0600-\u06FF]+|[^\s\w]/g) || [];
    return words.map(w => ({
      word: w,
      id: Math.abs(hashCode(w)) % 50000
    }));
  }

  function hashCode(str){
    let hash = 0;
    for(let i=0; i<str.length; i++){
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const text = input_s.value || "";
    const tokens = tokenize(text);

    document.getElementById("sim1_count").textContent = tokens.length;
    document.getElementById("sim1_len").textContent = text.length;
    document.getElementById("sim1_ratio").textContent = text.length > 0 ? (tokens.length / text.length).toFixed(2) : "0";

    if(tokens.length === 0){
      infoEl.innerHTML = "<b>راهنما:</b> یک متن وارد کنید.";
      return;
    }

    // Layout: token cards
    const padding = 20;
    const cardW = 90;
    const cardH = 90;
    const gap = 10;
    const cols = Math.floor((w - 2*padding) / (cardW + gap));
    const rows = Math.ceil(tokens.length / cols);
    const totalH = rows * (cardH + gap);
    const startY = Math.max(60, (h - totalH) / 2);
    const startX = (w - cols * (cardW + gap) + gap) / 2;

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`"${text.length > 40 ? text.substring(0,40) + '...' : text}"`, w/2, 15);

    // Arrow to tokens
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "13px Vazirmatn";
    ctx.fillText("↓", w/2, 40);

    // Token cards
    tokens.forEach((tok, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);

      // Card
      const colors = ["#4dd4ff", "#f5c76a", "#a78bfa", "#5ee8a8", "#f472b6"];
      const color = colors[i % colors.length];

      ctx.fillStyle = color + "22";
      ctx.fillRect(x, y, cardW, cardH);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cardW, cardH);

      // Word
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const displayWord = tok.word.length > 8 ? tok.word.substring(0,7) + "…" : tok.word;
      ctx.fillText(displayWord, x + cardW/2, y + cardH/2 - 15);

      // Separator
      ctx.strokeStyle = "rgba(120,160,220,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + cardH/2);
      ctx.lineTo(x + cardW - 10, y + cardH/2);
      ctx.stroke();

      // Token ID
      ctx.fillStyle = color;
      ctx.font = "bold 12px Vazirmatn";
      ctx.fillText(tok.id, x + cardW/2, y + cardH/2 + 15);

      // Position number
      ctx.fillStyle = "rgba(120,160,220,0.5)";
      ctx.font = "10px Vazirmatn";
      ctx.fillText(i + 1, x + 12, y + 12);
    });

    infoEl.innerHTML = `<b>تعداد توکن: ${tokens.length}</b> — هر توکن به یک ID عددی تبدیل شد (شبیه GPT/BERT).`;
  }

  input_s.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = draw;
})();

/* ============================================================
   SIM 2 — ATTENTION VISUALIZATION
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const focus_s = document.getElementById("sim2_focus");
  let currentSentence = 0;

  const sentences = [
    {
      words: ["The", "cat", "sat", "on", "the", "mat"],
      // Attention matrix (approximate): row i attends to column j
      attn: [
        [0.7, 0.1, 0.05, 0.05, 0.05, 0.05],
        [0.15, 0.5, 0.15, 0.05, 0.1, 0.05],
        [0.05, 0.4, 0.4, 0.05, 0.05, 0.05],
        [0.05, 0.05, 0.1, 0.4, 0.15, 0.25],
        [0.1, 0.05, 0.05, 0.1, 0.4, 0.3],
        [0.05, 0.05, 0.05, 0.4, 0.15, 0.3]
      ]
    },
    {
      words: ["The", "animal", "did", "not", "cross", "it", "was", "tired"],
      attn: [
        [0.6, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
        [0.1, 0.5, 0.1, 0.05, 0.05, 0.05, 0.05, 0.1],
        [0.05, 0.2, 0.4, 0.1, 0.1, 0.05, 0.05, 0.05],
        [0.05, 0.1, 0.2, 0.3, 0.2, 0.05, 0.05, 0.05],
        [0.1, 0.1, 0.1, 0.1, 0.4, 0.1, 0.05, 0.05],
        [0.05, 0.35, 0.05, 0.05, 0.05, 0.35, 0.05, 0.05],
        [0.05, 0.1, 0.1, 0.05, 0.05, 0.3, 0.25, 0.1],
        [0.05, 0.15, 0.05, 0.05, 0.05, 0.25, 0.1, 0.3]
      ]
    },
    {
      words: ["Ali", "poured", "water", "on", "the", "fire", "that", "he", "lit"],
      attn: [
        [0.7, 0.1, 0.05, 0.05, 0.05, 0.05, 0.0, 0.0, 0.0],
        [0.2, 0.4, 0.2, 0.05, 0.05, 0.05, 0.05, 0.0, 0.0],
        [0.1, 0.3, 0.3, 0.1, 0.1, 0.05, 0.05, 0.0, 0.0],
        [0.05, 0.1, 0.2, 0.3, 0.1, 0.15, 0.1, 0.0, 0.0],
        [0.05, 0.05, 0.1, 0.1, 0.3, 0.3, 0.1, 0.0, 0.0],
        [0.05, 0.05, 0.15, 0.1, 0.15, 0.4, 0.1, 0.0, 0.0],
        [0.05, 0.05, 0.05, 0.05, 0.1, 0.3, 0.3, 0.05, 0.05],
        [0.1, 0.05, 0.05, 0.05, 0.05, 0.15, 0.25, 0.2, 0.1],
        [0.05, 0.1, 0.05, 0.05, 0.05, 0.3, 0.2, 0.1, 0.1]
      ]
    }
  ];

  // Button handlers
  document.querySelectorAll("#sim2_btns button").forEach(btn => {
    btn.onclick = () => {
      currentSentence = parseInt(btn.dataset.sent);
      document.querySelectorAll("#sim2_btns button").forEach(b => {
        b.classList.remove("btnPrimary");
        b.classList.add("btnSecondary");
      });
      btn.classList.remove("btnSecondary");
      btn.classList.add("btnPrimary");
      focus_s.max = sentences[currentSentence].words.length - 1;
      focus_s.value = 0;
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

    const sent = sentences[currentSentence];
    const focus = Math.min(+focus_s.value, sent.words.length - 1);

    document.getElementById("sim2_focus_val").textContent = focus;
    document.getElementById("sim2_word").textContent = sent.words[focus];

    // Find top attention
    const attnRow = sent.attn[focus];
    let topIdx = 0;
    let topVal = 0;
    attnRow.forEach((v, i) => {
      if(v > topVal){ topVal = v; topIdx = i; }
    });
    document.getElementById("sim2_top").textContent = sent.words[topIdx];

    // Layout: words in a horizontal line
    const words = sent.words;
    const n = words.length;
    const wordSpacing = Math.min((w - 100) / n, 130);
    const totalW = n * wordSpacing;
    const startX = (w - totalW) / 2 + wordSpacing / 2;
    const wordY = h - 100;
    const focusY = 100;

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`"${words.join(" ")}"`, w/2, 15);

    // Focus word (top)
    const focusX = startX + focus * wordSpacing;

    // Attention lines from focus to all words
    attnRow.forEach((weight, i) => {
      if(weight < 0.02) return;
      const targetX = startX + i * wordSpacing;
      const alpha = weight * 1.5;
      ctx.strokeStyle = `rgba(245,199,106,${alpha})`;
      ctx.lineWidth = 1 + weight * 12;
      ctx.beginPath();
      ctx.moveTo(focusX, focusY + 30);
      ctx.lineTo(targetX, wordY - 20);
      ctx.stroke();
    });

    // Draw focus word
    ctx.fillStyle = "rgba(77,212,255,0.3)";
    ctx.strokeStyle = "#4dd4ff";
    ctx.lineWidth = 3;
    const focusW = 100;
    const focusH = 40;
    ctx.fillRect(focusX - focusW/2, focusY, focusW, focusH);
    ctx.strokeRect(focusX - focusW/2, focusY, focusW, focusH);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(words[focus], focusX, focusY + focusH/2);

    // Draw target words
    words.forEach((word, i) => {
      const x = startX + i * wordSpacing;
      const weight = attnRow[i];

      // Highlight based on attention
      if(weight > 0.05){
        ctx.fillStyle = `rgba(245,199,106,${weight * 0.8})`;
        ctx.fillRect(x - 45, wordY - 15, 90, 30);
      }

      ctx.strokeStyle = i === focus ? "#4dd4ff" : "rgba(120,160,220,0.4)";
      ctx.lineWidth = i === focus ? 2.5 : 1.5;
      ctx.strokeRect(x - 45, wordY - 15, 90, 30);

      ctx.fillStyle = i === focus ? "#4dd4ff" : "#fff";
      ctx.font = "bold 13px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(word, x, wordY);

      // Weight %
      if(weight > 0.05){
        ctx.fillStyle = "#f5c76a";
        ctx.font = "10px Vazirmatn";
        ctx.fillText((weight * 100).toFixed(0) + "%", x, wordY + 25);
      }
    });

    // Arrow indicator
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("↓ کلمه تمرکز", 20, focusY + 45);
    ctx.fillText("↓ توجه به کلمات دیگر", 20, wordY - 40);
  }

  focus_s.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = () => {
    focus_s.max = sentences[0].words.length - 1;
    focus_s.value = 0;
    draw();
  };
})();

/* ============================================================
   SIM 3 — TRANSFORMER COMPONENTS
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const infoEl = document.getElementById("sim3_info");
  let selectedComp = null;
  let hoveredComp = null;

  const components = [
    {
      id: "input",
      name: "Input Embedding",
      nameEn: "Input Embedding",
      role: "تبدیل توکن به بردار",
      color: "#4dd4ff",
      x: 0.5, y: 0.88,
      w: 120, h: 40
    },
    {
      id: "pos",
      name: "Positional Encoding",
      nameEn: "Positional Encoding",
      role: "افزودن موقعیت",
      color: "#a78bfa",
      x: 0.5, y: 0.76,
      w: 130, h: 35
    },
    {
      id: "self",
      name: "Self-Attention",
      nameEn: "Self-Attention",
      role: "توجه درون‌جمله‌ای",
      color: "#f5c76a",
      x: 0.5, y: 0.6,
      w: 130, h: 45
    },
    {
      id: "add1",
      name: "Add & Norm",
      nameEn: "Add & Norm",
      role: "Residual + LayerNorm",
      color: "#5ee8a8",
      x: 0.5, y: 0.46,
      w: 110, h: 30
    },
    {
      id: "ffn",
      name: "Feed Forward",
      nameEn: "Feed Forward",
      role: "شبکه عصبی دو‌لایه",
      color: "#f472b6",
      x: 0.5, y: 0.32,
      w: 120, h: 40
    },
    {
      id: "add2",
      name: "Add & Norm",
      nameEn: "Add & Norm",
      role: "Residual + LayerNorm",
      color: "#5ee8a8",
      x: 0.5, y: 0.18,
      w: 110, h: 30
    },
    {
      id: "output",
      name: "Output",
      nameEn: "Output",
      role: "بردار خروجی",
      color: "#ff7e93",
      x: 0.5, y: 0.05,
      w: 100, h: 35
    }
  ];

  function getComponentPositions(w, h){
    const positions = {};
    components.forEach(c => {
      positions[c.id] = {
        x: c.x * w,
        y: c.y * h,
        w: c.w,
        h: c.h
      };
    });
    return positions;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 && h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const positions = getComponentPositions(w, h);

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Transformer Encoder Block", w/2, 15);

    // Draw arrows between components
    for(let i=0; i<components.length - 1; i++){
      const c1 = positions[components[i].id];
      const c2 = positions[components[i+1].id];
      const y1 = c1.y - c1.h/2;
      const y2 = c2.y + c2.h/2;

      ctx.strokeStyle = "rgba(120,160,220,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c1.x, y1);
      ctx.lineTo(c2.x, y2);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(c2.x - 5, y2 + 8);
      ctx.lineTo(c2.x, y2);
      ctx.lineTo(c2.x + 5, y2 + 8);
      ctx.stroke();
    }

    // Draw components
    components.forEach(c => {
      const pos = positions[c.id];
      const isHovered = hoveredComp === c.id;
      const isSelected = selectedComp === c.id;
      const highlight = isHovered || isSelected;

      // Box
      ctx.fillStyle = c.color + (highlight ? "55" : "22");
      ctx.fillRect(pos.x - pos.w/2, pos.y - pos.h/2, pos.w, pos.h);

      ctx.strokeStyle = c.color;
      ctx.lineWidth = highlight ? 3 : 2;
      if(highlight){
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 15;
      }
      ctx.strokeRect(pos.x - pos.w/2, pos.y - pos.h/2, pos.w, pos.h);
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(c.name, pos.x, pos.y);
    });

    // Left side labels (arrows between encoder and decoder)
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "10px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const labels = [
      "tokens",
      "positions",
      "attention",
      "residual",
      "FFN",
      "residual",
      "output"
    ];
    components.forEach((c, i) => {
      if(labels[i]){
        const pos = positions[c.id];
        ctx.fillStyle = "rgba(120,160,220,0.6)";
        ctx.fillText(labels[i], 15, pos.y);
      }
    });

    // Update UI
    if(selectedComp){
      const c = components.find(x => x.id === selectedComp);
      document.getElementById("sim3_comp").textContent = c.name;
      document.getElementById("sim3_role").textContent = c.role;
      infoEl.innerHTML = `<b>${c.name}:</b> ${c.role}`;
    } else if(hoveredComp){
      const c = components.find(x => x.id === hoveredComp);
      document.getElementById("sim3_comp").textContent = c.name;
      document.getElementById("sim3_role").textContent = c.role;
      infoEl.innerHTML = `<b>${c.name}:</b> ${c.role}`;
    } else {
      infoEl.innerHTML = "<b>راهنما:</b> روی هر جزء کلیک کنید تا توضیح آن را ببینید.";
    }
  }

  function getPos(e){
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX || e.touches[0].clientX) - rect.left,
      y: (e.clientY || e.touches[0].clientY) - rect.top
    };
  }

  function findComponent(mx, my){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const positions = getComponentPositions(w, h);
    for(const c of components){
      const pos = positions[c.id];
      if(mx >= pos.x - pos.w/2 && mx <= pos.x + pos.w/2 &&
         my >= pos.y - pos.h/2 && my <= pos.y + pos.h/2){
        return c.id;
      }
    }
    return null;
  }

  canvas.addEventListener("mousemove", (e) => {
    const pos = getPos(e);
    const id = findComponent(pos.x, pos.y);
    if(id !== hoveredComp){
      hoveredComp = id;
      draw();
    }
    canvas.style.cursor = id ? "pointer" : "default";
  });

  canvas.addEventListener("mouseleave", () => {
    hoveredComp = null;
    draw();
  });

  canvas.addEventListener("click", (e) => {
    const pos = getPos(e);
    const id = findComponent(pos.x, pos.y);
    if(id){
      selectedComp = id;
      draw();
      playClick();
    }
  });

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const pos = getPos(e);
    const id = findComponent(pos.x, pos.y);
    if(id){
      selectedComp = id;
      draw();
      playClick();
    }
  }, { passive: false });

  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim3 = () => { selectedComp = null; draw(); };
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