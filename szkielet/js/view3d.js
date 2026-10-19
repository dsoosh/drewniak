// Three.js model of the building. Members are extruded polygons; z is up.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const LAYERS = [
  ['base', 'Rama z belek'], ['floor', 'Legary'], ['floorSheet', 'Podłoga OSB'], ['walls', 'Szkielet ścian'],
  ['wallSheet', 'Poszycie z zewnątrz'], ['wallSheetIn', 'Poszycie od środka'], ['roof', 'Krokwie i łaty'],
  ['cover', 'Pokrycie'], ['openings', 'Okna i drzwi'], ['anchors', 'Kotwy gruntowe'],
];
const ALL = Object.fromEntries(LAYERS.map(([k]) => [k, true]));
export const PRESETS = {
  frame: { ...ALL, floorSheet: false, wallSheet: false, wallSheetIn: false, cover: false, openings: false },
  all: { ...ALL, openings: false },
  vis: { ...ALL, anchors: false },
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
    this.stereoCam = new THREE.StereoCamera();
    this.stereo = false;
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
    const loop = () => { this.controls.update(); this.draw(); requestAnimationFrame(loop); };
    loop();
  }

  draw() {
    const r = this.renderer;
    if (!this.stereo) { r.setScissorTest(false); r.render(this.scene, this.camera); return; }
    // cross-eye: the left half shows the right eye's view
    const size = r.getSize(new THREE.Vector2());
    this.camera.updateMatrixWorld();
    const dist = this.camera.position.distanceTo(this.controls.target);
    this.camera.focus = dist;   // zero parallax at the orbit target
    this.stereoCam.eyeSep = dist / 30;
    this.stereoCam.update(this.camera);
    r.setScissorTest(true);
    const half = size.x / 2;
    for (const [cam, x] of [[this.stereoCam.cameraR, 0], [this.stereoCam.cameraL, half]]) {
      r.setScissor(x, 0, half, size.y); r.setViewport(x, 0, half, size.y); r.render(this.scene, cam);
    }
    r.setScissorTest(false); r.setViewport(0, 0, size.x, size.y);
  }

  setStereo(on) { this.stereo = on; this.resize(); }

  mat(color, opts = {}) {
    const k = `${color}|${opts.opacity || 1}|${opts.offset || 0}`;
    if (!this.mats[k]) this.mats[k] = new THREE.MeshLambertMaterial({
      color, transparent: (opts.opacity || 1) < 1, opacity: opts.opacity || 1, side: THREE.DoubleSide, depthWrite: (opts.opacity || 1) >= 1,
      polygonOffset: !!opts.offset, polygonOffsetFactor: opts.offset || 0, polygonOffsetUnits: opts.offset || 0,
    });
    return this.mats[k];
  }

  setBackground(css) { this.scene.background = new THREE.Color(css); }

  resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = (this.stereo ? w / 2 : w) / h;
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
      grp(layer).add(new THREE.Mesh(geo, this.mat(COLORS[m.kind] || 0xd9b47a, { offset: 1 })));
      grp(layer).add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), edgeMat));
    }
    const sheet = (p) => p.cells.map((c) => extrude({ ...p.shape3d, poly: c.poly.map(([u, v]) => [p.shape3d.map(u), v]) }));
    for (const p of res.floorSheets) for (const g of sheet(p)) grp('floorSheet').add(new THREE.Mesh(g, this.mat(0xbf9558)));
    for (const p of res.wallSheets) for (const g of sheet(p)) grp(p.side === 'in' ? 'wallSheetIn' : 'wallSheet').add(new THREE.Mesh(g, this.mat(p.side === 'in' ? 0xe3c88f : 0xd9b46a)));
    for (const g of res.roof.grid) for (const c of g.cells) grp('cover').add(new THREE.Mesh(extrude(c.shape), c.clear ? this.mat(0x9fdcf0, { opacity: 0.45 }) : this.mat(0x5b3c30)));
    this.openings(res, state, grp('openings'));
    this.anchors(res, grp('anchors'));
    const { L, W } = state.dims;
    this.groundMat = new THREE.MeshLambertMaterial({ color: 0x9aa58f, transparent: true, opacity: 1, depthWrite: true });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(L + 6000, W + 6000), this.groundMat);
    ground.position.set(L / 2, W / 2, -2);
    grp('ground').add(ground);
    grp('ground').add(bananaMesh(L + 350, -250, 0));
    grp('ground').add(bananaMesh(L * 0.3, W * 0.35, res.info.zf));
    for (const [k, g] of Object.entries(this.groups)) this.scene.add(g);
    this.setVisible({});
    if (this.first) { this.home(res, state); this.first = false; }
  }

  // window frames with glass, door frames with a leaf; plain openings stay empty
  openings(res, state, group) {
    const zf = res.info.zf;
    const frameMat = this.mat(0xf4f1ea), glassMat = this.mat(0x9fd3ea, { opacity: 0.4 }), leafMat = this.mat(0x6d4a32), handleMat = this.mat(0x2a2a2a);
    const F = 55;
    for (const [id, def] of Object.entries(res.walls)) {
      const list = id in state.openings ? state.openings[id] : state.partitions.find((p) => p.id === id)?.openings || [];
      const d0 = Math.min(def.depth[0], ...(def.sheet || [def.depth[0]])), d1 = Math.max(def.depth[1], ...(def.sheet || [def.depth[1]]));
      const mid = (d0 + d1) / 2;
      const box = (u0, u1, v0, v1, a, b, m) => group.add(new THREE.Mesh(extrude({ plane: def.plane, poly: [[def.map(u0), v0], [def.map(u1), v0], [def.map(u1), v1], [def.map(u0), v1]], d: [a, b] }), m));
      for (const o of list) {
        if (o.type === 'opening') continue;
        const u0 = o.U, u1 = o.U + o.w, v0 = zf + o.sill, v1 = v0 + o.h;
        box(u0, u0 + F, v0, v1, mid - 35, mid + 35, frameMat);
        box(u1 - F, u1, v0, v1, mid - 35, mid + 35, frameMat);
        box(u0, u1, v1 - F, v1, mid - 35, mid + 35, frameMat);
        if (o.type === 'window') {
          box(u0, u1, v0, v0 + F, mid - 35, mid + 35, frameMat);
          box(u0 + F, u1 - F, v0 + F, v1 - F, mid - 3, mid + 3, glassMat);
        } else {
          box(u0 + F, u1 - F, v0, v1 - F, mid - 20, mid + 20, leafMat);
          const hu = u1 - F - 90, hz = v0 + 1050;
          box(hu, hu + 120, hz, hz + 25, mid - 70, mid + 70, handleMat);
        }
      }
    }
  }

  // screw piles: head plate under the beam, shaft and helix below ground
  anchors(res, group) {
    const steel = this.mat(0x6f7a80), head = this.mat(0x4d575c);
    for (const [x, y] of res.info.supports) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(150, 150, 8), head);
      plate.position.set(x, y, -4);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(38, 38, 1000, 16), steel);
      shaft.rotation.x = Math.PI / 2; shaft.position.set(x, y, -508);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(38, 120, 16), steel);
      tip.rotation.x = -Math.PI / 2; tip.position.set(x, y, -1068);
      const helix = new THREE.Mesh(new THREE.TorusGeometry(80, 8, 6, 24), steel);
      helix.position.set(x, y, -900);
      group.add(plate, shaft, tip, helix);
    }
  }

  setVisible(vis) {
    this.vis = { ...this.vis, ...vis };
    for (const [k, g] of Object.entries(this.groups)) if (k !== 'ground') g.visible = this.vis[k] !== false;
    // see-through ground while anchors are shown
    if (this.groundMat) { const see = this.vis.anchors !== false; this.groundMat.opacity = see ? 0.45 : 1; this.groundMat.depthWrite = !see; }
  }

  home(res, state) {
    const { L, W } = state.dims, H = res.info.topZ || 3000;
    const c = new THREE.Vector3(L / 2, W / 2, H / 2.4);
    const r = Math.max(L, W, H) * 2.4;
    this.camera.position.set(c.x - r * 0.75, c.y - r * 0.95, c.z + r * 0.55);
    this.controls.target.copy(c);
    this.controls.update();
  }

  snapshot(w = 1600, h = 1000) {
    const old = [this.el.clientWidth, this.el.clientHeight], st = this.stereo;
    this.stereo = false;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    const url = this.renderer.domElement.toDataURL('image/jpeg', 0.9);
    this.stereo = st;
    this.renderer.setSize(old[0], old[1], false); this.camera.aspect = (st ? old[0] / 2 : old[0]) / old[1]; this.camera.updateProjectionMatrix();
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
