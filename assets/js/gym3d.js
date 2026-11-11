/* EVOXFIT Maia — início: o ginásio em 3D, à noite.
   Cena feita à mão (sem fotografias): começa lá longe, vista de cima, e a cada deslize aproxima-se
   — parque, entrada, sala principal, máquinas, receção. Sem WebGL ou com "reduzir movimento" não corre. */
import * as THREE from "../vendor/three.module.min.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
  catch (e) { return false; }
}

const sec = document.querySelector("[data-vs]");
const host = sec && sec.querySelector("[data-gl]");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (sec && host && !reduce && webglOK()) {
  const fontsReady = (document.fonts && document.fonts.load)
    ? Promise.race([document.fonts.load('italic 800 200px "Barlow Condensed"'), new Promise((r) => setTimeout(r, 1500))]).catch(() => {})
    : Promise.resolve();
  fontsReady.then(() => { try { boot(); } catch (e) { console.warn("gym3d", e); } });
}

/* ------------------------------------------------------------------ */
function boot() {
  const isMobile = window.matchMedia("(max-width: 860px)").matches || window.matchMedia("(pointer: coarse)").matches;
  const INTRO = parseFloat(sec.dataset.intro || "0.1");
  const N = sec.querySelectorAll(".vs-step").length || 5;

  const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x06060b, 1);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070710, 0.0055);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 900);

  /* ---------- Ambiente (reflexos) ---------- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.BoxGeometry(30, 14, 30), new THREE.MeshBasicMaterial({ color: 0x0a0a10, side: THREE.BackSide })));
  const strip = (color, power, w, h, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); envScene.add(m);
  };
  strip(0xfff1d0, 6, 12, 0.8, [0, 6.5, 0]);
  strip(0xffd21f, 7, 0.7, 7, [-8, 2, -3]);
  strip(0x4b3bff, 7, 0.7, 7, [8, 2, -3]);
  strip(0xffffff, 2, 8, 1.2, [0, 1.5, 9]);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;

  /* ---------- Texturas desenhadas em canvas ---------- */
  const cv = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const tex = (c, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const FONT = '800 italic %spx "Barlow Condensed", Impact, "Arial Narrow", sans-serif';
  const font = (px) => FONT.replace("%s", px);

  function radialTex(rgb, soft = 1) {
    const c = cv(128, 128), g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, `rgba(${rgb},1)`); r.addColorStop(0.25, `rgba(${rgb},${0.55 * soft})`); r.addColorStop(0.6, `rgba(${rgb},${0.14 * soft})`); r.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return tex(c);
  }
  const glowY = radialTex("255,210,31"), glowW = radialTex("255,236,200"), glowB = radialTex("110,92,255");

  function signTex() {
    const c = cv(2048, 360), g = c.getContext("2d");
    g.fillStyle = "#0a0a0e"; g.fillRect(0, 0, 2048, 360);
    g.strokeStyle = "#ffd21f"; g.lineWidth = 8; g.strokeRect(14, 14, 2020, 332);
    g.font = font(300); g.textAlign = "center"; g.textBaseline = "middle";
    g.shadowColor = "#ffd21f"; g.shadowBlur = 40; g.fillStyle = "#ffd21f";
    g.fillText("EVOXFIT", 900, 192); g.fillText("EVOXFIT", 900, 192);
    g.shadowBlur = 0; g.fillStyle = "#fff5cf"; g.fillText("EVOXFIT", 900, 192);
    g.font = font(110); g.fillStyle = "#8c7bff"; g.shadowColor = "#4b3bff"; g.shadowBlur = 24; g.textAlign = "left";
    g.fillText("MAIA", 1500, 196);
    return tex(c);
  }
  function muralTex() {
    const c = cv(2048, 640), g = c.getContext("2d");
    const bg = g.createLinearGradient(0, 0, 0, 640); bg.addColorStop(0, "#14122e"); bg.addColorStop(1, "#0a0a12");
    g.fillStyle = bg; g.fillRect(0, 0, 2048, 640);
    g.font = font(560); g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 6; g.strokeStyle = "rgba(255,210,31,.35)"; g.strokeText("EVOXFIT", 1024, 340);
    g.fillStyle = "#ffd21f"; g.shadowColor = "#ffd21f"; g.shadowBlur = 50; g.globalAlpha = 0.95; g.fillText("EVOX", 640, 340);
    g.globalAlpha = 1; g.fillStyle = "#f6f4ee"; g.shadowColor = "#fff"; g.shadowBlur = 24; g.fillText("FIT", 1500, 340);
    return tex(c);
  }
  function logoTex() {
    const c = cv(1024, 256), g = c.getContext("2d");
    g.fillStyle = "#0a0a0e"; g.fillRect(0, 0, 1024, 256);
    g.font = font(190); g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#ffd21f"; g.shadowColor = "#ffd21f"; g.shadowBlur = 26; g.fillText("EVOXFIT", 512, 134);
    return tex(c);
  }
  function pTex() {
    const c = cv(256, 256), g = c.getContext("2d");
    g.fillStyle = "#1747d6"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#fff"; g.lineWidth = 8; g.strokeRect(10, 10, 236, 236);
    g.fillStyle = "#fff"; g.font = '700 190px "Barlow", Arial, sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("P", 128, 140);
    return tex(c);
  }
  function lotTex() {
    const W = 2048, H = 1500, c = cv(W, H), g = c.getContext("2d");
    g.fillStyle = "#101015"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${150 + Math.random() * 60},${150 + Math.random() * 60},${160 + Math.random() * 60},${Math.random() * 0.06})`; g.fillRect(Math.random() * W, Math.random() * H, 2 + Math.random() * 4, 2 + Math.random() * 4); }
    const ppm = W / 60;
    g.strokeStyle = "rgba(220,220,232,.55)"; g.lineWidth = 5;
    const rows = [[6, 11.5], [17, 22.5]];
    rows.forEach(([z0, z1]) => {
      const y0 = (z0 - 2) / 44 * H, y1 = (z1 - 2) / 44 * H;
      for (let k = -9; k <= 9; k++) { const x = (k * 2.9 + 30) * ppm; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
      g.beginPath(); g.moveTo((-26 + 30) * ppm, y0); g.lineTo((26 + 30) * ppm, y0); g.stroke();
    });
    g.fillStyle = "rgba(255,210,31,.5)"; g.fillRect(0, 0, W, 8);
    return tex(c);
  }
  function roadTex() {
    const c = cv(1024, 128), g = c.getContext("2d");
    g.fillStyle = "#0d0d12"; g.fillRect(0, 0, 1024, 128);
    g.fillStyle = "rgba(255,210,31,.75)"; for (let i = 0; i < 8; i++) g.fillRect(i * 128 + 20, 60, 70, 8);
    g.fillStyle = "rgba(220,220,230,.35)"; g.fillRect(0, 6, 1024, 4); g.fillRect(0, 118, 1024, 4);
    const t = tex(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(4, 1); return t;
  }
  function floorTex() {
    const W = 1024, H = 1024, c = cv(W, H), g = c.getContext("2d");
    g.fillStyle = "#0c0c11"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(255,255,255,.05)"; g.lineWidth = 2;
    for (let i = 0; i <= 20; i++) { g.beginPath(); g.moveTo(i * 51.2, 0); g.lineTo(i * 51.2, H); g.stroke(); }
    for (let i = 0; i <= 19; i++) { g.beginPath(); g.moveTo(0, i * 53.9); g.lineTo(W, i * 53.9); g.stroke(); }
    const X = (x) => (x + 20) / 40 * W, Z = (z) => -z / 38 * H;
    g.fillStyle = "rgba(75,59,255,.16)"; g.fillRect(X(-3.8), Z(-14), X(3.8) - X(-3.8), Z(-35) - Z(-14));
    g.strokeStyle = "rgba(255,210,31,.8)"; g.lineWidth = 6; g.strokeRect(X(-3.8), Z(-14), X(3.8) - X(-3.8), Z(-35) - Z(-14));
    g.fillStyle = "rgba(255,210,31,.55)"; g.fillRect(X(-19), Z(-12.4), X(19) - X(-19), 5);
    g.strokeStyle = "rgba(255,210,31,.35)"; g.lineWidth = 4; g.beginPath(); g.moveTo(X(-5), Z(-1)); g.lineTo(X(-5), Z(-12)); g.moveTo(X(5), Z(-1)); g.lineTo(X(5), Z(-12)); g.stroke();
    return tex(c);
  }

  /* ---------- Materiais ---------- */
  const std = (color, rough = 0.7, metal = 0.1, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra));
  const basic = (color, mul = 1, extra = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: new THREE.Color(color).multiplyScalar(mul) }, extra));
  const M = {
    wall: std(0x1b1b24, 0.88, 0.05), dark: std(0x0d0d11, 0.55, 0.5), steel: std(0x9ea1ad, 0.32, 0.9), yellow: std(0xffd21f, 0.5, 0.1),
    rubber: std(0x08080b, 0.95, 0), pad: std(0x16161e, 0.75, 0.05), plate: std(0x111116, 0.4, 0.6), indigo: std(0x1b1670, 0.8, 0.05),
    inner: std(0x20202b, 0.85, 0.05), gY: basic(0xffd21f, 1.5), gW: basic(0xfff3d6, 2.2), gB: basic(0x6a5cff, 2), screen: basic(0x59d8ff, 1.2),
    red: basic(0xff2a2a, 1.6), skin: std(0xb98a68, 0.8, 0), cabin: std(0x0a121c, 0.12, 0.8),
    glass: new THREE.MeshBasicMaterial({ color: 0x9fb2ff, transparent: true, opacity: 0.1, depthWrite: false, fog: false }),
    tree: std(0x08140f, 1, 0), conc: std(0x22222c, 0.9, 0), mirror: std(0xb9c0d8, 0.06, 1),
  };
  const carColors = [0x15151b, 0x2b2b38, 0x3b1013, 0x1a2a46, 0x242424, 0x1e3a2c].map((c) => std(c, 0.35, 0.65));

  /* ---------- Agrupar peças por material (poucos pedidos à GPU) ---------- */
  const unitBox = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
  const cylCache = {};
  const unitCyl = (seg) => cylCache[seg] || (cylCache[seg] = new THREE.CylinderGeometry(1, 1, 1, seg).toNonIndexed());
  const unitSph = new THREE.SphereGeometry(1, 10, 8).toNonIndexed();
  class Batch {
    constructor() { this.map = new Map(); this.st = [new THREE.Matrix4()]; this.tmp = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.e = new THREE.Euler(); this.p = new THREE.Vector3(); this.s = new THREE.Vector3(); this.v = new THREE.Vector3(); this.nm = new THREE.Matrix3(); }
    push(x, y, z, ry = 0) { const m = new THREE.Matrix4().makeRotationY(ry); m.setPosition(x, y, z); this.st.push(this.st[this.st.length - 1].clone().multiply(m)); }
    pop() { this.st.pop(); }
    add(mat, geo, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
      let rec = this.map.get(mat); if (!rec) { rec = { pos: [], nor: [] }; this.map.set(mat, rec); }
      this.e.set(rx, ry, rz, "YXZ"); this.q.setFromEuler(this.e);
      this.tmp.compose(this.p.set(x, y, z), this.q, this.s.set(sx, sy, sz));
      const w = this.st[this.st.length - 1].clone().multiply(this.tmp);
      this.nm.getNormalMatrix(w);
      const P = geo.attributes.position, Nn = geo.attributes.normal, v = this.v;
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i).applyMatrix4(w); rec.pos.push(v.x, v.y, v.z);
        v.fromBufferAttribute(Nn, i).applyMatrix3(this.nm).normalize(); rec.nor.push(v.x, v.y, v.z);
      }
    }
    box(m, x, y, z, w, h, d, rx = 0, ry = 0, rz = 0) { this.add(m, unitBox, x, y, z, w, h, d, rx, ry, rz); }
    cyl(m, x, y, z, r, h, axis = "y", seg = 12) { this.add(m, unitCyl(seg), x, y, z, r, h, r, axis === "z" ? Math.PI / 2 : 0, 0, axis === "x" ? Math.PI / 2 : 0); }
    sph(m, x, y, z, r) { this.add(m, unitSph, x, y, z, r, r, r); }
    build(parent) {
      this.map.forEach((rec, mat) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(rec.pos, 3));
        g.setAttribute("normal", new THREE.Float32BufferAttribute(rec.nor, 3));
        const mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false; parent.add(mesh);
      });
    }
  }

  const sprite = (map, x, y, z, s, op = 1) => {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    m.position.set(x, y, z); m.scale.set(s, s, 1); scene.add(m); return m;
  };
  const pool = (map, x, z, s, op) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); scene.add(m);
  };
  const plane = (mat, w, h, x, y, z, ry = 0, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, "YXZ"); scene.add(m); return m;
  };

  /* ---------- Céu, estrelas, cidade ao longe ---------- */
  (function sky() {
    const c = cv(16, 512), g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, "#04040a"); gr.addColorStop(0.55, "#0b0c1f"); gr.addColorStop(0.8, "#1a1740"); gr.addColorStop(1, "#2a1d52");
    g.fillStyle = gr; g.fillRect(0, 0, 16, 512);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(500, 24, 16), new THREE.MeshBasicMaterial({ map: tex(c), side: THREE.BackSide, fog: false, depthWrite: false }));
    dome.rotation.y = 0; scene.add(dome);
    const n = 700, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, el = 0.12 + Math.random() * 1.25, r = 470; pos[i * 3] = Math.cos(a) * Math.cos(el) * r; pos[i * 3 + 1] = Math.sin(el) * r; pos[i * 3 + 2] = Math.sin(a) * Math.cos(el) * r; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xcfd6ff, size: isMobile ? 2.2 : 1.8, sizeAttenuation: false, transparent: true, opacity: 0.8, fog: false, depthWrite: false })));
    const moon = sprite(glowW, -150, 210, -420, 150, 0.55);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshBasicMaterial({ color: 0xf3f0e6, fog: false })); disc.position.set(-150, 210, -419); disc.lookAt(0, 0, 0); scene.add(disc);
  })();
  (function city() {
    const bb = new Batch(), wins = [], dark = std(0x0a0a13, 1, 0);
    for (let i = 0; i < 46; i++) {
      const side = i % 2 ? 1 : -1, x = (Math.random() * 260 - 60) * (Math.random() > 0.5 ? 1 : -1), z = -95 - Math.random() * 90;
      const w = 12 + Math.random() * 22, h = 14 + Math.random() * 46, d = 12 + Math.random() * 16;
      bb.box(dark, x, h / 2, z, w, h, d);
      const nw = Math.floor(w * h / 60);
      for (let k = 0; k < nw; k++) if (Math.random() > 0.55) wins.push(x + (Math.random() - 0.5) * (w - 2), 2 + Math.random() * (h - 3), z + d / 2 + 0.1);
    }
    bb.build(scene);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(wins, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffd9a0, size: isMobile ? 2.4 : 2, sizeAttenuation: false, transparent: true, opacity: 0.75 })));
  })();

  /* ---------- Chão, parque, estrada ---------- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), std(0x0a0a0e, 0.95, 0)); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; scene.add(ground);
  plane(new THREE.MeshStandardMaterial({ map: lotTex(), roughness: 0.55, metalness: 0.25 }), 60, 44, 0, 0.01, 24, 0, -Math.PI / 2);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(600, 9), new THREE.MeshStandardMaterial({ map: roadTex(), roughness: 0.6, metalness: 0.2 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 51); road.material.map.repeat.set(10, 1); scene.add(road);

  /* ---------- Edifício ---------- */
  const B = new Batch();
  const W = 40, D = 38, H = 7.5;
  // fachada (z = 0), com abertura para a porta e janelas grandes
  B.box(M.wall, -18.5, H / 2, 0, 3, H, 0.7); B.box(M.wall, 18.5, H / 2, 0, 3, H, 0.7);
  B.box(M.wall, -3.2, H / 2, 0, 1.6, H, 0.7); B.box(M.wall, 3.2, H / 2, 0, 1.6, H, 0.7);
  B.box(M.wall, 0, 5.6, 0, 4.8, 3.8, 0.7);
  [-10.25, 10.25].forEach((cx) => { B.box(M.wall, cx, 0.35, 0, 13.5, 0.7, 0.7); B.box(M.wall, cx, 6.2, 0, 13.5, 2.6, 0.7); });
  // pilares e molduras amarelas
  [-17, -4, 4, 17].forEach((x) => B.box(M.dark, x, 2.9, 0.4, 0.22, 5.2, 0.22));
  B.box(M.gY, 0, 4.88, 0.38, 40, 0.07, 0.07);
  B.box(M.gY, 0, 0.72, 0.38, 36, 0.05, 0.07);
  [-18.4, 18.4].forEach((x) => B.box(M.gB, x, 3.6, 0.4, 0.14, 6.4, 0.1));
  // paredes laterais, traseira e telhado
  B.box(M.wall, -20, H / 2, -D / 2, 0.7, H, D); B.box(M.wall, 20, H / 2, -D / 2, 0.7, H, D);
  B.box(M.wall, 0, H / 2, -D, W, H, 0.7);
  B.box(M.wall, 0, H + 0.25, -D / 2, W + 0.8, 0.5, D + 0.8);
  B.box(M.gY, 0, H + 0.58, 0.45, W + 0.8, 0.12, 0.1); B.box(M.gY, -20.4, H + 0.58, -D / 2, 0.1, 0.12, D + 0.8); B.box(M.gY, 20.4, H + 0.58, -D / 2, 0.1, 0.12, D + 0.8);
  // telhado: máquinas de ar condicionado
  for (let i = 0; i < 6; i++) { B.box(M.dark, -14 + i * 5.5, H + 0.9, -10 - (i % 3) * 8, 2.4, 0.9, 1.6); B.cyl(M.steel, -14 + i * 5.5, H + 1.38, -10 - (i % 3) * 8, 0.5, 0.06, "y", 14); }
  // alpendre à porta
  B.box(M.dark, 0, 3.75, 2.2, 6.2, 0.18, 4.4); B.box(M.gY, 0, 3.64, 4.35, 6.2, 0.06, 0.06);
  B.box(M.dark, -3, 1.85, 4.1, 0.14, 3.7, 0.14); B.box(M.dark, 3, 1.85, 4.1, 0.14, 3.7, 0.14);
  // passeio
  B.box(M.conc, 0, 0.06, 2.6, 46, 0.12, 5.2);
  B.box(M.gY, 0, 0.13, 5.25, 46, 0.02, 0.12);
  // portas de vidro (abertas, só as molduras)
  B.box(M.dark, -1.9, 1.7, 0.1, 0.08, 3.4, 0.08); B.box(M.dark, 1.9, 1.7, 0.1, 0.08, 3.4, 0.08);
  B.box(M.dark, -2.4, 1.7, 0.05, 0.2, 3.4, 0.2); B.box(M.dark, 2.4, 1.7, 0.05, 0.2, 3.4, 0.2);
  // portas de vidro deslizantes (abrem quando a câmara chega)
  const doorMat = new THREE.MeshBasicMaterial({ color: 0xa9b8ff, transparent: true, opacity: 0.24, depthWrite: false, fog: false });
  const doors = [-1, 1].map((d) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(2.3, 3.4, 0.05), doorMat)); const f = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.4, 0.08), M.gY); f.position.x = -d * 1.15; g.add(f); g.position.set(d * 1.15, 1.7, -0.5); scene.add(g); return g; });
  // letreiro
  const sign = plane(new THREE.MeshBasicMaterial({ map: signTex(), toneMapped: false }), 15, 2.65, 0, 6.05, 0.42);
  sprite(glowY, 0, 6.05, 1.5, 30, 0.5);
  const logo = plane(new THREE.MeshBasicMaterial({ map: logoTex(), toneMapped: false }), 4.4, 1.1, 0, 4.1, 4.4);
  void sign; void logo;

  // janelas (vidro)
  [-10.25, 10.25].forEach((cx) => plane(M.glass, 13.5, 4.1, cx, 2.75, 0.3));
  plane(M.glass, 4.8, 0.1, 0, 3.4, 0.3);

  /* ---------- Interior: revestimentos ---------- */
  const floor = plane(new THREE.MeshStandardMaterial({ map: floorTex(), roughness: 0.4, metalness: 0.35, envMapIntensity: 0.7 }), W - 0.8, D - 0.8, 0, 0.02, -D / 2, 0, -Math.PI / 2);
  void floor;
  const innerW = M.inner;
  plane(innerW, D - 0.8, 6.4, -19.62, 3.2, -D / 2, Math.PI / 2);
  plane(innerW, D - 0.8, 6.4, 19.62, 3.2, -D / 2, -Math.PI / 2);
  plane(M.dark, W - 0.8, 0.5, 0, 6.2, -0.45, Math.PI);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.8, D - 0.8), std(0x08080c, 0.9, 0.2)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 6.4, -D / 2); scene.add(ceil);
  plane(new THREE.MeshBasicMaterial({ map: muralTex(), toneMapped: false }), 28, 8.75, 0, 3.3, -D + 0.45, 0);
  [-14.3, 14.3].forEach((x) => B.box(M.gB, x, 3.2, -D + 0.4, 0.14, 6, 0.08));
  B.box(M.gB, 0, 0.5, -D + 0.4, 38.8, 0.1, 0.06); B.box(M.gY, 0, 6.15, -D + 0.4, 38.8, 0.08, 0.06);
  // espelhos (parede direita) e faixa amarela
  plane(M.mirror, 21, 3.6, 19.58, 2.6, -24, -Math.PI / 2);
  B.box(M.gY, 19.5, 0.85, -24, 0.06, 0.06, 21); B.box(M.gY, 19.5, 4.45, -24, 0.06, 0.06, 21);
  for (let i = 0; i <= 7; i++) B.box(M.dark, 19.52, 2.65, -13.5 - i * 3, 0.06, 3.6, 0.08);
  // teto: luzes, tubos e vigas
  for (const x of [-13, -4.5, 4.5, 13]) for (let z = -3; z > -37; z -= 4.5) B.box(M.gW, x, 6.3, z, 0.22, 0.05, 2.6);
  [-9, 9].forEach((x) => B.cyl(M.steel, x, 5.85, -D / 2, 0.32, D - 1, "z", 16));
  for (let z = -4; z > -37; z -= 6) B.box(M.dark, 0, 6.05, z, W - 1, 0.18, 0.28);
  // parte da frente: lobby
  B.box(M.gY, -5, 0.04, -6, 0.05, 0.02, 11); B.box(M.gY, 5, 0.04, -6, 0.05, 0.02, 11);

  /* ---------- Equipamento ---------- */
  function treadmill() {
    B.box(M.dark, 0, 0.14, 0, 0.78, 0.2, 1.9); B.box(M.rubber, 0, 0.26, 0.06, 0.62, 0.04, 1.62);
    [-0.36, 0.36].forEach((x) => { B.box(M.steel, x, 0.3, 0.06, 0.04, 0.07, 1.72); B.box(M.dark, x * 0.92, 0.78, -0.76, 0.05, 1.2, 0.05); B.box(M.steel, x, 1.0, -0.4, 0.035, 0.035, 0.8); });
    B.box(M.dark, 0, 1.32, -0.82, 0.66, 0.28, 0.12, -0.45); B.box(M.screen, 0, 1.33, -0.9, 0.5, 0.15, 0.01, -0.45);
  }
  function rack(bar) {
    B.box(M.rubber, 0, 0.03, 0, 2.5, 0.06, 2.4); [-1.25, 1.25].forEach((x) => B.box(M.gY, x, 0.065, 0, 0.05, 0.012, 2.4));
    [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([x, z]) => B.box(M.dark, x, 1.2, z, 0.1, 2.4, 0.1));
    [-0.6, 0.6].forEach((z) => B.box(M.dark, 0, 2.38, z, 1.3, 0.07, 0.07)); [-0.6, 0.6].forEach((x) => B.box(M.dark, x, 2.38, 0, 0.07, 0.07, 1.3));
    [-0.6, 0.6].forEach((x) => B.box(M.gY, x, 1.38, -0.7, 0.1, 0.05, 0.14));
    B.box(M.gY, 0, 2.06, 0.6, 1.1, 0.05, 0.05);
    if (bar) {
      B.cyl(M.steel, 0, 1.45, -0.7, 0.016, 2.3, "x", 8);
      [0.82, 0.89].forEach((x) => { B.cyl(M.plate, x, 1.45, -0.7, 0.23, 0.05, "x", 18); B.cyl(M.plate, -x, 1.45, -0.7, 0.23, 0.05, "x", 18); });
      [0.96].forEach((x) => { B.cyl(M.yellow, x, 1.45, -0.7, 0.17, 0.045, "x", 16); B.cyl(M.yellow, -x, 1.45, -0.7, 0.17, 0.045, "x", 16); });
    }
  }
  function bench() { B.box(M.pad, 0, 0.45, 0, 0.34, 0.1, 1.25); B.box(M.dark, 0, 0.22, -0.45, 0.4, 0.44, 0.06); B.box(M.dark, 0, 0.22, 0.45, 0.4, 0.44, 0.06); B.box(M.pad, 0, 0.78, 0.5, 0.34, 0.5, 0.08, -0.3); }
  function machine(tall) {
    B.box(M.dark, 0, 0.06, 0, 0.95, 0.12, 1.5);
    B.box(M.steel, 0, 0.82, -0.58, 0.5, 1.4, 0.32); B.box(M.gY, 0, 0.82, -0.41, 0.36, 0.05, 0.02); B.box(M.dark, 0, 1.56 + (tall ? 0.2 : 0), -0.58, 0.64, 0.08, 0.46);
    [-0.34, 0.34].forEach((x) => B.box(M.dark, x, 1.0, -0.2, 0.06, 1.9 + (tall ? 0.2 : 0), 0.06));
    B.box(M.pad, 0, 0.5, 0.36, 0.5, 0.12, 0.46); B.box(M.pad, 0, 0.98, 0.58, 0.44, 0.8, 0.1);
    [-0.4, 0.4].forEach((x) => B.cyl(M.steel, x, 1.12, 0.05, 0.02, 0.5, "z", 8));
    B.box(M.screen, 0, 1.25, -0.4, 0.14, 0.08, 0.01);
  }
  function cable() {
    [-1.5, 1.5].forEach((x) => { B.box(M.dark, x, 1.3, 0, 0.12, 2.6, 0.16); B.box(M.steel, x, 0.9, -0.14, 0.4, 1.5, 0.2); B.box(M.gY, x, 0.9, -0.03, 0.3, 0.04, 0.02); });
    B.box(M.dark, 0, 2.58, 0, 3.2, 0.12, 0.2); B.box(M.dark, 0, 0.04, 0, 3.4, 0.08, 0.9);
  }
  function dumbbells() {
    B.box(M.dark, 0, 0.78, 0, 3.3, 0.06, 0.55); B.box(M.dark, 0, 0.36, 0, 3.3, 0.06, 0.55);
    [-1.6, 0, 1.6].forEach((x) => B.box(M.dark, x, 0.4, 0, 0.08, 0.8, 0.5));
    [0.78, 0.36].forEach((y, k) => {
      for (let i = 0; i < 10; i++) {
        const x = -1.4 + i * 0.31, r = 0.06 + (k ? 0.012 : 0.004) * i + (k ? 0 : 0.01);
        B.cyl(M.steel, x, y + r + 0.03, 0, 0.014, 0.26, "z", 6);
        [-0.1, 0.1].forEach((z) => B.cyl(M.plate, x, y + r + 0.03, z, r, 0.09, "z", 10));
      }
    });
  }
  function desk() {
    B.box(M.dark, 0, 0.55, 0, 4.2, 1.1, 0.9); B.box(M.conc, 0, 1.12, 0, 4.4, 0.07, 1.1); B.box(M.gY, 0, 0.3, 0.46, 3.8, 0.06, 0.02); B.box(M.gY, 0, 1.17, 0.55, 4.4, 0.02, 0.03);
    B.box(M.dark, 2.4, 0.55, -1.4, 0.9, 1.1, 2.6); B.box(M.conc, 2.4, 1.12, -1.4, 1.1, 0.07, 2.8);
    [-1.2, 0.8].forEach((x) => { B.box(M.dark, x, 1.5, -0.15, 0.55, 0.34, 0.04); B.box(M.screen, x, 1.5, -0.12, 0.48, 0.28, 0.01); });
  }
  function mat(c) { B.box(c, 0, 0.02, 0, 1.0, 0.04, 2.0); }

  // cardio
  [-16.4, -12.8].forEach((x) => { for (let i = 0; i < 6; i++) { B.push(x, 0, -14 - i * 3.5); treadmill(); B.pop(); } });
  for (let i = 0; i < 5; i++) { B.push(-8.6, 0, -15 - i * 3.6, Math.PI); machine(false); B.pop(); }
  // pesos livres
  [-17, -23, -29].forEach((z) => { B.push(0, 0, z); rack(true); B.pop(); });
  [-3.2, 3.2].forEach((x) => [-19.5, -25.8].forEach((z) => { B.push(x, 0, z, Math.PI / 2); bench(); B.pop(); }));
  B.push(-9, 0, -34); cable(); B.pop();
  // máquinas
  [10, 14.6].forEach((x, c) => { for (let i = 0; i < 5; i++) { B.push(x, 0, -16.5 - i * 3.6, c ? -Math.PI / 2 : Math.PI / 2); machine(i % 2 === 0); B.pop(); } });
  [-20.5, -27.5].forEach((z) => { B.push(18.35, 0, z, Math.PI / 2); dumbbells(); B.pop(); });
  // zona funcional
  [-6.5, -4.8, -3.1].forEach((x, i) => { B.push(x, 0, -36.2); mat(i % 2 ? M.indigo : M.rubber); B.pop(); });
  [5, 6.6, 8.2].forEach((x, i) => { B.push(x, 0, -36.2); mat(i % 2 ? M.rubber : M.indigo); B.pop(); });
  // receção e lobby
  B.push(8.8, 0, -33.4, 0); desk(); B.pop();
  [-14, -11].forEach((x) => { B.box(M.pad, x, 0.3, -4, 1.6, 0.4, 0.6); B.box(M.pad, x, 0.62, -4.25, 1.6, 0.5, 0.12); });
  B.cyl(M.steel, -16.5, 0.65, -3, 0.2, 1.3, "y", 14); B.cyl(M.gB, -16.5, 1.35, -3, 0.2, 0.08, "y", 14);

  /* ---------- Carros e candeeiros ---------- */
  function makeCar(mat, lights) {
    const g = new THREE.Group();
    const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; };
    add(new THREE.BoxGeometry(1.85, 0.6, 4.3), mat, 0, 0.64, 0);
    add(new THREE.BoxGeometry(1.6, 0.56, 2.3), M.cabin, 0, 1.2, 0.25);
    const wg = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 14); wg.rotateZ(Math.PI / 2);
    [[-0.92, -1.35], [0.92, -1.35], [-0.92, 1.35], [0.92, 1.35]].forEach(([x, z]) => add(wg, M.rubber, x, 0.33, z));
    [-0.65, 0.65].forEach((x) => add(new THREE.BoxGeometry(0.36, 0.1, 0.04), M.red, x, 0.8, 2.17));
    if (lights) {
      [-0.65, 0.65].forEach((x) => add(new THREE.BoxGeometry(0.4, 0.12, 0.04), M.gW, x, 0.8, -2.17));
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.3, 14, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      cone.rotation.x = -Math.PI / 2; cone.position.set(0, 0.8, -9); g.add(cone);
    }
    return g;
  }
  [[-12, 8.4, 0, 0], [-7.2, 8.4, 1, 0], [9.2, 8.4, 2, 0], [14.8, 8.4, 4, 0], [-14.6, 19.6, 3, Math.PI], [12.2, 19.6, 1, Math.PI], [17.8, 19.6, 5, Math.PI]].forEach(([x, z, c, ry]) => {
    const car = makeCar(carColors[c], false); car.position.set(x, 0, z); car.rotation.y = ry; scene.add(car);
  });
  const mover = makeCar(carColors[2], true); mover.position.set(80, 0, 52.5); mover.rotation.y = Math.PI / 2; scene.add(mover);
  const mover2 = makeCar(carColors[5], true); mover2.position.set(-90, 0, 49.5); mover2.rotation.y = -Math.PI / 2; scene.add(mover2);
  (function posts() {
    const L = new Batch();
    [[-24, 12, 1], [24, 12, -1], [-24, 30, 1], [24, 30, -1], [-11, 15, 1], [11, 36, -1]].forEach(([x, z, dir]) => {
      L.cyl(M.dark, x, 4, z, 0.08, 8, "y", 8); L.box(M.dark, x + dir * 0.8, 8, z, 1.6, 0.08, 0.08); L.box(M.gW, x + dir * 1.5, 7.92, z, 0.7, 0.06, 0.28);
      sprite(glowW, x + dir * 1.5, 7.9, z, 7, 0.9); pool(glowW, x + dir * 1.5, z, 22, 0.42);
    });
    // sinal de estacionamento
    L.cyl(M.dark, -27, 1.2, 4.2, 0.05, 2.4, "y", 6);
    L.build(scene);
    plane(new THREE.MeshBasicMaterial({ map: pTex() }), 0.9, 0.9, -27, 2.55, 4.2, 0);
    // árvores / sebes
    const T = new Batch();
    for (let i = 0; i < 26; i++) {
      const side = i % 2 ? 1 : -1, x = side * (30 + Math.random() * 12), z = 6 + Math.random() * 40 - i * 2.2, h = 3 + Math.random() * 4;
      T.cyl(M.dark, x, h * 0.35, z, 0.18, h * 0.7, "y", 6); T.sph(M.tree, x, h * 0.9, z, 1.6 + Math.random() * 1.4);
    }
    for (let i = 0; i < 12; i++) T.box(M.tree, -26 + i * 4.8, 0.5, 47, 3.4, 1, 1.2);
    T.build(scene);
  })();
  pool(glowY, 0, 6, 40, 0.28); pool(glowW, 0, 3.4, 18, 0.5);
  sprite(glowB, 18.4, 3.6, 1, 10, 0.45); sprite(glowB, -18.4, 3.6, 1, 10, 0.45);
  [-10.25, 10.25].forEach((x) => sprite(glowW, x, 3.2, -4, 22, 0.28));

  B.build(scene);

  /* ---------- Luzes ---------- */
  scene.add(new THREE.HemisphereLight(0x5a6aa8, 0x0c0c16, 0.9));
  const L1 = new THREE.PointLight(0xfff0d2, 190, 30, 1.7); L1.position.set(0, 5.4, -4); scene.add(L1);
  const L2 = new THREE.PointLight(0xfff0d2, 210, 32, 1.7); L2.position.set(-2, 5.6, -17); scene.add(L2);
  const L3 = new THREE.PointLight(0xffe2a0, 190, 30, 1.7); L3.position.set(5, 5.6, -29); scene.add(L3);
  const L4 = new THREE.PointLight(0x6d5cff, 150, 26, 1.8); L4.position.set(-14, 3.6, -34); scene.add(L4);
  const L5 = new THREE.PointLight(0xfff0d2, 70, 26, 1.8); L5.position.set(8, 1.6, 8); scene.add(L5);
  const L7 = new THREE.PointLight(0xfff4e2, 140, 36, 1.6); L7.position.set(0, 7, 13); scene.add(L7);
  if (!isMobile) { const L6 = new THREE.PointLight(0xfff0d2, 160, 30, 1.7); L6.position.set(14, 5.6, -20); scene.add(L6); }

  /* ---------- Pessoas (silhuetas simples) ---------- */
  function person(shirt, h = 1) {
    const g = new THREE.Group(), sm = std(shirt, 0.7, 0.05), pm = std(0x15151c, 0.8, 0), skin = M.skin;
    const add = (geo, m, x, y, z, parent = g) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); parent.add(o); return o; };
    const torso = add(new THREE.CapsuleGeometry(0.17, 0.46, 4, 8), sm, 0, 1.12, 0);
    add(new THREE.SphereGeometry(0.115, 12, 10), skin, 0, 1.62, 0);
    const legL = new THREE.Group(), legR = new THREE.Group(), armL = new THREE.Group(), armR = new THREE.Group();
    legL.position.set(-0.09, 0.84, 0); legR.position.set(0.09, 0.84, 0); armL.position.set(-0.23, 1.38, 0); armR.position.set(0.23, 1.38, 0);
    add(new THREE.CapsuleGeometry(0.07, 0.62, 3, 6), pm, 0, -0.38, 0, legL); add(new THREE.CapsuleGeometry(0.07, 0.62, 3, 6), pm, 0, -0.38, 0, legR);
    add(new THREE.CapsuleGeometry(0.055, 0.5, 3, 6), sm, 0, -0.28, 0, armL); add(new THREE.CapsuleGeometry(0.055, 0.5, 3, 6), sm, 0, -0.28, 0, armR);
    g.add(legL, legR, armL, armR); g.scale.setScalar(h); g.userData = { legL, legR, armL, armR, torso };
    scene.add(g); return g;
  }
  const staff = person(0xffd21f); staff.position.set(7.6, 0, -34.3); staff.rotation.y = 0;
  const staff2 = person(0xffd21f, 1.04); staff2.position.set(9.9, 0, -34.3); staff2.rotation.y = 0;
  const runner = person(0x4b3bff); runner.position.set(-12.8, 0.28, -21.35);
  const lifter = person(0x2b2b36, 1.02); lifter.position.set(0, 0, -23.7);
  const walkA = person(0x3a3a48), walkB = person(0xc7c7d2, 0.96);
  const seated = person(0x6a5cff); seated.position.set(10.25, 0, -20.1); seated.rotation.y = Math.PI / 2;
  seated.userData.legL.rotation.x = -1.3; seated.userData.legR.rotation.x = -1.3; seated.position.y = -0.28; seated.userData.armL.rotation.x = -1.2; seated.userData.armR.rotation.x = -1.2;
  const lift2 = person(0x1c1c24); lift2.position.set(17.4, 0, -20.6); lift2.rotation.y = Math.PI / 2;

  function animate(t) {
    const s = t / 1000;
    // pessoas
    const sw = Math.sin(s * 7) * 0.9;
    runner.userData.legL.rotation.x = sw; runner.userData.legR.rotation.x = -sw; runner.userData.armL.rotation.x = -sw * 0.8; runner.userData.armR.rotation.x = sw * 0.8;
    runner.position.y = 0.28 + Math.abs(Math.sin(s * 7)) * 0.04;
    lifter.position.y = -Math.abs(Math.sin(s * 1.3)) * 0.32; lifter.userData.legL.rotation.x = lifter.userData.legR.rotation.x = Math.abs(Math.sin(s * 1.3)) * 0.2;
    lifter.userData.armL.rotation.z = lifter.userData.armR.rotation.z = 0; lifter.userData.armL.rotation.x = lifter.userData.armR.rotation.x = -Math.PI + 0.6;
    staff.userData.armR.rotation.z = -2.6 + Math.sin(s * 5) * 0.3; staff.userData.armR.rotation.x = 0;
    staff2.rotation.y = Math.sin(s * 0.6) * 0.15;
    lift2.userData.armL.rotation.x = lift2.userData.armR.rotation.x = -0.8 + Math.sin(s * 2) * 0.7;
    const wa = (s * 0.045) % 1, wb = (s * 0.04 + 0.5) % 1;
    walkA.position.set(-6.2, 0, -10 - wa * 26); walkA.rotation.y = Math.PI; walkB.position.set(6.2, 0, -36 + wb * 26); walkB.rotation.y = 0;
    [[walkA, wa], [walkB, wb]].forEach(([w, ph], i) => { const k = Math.sin(s * 5 + i); w.userData.legL.rotation.x = k * 0.6; w.userData.legR.rotation.x = -k * 0.6; w.userData.armL.rotation.x = -k * 0.4; w.userData.armR.rotation.x = k * 0.4; });
    // carros na estrada
    mover.position.x = 80 - ((s * 7) % 200); mover2.position.x = -90 + ((s * 6 + 70) % 200);
    // luminosidade do letreiro
    L5.intensity = 70 + Math.sin(s * 1.4) * 10;
  }

  /* ---------- Câmara: percurso de longe até ao interior ---------- */
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const KEYS = [
    { p: 0.00, pos: V(24, 34, 112), tgt: V(0, 3.5, -4), fov: 34, m: 1.0 },      // vista de longe
    { p: 0.10, pos: V(12, 14, 72), tgt: V(0, 3.5, -2), fov: 38, m: 1.05 },
    { p: 0.19, pos: V(3, 3.4, 33), tgt: V(0, 3.2, 0), fov: 42, m: 1.15 },       // parque
    { p: 0.28, pos: V(1, 2.3, 19), tgt: V(0, 2.8, -6), fov: 48, m: 1.05 },
    { p: 0.37, pos: V(0.3, 1.7, 9.5), tgt: V(0, 2.3, -14), fov: 54, m: 1 },     // porta
    { p: 0.45, pos: V(0, 1.75, 1.5), tgt: V(0, 2.2, -20), fov: 58, m: 1 },      // soleira
    { p: 0.55, pos: V(0, 2.6, -9), tgt: V(0, 2.1, -36), fov: 62, m: 1 },        // sala principal
    { p: 0.73, pos: V(-9.6, 1.7, -17), tgt: V(-11.3, 1.25, -33), fov: 58, m: 1 }, // máquinas
    { p: 0.92, pos: V(5.4, 1.7, -19.5), tgt: V(8.8, 1.55, -34), fov: 52, m: 1 },  // equipa
  ];
  const cuePs = KEYS.map((k) => k.p);
  const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => k.pos), false, "catmullrom", 0.4);
  const tgtCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => k.tgt), false, "catmullrom", 0.4);
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3(), tmpV = new THREE.Vector3();
  let W0 = 1, H0 = 1, bobPh = 0, bobAmp = 0;

  function place(p, t) {
    let i = 0; while (i < cuePs.length - 2 && p > cuePs[i + 1]) i++;
    const a = cuePs[i], b = cuePs[i + 1], tl = clamp((p - a) / (b - a)), s = lerp(tl, smooth(tl), 0.25), u = (i + s) / (KEYS.length - 1);
    posCurve.getPoint(u, camPos); tgtCurve.getPoint(u, camTgt);
    const portrait = W0 / H0 < 0.9, f = lerp(KEYS[i].m, KEYS[i + 1].m, s);
    if (portrait && f !== 1) { tmpV.copy(camPos).sub(camTgt); camPos.copy(camTgt).addScaledVector(tmpV, f); }
    const fov = lerp(KEYS[i].fov, KEYS[i + 1].fov, s) * (portrait ? 1.32 : 1);
    camera.fov = Math.min(fov, 80);
    const sw = t / 1000, ins = smooth(clamp((6 - camPos.z) / 6));
    camPos.x += Math.sin(sw * 0.4) * 0.12; camPos.y += Math.sin(sw * 0.55) * 0.07 + Math.sin(bobPh) * 0.045 * ins * bobAmp; camPos.x += Math.cos(bobPh * 0.5) * 0.03 * ins * bobAmp;
    const o = smooth(clamp((17 - camPos.z) / 8)); doors[0].position.x = -1.15 - o * 1.95; doors[1].position.x = 1.15 + o * 1.95;
    camera.position.copy(camPos); camera.lookAt(camTgt);
    camera.aspect = W0 / H0;
    const intro = 1 - smooth(clamp((p - 0.01) / (INTRO + 0.04)));
    const lift = 1 - intro;
    if (portrait) camera.setViewOffset(W0, H0, 0, H0 * (0.2 * lift - 0.3 * intro), W0, H0);
    else camera.setViewOffset(W0, H0, -W0 * 0.2 * intro, H0 * (0.15 * lift + 0.04 * intro), W0, H0);
    camera.updateProjectionMatrix();
    const inside = ins;
    const start = smooth(clamp(p / 0.19));
    renderer.toneMappingExposure = lerp(lerp(1.35, 1.05, start), 1.22, inside);
    scene.fog.density = lerp(0.0055, 0.0034, inside);
  }

  /* ---------- Ciclo ---------- */
  let target = 0, cur = 0, raf = 0, running = false, last = performance.now();
  const total = () => Math.max(1, sec.offsetHeight - window.innerHeight);
  const read = () => { target = clamp(-sec.getBoundingClientRect().top / total()); };
  window.addEventListener("scroll", read, { passive: true });
  function resize() {
    W0 = Math.max(1, host.clientWidth); H0 = Math.max(1, host.clientHeight);
    renderer.setSize(W0, H0, false); read();
  }
  new ResizeObserver(resize).observe(host); resize(); cur = target;

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const prev = cur; cur += (target - cur) * (1 - Math.exp(-dt * 5.5));
    const sp = Math.abs(cur - prev) / Math.max(dt, 0.001); bobAmp += (clamp(sp * 14) - bobAmp) * 0.15; bobPh += Math.abs(cur - prev) * 900;
    if (Math.abs(target - cur) < 0.00005) cur = target;
    animate(now); place(cur, now);
    renderer.render(scene, camera);
  }
  function loop(now) { frame(now); raf = requestAnimationFrame(loop); }
  new IntersectionObserver((es) => {
    const on = es[0].isIntersecting;
    if (on && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
    else if (!on && running) { running = false; cancelAnimationFrame(raf); }
  }, { rootMargin: "100px" }).observe(sec);
  document.addEventListener("visibilitychange", () => { if (document.hidden && running) { cancelAnimationFrame(raf); running = false; } else if (!document.hidden) read(); });

  frame(performance.now());
  sec.classList.add("gl-on");
  requestAnimationFrame(() => host.classList.add("ready"));

  /* gancho para testes: salta para um ponto do percurso */
  window.__gym = { jump(p) { target = cur = clamp(p); frame(performance.now()); return p; }, get p() { return cur; } };
}
