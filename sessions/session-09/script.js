/* ============================================================
   جلسه ۹ — شبکه عصبی و MLP
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Perceptron AND، Activation Functions، Neural Network XOR
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
   SIM 1 — PERCEPTRON AND GATE
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const w1_s = document.getElementById("sim1_w1");
  const w2_s = document.getElementById("sim1_w2");
  const b_s = document.getElementById("sim1_b");
  const infoEl = document.getElementById("sim1_info");

  // AND gate truth table
  const samples = [
    { x1: 0, x2: 0, y: 0 },
    { x1: 0, x2: 1, y: 0 },
    { x1: 1, x2: 0, y: 0 },
    { x1: 1, x2: 1, y: 1 }
  ];

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const w1 = +w1_s.value;
    const w2 = +w2_s.value;
    const b = +b_s.value;

    document.getElementById("sim1_w1_val").textContent = w1.toFixed(1);
    document.getElementById("sim1_w2_val").textContent = w2.toFixed(1);
    document.getElementById("sim1_b_val").textContent = b.toFixed(1);

    // Predict for each sample
    let correct = 0;
    const predictions = samples.map(s => {
      const z = w1 * s.x1 + w2 * s.x2 + b;
      const pred = z > 0 ? 1 : 0;
      if(pred === s.y) correct++;
      return { ...s, z, pred };
    });

    document.getElementById("sim1_correct").textContent = correct + " / 4";
    const statusEl = document.getElementById("sim1_status");
    if(correct === 4){
      statusEl.textContent = "✓ AND حل شد";
      statusEl.style.color = "#5ee8a8";
      infoEl.innerHTML = "<b>✓ عالی!</b> Perceptron توانست AND را یاد بگیرد. حاشیه تصمیم درست است.";
    } else {
      statusEl.textContent = correct + " خطا";
      statusEl.style.color = "#ff7e93";
      infoEl.innerHTML = `<b>⚠ ${4 - correct} خطا:</b> سعی کنید w1 و w2 را مثبت و b را منفی نگه دارید. برای AND: w₁ + w₂ + b > 0 باید فقط برای (1,1) صادق باشد.`;
    }

    // Plot decision boundary in 2D input space
    const padding = 60;
    const plotW = w - 2*padding;
    const plotH = h - 2*padding - 40;
    const xMin = -0.5, xMax = 1.5;
    const yMin = -0.5, yMax = 1.5;
    const xScale = plotW / (xMax - xMin);
    const yScale = plotH / (yMax - yMin);
    const xToPx = (x) => padding + (x - xMin) * xScale;
    const yToPx = (y) => h - padding - (y - yMin) * yScale;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i = 0; i <= 10; i++){
      ctx.beginPath();
      ctx.moveTo(xToPx(-0.5 + i*0.2), padding);
      ctx.lineTo(xToPx(-0.5 + i*0.2), h - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, yToPx(-0.5 + i*0.2));
      ctx.lineTo(w - padding, yToPx(-0.5 + i*0.2));
      ctx.stroke();
    }

    // Decision boundary: w1*x1 + w2*x2 + b = 0
    // x2 = -(w1*x1 + b) / w2 (if w2 != 0)
    if(Math.abs(w2) > 0.001){
      ctx.strokeStyle = "#f5c76a";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#f5c76a";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      const x1a = xMin, x1b = xMax;
      const x2a = -(w1*x1a + b) / w2;
      const x2b = -(w1*x1b + b) / w2;
      ctx.moveTo(xToPx(x1a), yToPx(x2a));
      ctx.lineTo(xToPx(x1b), yToPx(x2b));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Plot samples
    predictions.forEach(s => {
      const px = xToPx(s.x1);
      const py = yToPx(s.x2);
      const correct = s.pred === s.y;

      // Point
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI*2);
      ctx.fillStyle = s.y === 1 ? "#5ee8a8" : "#ff7e93";
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = correct ? "#fff" : "#f5c76a";
      ctx.lineWidth = correct ? 2 : 4;
      ctx.stroke();

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`(${s.x1},${s.x2})`, px, py - 22);

      // Prediction
      ctx.fillStyle = s.pred === 1 ? "#5ee8a8" : "#ff7e93";
      ctx.font = "bold 14px Vazirmatn";
      ctx.fillText(s.pred, px, py + 2);
    });

    // Axis labels
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("x₁", w/2, h - 20);
    ctx.save();
    ctx.translate(20, h/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText("x₂", 0, 0);
    ctx.restore();

    // Legend
    ctx.fillStyle = "#5ee8a8";
    ctx.textAlign = "left";
    ctx.font = "bold 12px Vazirmatn";
    ctx.fillText("● y=1", w - 150, 25);
    ctx.fillStyle = "#ff7e93";
    ctx.fillText("● y=0", w - 100, 25);
  }

  [w1_s, w2_s, b_s].forEach(s => {
    s.addEventListener("input", draw);
  });
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = draw;
})();

/* ============================================================
   SIM 2 — ACTIVATION FUNCTIONS
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const x_s = document.getElementById("sim2_x");
  let currentFn = "relu";

  const fns = {
    relu: {
      name: "ReLU",
      f: (x) => Math.max(0, x),
      df: (x) => x > 0 ? 1 : 0
    },
    sigmoid: {
      name: "Sigmoid",
      f: (x) => 1 / (1 + Math.exp(-x)),
      df: (x) => {
        const s = 1 / (1 + Math.exp(-x));
        return s * (1 - s);
      }
    },
    tanh: {
      name: "Tanh",
      f: (x) => Math.tanh(x),
      df: (x) => 1 - Math.tanh(x)**2
    },
    leaky: {
      name: "Leaky ReLU",
      f: (x) => x > 0 ? x : 0.01 * x,
      df: (x) => x > 0 ? 1 : 0.01
    }
  };

  // Button handlers
  document.querySelectorAll("#sim2_btns button").forEach(btn => {
    btn.onclick = () => {
      currentFn = btn.dataset.fn;
      document.querySelectorAll("#sim2_btns button").forEach(b => {
        b.classList.remove("btnPrimary");
        b.classList.add("btnSecondary");
      });
      btn.classList.remove("btnSecondary");
      btn.classList.add("btnPrimary");
      document.getElementById("sim2_fn").textContent = fns[currentFn].name;
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

    const xVal = +x_s.value;
    const yVal = fns[currentFn].f(xVal);
    const dyVal = fns[currentFn].df(xVal);

    document.getElementById("sim2_x_val").textContent = xVal.toFixed(1);
    document.getElementById("sim2_y").textContent = yVal.toFixed(3);
    document.getElementById("sim2_dy").textContent = dyVal.toFixed(3);

    // Plot
    const padding = 50;
    const plotW = w - 2*padding;
    const plotH = h - 2*padding;
    const xMin = -5, xMax = 5, yMin = -1.5, yMax = 1.5;
    const xScale = plotW / (xMax - xMin);
    const yScale = plotH / (yMax - yMin);
    const xToPx = (x) => padding + (x - xMin) * xScale;
    const yToPx = (y) => h - padding - (y - yMin) * yScale;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i = -5; i <= 5; i++){
      ctx.beginPath();
      ctx.moveTo(xToPx(i), padding); ctx.lineTo(xToPx(i), h - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, yToPx(i)); ctx.lineTo(w - padding, yToPx(i));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(120,160,220,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, yToPx(0)); ctx.lineTo(w - padding, yToPx(0));
    ctx.moveTo(xToPx(0), padding); ctx.lineTo(xToPx(0), h - padding);
    ctx.stroke();

    // Plot curve
    const color = currentFn === "relu" ? "#4dd4ff" :
                  currentFn === "sigmoid" ? "#f5c76a" :
                  currentFn === "tanh" ? "#a78bfa" : "#f472b6";

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for(let px = padding; px <= w - padding; px++){
      const x = (px - padding) / xScale + xMin;
      const y = fns[currentFn].f(x);
      const py = yToPx(y);
      if(px === padding) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Current point
    const px = xToPx(xVal);
    const py = yToPx(yVal);
    if(px >= padding && px <= w - padding && py >= padding && py <= h - padding){
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI*2);
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = color;
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "left";
    ctx.fillText(fns[currentFn].name, padding + 10, padding + 25);

    ctx.fillStyle = "#a8bcd4";
    ctx.font = "12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("x", w/2, h - 20);
    ctx.save();
    ctx.translate(20, h/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText("f(x)", 0, 0);
    ctx.restore();
  }

  x_s.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = draw;
})();

/* ============================================================
   SIM 3 — NEURAL NETWORK XOR
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const lr_s = document.getElementById("sim3_lr");
  const trainBtn = document.getElementById("sim3_train");
  const resetBtn = document.getElementById("sim3_reset");
  const infoEl = document.getElementById("sim3_info");

  // XOR data
  const X = [[0,0], [0,1], [1,0], [1,1]];
  const Y = [0, 1, 1, 0];

  // Network: 2 -> 4 -> 1 with sigmoid
  let W1, b1, W2, b2;
  let epoch = 0;
  let loss = 0;
  let training = false;
  let trainTimer = null;

  function initNetwork(){
    W1 = [];
    b1 = [];
    for(let i=0; i<4; i++){
      W1.push([Math.random()*2-1, Math.random()*2-1]);
      b1.push(Math.random()*2-1);
    }
    W2 = [Math.random()*2-1, Math.random()*2-1, Math.random()*2-1, Math.random()*2-1];
    b2 = Math.random()*2-1;
    epoch = 0;
    loss = 0;
  }

  function sigmoid(x){ return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); }
  function sigmoidDeriv(s){ return s * (1 - s); }

  function forward(x){
    const h = [];
    for(let i=0; i<4; i++){
      const z = W1[i][0]*x[0] + W1[i][1]*x[1] + b1[i];
      h.push(sigmoid(z));
    }
    const zOut = W2[0]*h[0] + W2[1]*h[1] + W2[2]*h[2] + W2[3]*h[3] + b2;
    const y = sigmoid(zOut);
    return { h, y, zOut };
  }

  function trainStep(){
    const lr = +lr_s.value;
    let totalLoss = 0;

    // For each sample, forward + backward
    for(let n=0; n<X.length; n++){
      const x = X[n];
      const yTrue = Y[n];
      const { h, y } = forward(x);

      // Loss (binary cross-entropy simplified to MSE for gradient ease)
      totalLoss += 0.5 * Math.pow(y - yTrue, 2);

      // Gradient of output
      const dOut = (y - yTrue) * sigmoidDeriv(y);

      // Gradients for W2, b2
      const dW2 = h.map(hi => dOut * hi);
      const db2 = dOut;

      // Gradients for hidden layer
      const dH = h.map((hi, i) => dOut * W2[i] * sigmoidDeriv(hi));

      // Update W2, b2
      for(let i=0; i<4; i++){
        W2[i] -= lr * dW2[i];
      }
      b2 -= lr * db2;

      // Update W1, b1
      for(let i=0; i<4; i++){
        for(let j=0; j<2; j++){
          W1[i][j] -= lr * dH[i] * x[j];
        }
        b1[i] -= lr * dH[i];
      }
    }

    loss = totalLoss / X.length;
    epoch++;
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    document.getElementById("sim3_lr_val").textContent = (+lr_s.value).toFixed(2);
    document.getElementById("sim3_epoch").textContent = epoch;
    document.getElementById("sim3_loss").textContent = loss.toFixed(4);

    // Draw network architecture
    const layers = [2, 4, 1];
    const layerX = [w * 0.2, w * 0.5, w * 0.8];
    const nodeR = 14;

    function nodeY(layerIdx, nodeIdx){
      const n = layers[layerIdx];
      const totalH = h - 100;
      const step = totalH / (n + 1);
      return 50 + step * (nodeIdx + 1);
    }

    // Draw edges
    for(let l=0; l<layers.length-1; l++){
      for(let i=0; i<layers[l]; i++){
        for(let j=0; j<layers[l+1]; j++){
          const weight = l === 0 ? W1[j][i] : W2[j];
          const alpha = Math.min(1, Math.abs(weight) * 0.5 + 0.1);
          const color = weight > 0 ? "#5ee8a8" : "#ff7e93";
          ctx.strokeStyle = color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = Math.min(3, Math.abs(weight) * 2 + 0.5);
          ctx.beginPath();
          ctx.moveTo(layerX[l], nodeY(l, i));
          ctx.lineTo(layerX[l+1], nodeY(l+1, j));
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // Draw nodes
    for(let l=0; l<layers.length; l++){
      for(let i=0; i<layers[l]; i++){
        const x = layerX[l];
        const y = nodeY(l, i);
        ctx.beginPath();
        ctx.arc(x, y, nodeR, 0, Math.PI*2);
        ctx.fillStyle = l === 0 ? "#4dd4ff" :
                        l === 1 ? "#f5c76a" : "#a78bfa";
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = l === 0 ? "#4dd4ff" :
                          l === 1 ? "#f5c76a" : "#a78bfa";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Labels
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.fillText("ورودی", layerX[0], 30);
    ctx.fillText("پنهان", layerX[1], 30);
    ctx.fillText("خروجی", layerX[2], 30);

    // Predictions
    const preds = X.map(x => forward(x).y);
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    const startY = h - 70;
    ctx.fillStyle = "#a8bcd4";
    ctx.fillText("پیش‌بینی:", 20, startY);
    preds.forEach((p, i) => {
      const correct = (p > 0.5 ? 1 : 0) === Y[i];
      ctx.fillStyle = correct ? "#5ee8a8" : "#ff7e93";
      ctx.fillText(`(${X[i][0]},${X[i][1]})→${p.toFixed(2)}`, 20 + i * 120, startY + 20);
    });

    // Status
    const statusEl = document.getElementById("sim3_status");
    if(loss < 0.05){
      statusEl.textContent = "✓ حل شد";
      statusEl.style.color = "#5ee8a8";
    } else if(loss < 0.2){
      statusEl.textContent = "در حال یادگیری";
      statusEl.style.color = "#f5c76a";
    } else {
      statusEl.textContent = "آماده";
      statusEl.style.color = "#a8bcd4";
    }

    if(epoch === 0){
      infoEl.innerHTML = "<b>راهنما:</b> «شروع آموزش» را بزنید تا شبکه XOR را یاد بگیرد.";
    } else if(loss < 0.05){
      infoEl.innerHTML = `<b>✓ موفق!</b> شبکه توانست XOR را یاد بگیرد. Loss = ${loss.toFixed(4)}`;
    } else if(loss < 0.2){
      infoEl.innerHTML = `<b>در حال یادگیری...</b> Loss = ${loss.toFixed(4)}. ادامه دهید.`;
    } else {
      infoEl.innerHTML = `<b>Loss = ${loss.toFixed(4)}</b> — شبکه هنوز یاد نگرفته. نرخ یادگیری را تنظیم کنید.`;
    }
  }

  function trainLoop(){
    if(!training) return;
    for(let i=0; i<10; i++) trainStep();
    draw();
    if(epoch < 5000 && loss > 0.02){
      trainTimer = setTimeout(trainLoop, 50);
    } else {
      training = false;
      trainBtn.innerHTML = '<i data-lucide="play"></i> شروع آموزش';
      lucide.createIcons();
    }
  }

  trainBtn.onclick = () => {
    if(training){
      training = false;
      if(trainTimer) clearTimeout(trainTimer);
      trainBtn.innerHTML = '<i data-lucide="play"></i> ادامه';
      lucide.createIcons();
    } else {
      training = true;
      trainBtn.innerHTML = '<i data-lucide="pause"></i> توقف';
      lucide.createIcons();
      trainLoop();
    }
    playClick();
  };

  resetBtn.onclick = () => {
    training = false;
    if(trainTimer) clearTimeout(trainTimer);
    initNetwork();
    trainBtn.innerHTML = '<i data-lucide="play"></i> شروع آموزش';
    lucide.createIcons();
    draw();
    playClick();
  };

  initNetwork();
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim3 = () => { draw(); };
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