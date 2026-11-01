/* ============================================================
   جلسه ۱۱ — MediaPipe و CV تعاملی
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Hand Landmarks، Hand Gesture، Face Landmarks
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
   HAND LANDMARKS DATA (21 points)
   ============================================================ */
const HAND_LANDMARKS = [
  { id: 0, name: "مچ دست", finger: "Wrist" },
  { id: 1, name: "شست - مفصل ۱", finger: "Thumb" },
  { id: 2, name: "شست - مفصل ۲", finger: "Thumb" },
  { id: 3, name: "شست - مفصل ۳", finger: "Thumb" },
  { id: 4, name: "نوک شست", finger: "Thumb" },
  { id: 5, name: "اشاره - مفصل ۱", finger: "Index" },
  { id: 6, name: "اشاره - مفصل ۲", finger: "Index" },
  { id: 7, name: "اشاره - مفصل ۳", finger: "Index" },
  { id: 8, name: "نوک اشاره", finger: "Index" },
  { id: 9, name: "میانی - مفصل ۱", finger: "Middle" },
  { id: 10, name: "میانی - مفصل ۲", finger: "Middle" },
  { id: 11, name: "میانی - مفصل ۳", finger: "Middle" },
  { id: 12, name: "نوک میانی", finger: "Middle" },
  { id: 13, name: "حلقه - مفصل ۱", finger: "Ring" },
  { id: 14, name: "حلقه - مفصل ۲", finger: "Ring" },
  { id: 15, name: "حلقه - مفصل ۳", finger: "Ring" },
  { id: 16, name: "نوک حلقه", finger: "Ring" },
  { id: 17, name: "کوچک - مفصل ۱", finger: "Pinky" },
  { id: 18, name: "کوچک - مفصل ۲", finger: "Pinky" },
  { id: 19, name: "کوچک - مفصل ۳", finger: "Pinky" },
  { id: 20, name: "نوک کوچک", finger: "Pinky" }
];

// Normalized coordinates for hand skeleton (0-1)
const HAND_COORDS = {
  0: { x: 0.5, y: 0.85 },   // wrist
  1: { x: 0.35, y: 0.78 },
  2: { x: 0.28, y: 0.68 },
  3: { x: 0.25, y: 0.58 },
  4: { x: 0.22, y: 0.48 },  // thumb tip
  5: { x: 0.45, y: 0.65 },
  6: { x: 0.44, y: 0.52 },
  7: { x: 0.43, y: 0.42 },
  8: { x: 0.42, y: 0.32 },  // index tip
  9: { x: 0.55, y: 0.62 },
  10: { x: 0.55, y: 0.48 },
  11: { x: 0.55, y: 0.38 },
  12: { x: 0.55, y: 0.28 }, // middle tip
  13: { x: 0.65, y: 0.65 },
  14: { x: 0.66, y: 0.52 },
  15: { x: 0.67, y: 0.42 },
  16: { x: 0.68, y: 0.32 }, // ring tip
  17: { x: 0.75, y: 0.72 },
  18: { x: 0.77, y: 0.62 },
  19: { x: 0.79, y: 0.52 },
  20: { x: 0.80, y: 0.44 }  // pinky tip
};

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17]
];

