// Three.js model of the building. Members are extruded polygons; z is up.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const LAYERS = [
  ['base', 'Rama 100×100'], ['floor', 'Legary'], ['floorSheet', 'Podłoga OSB'], ['walls', 'Szkielet ścian'],
  ['wallSheet', 'Poszycie ścian'], ['roof', 'Krokwie i łaty'], ['cover', 'Pokrycie'],
];
export const PRESETS = {
  frame: { base: true, floor: true, floorSheet: false, walls: true, wallSheet: false, roof: true, cover: false },
  all: { base: true, floor: true, floorSheet: true, walls: true, wallSheet: true, roof: true, cover: true },
};

const COLORS = { beam: 0x8c6a43, joist: 0xc9a66b, stud: 0xe0bd84, king: 0xe0bd84, trimmer: 0xc99a5b, cripple: 0xe0bd84, plate: 0xc99a5b, header: 0xb9783e, sill: 0xb9783e, nog: 0xe9cc9a, rafter: 0xbf8f55, tie: 0xbf8f55, verge: 0xa77b45, batten: 0xa77b45 };

export class View3D {
  constructor(el) {
    this.el = el;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    el.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 50, 200000);
    this.camera.up.set(0, 0, 1);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8170, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(-4000, -6000, 9000);
    this.scene.add(sun);
    this.groups = {};
    this.mats = {};
    this.vis = { ...PRESETS.all };
    this.first = true;
    new ResizeObserver(() => this.resize()).observe(el);
    const loop = () => { this.controls.update(); this.renderer.render(this.scene, this.camera); requestAnimationFrame(loop); };
    loop();
  }

  mat(color, opts = {}) {
    const k = `${color}|${opts.opacity || 1}`;
    if (!this.mats[k]) this.mats[k] = new THREE.MeshLambertMaterial({ color, transparent: (opts.opacity || 1) < 1, opacity: opts.opacity || 1, side: THREE.DoubleSide, depthWrite: (opts.opacity || 1) >= 1 });
    return this.mats[k];
  }

  setBackground(css) { this.scene.background = new THREE.Color(css); }

  resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  update(res, state) {
    for (const g of Object.values(this.groups)) { this.scene.remove(g); g.traverse((o) => o.geometry && o.geometry.dispose()); }
    this.groups = {};
    const grp = (k) => (this.groups[k] ||= new THREE.Group());
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x3a2c1c, transparent: true, opacity: 0.35 });
    for (const m of res.members) {
      const layer = m.group === 'base' ? 'base' : m.group === 'floor' ? 'floor' : m.group === 'roof' ? 'roof' : 'walls';
      const geo = extrude(m.shape);
      const mesh = new THREE.Mesh(geo, this.mat(COLORS[m.kind] || 0xd9b47a));
      grp(layer).add(mesh);
      grp(layer).add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), edgeMat));
    }
    for (const p of res.floorSheets) for (const c of p.cells) grp('floorSheet').add(new THREE.Mesh(extrude({ ...p.shape3d, poly: c.poly.map(([u, v]) => [p.shape3d.map(u), v]) }), this.mat(0xbf9558)));
    for (const p of res.wallSheets) for (const c of p.cells) grp('wallSheet').add(new THREE.Mesh(extrude({ ...p.shape3d, poly: c.poly.map(([u, v]) => [p.shape3d.map(u), v]) }), this.mat(0xd9b46a, { opacity: 0.92 })));
    for (const g of res.roof.grid) for (const c of g.cells) grp('cover').add(new THREE.Mesh(extrude(c.shape), c.clear ? this.mat(0x9fdcf0, { opacity: 0.45 }) : this.mat(0x5b3c30)));
    const { L, W } = state.dims;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(L + 6000, W + 6000), new THREE.MeshLambertMaterial({ color: 0x9aa58f }));
    ground.position.set(L / 2, W / 2, -2);
    grp('ground').add(ground);
    grp('ground').add(bananaMesh(L + 350, -250, 0));
    grp('ground').add(bananaMesh(L * 0.3, W * 0.35, res.info.zf));
    for (const [k, g] of Object.entries(this.groups)) { g.visible = k === 'ground' || this.vis[k] !== false; this.scene.add(g); }
    if (this.first) { this.home(res, state); this.first = false; }
  }

  setVisible(vis) { this.vis = { ...this.vis, ...vis }; for (const [k, g] of Object.entries(this.groups)) if (k !== 'ground') g.visible = this.vis[k] !== false; }

  home(res, state) {
    const { L, W } = state.dims, H = res.info.topZ || 3000;
    const c = new THREE.Vector3(L / 2, W / 2, H / 2.4);
    const r = Math.max(L, W, H) * 2.4;
    this.camera.position.set(c.x - r * 0.75, c.y - r * 0.95, c.z + r * 0.55);
    this.controls.target.copy(c);
    this.controls.update();
  }

  snapshot(w = 1600, h = 1000) {
    const old = [this.el.clientWidth, this.el.clientHeight];
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    const url = this.renderer.domElement.toDataURL('image/jpeg', 0.9);
    this.renderer.setSize(old[0], old[1], false); this.camera.aspect = old[0] / old[1]; this.camera.updateProjectionMatrix();
    return url;
  }
}

// plane 'xy': u=x, v=y, extrude along z; 'xz': u=x, v=z, along y; 'yz': u=y, v=z, along x.
function extrude(sh) {
  const shape = new THREE.Shape(sh.poly.map(([u, v]) => new THREE.Vector2(u, v)));
  const depth = sh.d[1] - sh.d[0];
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  const m = new THREE.Matrix4();
  if (sh.plane === 'xy') m.makeTranslation(0, 0, sh.d[0]);
  else if (sh.plane === 'xz') m.set(1, 0, 0, 0, 0, 0, -1, sh.d[1], 0, 1, 0, 0, 0, 0, 0, 1);
  else m.set(0, 0, 1, sh.d[0], 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1);
  geo.applyMatrix4(m);
  return geo;
}

function bananaMesh(x, y, z) {
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([[0, 0, 40], [50, 18, 22], [100, 22, 18], [150, 12, 24], [185, -8, 46]].map((p) => new THREE.Vector3(...p)));
  const tube = new THREE.TubeGeometry(curve, 40, 17, 10, false);
  const pos = tube.attributes.position;
  // taper the ends
  const pts = curve.getSpacedPoints(40);
  for (let i = 0; i < pos.count; i++) {
    const seg = Math.floor(i / 11), t = seg / 40, c = pts[Math.min(40, seg)];
    const k = Math.sin(Math.PI * Math.min(1, Math.max(0.12, t))) ** 0.6;
    pos.setXYZ(i, c.x + (pos.getX(i) - c.x) * k, c.y + (pos.getY(i) - c.y) * k, c.z + (pos.getZ(i) - c.z) * k);
  }
  tube.computeVertexNormals();
  g.add(new THREE.Mesh(tube, new THREE.MeshLambertMaterial({ color: 0xf2cf3c })));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 22, 6), new THREE.MeshLambertMaterial({ color: 0x6b5a2a }));
  stem.position.set(192, -14, 52); stem.rotation.z = 0.9;
  g.add(stem);
  g.position.set(x, y, z);
  g.rotation.z = 0.5;
  return g;
}
