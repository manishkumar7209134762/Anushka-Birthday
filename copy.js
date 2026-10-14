// =================================================
// EASY EDIT SETTINGS (times in milliseconds)
// =================================================
const CONFIG = {
  clip1Start: 0,
  fadeTime: 800,

  clip1ShootDelay: 3000,
  clip1EndHold: 200,

  clip2Text: "Happy Birthday",
  clip2TypeStart: 4300,
  clip2TypeSpeed: 110,
  clip2HoldAfterTyping: 2500,

  // ---- Clip 3 ----
  clip3Name: "Anushka Vishwakarma",
  clip3Day: 16,              // <-- birthday day (number only)
  clip3Month: "October",     // <-- birthday month name
  clip3EnvelopeOpenDelay: 1200,
  clip3LetterRevealDelay: 900,

  // Photos for the memory wall. Best: save pictures in an "images" folder
  // next to index.html and use "images/photo1.jpg" etc.
  clip3Photos: [
    { src: "https://i.pinimg.com/736x/14/bc/80/14bc80ea7866c02b943debabba6ca4ae.jpg", label: "first memory" },
    { src: "https://yt3.googleusercontent.com/N3h134HfMIcAhgt5zyDwmaFZEsN_hqL7Vkj_nDj5ZXquUyJ6RtbUBLPP1OmqInQHleJXUn6HVA=s900-c-k-c0x00ffffff-no-rj", label: "that day" },
    { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKl_wa-v1nMdqlJok84K8cEy4oO0w48Y_aFS7hr9MbI8iWaO5V", label: "favourite" },
    { src: "https://thumbs.dreamstime.com/b/illustration-young-couple-sitting-ground-sharing-moment-coffee-man-wearing-beige-sweater-dark-pants-459307958.jpg", label: "together" },
    { src: "https://i.pinimg.com/474x/e0/56/61/e056616ccc16986d9d551bfb1bac351f.jpg?nii=t", label: "good days" },
    { src: "https://i.pinimg.com/1200x/67/bd/01/67bd0181c7540743cce039ad6040f909.jpg", label: "always" },
    { src: "https://i.pinimg.com/736x/fe/04/ce/fe04ce632e6128294bbb6b5ce50e91fc.jpg", label: "laughter" },
    { src: "https://i.pinimg.com/474x/73/54/71/735471bdb5f95ec21b5cb656150e5073.jpg", label: "forever" },
    { src: "https://i.pinimg.com/736x/f0/73/0d/f0730dd8f48aa32bcc25722a066dfdc8.jpg", label: "us" }
  ],

  clip3Wishes: [
    "i love your smile",
    "You mean so much to me",
    "I love your little things",
    "I’ll always wish the best for you.",
    "I’ll forever care for you",
    "Your innocent smile forever stays in my heart 🤗🥰💞"
  ]
};

// small safe helpers
const $ = id => document.getElementById(id);
const setText = (id, t) => { const e = $(id); if (e) e.textContent = t; };
const setHTML = (id, h) => { const e = $(id); if (e) e.innerHTML = h; };

// =================================================
// CLIP 1 (heart & bow)
// =================================================
const Clip1 = (function () {
  const api = { onFinish: function () {}, start: function () { start(); } };

  const svg = $("c1-scene"), heart = $("c1-heart"), glow = $("c1-glow"), ball = $("c1-ball"),
        bow = $("c1-bow"), nock = $("c1-nock"), string = $("c1-string"), finger = $("c1-finger"),
        sparks = $("c1-sparks"), flood = $("c1-flood"), hint = $("c1-hint");

  const H = { x: 500, y: 200 };
  const C = { x: 150, y: 430 };
  const ang = Math.atan2(H.y - C.y, H.x - C.x);
  const dir = { x: Math.cos(ang), y: Math.sin(ang) };
  const ARROW = 72, MAX_PULL = 60;

  let phase = "idle";
  let pull = 0, shake = 0, heartScale = 1, t0 = performance.now();
  let arrowStuck = null;
  let demoTimer;

  function drawBow() {
    bow.setAttribute("transform", `translate(${C.x} ${C.y}) rotate(${ang * 180 / Math.PI})`);
    string.setAttribute("points", `0,-52 ${-pull},0 0,52`);
    if (phase === "idle" || phase === "pulling") {
      nock.setAttribute("transform", `translate(${-pull} 0)`);
      nock.style.display = "";
    } else if (phase === "flying") {
      nock.style.display = "none";
    }
    finger.setAttribute("cx", -pull);
    finger.style.opacity = phase === "pulling" ? .9 : 0;
  }
  function drawHeart(now) {
    const bob = Math.sin((now - t0) / 500) * 4;
    const sx = shake ? (Math.random() - .5) * shake : 0;
    heart.setAttribute("transform", `translate(${H.x + sx} ${H.y + bob}) scale(${heartScale})`);
    glow.setAttribute("cy", H.y + bob);
  }
  function loop(now) { drawHeart(now); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  drawBow();

  const ease = t => t * t * (3 - 2 * t);
  function tween(ms, fn, done) {
    const s = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - s) / ms);
      fn(p);
      p < 1 ? requestAnimationFrame(step) : done && done();
    })(s);
  }
  function svgPoint(e) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function release() {
    if (phase === "flying" || phase === "hit" || phase === "done") return;
    clearTimeout(demoTimer);
    const startPull = pull;
    phase = "flying";
    hint.style.opacity = 0;

    tween(220, p => { pull = startPull * (1 - ease(p)) * Math.cos(p * 10); drawBow(); },
          () => { pull = 0; drawBow(); });

    const arrow = nock.cloneNode(true);
    arrow.removeAttribute("id");
    arrow.removeAttribute("transform");
    arrow.style.display = "";
    const holder = document.createElementNS("http://www.w3.org/2000/svg", "g");
    holder.appendChild(arrow);
    svg.appendChild(holder);
    const sx = C.x - dir.x * startPull, sy = C.y - dir.y * startPull;
    const ex = H.x - dir.x * (ARROW - 14), ey = H.y - dir.y * (ARROW - 14);
    const deg = ang * 180 / Math.PI;

    tween(340, p => {
      const e = p * p;
      holder.setAttribute("transform", `translate(${sx + (ex - sx) * e} ${sy + (ey - sy) * e}) rotate(${deg})`);
    }, () => hitHeart(holder));
  }

  function hitHeart(holder) {
    phase = "hit";
    arrowStuck = holder;
    shake = 14;
    tween(350, p => { shake = 14 * (1 - p); }, () => shake = 0);
    burst();
    setTimeout(() => { tween(260, p => { heartScale = 1 - ease(p) * 0.55; }); }, 400);
    setTimeout(() => {
      arrowStuck.style.display = "none";
      heart.style.display = "none";
      glow.style.opacity = 0;
      ball.setAttribute("r", 32);
      tween(320, p => ball.setAttribute("r", 32 + ease(p) * 4));
    }, 700);
    setTimeout(floodScreen, 1000);
  }

  function burst() {
    const colors = ["#ff5c8a", "#ffb703", "#ff8fab", "#c2185b", "#ffd166"];
    for (let i = 0; i < 16; i++) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
      c.setAttribute("r", 2 + Math.random() * 3.5);
      c.setAttribute("fill", colors[i % colors.length]);
      sparks.appendChild(c);
      const x0 = H.x, y0 = H.y;
      tween(900, p => {
        const e = 1 - Math.pow(1 - p, 3);
        c.setAttribute("cx", x0 + Math.cos(a) * d * e);
        c.setAttribute("cy", y0 + Math.sin(a) * d * e - p * 30);
        c.setAttribute("opacity", 1 - p);
      }, () => c.remove());
    }
  }

  function floodScreen() {
    const r = ball.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const size = 200;
    flood.style.left = cx + "px"; flood.style.top = cy + "px";
    const need = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) * 2;
    flood.style.transform = "translate(-50%,-50%) scale(.16)";
    void flood.offsetWidth;
    flood.classList.add("go");
    flood.style.transform = `translate(-50%,-50%) scale(${need / size})`;
    setTimeout(() => { phase = "done"; api.onFinish(); }, 1100);
  }

  svg.addEventListener("pointerdown", e => {
    if (phase === "done") { reset(); return; }
    if (phase !== "idle") return;
    const p = svgPoint(e);
    if (Math.hypot(p.x - C.x, p.y - C.y) > 110) return;
    clearTimeout(demoTimer);
    phase = "pulling";
    svg.setPointerCapture(e.pointerId);
    move(e);
  });
  svg.addEventListener("pointermove", move);
  svg.addEventListener("pointerup", () => { if (phase === "pulling") release(); });
  function move(e) {
    if (phase !== "pulling") return;
    const p = svgPoint(e);
    const back = (C.x - p.x) * dir.x + (C.y - p.y) * dir.y;
    pull = Math.max(0, Math.min(MAX_PULL, back));
    drawBow();
  }
  flood.addEventListener("click", () => phase === "done" && reset());
  $("clip1").addEventListener("click", () => phase === "done" && reset());

  function demo() {
    if (phase !== "idle") return;
    phase = "pulling";
    tween(800, p => { pull = MAX_PULL * ease(p); drawBow(); }, () => { setTimeout(release, 250); });
  }

  function reset() {
    flood.classList.remove("go");
    flood.style.transform = "translate(-50%,-50%) scale(0)";
    sparks.innerHTML = "";
    [...svg.querySelectorAll(":scope > g:not(#c1-heart):not(#c1-sparks):not(#c1-bow)")].forEach(g => g.remove());
    heart.style.display = ""; glow.style.opacity = 1;
    ball.setAttribute("r", 0);
    heartScale = 1; pull = 0; phase = "idle"; hint.style.opacity = 1;
    drawBow();
    demoTimer = setTimeout(demo, CONFIG.clip1ShootDelay);
  }

  function start() { demoTimer = setTimeout(demo, CONFIG.clip1ShootDelay); }

  return api;
})();