/* ============================================================
   SIM 1 — HAND LANDMARKS INTERACTIVE
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const infoEl = document.getElementById("sim1_info");
  let hoveredId = null;
  let selectedId = null;

  function getPointPositions(w, h){
    const positions = {};
    Object.keys(HAND_COORDS).forEach(id => {
      const coord = HAND_COORDS[id];
      // Convert to canvas coordinates (with padding and mirroring for RTL)
      positions[id] = {
        x: w - (50 + coord.x * (w - 100)),
        y: 50 + coord.y * (h - 100)
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

    const positions = getPointPositions(w, h);

    // Draw connections
    ctx.lineWidth = 3;
    HAND_CONNECTIONS.forEach(([a, b]) => {
      const pa = positions[a];
      const pb = positions[b];
      ctx.strokeStyle = "rgba(77,212,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    // Draw points
    Object.keys(positions).forEach(id => {
      const pos = positions[id];
      const numId = parseInt(id);
      const isHovered = hoveredId === numId;
      const isSelected = selectedId === numId;

      // Glow for hovered/selected
      if(isHovered || isSelected){
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI*2);
        const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 20);
        grad.addColorStop(0, "rgba(245,199,106,0.6)");
        grad.addColorStop(1, "rgba(245,199,106,0)");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Point circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isHovered || isSelected ? 12 : 8, 0, Math.PI*2);
      ctx.fillStyle = isSelected ? "#f5c76a" : (isHovered ? "#ffb700" : "#4dd4ff");
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label (ID number)
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${isHovered || isSelected ? 12 : 10}px Vazirmatn`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(numId, pos.x, pos.y);

      // Name label
      if(isHovered || isSelected){
        const label = HAND_LANDMARKS[numId].name;
        ctx.font = "bold 13px Vazirmatn";
        const labelW = ctx.measureText(label).width + 16;
        const labelH = 24;
        const lx = pos.x - labelW/2;
        const ly = pos.y - 40;

        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.strokeStyle = "#f5c76a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if(ctx.roundRect){
          ctx.roundRect(lx, ly, labelW, labelH, 8);
        } else {
          ctx.rect(lx, ly, labelW, labelH);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#f5c76a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, pos.x, ly + labelH/2);
      }
    });

    // Title
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("۲۱ نقطه کلیدی دست — کلیک کنید", w/2, 10);

    // Legend
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("● Hand Landmarks", 15, h - 15);
  }

  // Hit testing
  function getMousePos(e){
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX || e.touches[0].clientX) - rect.left,
      y: (e.clientY || e.touches[0].clientY) - rect.top
    };
  }

  function findHoveredPoint(mx, my){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const positions = getPointPositions(w, h);
    for(const id in positions){
      const pos = positions[id];
      const d = Math.hypot(pos.x - mx, pos.y - my);
      if(d < 15) return parseInt(id);
    }
    return null;
  }

  function updateInfo(id){
    if(id === null) return;
    const lm = HAND_LANDMARKS[id];
    document.getElementById("sim1_point").textContent = id;
    document.getElementById("sim1_name").textContent = lm.name;
    document.getElementById("sim1_finger").textContent = lm.finger;
    const fingerFa = {
      "Wrist": "مچ",
      "Thumb": "شست",
      "Index": "اشاره",
      "Middle": "میانی",
      "Ring": "حلقه",
      "Pinky": "کوچک"
    };
    document.getElementById("sim1_finger").textContent = fingerFa[lm.finger] || lm.finger;
    infoEl.innerHTML = `<b>نقطه ${id}:</b> ${lm.name} — انگشت: ${fingerFa[lm.finger] || lm.finger}`;
  }

  canvas.addEventListener("mousemove", (e) => {
    const pos = getMousePos(e);
    const id = findHoveredPoint(pos.x, pos.y);
    if(id !== hoveredId){
      hoveredId = id;
      draw();
      if(id !== null) updateInfo(id);
    }
    canvas.style.cursor = id !== null ? "pointer" : "default";
  });

  canvas.addEventListener("mouseleave", () => {
    hoveredId = null;
    draw();
  });

  canvas.addEventListener("click", (e) => {
    const pos = getMousePos(e);
    const id = findHoveredPoint(pos.x, pos.y);
    if(id !== null){
      selectedId = id;
      updateInfo(id);
      draw();
      playClick();
    }
  });

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    const id = findHoveredPoint(pos.x, pos.y);
    if(id !== null){
      selectedId = id;
      updateInfo(id);
      draw();
      playClick();
    }
  }, { passive: false });

  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = () => { selectedId = null; draw(); };
})();

/* ============================================================
   SIM 2 — HAND GESTURE RECOGNITION
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const infoEl = document.getElementById("sim2_info");
  let currentGesture = "fist";

  // Finger states for each gesture: [thumb, index, middle, ring, pinky]
  const gestures = {
    fist:     { fingers: [0,0,0,0,0], name: "مشت", confidence: 0.95 },
    open:     { fingers: [1,1,1,1,1], name: "دست باز", confidence: 0.98 },
    peace:    { fingers: [0,1,1,0,0], name: "صلح (V)", confidence: 0.92 },
    thumbsup: { fingers: [1,0,0,0,0], name: "پسند", confidence: 0.94 },
    point:    { fingers: [0,1,0,0,0], name: "اشاره", confidence: 0.96 }
  };

  // Base hand coordinates (will be modified for each gesture)
  const baseCoords = {
    0: { x: 0.5, y: 0.9 },    // wrist
    1: { x: 0.4, y: 0.8 },
    2: { x: 0.32, y: 0.72 },
    3: { x: 0.28, y: 0.62 },
    4: { x: 0.26, y: 0.52 },
    5: { x: 0.45, y: 0.72 },
    6: { x: 0.44, y: 0.6 },
    7: { x: 0.43, y: 0.48 },
    8: { x: 0.42, y: 0.36 },
    9: { x: 0.55, y: 0.7 },
    10: { x: 0.55, y: 0.56 },
    11: { x: 0.55, y: 0.44 },
    12: { x: 0.55, y: 0.32 },
    13: { x: 0.65, y: 0.72 },
    14: { x: 0.66, y: 0.6 },
    15: { x: 0.67, y: 0.48 },
    16: { x: 0.68, y: 0.36 },
    17: { x: 0.74, y: 0.78 },
    18: { x: 0.76, y: 0.68 },
    19: { x: 0.78, y: 0.58 },
    20: { x: 0.8, y: 0.5 }
  };

  function computeGestureCoords(fingers){
    const coords = {};
    Object.keys(baseCoords).forEach(k => {
      coords[k] = { ...baseCoords[k] };
    });

    // For each finger, if folded, bend joints
    // Thumb (1-4)
    if(!fingers[0]){
      coords[2].x = 0.38; coords[2].y = 0.74;
      coords[3].x = 0.42; coords[3].y = 0.78;
      coords[4].x = 0.48; coords[4].y = 0.82;
    }
    // Index (5-8)
    if(!fingers[1]){
      coords[6].y = 0.75; coords[7].y = 0.78; coords[8].y = 0.78;
    }
    // Middle (9-12)
    if(!fingers[2]){
      coords[10].y = 0.75; coords[11].y = 0.78; coords[12].y = 0.78;
    }
    // Ring (13-16)
    if(!fingers[3]){
      coords[14].y = 0.77; coords[15].y = 0.8; coords[16].y = 0.8;
    }
    // Pinky (17-20)
    if(!fingers[4]){
      coords[18].y = 0.83; coords[19].y = 0.86; coords[20].y = 0.86;
    }

    return coords;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const g = gestures[currentGesture];
    const coords = computeGestureCoords(g.fingers);

    const positions = {};
    Object.keys(coords).forEach(id => {
      positions[id] = {
        x: w - (50 + coords[id].x * (w - 100)),
        y: 50 + coords[id].y * (h - 100)
      };
    });

    // Draw connections
    ctx.lineWidth = 4;
    HAND_CONNECTIONS.forEach(([a, b]) => {
      const pa = positions[a];
      const pb = positions[b];
      ctx.strokeStyle = "rgba(77,212,255,0.7)";
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    // Draw points
    Object.keys(positions).forEach(id => {
      const pos = positions[id];
      const numId = parseInt(id);
      const isTip = [4, 8, 12, 16, 20].includes(numId);
      const fingerIdx = [4, 8, 12, 16, 20].indexOf(numId);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isTip ? 12 : 8, 0, Math.PI*2);
      if(isTip && fingerIdx >= 0 && g.fingers[fingerIdx]){
        ctx.fillStyle = "#5ee8a8";
      } else if(isTip){
        ctx.fillStyle = "#ff7e93";
      } else {
        ctx.fillStyle = "#4dd4ff";
      }
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      if(isTip){
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px Vazirmatn";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(numId, pos.x, pos.y);
      }
    });

    // Gesture label
    ctx.fillStyle = "#f5c76a";
    ctx.font = "bold 22px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(g.name, w/2, 10);

    // Finger status
    const fingerNames = ["شست", "اشاره", "میانی", "حلقه", "کوچک"];
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    fingerNames.forEach((name, i) => {
      const status = g.fingers[i] ? "↑" : "↓";
      ctx.fillStyle = g.fingers[i] ? "#5ee8a8" : "#ff7e93";
      ctx.fillText(`${name} ${status}`, 20, h - 15 - i * 20);
    });

    // Update UI
    document.getElementById("sim2_gesture").textContent = g.name;
    document.getElementById("sim2_conf").textContent = (g.confidence * 100).toFixed(1) + "%";
    document.getElementById("sim2_count").textContent = g.fingers.reduce((a,b) => a+b, 0);

    const openCount = g.fingers.reduce((a,b) => a+b, 0);
    infoEl.innerHTML = `<b>${g.name}:</b> ${openCount} انگشت باز. اطمینان: ${(g.confidence*100).toFixed(1)}%`;
  }

  // Button handlers
  document.querySelectorAll("#sim2_btns button").forEach(btn => {
    btn.onclick = () => {
      currentGesture = btn.dataset.gesture;
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

  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = draw;
})();

/* ============================================================
   SIM 3 — FACE LANDMARKS
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const infoEl = document.getElementById("sim3_info");
  let currentRegion = "full";

  // Simplified face landmark regions (normalized coords)
  const regions = {
    full: {
      name: "همه",
      color: "#4dd4ff",
      points: generateFaceMesh()
    },
    eyes: {
      name: "چشم‌ها",
      color: "#f5c76a",
      points: [
        // Left eye
        {x: 0.35, y: 0.42}, {x: 0.38, y: 0.4}, {x: 0.42, y: 0.42},
        {x: 0.42, y: 0.44}, {x: 0.38, y: 0.44}, {x: 0.35, y: 0.44},
        // Right eye
        {x: 0.58, y: 0.42}, {x: 0.62, y: 0.4}, {x: 0.65, y: 0.42},
        {x: 0.65, y: 0.44}, {x: 0.62, y: 0.44}, {x: 0.58, y: 0.44}
      ]
    },
    nose: {
      name: "بینی",
      color: "#a78bfa",
      points: [
        {x: 0.5, y: 0.45}, {x: 0.5, y: 0.5}, {x: 0.5, y: 0.55},
        {x: 0.48, y: 0.58}, {x: 0.52, y: 0.58},
        {x: 0.46, y: 0.6}, {x: 0.5, y: 0.62}, {x: 0.54, y: 0.6}
      ]
    },
    mouth: {
      name: "دهان",
      color: "#f472b6",
      points: [
        {x: 0.4, y: 0.7}, {x: 0.45, y: 0.68}, {x: 0.5, y: 0.68},
        {x: 0.55, y: 0.68}, {x: 0.6, y: 0.7},
        {x: 0.58, y: 0.75}, {x: 0.5, y: 0.78}, {x: 0.42, y: 0.75}
      ]
    }
  };

  function generateFaceMesh(){
    // Generate ~40 points along face contour + eyes + nose + mouth
    const points = [];
    // Face contour (ellipse)
    for(let i=0; i<20; i++){
      const angle = (i / 20) * Math.PI * 2;
      points.push({
        x: 0.5 + 0.25 * Math.cos(angle),
        y: 0.5 + 0.35 * Math.sin(angle)
      });
    }
    // Eyes
    [0.35, 0.42, 0.65, 0.58].forEach((x, i) => {
      points.push({ x, y: 0.42 });
      points.push({ x, y: 0.45 });
    });
    // Nose
    [0.5, 0.48, 0.52].forEach(x => {
      points.push({ x, y: 0.5 });
      points.push({ x, y: 0.55 });
    });
    // Mouth
    for(let i=0; i<6; i++){
      points.push({
        x: 0.4 + i * 0.04,
        y: 0.7 + (i === 2 || i === 3 ? 0.03 : 0)
      });
    }
    return points;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const region = regions[currentRegion];

    // Draw face outline
    ctx.strokeStyle = "rgba(120,160,220,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w/2, h/2, (w - 100) * 0.25, (h - 100) * 0.35, 0, 0, Math.PI*2);
    ctx.stroke();

    // Draw points
    region.points.forEach((p, idx) => {
      const px = w - (50 + p.x * (w - 100));
      const py = 50 + p.y * (h - 100);

      // Glow
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI*2);
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 10);
      grad.addColorStop(0, region.color + "80");
      grad.addColorStop(1, region.color + "00");
      ctx.fillStyle = grad;
      ctx.fill();

      // Point
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI*2);
      ctx.fillStyle = region.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Labels
    ctx.fillStyle = region.color;
    ctx.font = "bold 18px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(region.name, w/2, 10);

    // Update UI
    document.getElementById("sim3_region").textContent = region.name;
    document.getElementById("sim3_count").textContent = region.points.length;
    infoEl.innerHTML = `<b>ناحیه ${region.name}:</b> ${region.points.length} نقطه نمایش داده می‌شود.`;
  }

  // Button handlers
  document.querySelectorAll("#sim3_btns button").forEach(btn => {
    btn.onclick = () => {
      currentRegion = btn.dataset.region;
      document.querySelectorAll("#sim3_btns button").forEach(b => {
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