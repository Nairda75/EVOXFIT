/* EVOXFIT Maia — hero "A Barra".
   Uma barra olímpica em 3D que vai ficando carregada de anilhas à medida que se desce a página.
   Cada capítulo de texto corresponde a mais um par de anilhas; o contador de kg acompanha.
   Sem WebGL aparece uma ilustração em SVG, com as mesmas anilhas a surgir. */
import * as THREE from "../vendor/three.module.min.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
  catch (e) { return false; }
}

/* Pares de anilhas: do mais pesado (entra primeiro, junto à barra) ao mais leve. */
const PAIRS = [
  { label: "25", kg: 50, R: 0.225, t: 0.062, from: 0.12, to: 0.25 },
  { label: "20", kg: 40, R: 0.225, t: 0.052, from: 0.34, to: 0.47 },
  { label: "15", kg: 30, R: 0.19,  t: 0.046, from: 0.56, to: 0.69 },
  { label: "10", kg: 20, R: 0.15,  t: 0.04,  from: 0.78, to: 0.89 },
];
const BASE_KG = 20, MAX_KG = BASE_KG + PAIRS.reduce((s, p) => s + p.kg, 0);

function boot(section) {
  const host = section.querySelector(".bar-canvas");
  const chapters = [...section.querySelectorAll(".bar-chapter")];
  const dots = [...section.querySelectorAll(".bar-dots button")];
  const kgEl = section.querySelector("[data-kg]");
  const meter = section.querySelector("[data-meter]");
  const fbPlates = [...section.querySelectorAll(".bar-fallback [data-pair]")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 860px)").matches || window.matchMedia("(pointer: coarse)").matches;
  const gl = webglOK();

  /* ---------- Progresso do scroll (0 a 1 ao longo do hero) ---------- */
  let target = 0, cur = 0;
  const total = () => Math.max(1, section.offsetHeight - window.innerHeight);
  const readProgress = () => { target = clamp(-section.getBoundingClientRect().top / total()); };
  window.addEventListener("scroll", readProgress, { passive: true });
  window.addEventListener("resize", readProgress);
  readProgress(); cur = target;

  const pairProgress = (p, i) => clamp((p - PAIRS[i].from) / (PAIRS[i].to - PAIRS[i].from));

  /* ---------- Interface (capítulos, contador de kg, pontos) ---------- */
  let lastKg = -1, lastChapter = -2;
  function ui(p) {
    section.classList.toggle("moved", p > 0.03);
    let kg = BASE_KG;
    PAIRS.forEach((pr, i) => { kg += pr.kg * easeOut(pairProgress(p, i)); });
    const kgR = Math.round(kg);
    if (kgR !== lastKg) { lastKg = kgR; if (kgEl) kgEl.textContent = kgR; }
    if (meter) meter.style.transform = "scaleX(" + ((kg - BASE_KG) / (MAX_KG - BASE_KG)).toFixed(3) + ")";
    let on = -1;
    chapters.forEach((c, i) => { if (p >= +c.dataset.from && p < +c.dataset.to) on = i; });
    if (on !== lastChapter) {
      lastChapter = on;
      chapters.forEach((c, i) => c.classList.toggle("on", i === on));
      dots.forEach((d, i) => d.classList.toggle("on", i === on));
    }
    if (!gl) fbPlates.forEach((r) => { r.style.opacity = easeOut(pairProgress(p, +r.dataset.pair)).toFixed(3); });
  }

  dots.forEach((d) => d.addEventListener("click", () => {
    const y = section.offsetTop + (+d.dataset.goto) * total();
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.8 });
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }));

  if (!gl) {
    section.classList.add("bar--fallback");
    const tick = () => { cur += (target - cur) * 0.2; ui(cur); requestAnimationFrame(tick); };
    tick();
    return;
  }

  /* ---------- Renderizador e cena ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x0a0a0b, 1);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0b, 0.2);
  const camera = new THREE.PerspectiveCamera(isMobile ? 40 : 33, 1, 0.05, 60);

  /* Ambiente de estúdio (faixas de luz) para dar brilho ao metal */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.BoxGeometry(24, 12, 24), new THREE.MeshBasicMaterial({ color: 0x07070a, side: THREE.BackSide })));
  const strip = (color, power, w, h, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); envScene.add(m);
  };
  strip(0xffffff, 7, 9, 0.7, [0, 5.4, 1]);
  strip(0xffd21f, 9, 0.6, 7, [-6, 2, -2]);
  strip(0x4b3bff, 8, 0.6, 7, [6, 2, -3]);
  strip(0xfff1c8, 3, 6, 1.2, [0, 1.2, 8]);
  scene.environment = pmrem.fromScene(envScene, 0.03).texture;

  /* Luzes */
  scene.add(new THREE.AmbientLight(0x2a2a40, 0.5));
  const key = new THREE.SpotLight(0xfff1d0, 140, 14, 0.65, 0.65, 1.5);
  key.position.set(1.2, 3.2, 2.2); key.target.position.set(0.4, 0.2, 0); scene.add(key, key.target);
  const rimY = new THREE.PointLight(0xffd21f, 9, 9, 2); rimY.position.set(-2.1, 1.2, -1.3); scene.add(rimY);
  const rimB = new THREE.PointLight(0x4b3bff, 14, 9, 2); rimB.position.set(2.4, 0.9, -1.1); scene.add(rimB);
  const flash = new THREE.PointLight(0xffd21f, 0, 4, 2); flash.position.set(0, 0.7, 0.6); scene.add(flash);

  /* ---------- Chão: plataforma de treino ---------- */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.38, metalness: 0.5, envMapIntensity: 0.3 }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const platform = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.03, 3.2), new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: 0.7, metalness: 0.15, envMapIntensity: 0.35 }));
  platform.position.y = 0.015; scene.add(platform);
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffd21f });
  [[0, 1.6, 6.4, 0.03], [0, -1.6, 6.4, 0.03], [3.2, 0, 0.03, 3.2], [-3.2, 0, 0.03, 3.2]].forEach(([x, z, w, d]) => {
    const e = new THREE.Mesh(new THREE.BoxGeometry(w, 0.034, d), edgeMat); e.position.set(x, 0.016, z); scene.add(e);
  });
  /* "EVOXFIT" pintado no chão, em amarelo (como no ginásio) */
  const paint = document.createElement("canvas"); paint.width = 1024; paint.height = 256;
  const drawPaint = () => {
    const g = paint.getContext("2d"); g.clearRect(0, 0, 1024, 256);
    g.fillStyle = "#ffd21f"; g.font = "800 italic 230px 'Barlow Condensed', Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("EVOXFIT", 512, 140);
  };
  drawPaint();
  const paintTex = new THREE.CanvasTexture(paint); paintTex.colorSpace = THREE.SRGBColorSpace; paintTex.anisotropy = 4;
  const paintMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.85), new THREE.MeshBasicMaterial({ map: paintTex, transparent: true, opacity: 0.9, depthWrite: false }));
  paintMesh.rotation.x = -Math.PI / 2; paintMesh.position.set(0, 0.032, 1.05); scene.add(paintMesh);

  /* Faixas de neon ao fundo, com brilho */
  const glowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();
  const neon = (x, z, color, h = 2.6) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.05), new THREE.MeshBasicMaterial({ color }));
    bar.position.set(x, h / 2 + 0.2, z); scene.add(bar);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.6, h * 1.25), new THREE.MeshBasicMaterial({ map: glowTex, color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.position.set(x, h / 2 + 0.2, z + 0.02); scene.add(halo);
  };
  neon(-3.0, -3.2, 0xffd21f); neon(-1.0, -3.8, 0x4b3bff, 3.2); neon(1.4, -3.6, 0xffd21f, 2.2); neon(3.2, -3.1, 0x4b3bff);

  /* ---------- A barra ---------- */
  const barGroup = new THREE.Group();
  barGroup.position.y = 0.225 + 0.03; scene.add(barGroup);
  const steel = new THREE.MeshStandardMaterial({ color: 0xd4d4da, metalness: 1, roughness: 0.26, envMapIntensity: 1.3 });
  const knurl = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
    g.fillStyle = "#808080"; g.fillRect(0, 0, 64, 64); g.strokeStyle = "#e0e0e0"; g.lineWidth = 3;
    for (let i = -64; i < 128; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(16, 6); return t;
  })();
  const knurlMat = steel.clone(); knurlMat.bumpMap = knurl; knurlMat.bumpScale = 2; knurlMat.roughness = 0.4;
  const cyl = (r, len, mat, x) => {
    const g = new THREE.CylinderGeometry(r, r, len, 28); g.rotateZ(Math.PI / 2);
    const m = new THREE.Mesh(g, mat); m.position.x = x; barGroup.add(m); return m;
  };
  cyl(0.014, 1.32, steel, 0);                 // veio
  cyl(0.0145, 0.62, knurlMat, 0);             // zona estriada
  [-1, 1].forEach((s) => {
    cyl(0.025, 0.46, steel, s * 0.885);       // manga
    cyl(0.034, 0.03, steel, s * 0.665);       // batente
    cyl(0.02, 0.012, steel, s * 1.12);        // ponta
  });

  /* Anilhas */
  const faceTexes = [];
  const faceTex = (label) => {
    const s = 512, c = document.createElement("canvas"); c.width = c.height = s;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const draw = () => {
      const g = c.getContext("2d");
      g.fillStyle = "#121215"; g.fillRect(0, 0, s, s);
      g.strokeStyle = "#ffd21f"; g.lineWidth = 16; g.beginPath(); g.arc(s / 2, s / 2, s * 0.435, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = "rgba(255,210,31,.45)"; g.lineWidth = 3; g.beginPath(); g.arc(s / 2, s / 2, s * 0.37, 0, Math.PI * 2); g.stroke();
      const hub = g.createRadialGradient(s / 2, s / 2, 4, s / 2, s / 2, s * 0.1); hub.addColorStop(0, "#f4f4f0"); hub.addColorStop(1, "#6e6e78");
      g.fillStyle = hub; g.beginPath(); g.arc(s / 2, s / 2, s * 0.1, 0, Math.PI * 2); g.fill();
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = "#f4f4f0"; g.font = "800 italic 74px 'Barlow Condensed', Impact, sans-serif"; g.fillText("EVOXFIT", s / 2, s * 0.27);
      g.fillStyle = "#ffd21f"; g.font = "800 italic 150px 'Barlow Condensed', Impact, sans-serif"; g.fillText(label, s / 2 - 22, s * 0.76);
      g.fillStyle = "#f4f4f0"; g.font = "800 italic 52px 'Barlow Condensed', Impact, sans-serif"; g.fillText("KG", s / 2 + 92, s * 0.8);
      t.needsUpdate = true;
    };
    draw(); faceTexes.push(draw);
    // a tampa +x do cilindro fica rodada 180°: usa uma cópia rodada para o texto ler-se bem nas duas faces
    const t2 = t.clone(); t2.center.set(0.5, 0.5); t2.rotation = Math.PI; t2.needsUpdate = true;
    faceTexes.push(() => { t2.needsUpdate = true; });
    return [t, t2];
  };
  const rubber = new THREE.MeshStandardMaterial({ color: 0x131316, roughness: 0.6, metalness: 0.25, envMapIntensity: 0.9 });
  let offset = 0.665 + 0.015;
  const plates = PAIRS.map((pr) => {
    const [tA, tB] = faceTex(pr.label);
    const faceA = new THREE.MeshStandardMaterial({ map: tA, roughness: 0.5, metalness: 0.15, envMapIntensity: 0.9 });
    const faceB = new THREE.MeshStandardMaterial({ map: tB, roughness: 0.5, metalness: 0.15, envMapIntensity: 0.9 });
    const x = offset + pr.t / 2; offset += pr.t + 0.006;
    const mk = (side) => {
      const g = new THREE.CylinderGeometry(pr.R, pr.R, pr.t, 56); g.rotateZ(Math.PI / 2);
      const m = new THREE.Mesh(g, [rubber, faceA, faceB]);
      m.visible = false; barGroup.add(m); return { m, side };
    };
    return { pr, x, parts: [mk(1), mk(-1)] };
  });
  const collarMat = new THREE.MeshStandardMaterial({ color: 0xffd21f, roughness: 0.4, metalness: 0.7, envMapIntensity: 1.2 });
  const collars = [-1, 1].map((s) => {
    const g = new THREE.CylinderGeometry(0.045, 0.045, 0.05, 32); g.rotateZ(Math.PI / 2);
    const m = new THREE.Mesh(g, collarMat); m.visible = false; barGroup.add(m); return { m, s };
  });
  const collarX = offset + 0.03;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawPaint(); paintTex.needsUpdate = true; faceTexes.forEach((f) => f()); });

  /* Poeira a flutuar na luz */
  const N = isMobile ? 120 : 260;
  const pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 7; pos[i * 3 + 1] = Math.random() * 2.6; pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 0.5; seed[i] = Math.random() * 6.28; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glowTex, color: 0xffe9a8, size: 0.06, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  /* ---------- Câmara: percurso à volta da barra ---------- */
  const camPts = [[-0.75, 0.3, 2.25], [0.15, 0.24, 1.45], [1.15, 0.31, 1.35], [1.95, 0.36, 0.7], [1.75, 0.72, -0.85], [0.7, 0.78, -1.75], [0.05, 0.5, 3.55]].map((a) => new THREE.Vector3(...a));
  const tgtPts = [[0.1, 0.17, 0], [0.55, 0.2, 0], [0.88, 0.2, 0], [0.95, 0.22, 0], [0.8, 0.2, 0], [0.2, 0.2, 0], [0, 0.24, 0]].map((a) => new THREE.Vector3(...a));
  const camCurve = new THREE.CatmullRomCurve3(camPts, false, "centripetal");
  const tgtCurve = new THREE.CatmullRomCurve3(tgtPts, false, "centripetal");
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!isMobile && !reduce) window.addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  let W = 0, H = 0;
  function resize() {
    W = host.clientWidth; H = host.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    applyOffset(cur);
  }
  // Desloca a cena para o lado oposto ao texto (PC) ou para cima (telemóvel); no início sobe ainda mais
  function applyOffset(p) {
    const up = (1 - smooth(clamp(p / 0.1)));
    if (isMobile || W / H < 0.9) camera.setViewOffset(W, H, 0, H * (0.1 + 0.12 * up), W, H);
    else camera.setViewOffset(W, H, -W * (0.15 + 0.12 * smooth(clamp((p - 0.88) / 0.12))), H * 0.2 * up, W, H);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host); resize();

  function frame(p, time) {
    // plates
    let bump = 0;
    plates.forEach((pl, i) => {
      const a = easeOut(pairProgress(p, i));
      pl.parts.forEach(({ m, side }) => {
        m.visible = a > 0.002;
        m.position.x = side * (pl.x + (1 - a) * 1.7);
        m.rotation.x = (1 - a) * side * 7;
      });
      bump += Math.exp(-Math.pow((p - PAIRS[i].to) / 0.012, 2));
    });
    const ca = easeOut(clamp((p - 0.9) / 0.06));
    collars.forEach(({ m, s }) => { m.visible = ca > 0.002; m.position.x = s * (collarX + (1 - ca) * 0.9); });
    bump = Math.min(1, bump);
    barGroup.position.y = 0.255 - bump * 0.012;
    flash.intensity = bump * 26 + (p > 0.93 ? (1 - clamp((p - 0.93) / 0.07)) * 6 : 0);

    // camera
    camCurve.getPoint(p, tmpP); tgtCurve.getPoint(p, tmpT);
    const aspect = W / H;
    const k = aspect < 1 ? 1 + (1 / aspect - 1) * 0.42 * (1 + smooth(clamp((p - 0.82) / 0.18)) * 0.55) : 1;
    tmpP.sub(tmpT).multiplyScalar(k).add(tmpT);
    mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;
    camera.position.set(tmpP.x + mouse.sx * 0.18, tmpP.y - mouse.sy * 0.08, tmpP.z);
    applyOffset(p);
    camera.lookAt(tmpT);

    // poeira
    if (!reduce) {
      const a = dustGeo.attributes.position.array;
      for (let i = 0; i < N; i++) { a[i * 3 + 1] += 0.0006 + Math.sin(time * 0.0004 + seed[i]) * 0.0004; a[i * 3] += Math.sin(time * 0.0003 + seed[i]) * 0.0004; if (a[i * 3 + 1] > 2.8) a[i * 3 + 1] = 0; }
      dustGeo.attributes.position.needsUpdate = true;
    }
    rimB.intensity = 14 + Math.sin(time * 0.0016) * 2;
  }

  /* ---------- Ciclo de desenho (só enquanto o hero está visível) ---------- */
  let running = false, raf = 0;
  function loop(time) {
    if (!running) return;
    cur += (target - cur) * (reduce ? 1 : 0.085);
    if (Math.abs(target - cur) < 0.00008) cur = target;
    ui(cur); frame(cur, time);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  new IntersectionObserver((es) => {
    const on = es[0].isIntersecting;
    if (on && !running) { running = true; raf = requestAnimationFrame(loop); }
    else if (!on) { running = false; cancelAnimationFrame(raf); }
  }, { rootMargin: "200px 0px" }).observe(section);

  ui(cur); frame(cur, 0); renderer.render(scene, camera);
  window.__evoxHero = { get progress() { return cur; }, renderer, jump(p) { target = cur = clamp(p); } };
}

/* arranque */
const section = document.querySelector("[data-bar]");
if (section) boot(section);
