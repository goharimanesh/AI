/* ============================================================
   جلسه ۱۰ — CNN و بینایی ماشین
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Convolution، Max Pooling، CNN Detection
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
   SIM 1 — CONVOLUTION INTERACTIVE
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const x_s = document.getElementById("sim1_x");
  const y_s = document.getElementById("sim1_y");
  const infoEl = document.getElementById("sim1_info");

  // 5x5 input image (values 0-9)
  const input = [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
    [3, 4, 5, 6, 7],
    [4, 5, 6, 7, 8],
    [5, 6, 7, 8, 9]
  ];

  // 3x3 Sobel-like edge filter
  const filter = [
    [-1, -2, -1],
    [ 0,  0,  0],
    [ 1,  2,  1]
  ];

  function computeOutput(fx, fy){
    let sum = 0;
    const details = [];
    for(let i=0; i<3; i++){
      const row = [];
      for(let j=0; j<3; j++){
        const v = input[fy + i][fx + j] * filter[i][j];
        row.push({ img: input[fy + i][fx + j], f: filter[i][j], v });
        sum += v;
      }
      details.push(row);
    }
    return { sum, details };
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const fx = +x_s.value;
    const fy = +y_s.value;

    document.getElementById("sim1_x_val").textContent = fx;
    document.getElementById("sim1_y_val").textContent = fy;

    const { sum, details } = computeOutput(fx, fy);

    document.getElementById("sim1_out").textContent = sum;
    document.getElementById("sim1_out").style.color = sum > 0 ? "#5ee8a8" : (sum < 0 ? "#ff7e93" : "#a8bcd4");

    infoEl.innerHTML = `<b>خروجی = ${sum}.</b> این عدد نشان می‌دهد آیا در این ناحیه لبه‌ی افقی وجود دارد یا نه.`;

    // Layout: image on left, filter on right
    const cellSize = Math.min(60, (w - 200) / 5, (h - 120) / 5);
    const imgStartX = 40;
    const imgStartY = 80;
    const filterStartX = imgStartX + 5 * cellSize + 60;
    const filterStartY = imgStartY;

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 16px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("تصویر ورودی (5×5)", imgStartX + 2.5 * cellSize, 50);

    ctx.fillStyle = "#f5c76a";
    ctx.fillText("فیلتر (3×3)", filterStartX + 1.5 * cellSize, 50);

    // Draw input image
    for(let i=0; i<5; i++){
      for(let j=0; j<5; j++){
        const x = imgStartX + j * cellSize;
        const y = imgStartY + i * cellSize;
        const val = input[i][j];

        // Highlight if within filter window
        const inWindow = i >= fy && i < fy + 3 && j >= fx && j < fx + 3;

        // Background intensity based on value
        const intensity = val / 9;
        ctx.fillStyle = inWindow ?
          `rgba(77, 212, 255, ${0.3 + intensity * 0.5})` :
          `rgba(120, 140, 160, ${0.15 + intensity * 0.3})`;
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        // Border
        ctx.strokeStyle = inWindow ? "#4dd4ff" : "rgba(120,160,220,0.3)";
        ctx.lineWidth = inWindow ? 3 : 1;
        ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        // Value
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.floor(cellSize * 0.4)}px Vazirmatn`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(val, x + cellSize/2, y + cellSize/2);
      }
    }

    // Draw filter
    for(let i=0; i<3; i++){
      for(let j=0; j<3; j++){
        const x = filterStartX + j * cellSize;
        const y = filterStartY + i * cellSize;
        const val = filter[i][j];

        ctx.fillStyle = val > 0 ? "rgba(245,199,106,0.4)" : "rgba(167,139,250,0.4)";
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        ctx.strokeStyle = val > 0 ? "#f5c76a" : "#a78bfa";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.floor(cellSize * 0.4)}px Vazirmatn`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(val, x + cellSize/2, y + cellSize/2);
      }
    }

    // Arrow between
    const arrowStartX = imgStartX + 5 * cellSize + 10;
    const arrowY = imgStartY + 2.5 * cellSize;
    ctx.strokeStyle = "#a8bcd4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arrowStartX, arrowY);
    ctx.lineTo(filterStartX - 10, arrowY);
    ctx.stroke();

    // Result box
    const resultY = imgStartY + 5 * cellSize + 30;
    ctx.fillStyle = "rgba(94,232,168,0.15)";
    ctx.strokeStyle = "#5ee8a8";
    ctx.lineWidth = 2;
    ctx.fillRect(40, resultY, w - 80, 50);
    ctx.strokeRect(40, resultY, w - 80, 50);

    ctx.fillStyle = "#5ee8a8";
    ctx.font = "bold 18px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`خروجی کانولوشن: ${sum}`, w/2, resultY + 25);
  }

  x_s.addEventListener("input", draw);
  y_s.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = draw;
})();

/* ============================================================
   SIM 2 — MAX POOLING
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const runBtn = document.getElementById("sim2_run");
  const resetBtn = document.getElementById("sim2_reset");
  const infoEl = document.getElementById("sim2_info");

  // 4x4 input
  const input = [
    [1, 3, 2, 4],
    [5, 6, 1, 2],
    [7, 2, 8, 3],
    [1, 4, 2, 9]
  ];

  let currentStep = 0; // 0: not started, 1-4: processing quadrants, 5: done
  let timer = null;

  // Compute max pooling
  const output = [];
  for(let i=0; i<2; i++){
    const row = [];
    for(let j=0; j<2; j++){
      const vals = [
        input[i*2][j*2], input[i*2][j*2+1],
        input[i*2+1][j*2], input[i*2+1][j*2+1]
      ];
      row.push(Math.max(...vals));
    }
    output.push(row);
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    // Layout
    const cellSize = Math.min(70, (w - 300) / 4, (h - 120) / 4);
    const imgStartX = 50;
    const imgStartY = 80;
    const outStartX = imgStartX + 4 * cellSize + 80;
    const outStartY = imgStartY + cellSize;

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 16px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("ورودی (4×4)", imgStartX + 2 * cellSize, 50);

    ctx.fillStyle = "#f5c76a";
    ctx.fillText("خروجی (2×2)", outStartX + cellSize, 50);

    // Determine current quadrant
    const quadrants = [
      { r: 0, c: 0 }, { r: 0, c: 1 },
      { r: 1, c: 0 }, { r: 1, c: 1 }
    ];
    const activeQuad = currentStep > 0 && currentStep <= 4 ? quadrants[currentStep - 1] : null;

    // Draw input
    for(let i=0; i<4; i++){
      for(let j=0; j<4; j++){
        const x = imgStartX + j * cellSize;
        const y = imgStartY + i * cellSize;
        const val = input[i][j];

        // Is this cell in the active quadrant?
        const inActive = activeQuad &&
          Math.floor(i/2) === activeQuad.r &&
          Math.floor(j/2) === activeQuad.c;

        // Is this the max in its quadrant?
        const quadR = Math.floor(i/2);
        const quadC = Math.floor(j/2);
        const isMax = val === output[quadR][quadC];

        if(inActive){
          ctx.fillStyle = isMax ? "rgba(245,199,106,0.5)" : "rgba(245,199,106,0.15)";
        } else if(currentStep >= 5 && isMax){
          ctx.fillStyle = "rgba(245,199,106,0.3)";
        } else {
          ctx.fillStyle = "rgba(77,212,255,0.2)";
        }
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

        ctx.strokeStyle = inActive ? "#f5c76a" : "rgba(77,212,255,0.5)";
        ctx.lineWidth = inActive ? 3 : 1.5;
        ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

        ctx.fillStyle = isMax && (inActive || currentStep >= 5) ? "#f5c76a" : "#fff";
        ctx.font = `bold ${Math.floor(cellSize * 0.35)}px Vazirmatn`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(val, x + cellSize/2, y + cellSize/2);
      }
    }

    // Quadrant separators (thick lines)
    ctx.strokeStyle = "rgba(167,139,250,0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(imgStartX + 2 * cellSize, imgStartY);
    ctx.lineTo(imgStartX + 2 * cellSize, imgStartY + 4 * cellSize);
    ctx.moveTo(imgStartX, imgStartY + 2 * cellSize);
    ctx.lineTo(imgStartX + 4 * cellSize, imgStartY + 2 * cellSize);
    ctx.stroke();

    // Arrow
    ctx.strokeStyle = "#a8bcd4";
    ctx.lineWidth = 2;
    const arrowX1 = imgStartX + 4 * cellSize + 15;
    const arrowX2 = outStartX - 15;
    const arrowY = imgStartY + 2 * cellSize;
    ctx.beginPath();
    ctx.moveTo(arrowX1, arrowY);
    ctx.lineTo(arrowX2, arrowY);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(arrowX2 - 8, arrowY - 6);
    ctx.lineTo(arrowX2, arrowY);
    ctx.lineTo(arrowX2 - 8, arrowY + 6);
    ctx.stroke();

    // Draw output
    for(let i=0; i<2; i++){
      for(let j=0; j<2; j++){
        const x = outStartX + j * cellSize;
        const y = outStartY + i * cellSize;
        const val = output[i][j];
        const filled = currentStep > (i*2 + j);

        ctx.fillStyle = filled ? "rgba(94,232,168,0.3)" : "rgba(120,140,160,0.2)";
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
        ctx.strokeStyle = filled ? "#5ee8a8" : "rgba(120,160,220,0.3)";
        ctx.lineWidth = filled ? 3 : 1.5;
        ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

        if(filled){
          ctx.fillStyle = "#5ee8a8";
          ctx.font = `bold ${Math.floor(cellSize * 0.35)}px Vazirmatn`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(val, x + cellSize/2, y + cellSize/2);
        }
      }
    }

    // Status
    if(currentStep === 0){
      infoEl.innerHTML = "<b>راهنما:</b> «اجرا» را بزنید تا مراحل انتخاب بزرگ‌ترین در هر پنجره را ببینید.";
    } else if(currentStep <= 4){
      const q = quadrants[currentStep - 1];
      const maxVal = output[q.r][q.c];
      infoEl.innerHTML = `<b>پنجره ${currentStep}:</b> بزرگ‌ترین عدد = <b>${maxVal}</b> (از ۴ عدد در پنجره 2×2)`;
    } else {
      infoEl.innerHTML = "<b>✓ Pooling کامل شد.</b> ابعاد از 4×4 به 2×2 کاهش یافت — ۷۵٪ کاهش!";
    }
  }

  function start(){
    if(timer) clearInterval(timer);
    currentStep = 0;
    draw();
    timer = setInterval(() => {
      currentStep++;
      draw();
      playClick();
      if(currentStep >= 5){
        clearInterval(timer);
        timer = null;
      }
    }, 700);
  }

  function reset(){
    if(timer) clearInterval(timer);
    currentStep = 0;
    draw();
    playClick();
  }

  runBtn.onclick = start;
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = () => { currentStep = 0; draw(); };
})();

/* ============================================================
   SIM 3 — CNN DETECTION DEMO
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const runBtn = document.getElementById("sim3_run");
  const resetBtn = document.getElementById("sim3_reset");
  const infoEl = document.getElementById("sim3_info");

  // Simulate 4 test images (each 8x8 binary pattern representing a shape)
  const testImages = [
    { label: "دایره", pixels: generateCircle(), correct: true },
    { label: "مربع", pixels: generateSquare(), correct: true },
    { label: "مثلث", pixels: generateTriangle(), correct: true },
    { label: "دایره", pixels: generateCircle(), correct: false } // misclassified
  ];

  function generateCircle(){
    const p = [];
    for(let i=0; i<8; i++){
      const row = [];
      for(let j=0; j<8; j++){
        const d = Math.sqrt((i-3.5)**2 + (j-3.5)**2);
        row.push(d < 3 ? 1 : 0);
      }
      p.push(row);
    }
    return p;
  }
  function generateSquare(){
    const p = [];
    for(let i=0; i<8; i++){
      const row = [];
      for(let j=0; j<8; j++){
        row.push((i >= 1 && i <= 6 && j >= 1 && j <= 6) ? 1 : 0);
      }
      p.push(row);
    }
    return p;
  }
  function generateTriangle(){
    const p = [];
    for(let i=0; i<8; i++){
      const row = [];
      for(let j=0; j<8; j++){
        row.push((i >= 2 && j >= 3 - Math.floor(i/2) && j <= 4 + Math.floor(i/2)) ? 1 : 0);
      }
      p.push(row);
    }
    return p;
  }

  let currentIdx = 0;
  let results = [];
  let timer = null;

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
    ctx.fillText("CNN Detection — طبقه‌بندی تصاویر", w/2, 30);

    // Layout: show 4 images in a row
    const imgSize = Math.min(100, (w - 100) / 4);
    const totalW = 4 * imgSize + 3 * 20;
    const startX = (w - totalW) / 2;
    const startY = 70;

    testImages.forEach((img, idx) => {
      const x = startX + idx * (imgSize + 20);
      const y = startY;
      const processed = currentIdx > idx;
      const isProcessing = currentIdx === idx && timer !== null;

      // Draw image frame
      ctx.strokeStyle = processed ? "#5ee8a8" : (isProcessing ? "#f5c76a" : "rgba(120,160,220,0.3)");
      ctx.lineWidth = processed || isProcessing ? 3 : 1.5;
      ctx.strokeRect(x, y, imgSize, imgSize);

      // Draw pixels
      const cellSize = imgSize / 8;
      for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
          if(img.pixels[i][j]){
            const px = x + j * cellSize;
            const py = y + i * cellSize;
            ctx.fillStyle = processed ?
              (img.correct ? "rgba(94,232,168,0.5)" : "rgba(255,126,147,0.5)") :
              "rgba(77,212,255,0.5)";
            ctx.fillRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
          }
        }
      }

      // Label
      ctx.fillStyle = "#a8bcd4";
      ctx.font = "bold 12px Vazirmatn";
      ctx.textAlign = "center";
      ctx.fillText(`تصویر ${idx+1}`, x + imgSize/2, y + imgSize + 18);

      // Result
      if(processed){
        ctx.fillStyle = img.correct ? "#5ee8a8" : "#ff7e93";
        ctx.font = "bold 12px Vazirmatn";
        ctx.fillText(img.correct ? "✓ درست" : "✗ خطا", x + imgSize/2, y + imgSize + 35);
        ctx.font = "11px Vazirmatn";
        ctx.fillStyle = "#a8bcd4";
        ctx.fillText(`"${img.label}"`, x + imgSize/2, y + imgSize + 52);
      } else if(isProcessing){
        ctx.fillStyle = "#f5c76a";
        ctx.font = "bold 12px Vazirmatn";
        ctx.fillText("در حال پردازش...", x + imgSize/2, y + imgSize + 35);
      }
    });

    // CNN pipeline visualization at bottom
    const pipelineY = h - 100;
    const stages = ["Conv", "Pool", "Conv", "Pool", "FC"];
    const stageW = 80;
    const totalPipelineW = stages.length * stageW + (stages.length - 1) * 15;
    const pipelineX = (w - totalPipelineW) / 2;

    // Draw connection lines first
    for(let i=0; i<stages.length-1; i++){
      const x1 = pipelineX + (i + 1) * stageW + i * 15;
      const x2 = pipelineX + (i + 1) * (stageW + 15);
      const y = pipelineY + 25;
      ctx.strokeStyle = currentIdx > 0 ? "#4dd4ff" : "rgba(120,160,220,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    stages.forEach((stage, i) => {
      const x = pipelineX + i * (stageW + 15);
      const y = pipelineY;
      const active = currentIdx > 0 && currentIdx <= 4;

      ctx.fillStyle = active ? "rgba(77,212,255,0.2)" : "rgba(120,140,160,0.15)";
      ctx.fillRect(x, y, stageW, 50);
      ctx.strokeStyle = active ? "#4dd4ff" : "rgba(120,160,220,0.3)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, stageW, 50);

      ctx.fillStyle = active ? "#4dd4ff" : "#a8bcd4";
      ctx.font = "bold 13px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stage, x + stageW/2, y + 25);
    });

    // Status
    if(currentIdx === 0){
      infoEl.innerHTML = "<b>راهنما:</b> «اجرا» را بزنید تا CNN تصاویر را پردازش کند.";
    } else if(currentIdx < 4){
      infoEl.innerHTML = `<b>در حال پردازش تصویر ${currentIdx}...</b>`;
    } else {
      const correct = testImages.filter(t => t.correct).length;
      infoEl.innerHTML = `<b>✓ پردازش کامل شد.</b> دقت: ${correct}/4 = ${(correct/4*100).toFixed(0)}٪`;
    }
  }

  function run(){
    if(timer) clearInterval(timer);
    currentIdx = 0;
    results = [];
    draw();
    timer = setInterval(() => {
      currentIdx++;
      draw();
      playClick();
      if(currentIdx >= 4){
        clearInterval(timer);
        timer = null;
      }
    }, 800);
  }

  function reset(){
    if(timer) clearInterval(timer);
    currentIdx = 0;
    results = [];
    document.getElementById("sim3_status").textContent = "آماده";
    document.getElementById("sim3_status").style.color = "#a8bcd4";
    document.getElementById("sim3_acc").textContent = "—";
    document.getElementById("sim3_count").textContent = "0";
    draw();
    playClick();
  }

  // Update results display during run
  const origDraw = draw;
  draw = function(){
    origDraw();
    if(currentIdx > 0){
      const processed = testImages.slice(0, currentIdx);
      const correct = processed.filter(t => t.correct).length;
      document.getElementById("sim3_status").textContent = currentIdx < 4 ? "در حال پردازش" : "✓ پایان";
      document.getElementById("sim3_status").style.color = currentIdx < 4 ? "#f5c76a" : "#5ee8a8";
      document.getElementById("sim3_acc").textContent = (correct / processed.length * 100).toFixed(0) + "%";
      document.getElementById("sim3_count").textContent = currentIdx;
    }
  };

  runBtn.onclick = run;
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim3 = () => { currentIdx = 0; draw(); };
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