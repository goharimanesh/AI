/* ============================================================
   جلسه ۱۵ — Policy Gradient و PPO
   JavaScript کامل — دکتر مسعود گوهری‌منش
   شامل ۳ شبیه‌ساز: Value vs Policy، REINFORCE، Actor-Critic
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
   SIM 1 — VALUE vs POLICY
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim1Canvas");
  if(!canvas) return;
  const q1_s = document.getElementById("sim1_q1");
  const q2_s = document.getElementById("sim1_q2");
  const q3_s = document.getElementById("sim1_q3");
  const temp_s = document.getElementById("sim1_temp");
  const infoEl = document.getElementById("sim1_info");

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const q = [+q1_s.value, +q2_s.value, +q3_s.value];
    const temp = +temp_s.value;

    document.getElementById("sim1_q1_val").textContent = q[0].toFixed(2);
    document.getElementById("sim1_q2_val").textContent = q[1].toFixed(2);
    document.getElementById("sim1_q3_val").textContent = q[2].toFixed(2);
    document.getElementById("sim1_temp_val").textContent = temp.toFixed(1);

    // Softmax probabilities
    const exps = q.map(v => Math.exp(v / temp));
    const sum = exps.reduce((a,b) => a+b, 0);
    const probs = exps.map(e => e / sum);

    // Best Q action
    const bestQ = q.indexOf(Math.max(...q));
    // Policy (sampled from distribution)
    let policySample = 0;
    let r = Math.random();
    for(let i=0; i<3; i++){
      if(r < probs[i]){ policySample = i; break; }
      r -= probs[i];
    }

    document.getElementById("sim1_best_q").textContent = `Action ${bestQ + 1}`;
    document.getElementById("sim1_policy").textContent = `Action ${policySample + 1}`;

    // Layout
    const padding = 40;
    const colW = (w - 3*padding) / 2;
    const plotH = h - 120;

    // === LEFT: Value-Based (Q values as bars) ===
    const leftX = padding;
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Value-Based (DQN)", leftX + colW/2, 15);

    const barW = colW * 0.2;
    const gap = (colW - 3*barW) / 4;
    const baseY = padding + plotH;

    q.forEach((val, i) => {
      const x = leftX + gap + i * (barW + gap);
      const barH = val * plotH * 0.8;
      const y = baseY - barH;

      const grad = ctx.createLinearGradient(0, y, 0, baseY);
      grad.addColorStop(0, "#4dd4ff");
      grad.addColorStop(1, "rgba(77,212,255,0.3)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      ctx.strokeStyle = "#4dd4ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barW, barH);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`A${i+1}`, x + barW/2, baseY + 20);
      ctx.fillText(val.toFixed(2), x + barW/2, y - 15);

      // Highlight best
      if(i === bestQ){
        ctx.fillStyle = "#f5c76a";
        ctx.font = "bold 16px Vazirmatn";
        ctx.fillText("★", x + barW/2, y - 35);
      }
    });

    // === RIGHT: Policy-Based (probabilities) ===
    const rightX = padding + colW + padding;
    ctx.fillStyle = "#f5c76a";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Policy-Based (PPO)", rightX + colW/2, 15);

    probs.forEach((p, i) => {
      const x = rightX + gap + i * (barW + gap);
      const barH = p * plotH * 0.8;
      const y = baseY - barH;

      const grad = ctx.createLinearGradient(0, y, 0, baseY);
      grad.addColorStop(0, "#f5c76a");
      grad.addColorStop(1, "rgba(245,199,106,0.3)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      ctx.strokeStyle = "#f5c76a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barW, barH);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`A${i+1}`, x + barW/2, baseY + 20);
      ctx.fillText((p * 100).toFixed(1) + "%", x + barW/2, y - 15);
    });

    // Axis
    ctx.strokeStyle = "rgba(120,160,220,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftX, baseY);
    ctx.lineTo(leftX + colW, baseY);
    ctx.moveTo(rightX, baseY);
    ctx.lineTo(rightX + colW, baseY);
    ctx.stroke();

    // Explanation
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("همیشه بهترین را انتخاب می‌کند", leftX + colW/2, h - 30);
    ctx.fillText("توزیع احتمال — می‌تواند تصادفی باشد", rightX + colW/2, h - 30);

    // Info
    if(temp < 0.5){
      infoEl.innerHTML = `<b>دمای کم (${temp}):</b> Policy تقریباً حتماً بهترین عمل را انتخاب می‌کند (مثل DQN).`;
    } else if(temp > 3){
      infoEl.innerHTML = `<b>دمای زیاد (${temp}):</b> Policy تقریباً تصادفی است — حتی اعمال ضعیف هم شانس دارند.`;
    } else {
      infoEl.innerHTML = `<b>دمای متوسط (${temp}):</b> Policy مایل به بهترین اعمال است، اما گاهی اعمال دیگر را هم امتحان می‌کند.`;
    }
  }

  [q1_s, q2_s, q3_s, temp_s].forEach(s => {
    s.addEventListener("input", draw);
  });
  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim1 = draw;
})();

/* ============================================================
   SIM 2 — REINFORCE
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim2Canvas");
  if(!canvas) return;
  const lr_s = document.getElementById("sim2_lr");
  const trainBtn = document.getElementById("sim2_train");
  const resetBtn = document.getElementById("sim2_reset");
  const infoEl = document.getElementById("sim2_info");

  // 3-arm bandit with true means
  const arms = [
    { name: "A", trueMean: 0.3 },
    { name: "B", trueMean: 0.8 }, // best
    { name: "C", trueMean: 0.5 }
  ];

  // Policy parameters (logits)
  let logits = [0, 0, 0];
  let episode = 0;
  let bestAction = -1;
  let training = false;
  let timer = null;
  let rewardHistory = [];

  function softmax(logits){
    const exps = logits.map(l => Math.exp(l));
    const sum = exps.reduce((a,b) => a+b, 0);
    return exps.map(e => e / sum);
  }

  function sampleAction(probs){
    let r = Math.random();
    for(let i=0; i<probs.length; i++){
      if(r < probs[i]) return i;
      r -= probs[i];
    }
    return probs.length - 1;
  }

  function step(){
    const lr = +lr_s.value;
    const probs = softmax(logits);
    const action = sampleAction(probs);

    // Get reward
    const reward = Math.random() < arms[action].trueMean ? 1 : 0;
    rewardHistory.push(reward);
    if(rewardHistory.length > 100) rewardHistory.shift();

    // REINFORCE update: increase logit of chosen action if reward was positive
    // Δlogit_i = lr * (reward - baseline) * (1[i==a] - probs[i])
    const baseline = rewardHistory.reduce((a,b) => a+b, 0) / rewardHistory.length;
    for(let i=0; i<3; i++){
      const indicator = i === action ? 1 : 0;
      logits[i] += lr * (reward - baseline) * (indicator - probs[i]);
    }

    episode++;
    bestAction = softmax(logits).indexOf(Math.max(...softmax(logits)));

    document.getElementById("sim2_ep").textContent = episode;
    document.getElementById("sim2_rew").textContent = reward;
    document.getElementById("sim2_best").textContent = `Action ${bestAction + 1}`;

    const progress = (probs[1] * 100).toFixed(0);
    document.getElementById("sim2_prog").textContent = progress + "%";

    draw();

    if(episode < 500 && training){
      timer = setTimeout(step, 50);
    } else {
      training = false;
      trainBtn.innerHTML = '<i data-lucide="play"></i> آموزش';
      lucide.createIcons();
    }
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 || h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const probs = softmax(logits);

    // Layout
    const padding = 60;
    const plotW = w - 2*padding;
    const plotH = h - 2*padding - 40;
    const barW = plotW / 3 * 0.7;
    const gap = plotW / 3 * 0.3;
    const baseY = padding + plotH;

    // Title
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 16px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("توزیع احتمال سیاست (Policy Distribution)", w/2, 15);

    // Bars
    arms.forEach((arm, i) => {
      const x = padding + i * (barW + gap) + gap/2;
      const barH = probs[i] * plotH;
      const y = baseY - barH;

      const isBest = i === bestAction;
      const color = isBest ? "#f5c76a" : "#4dd4ff";

      const grad = ctx.createLinearGradient(0, y, 0, baseY);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + "33");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      ctx.strokeStyle = color;
      ctx.lineWidth = isBest ? 3 : 2;
      ctx.strokeRect(x, y, barW, barH);

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(arm.name, x + barW/2, baseY + 20);

      // Probability
      ctx.fillStyle = color;
      ctx.font = "bold 14px Vazirmatn";
      ctx.fillText((probs[i] * 100).toFixed(1) + "%", x + barW/2, y - 15);

      // Best indicator
      if(isBest){
        ctx.fillStyle = "#f5c76a";
        ctx.font = "bold 20px Vazirmatn";
        ctx.fillText("★", x + barW/2, y - 40);
      }

      // True mean indicator
      const trueY = baseY - arm.trueMean * plotH;
      ctx.strokeStyle = "rgba(167,139,250,0.6)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x - 5, trueY);
      ctx.lineTo(x + barW + 5, trueY);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Axis
    ctx.strokeStyle = "rgba(120,160,220,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, baseY);
    ctx.lineTo(padding + plotW, baseY);
    ctx.stroke();

    // Legend
    ctx.font = "bold 12px Vazirmatn";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#f5c76a";
    ctx.fillText("● بهترین (Policy)", padding, h - 15);
    ctx.fillStyle = "#a78bfa";
    ctx.fillText("┄ True Mean", padding + 200, h - 15);
  }

  trainBtn.onclick = () => {
    if(training){
      training = false;
      if(timer) clearTimeout(timer);
      trainBtn.innerHTML = '<i data-lucide="play"></i> ادامه';
      lucide.createIcons();
    } else {
      training = true;
      trainBtn.innerHTML = '<i data-lucide="pause"></i> توقف';
      lucide.createIcons();
      step();
    }
    playClick();
  };

  resetBtn.onclick = () => {
    training = false;
    if(timer) clearTimeout(timer);
    logits = [0, 0, 0];
    episode = 0;
    bestAction = -1;
    rewardHistory = [];
    document.getElementById("sim2_ep").textContent = "0";
    document.getElementById("sim2_rew").textContent = "—";
    document.getElementById("sim2_best").textContent = "—";
    document.getElementById("sim2_prog").textContent = "—";
    infoEl.innerHTML = "<b>راهنما:</b> «آموزش» را بزنید تا سیاست یاد بگیرد.";
    draw();
    playClick();
  };

  window.addEventListener("resize", () => { if(canvas.offsetParent !== null) draw(); });
  simsInit.sim2 = () => { draw(); };
})();

/* ============================================================
   SIM 3 — ACTOR-CRITIC
   ============================================================ */
