/* ============================================================
   جلسه ۱۴ — Q-Learning و DQN
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Q-Table vs Q-Network، Replay Buffer، DQN Training
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
   SIM 1 — Q-TABLE vs Q-NETWORK (Memory Comparison)
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const n_s = document.getElementById("sim1_n");
  const infoEl = document.getElementById("sim1_info");

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const nStates = +n_s.value;
    const nActions = 4;
    // Q-Table memory: nStates * nActions * 4 bytes (float32)
    const tableBytes = nStates * nActions * 4;
    // Q-Network memory: ~fixed, about 50000 parameters * 4 bytes
    const netBytes = 50000 * 4;
    const ratio = tableBytes / netBytes;

    document.getElementById("sim1_n_val").textContent = nStates.toLocaleString('fa-IR');
    document.getElementById("sim1_table_size").textContent = formatBytes(tableBytes);
    document.getElementById("sim1_net_size").textContent = formatBytes(netBytes);
    document.getElementById("sim1_ratio").textContent = ratio > 1 ? ratio.toFixed(1) + "×" : ratio.toFixed(2) + "×";

    // Draw comparison bars
    const padding = { top: 40, right: 40, bottom: 60, left: 140 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;
    const maxBytes = Math.max(tableBytes, netBytes);
    const baseY = padding.top + plotH;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i = 0; i <= 10; i++){
      const x = padding.left + plotW * i / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, baseY);
      ctx.stroke();
    }

    // Bars
    const bars = [
      { label: "Q-Table", value: tableBytes, color: "#ff7e93" },
      { label: "Q-Network", value: netBytes, color: "#5ee8a8" }
    ];

    bars.forEach((bar, i) => {
      const y = padding.top + 20 + i * (plotH / 2 + 10);
      const barW = (bar.value / maxBytes) * plotW;
      const barH = plotH / 2 - 30;

      // Background
      ctx.fillStyle = "rgba(120,140,160,0.1)";
      ctx.fillRect(padding.left, y, plotW, barH);

      // Bar
      const grad = ctx.createLinearGradient(padding.left, 0, padding.left + barW, 0);
      grad.addColorStop(0, bar.color + "88");
      grad.addColorStop(1, bar.color);
      ctx.fillStyle = grad;
      ctx.fillRect(padding.left, y, Math.max(2, barW), barH);

      // Border
      ctx.strokeStyle = bar.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(padding.left, y, Math.max(2, barW), barH);

      // Label
      ctx.fillStyle = bar.color;
      ctx.font = "bold 14px Vazirmatn";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(bar.label, padding.left - 10, y + barH/2);

      // Value
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Vazirmatn";
      ctx.textAlign = "left";
      ctx.fillText(formatBytes(bar.value), padding.left + barW + 10, y + barH/2);
    });

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`مقایسه حافظه برای ${nStates.toLocaleString('fa-IR')} حالت`, w/2, 15);

    // Interpretation
    if(ratio > 1000){
      infoEl.innerHTML = `<b>Q-Network ${Math.floor(ratio)}× کارآمدتر!</b> Q-Table نیاز به ${formatBytes(tableBytes)} حافظه دارد، در حالی که Q-Network فقط ${formatBytes(netBytes)}. اینجاست که DQN ضروری می‌شود.`;
    } else if(ratio > 10){
      infoEl.innerHTML = `<b>Q-Network ${Math.floor(ratio)}× کارآمدتر.</b> با افزایش تعداد حالت‌ها، برتری DQN بیشتر می‌شود.`;
    } else if(ratio > 1){
      infoEl.innerHTML = `<b>تقریباً برابر.</b> در این مقیاس، Q-Table هنوز کارا است. اما با رشد حالت‌ها، DQN برنده می‌شود.`;
    } else {
      infoEl.innerHTML = `<b>Q-Table کارآمدتر.</b> برای محیط‌های کوچک، Q-Table ساده‌تر و سریع‌تر است.`;
    }
  }

  function formatBytes(bytes){
    if(bytes < 1024) return bytes + " B";
    if(bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if(bytes < 1024 * 1024 * 1024) return (bytes / (1024*1024)).toFixed(2) + " MB";
    return (bytes / (1024*1024*1024)).toFixed(2) + " GB";
  }

  n_s.addEventListener("input", draw);
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = draw;
})();

/* ============================================================
   SIM 2 — REPLAY BUFFER
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const addBtn = document.getElementById("sim2_add");
  const sampleBtn = document.getElementById("sim2_sample");
  const resetBtn = document.getElementById("sim2_reset");
  const infoEl = document.getElementById("sim2_info");

  const MAX_BUFFER = 50;
  const BATCH_SIZE = 8;
  let buffer = [];
  let sampledIndices = [];
  let nextId = 0;

  function addExperience(){
    if(buffer.length >= MAX_BUFFER){
      buffer.shift(); // remove oldest
    }
    const exp = {
      id: nextId++,
      state: Math.floor(Math.random() * 100),
      action: Math.floor(Math.random() * 4),
      reward: (Math.random() * 2 - 0.5).toFixed(1),
      nextState: Math.floor(Math.random() * 100)
    };
    buffer.push(exp);

    // Random color
    exp.color = `hsl(${(exp.id * 37) % 360}, 70%, 55%)`;

    document.getElementById("sim2_size").textContent = `${buffer.length} / ${MAX_BUFFER}`;
    document.getElementById("sim2_last").textContent = `s=${exp.state} a=${exp.action} r=${exp.reward}`;
    sampledIndices = [];
    draw();
  }

  function sampleBatch(){
    if(buffer.length < BATCH_SIZE){
      infoEl.innerHTML = `<b>⚠ تجربه کافی ندارید.</b> حداقل ${BATCH_SIZE} تجربه لازم است. فعلاً ${buffer.length} دارید.`;
      return;
    }
    sampledIndices = [];
    const available = [...Array(buffer.length).keys()];
    for(let i=0; i<BATCH_SIZE; i++){
      const idx = Math.floor(Math.random() * available.length);
      sampledIndices.push(available[idx]);
      available.splice(idx, 1);
    }
    const sampled = sampledIndices.map(i => buffer[i]);
    document.getElementById("sim2_batch").textContent = sampled.map(e => e.id).join(", ");
    infoEl.innerHTML = `<b>${BATCH_SIZE} تجربه تصادفی نمونه‌گیری شد:</b> ${sampledIndices.map(i => `#${buffer[i].id}`).join(", ")}. این batch برای آموزش شبکه استفاده می‌شود.`;
    draw();
    playClick();
  }

  function reset(){
    buffer = [];
    sampledIndices = [];
    nextId = 0;
    document.getElementById("sim2_size").textContent = `0 / ${MAX_BUFFER}`;
    document.getElementById("sim2_last").textContent = "—";
    document.getElementById("sim2_batch").textContent = "—";
    infoEl.innerHTML = "<b>راهنما:</b> ابتدا چند تجربه اضافه کنید، سپس نمونه‌گیری کنید.";
    draw();
    playClick();
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    // Buffer visualization as memory cells
    const cols = 10;
    const rows = Math.ceil(MAX_BUFFER / cols);
    const cellW = Math.min(40, (w - 80) / cols);
    const cellH = Math.min(30, (h - 120) / rows);
    const startX = (w - cols * cellW) / 2;
    const startY = 60;

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 15px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`Replay Buffer (${buffer.length} / ${MAX_BUFFER})`, w/2, 15);

    // Draw cells
    for(let i=0; i<MAX_BUFFER; i++){
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;

      const filled = i < buffer.length;
      const exp = buffer[i];
      const isSampled = sampledIndices.includes(i);

      // Background
      if(isSampled){
        ctx.fillStyle = "rgba(245,199,106,0.4)";
      } else if(filled){
        ctx.fillStyle = exp.color + "88";
      } else {
        ctx.fillStyle = "rgba(120,140,160,0.1)";
      }
      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

      // Border
      if(isSampled){
        ctx.strokeStyle = "#f5c76a";
        ctx.lineWidth = 2.5;
      } else if(filled){
        ctx.strokeStyle = exp.color;
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = "rgba(120,160,220,0.2)";
        ctx.lineWidth = 1;
      }
      ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);

      // Label
      if(filled){
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px Vazirmatn";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`#${exp.id}`, x + cellW/2, y + cellH/2);
      }
    }

    // Legend
    const legendY = h - 40;
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#4dd4ff";
    ctx.fillText("● تجربه ذخیره‌شده", 30, legendY);

    ctx.fillStyle = "#f5c76a";
    ctx.fillText("● در batch فعلی", 200, legendY);

    ctx.fillStyle = "rgba(120,140,160,0.4)";
    ctx.fillText("● خالی", 370, legendY);
  }

  addBtn.onclick = () => { addExperience(); playClick(); };
  sampleBtn.onclick = sampleBatch;
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = () => { reset(); };
})();

/* ============================================================
   SIM 3 — DQN TRAINING (Simulated)
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const lr_s = document.getElementById("sim3_lr");
  const trainBtn = document.getElementById("sim3_train");
  const resetBtn = document.getElementById("sim3_reset");
  const infoEl = document.getElementById("sim3_info");

  let training = false;
  let timer = null;
  let episode = 0;
  let reward = 0;
  let loss = 0;
  let epsilon = 1.0;
  let rewardHistory = [];
  let lossHistory = [];

  // Simulated learning curve
  function simulateEpisode(){
    episode++;
    // Learning rate influences speed of convergence
    const lr = +lr_s.value;
    const lrFactor = lr * 1000; // 0.001 -> 1.0

    // Reward increases with episodes (with some noise)
    const baseReward = 500 * (1 - Math.exp(-episode / (80 / lrFactor)));
    reward = Math.max(10, Math.min(500, baseReward + (Math.random() - 0.5) * 50));

    // Loss decreases
    loss = 1.0 * Math.exp(-episode / (60 / lrFactor)) + (Math.random() - 0.5) * 0.1;
    loss = Math.max(0.01, loss);

    // Epsilon decays
    epsilon = Math.max(0.01, epsilon * 0.97);

    rewardHistory.push(reward);
    lossHistory.push(loss);

    document.getElementById("sim3_ep").textContent = episode;
    document.getElementById("sim3_rew").textContent = reward.toFixed(0);
    document.getElementById("sim3_loss").textContent = loss.toFixed(3);
    document.getElementById("sim3_eps").textContent = epsilon.toFixed(2);

    // Update info
    if(episode < 10){
      infoEl.innerHTML = `<b>Episode ${episode}:</b> DQN در حال کشف محیط است (epsilon = ${epsilon.toFixed(2)}). پاداش کم — طبیعی است.`;
    } else if(episode < 50){
      infoEl.innerHTML = `<b>Episode ${episode}:</b> DQN در حال یادگیری. epsilon در حال کاهش. پاداش: ${reward.toFixed(0)}.`;
    } else if(episode < 150){
      infoEl.innerHTML = `<b>Episode ${episode}:</b> همگرایی. Loss = ${loss.toFixed(3)}. epsilon = ${epsilon.toFixed(2)}.`;
    } else {
      if(reward > 400){
        infoEl.innerHTML = `<b>✓ Episode ${episode}:</b> DQN آموزش دیده! پاداش = ${reward.toFixed(0)} (نزدیک حداکثر). epsilon = ${epsilon.toFixed(2)}.`;
      } else {
        infoEl.innerHTML = `<b>Episode ${episode}:</b> در حال بهبود. پاداش = ${reward.toFixed(0)}.`;
      }
    }

    draw();
  }

  function trainLoop(){
    if(!training) return;
    simulateEpisode();
    if(episode >= 300){
      training = false;
      trainBtn.innerHTML = '<i data-lucide="play"></i> آموزش';
      lucide.createIcons();
      return;
    }
    timer = setTimeout(trainLoop, 30);
  }

  function startTraining(){
    if(training) return;
    training = true;
    trainBtn.innerHTML = '<i data-lucide="pause"></i> توقف';
    lucide.createIcons();
    trainLoop();
    playClick();
  }

  function stopTraining(){
    training = false;
    if(timer) clearTimeout(timer);
    trainBtn.innerHTML = '<i data-lucide="play"></i> آموزش';
    lucide.createIcons();
  }

  function reset(){
    stopTraining();
    episode = 0;
    reward = 0;
    loss = 0;
    epsilon = 1.0;
    rewardHistory = [];
    lossHistory = [];
    document.getElementById("sim3_ep").textContent = "0";
    document.getElementById("sim3_rew").textContent = "—";
    document.getElementById("sim3_loss").textContent = "—";
    document.getElementById("sim3_eps").textContent = "1.00";
    infoEl.innerHTML = "<b>راهنما:</b> «آموزش» را بزنید تا DQN روی CartPole یاد بگیرد.";
    draw();
    playClick();
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    // Two plots: reward (top), loss (bottom)
    const padding = { top: 30, right: 40, bottom: 30, left: 60 };
    const plotW = w - padding.left - padding.right;
    const plotH = (h - padding.top - padding.bottom - 30) / 2;

    // === Reward plot ===
    const rBaseY = padding.top + plotH;

    // Grid
    ctx.strokeStyle = "rgba(120,160,220,0.1)";
    ctx.lineWidth = 1;
    for(let i = 0; i <= 10; i++){
      const x = padding.left + plotW * i / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, rBaseY);
      ctx.stroke();
    }

    // Title
    ctx.fillStyle = "#5ee8a8";
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Reward", padding.left + 5, padding.top + 5);

    // Reward curve
    if(rewardHistory.length > 1){
      const maxR = 500;
      ctx.strokeStyle = "#5ee8a8";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#5ee8a8";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      rewardHistory.forEach((r, i) => {
        const x = padding.left + (i / Math.max(1, 300)) * plotW;
        const y = rBaseY - (r / maxR) * plotH;
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // === Loss plot ===
    const lBaseY = rBaseY + 60 + plotH;

    // Title
    ctx.fillStyle = "#ff7e93";
    ctx.font = "bold 13px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Loss", padding.left + 5, rBaseY + 60 + 5);

    // Loss curve
    if(lossHistory.length > 1){
      const maxL = 1.0;
      ctx.strokeStyle = "#ff7e93";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#ff7e93";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      lossHistory.forEach((l, i) => {
        const x = padding.left + (i / Math.max(1, 300)) * plotW;
        const y = lBaseY - (l / maxL) * plotH;
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // X axis label
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "11px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Episode", padding.left + plotW/2, lBaseY + 5);
  }

  trainBtn.onclick = () => {
    if(training) stopTraining();
    else startTraining();
  };
  resetBtn.onclick = reset;
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim3 = () => { reset(); };
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