// =================================================
// CLIP 2 (birthday cake)
// =================================================
const Clip2 = (function () {
  const api = { onFinish: function () {}, start: function () { start(); } };

  const TEXT = CONFIG.clip2Text, TYPE_START = CONFIG.clip2TypeStart, TYPE_SPEED = CONFIG.clip2TypeSpeed;
  const stage = $("c2-stage"), title = $("c2-title");
  let timers = [];

  function typeText() {
    title.textContent = "";
    title.classList.remove("done");
    [...TEXT].forEach((_, i) => {
      timers.push(setTimeout(() => {
        title.textContent = TEXT.slice(0, i + 1);
        if (i === TEXT.length - 1) title.classList.add("done");
      }, TYPE_START + i * TYPE_SPEED));
    });
    timers.push(setTimeout(() => api.onFinish(), TYPE_START + TEXT.length * TYPE_SPEED + CONFIG.clip2HoldAfterTyping));
  }

  function makeConfetti() {
    const box = $("c2-confetti");
    box.innerHTML = "";
    const colors = ["#ffffff", "#fff8ee", "#f28ba0", "#ffd6dc"];
    for (let i = 0; i < 45; i++) {
      const d = document.createElement("span");
      d.className = "dot";
      const size = 4 + Math.random() * 8;
      const round = Math.random() > .4;
      d.style.cssText = `
        left:${Math.random() * 100}vw;
        width:${size}px;height:${round ? size : size * .6}px;
        border-radius:${round ? "50%" : "1px"};
        background:${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration:${5 + Math.random() * 6}s;
        animation-delay:${-Math.random() * 10}s;
        --dx:${(Math.random() - .5) * 160}px;
        --rot:${Math.random() * 720}deg;`;
      box.appendChild(d);
    }
  }

  function play() {
    timers.forEach(clearTimeout);
    timers = [];
    stage.classList.remove("play");
    void stage.offsetWidth;
    stage.classList.add("play");
    typeText();
  }

  makeConfetti();
  $("clip2").addEventListener("click", play);

  function start() { document.fonts.ready.then(play); }

  return api;
})();