(function(){
  const canvas = document.getElementById("sim3Canvas");
  if(!canvas) return;
  const trainBtn = document.getElementById("sim3_train");
  const resetBtn = document.getElementById("sim3_reset");
  const infoEl = document.getElementById("sim3_info");

  const arms = [
    { name: "A", trueMean: 0.3 },
    { name: "B", trueMean: 0.8 },
    { name: "C", trueMean: 0.5 }
  ];

  // Actor: policy logits
  let actorLogits = [0, 0, 0];
  // Critic: value estimate
  let criticValue = 0.5;

  let episode = 0;
  let training = false;
  let timer = null;
  let actorLoss = 0;
  let criticLoss = 0;
  let rewardHistory = [];

  function softmax(logits){
    const exps = logits.map(l => Math.exp(l));
    const sum = exps.reduce((a,b) => a+b, 0);
    return exps.map(e => e / sum);
  }

  function step(){
    const probs = softmax(actorLogits);
    // Sample action
    let r = Math.random();
    let action = 2;
    for(let i=0; i<3; i++){
      if(r < probs[i]){ action = i; break; }
      r -= probs[i];
    }

    // Get reward
    const reward = Math.random() < arms[action].trueMean ? 1 : 0;
    rewardHistory.push(reward);
    if(rewardHistory.length > 100) rewardHistory.shift();

    // Advantage
    const advantage = reward - criticValue;

    // Actor update (policy gradient)
    const actorLr = 0.1;
    for(let i=0; i<3; i++){
      const indicator = i === action ? 1 : 0;
      actorLogits[i] += actorLr * advantage * (indicator - probs[i]);
    }

    // Critic update (MSE between reward and value)
    const criticLr = 0.1;
    criticValue += criticLr * (reward - criticValue);

    actorLoss = -Math.log(probs[action] + 1e-8) * advantage;
    criticLoss = Math.pow(reward - criticValue, 2);

    episode++;

    document.getElementById("sim3_ep").textContent = episode;
    document.getElementById("sim3_rew").textContent = reward;
    document.getElementById("sim3_al").textContent = actorLoss.toFixed(3);
    document.getElementById("sim3_cl").textContent = criticLoss.toFixed(3);

    draw();

    if(episode < 500 && training){
      timer = setTimeout(step, 50);
    } else {
      training = false;
      trainBtn.innerHTML = '<i data-lucide="play"></i> آموزش';
      lucide.createIcons();
    }
  }

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if(w < 10 && h < 10) return;
    const ctx = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const probs = softmax(actorLogits);

    // Layout: two columns
    const padding = 40;
    const colW = (w - 3*padding) / 2;
    const plotH = h - 100;
    const baseY = padding + plotH;

    // === LEFT: Actor (policy) ===
    const leftX = padding;
    ctx.fillStyle = "#4dd4ff";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("🎭 Actor (Policy)", leftX + colW/2, 15);

    const barW = colW * 0.2;
    const gap = (colW - 3*barW) / 4;
    const bestAction = probs.indexOf(Math.max(...probs));

    probs.forEach((p, i) => {
      const x = leftX + gap + i * (barW + gap);
      const barH = p * plotH * 0.8;
      const y = baseY - barH;
      const color = i === bestAction ? "#f5c76a" : "#4dd4ff";

      const grad = ctx.createLinearGradient(0, y, 0, baseY);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + "33");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barW, barH);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px Vazirmatn";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`A${i+1}`, x + barW/2, baseY + 20);
      ctx.fillText((p * 100).toFixed(0) + "%", x + barW/2, y - 15);

      if(i === bestAction){
        ctx.fillStyle = "#f5c76a";
        ctx.font = "bold 16px Vazirmatn";
        ctx.fillText("★", x + barW/2, y - 35);
      }
    });

    // === RIGHT: Critic (value) ===
    const rightX = padding + colW + padding;
    ctx.fillStyle = "#f5c76a";
    ctx.font = "bold 14px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("📊 Critic (Value)", rightX + colW/2, 15);

    // Draw value gauge
    const gaugeX = rightX + colW/2;
    const gaugeY = baseY - plotH * 0.4;
    const gaugeR = Math.min(colW, plotH) * 0.3;

    // Gauge circle
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120,160,220,0.3)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Filled arc (value 0-1)
    const angle = -Math.PI/2 + criticValue * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeR, -Math.PI/2, angle);
    ctx.strokeStyle = "#f5c76a";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#f5c76a";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Value text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 26px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(criticValue.toFixed(2), gaugeX, gaugeY);

    ctx.fillStyle = "#a8bcd4";
    ctx.font = "12px Vazirmatn";
    ctx.fillText("V(s)", gaugeX, gaugeY + 35);

    // Explanation
    ctx.fillStyle = "#a8bcd4";
    ctx.font = "12px Vazirmatn";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("احتمال اعمال", leftX + colW/2, h - 30);
    ctx.fillText("ارزش وضعیت", rightX + colW/2, h - 30);

    // Info
    if(episode === 0){
      infoEl.innerHTML = "<b>راهنما:</b> «آموزش» را بزنید تا Actor و Critic هم‌زمان یاد بگیرند.";
    } else if(episode < 20){
      infoEl.innerHTML = `<b>Episode ${episode}:</b> Actor در حال یادگیری است. Critic هنوز نویزی است.`;
    } else {
      infoEl.innerHTML = `<b>Episode ${episode}:</b> Actor بهترین عمل را انتخاب می‌کند. Critic ارزش را تخمین می‌زند. Actor Loss: ${actorLoss.toFixed(3)}، Critic Loss: ${criticLoss.toFixed(3)}.`;
    }
  }

  trainBtn.onclick = () => {
    if(training){
      training = false;
      if(timer) clearTimeout(timer);
      trainBtn.innerHTML = '<i data-lucide="play"></i> ادامه';
      lucide.createIcons();
    } else {
      training = true;
      trainBtn.innerHTML = '<i data-lucide="pause"></i> توقف';
      lucide.createIcons();
      step();
    }
    playClick();
  };

  resetBtn.onclick = () => {
    training = false;
    if(timer) clearTimeout(timer);
    actorLogits = [0, 0, 0];
    criticValue = 0.5;
    episode = 0;
    rewardHistory = [];
    document.getElementById("sim3_ep").textContent = "0";
    document.getElementById("sim3_rew").textContent = "—";
    document.getElementById("sim3_al").textContent = "—";
    document.getElementById("sim3_cl").textContent = "—";
    infoEl.innerHTML = "<b>راهنما:</b> «آموزش» را بزنید تا Actor و Critic هم‌زمان یاد بگیرند.";
    draw();
    playClick();
  };

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