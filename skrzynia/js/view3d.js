// Three.js model of the chest from the generator's boxes; z is up. Boxes with lid: true turn
// about the hinge axis; hand holes are drawn on the tray ends.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bananaMesh } from '../../szkielet/js/view3d.js';
import { SKIRT_DROP } from './build.js';

const COLORS = {
  wall: 0xd3a86f, end: 0xc99c63, fingerA: 0xecd09f, fingerB: 0x7a5228, skirt: 0xc4955b, lid: 0xd8b07a, apron: 0xcfa36a,
  batten: 0xb98a52, cleat: 0xbf925b, bottom: 0xbf925b, runner: 0xbf925b, tray: 0xdcb47e, trayBottom: 0xc99c63,
  handle: 0xb98a52, metal: 0x2a2a2a, hinge: 0x2a2a2a,
};

export class ChestView {
  constructor(el) {
    this.el = el;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    el.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 10, 50000);
    this.camera.up.set(0, 0, 1);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8170, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 1.45);
    sun.position.set(-900, -1700, 2300);
    this.scene.add(sun);
    this.mats = {};
    this.edgeMat = new THREE.LineBasicMaterial({ color: 0x3a2c1c, transparent: true, opacity: 0.4 });
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.lidAngle = 80;
    this.first = true;
    new ResizeObserver(() => this.resize()).observe(el);
    const loop = () => { this.controls.update(); this.renderer.render(this.scene, this.camera); requestAnimationFrame(loop); };
    loop();
  }
  mat(c) { return (this.mats[c] ??= new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide })); }
  resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }
  setLid(deg) { this.lidAngle = deg; if (this.lid) this.lid.rotation.x = -THREE.MathUtils.degToRad(deg); }
  update(res, bg) {
    this.scene.background = new THREE.Color(bg || 0xf4efe6);
    this.root.clear();
    const g = res.geometry, d = res.d;
    const lid = new THREE.Group(), lidInner = new THREE.Group();
    lid.add(lidInner); lid.position.set(0, g.lidAxis.y, g.lidAxis.z); lidInner.position.set(0, -g.lidAxis.y, -g.lidAxis.z);
    for (const b of g.boxes) {
      if (b.kind === 'hole') { this.hole(b); continue; }
      const geo = new THREE.BoxGeometry(b.x1 - b.x0, b.y1 - b.y0, b.z1 - b.z0);
      const c = b.kind === 'wall' && b.face === 'end' ? COLORS.end : COLORS[b.kind] ?? 0xbf925b;
      const m = new THREE.Mesh(geo, this.mat(c));
      m.position.set((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), this.edgeMat));
      (b.lid ? lidInner : this.root).add(m);
    }
    this.root.add(lid); this.lid = lid; this.setLid(this.lidAngle);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), this.mat(0xe7dfd1));
    ground.position.z = -SKIRT_DROP - 0.5; this.root.add(ground);
    const ban = bananaMesh(d.Lo - 160, -300, -SKIRT_DROP - 20); ban.rotation.z = 0.15; this.root.add(ban);
    if (this.first) {
      this.first = false;
      this.camera.position.set(-1.35 * d.Lo, -2.4 * d.Do - 900, 1.9 * d.H + 500);
      this.controls.target.set(d.Lo / 2, d.Do / 2, d.H * 0.55);
      this.resize();
    }
  }
  hole(h) {
    const r = h.h / 2, s = new THREE.Shape();
    s.absarc(-h.len / 2 + r, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
    s.absarc(h.len / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
    const geo = new THREE.ShapeGeometry(s, 16); geo.rotateX(Math.PI / 2); geo.rotateZ(Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x3b2a18, side: THREE.DoubleSide });
    for (const x of h.x) for (const dx of [-0.6, 0.6]) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x + dx, h.yc, h.zTop - r); this.root.add(m);
    }
  }
  snapshot() { this.renderer.render(this.scene, this.camera); return this.renderer.domElement.toDataURL('image/jpeg', 0.9); }
}