// =================================================
// CLIP 3 (birthday story)
// =================================================
const Clip3 = (function () {
  const api = { onFinish: function () {}, start: function () { start(); } };

  const NAME = CONFIG.clip3Name;
  const DAY = Number(CONFIG.clip3Day), MONTH = CONFIG.clip3Month;
  const screens = [...document.querySelectorAll("#clip3 .screen")];
  const dotsBox = $("c3-dots");
  const back = $("c3-back");
  let cur = 0, lit = false;

  /* progress dots */
  for (let i = 0; i < 4; i++) dotsBox.appendChild(document.createElement("i"));

  /* date + name text (all from CONFIG) */
  const ord = n => { const s = ["th", "st", "nd", "rd"], v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; };
  const suffix = ord(DAY);
  setHTML("c3-day", DAY + "<sup>" + suffix + "</sup>");
  setText("c3-month", MONTH);
  setText("c3-date2", DAY + suffix + " " + MONTH);
  setText("c3-name", NAME + " 🫶🏻🎀");
  setText("c3-name2", NAME);

  /* candles */
  const cg = $("c3-candles");
  [70, 110, 150].forEach(x => cg.innerHTML +=
    `<rect x="${x - 3}" y="46" width="6" height="36" fill="#fff" stroke="#8e2a45" stroke-width="1.5" stroke-dasharray="4 4"/>
     <g class="fire" style="display:none"><ellipse class="flame" cx="${x}" cy="38" rx="5" ry="9" fill="#f5a623"/><ellipse class="flame" cx="${x}" cy="41" rx="2.5" ry="5" fill="#ffe27a"/></g>`);

  /* photo wall (built once, from CONFIG.clip3Photos) */
  $("c3-grid").innerHTML = CONFIG.clip3Photos.map((p, i) =>
    `<div class="pol" style="--r:${(Math.random() * 6 - 3).toFixed(1)}deg;--d:${(i * .09).toFixed(2)}s">
       <div>${p.src ? `<img src="${p.src}" alt="${p.label}" onerror="this.replaceWith('♡')">` : "♡"}</div>
       <span>${p.label}</span>
     </div>`).join("");

  const wishes = CONFIG.clip3Wishes;

  /* navigation */
  function go(n) {
    screens.forEach((s, i) => s.classList.toggle("on", i === n));
    cur = n;
    [...dotsBox.children].forEach((d, i) => d.classList.toggle("on", i === Math.min(n, 3)));
    back.style.display = n > 0 ? "block" : "none";
    if (n === 3) resetLetter();
    if (n === 4) showWishes();
  }
  document.querySelectorAll("#clip3 [data-go]").forEach(b => b.onclick = () => go(+b.dataset.go));
  back.onclick = () => go(Math.max(0, cur - 1));
  go(0);

  /* cake: light candles + confetti */
  $("c3-cake").onclick = () => {
    if (lit) return; lit = true;
    document.querySelectorAll("#clip3 .fire").forEach(f => f.style.display = "");
    setText("c3-msg", "wish made ✨");
    confetti(40);
  };
  function confetti(n) {
    const fx = $("c3-fx"), cols = ["#b0405f", "#f2c94c", "#f3c3cb", "#7b1e34", "#d98b62"];
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      p.style.cssText = `left:${Math.random() * 100}vw;background:${cols[i % 5]};--x:${Math.random() * 200 - 100}px;animation-delay:${Math.random() * .6}s`;
      fx.appendChild(p); setTimeout(() => p.remove(), 3500);
    }
  }

  /* envelope -> letter */
  const env = $("c3-env"), lscreen = document.querySelector("#clip3 .letter");
  function resetLetter() {
    env.classList.remove("open"); lscreen.classList.remove("show");
    setTimeout(openEnv, CONFIG.clip3EnvelopeOpenDelay);
  }
  function openEnv() {
    if (cur !== 3) return;
    env.classList.add("open");
    setTimeout(() => lscreen.classList.add("show"), CONFIG.clip3LetterRevealDelay);
  }
  env.onclick = openEnv;

  /* flowers screen */
  function showWishes() {
    const box = $("c3-tags"); box.innerHTML = "";
    wishes.forEach((w, i) => {
      const s = document.createElement("span");
      s.textContent = w;
      s.style.animationDelay = (.5 + i * .35) + "s";
      box.appendChild(s);
    });
    confetti(30);
  }

  function start() { go(0); }

  return api;
})();

// =================================================
// TRANSITIONS (Clip 1 -> Clip 2 -> Clip 3)
// =================================================
const clipEls = [$("clip1"), $("clip2"), $("clip3")];
const clipApis = [Clip1, Clip2, Clip3];
let currentClip = -1;

document.documentElement.style.setProperty("--fade-time", CONFIG.fadeTime + "ms");

function showClip(i, instant) {
  if (i <= currentClip || i >= clipEls.length) return;
  const previous = clipEls[currentClip];
  if (instant) clipEls[i].classList.add("no-fade");
  clipEls[i].classList.add("visible");
  currentClip = i;
  clipApis[i].start();
  if (previous) setTimeout(() => previous.classList.remove("visible"), CONFIG.fadeTime + 100);
}

Clip1.onFinish = () => setTimeout(() => showClip(1), CONFIG.clip1EndHold);
Clip2.onFinish = () => showClip(2);

setTimeout(() => showClip(0, true), CONFIG.clip1Start);