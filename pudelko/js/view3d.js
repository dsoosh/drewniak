// Three.js model of the practice box from the generator's boxes; z is up. Lid boxes move as the
// generator says: turn about the hinge axis, lift, or slide out.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bananaMesh } from '../../szkielet/js/view3d.js';

const COLORS = {
  wall: 0xd3a86f, end: 0xc99c63, fingerA: 0xecd09f, fingerB: 0x7a5228, bottom: 0xbf925b, panel: 0xd8b07a, lidPanel: 0xd8b07a,
  lip: 0xbf925b, batten: 0xc99c63, hinge: 0xb08d3a, grip: 0x8a6338, recess: 0x5a3b22,
};

export class BoxView {
  constructor(el) {
    this.el = el;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    el.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 5, 20000);
    this.camera.up.set(0, 0, 1);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8170, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(-400, -700, 900); this.scene.add(sun);
    this.mats = {};
    this.edge = new THREE.LineBasicMaterial({ color: 0x3a2c1c, transparent: true, opacity: 0.45 });
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.open = 0.8; this.first = true;
    new ResizeObserver(() => this.resize()).observe(el);
    const loop = () => { this.controls.update(); this.renderer.render(this.scene, this.camera); requestAnimationFrame(loop); };
    loop();
  }
  mat(c) { return (this.mats[c] ??= new THREE.MeshLambertMaterial({ color: c })); }
  resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }
  setOpen(t) {
    this.open = t;
    const m = this.motion, g = this.lid;
    if (!m || !g) return;
    g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); this.lidInner.position.set(0, 0, 0);
    if (m.kind === 'hinge') { g.position.set(0, m.y, m.z); this.lidInner.position.set(0, -m.y, -m.z); g.rotation.x = -THREE.MathUtils.degToRad(m.deg * t); }
    else if (m.kind === 'slide') g.position.x = m.dx * t;
    else { g.position.set(-10 * t, 50 * t, m.dz * t * 1.6); g.rotation.x = -0.3 * t; }
  }
  update(res, bg) {
    this.scene.background = new THREE.Color(bg || 0xf4efe6);
    this.root.clear();
    const g = res.geometry, d = res.d;
    this.lid = new THREE.Group(); this.lidInner = new THREE.Group(); this.lid.add(this.lidInner); this.motion = g.lidMotion;
    for (const b of g.boxes) {
      const geo = new THREE.BoxGeometry(b.x1 - b.x0, b.y1 - b.y0, b.z1 - b.z0);
      const c = b.kind === 'wall' && b.face === 'end' ? COLORS.end : COLORS[b.kind] ?? 0xbf925b;
      const m = new THREE.Mesh(geo, this.mat(c));
      m.position.set((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), this.edge));
      (b.lid ? this.lidInner : this.root).add(m);
    }
    this.root.add(this.lid); this.setOpen(this.open);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), this.mat(0xe7dfd1)); ground.position.z = -0.5; this.root.add(ground);
    const ban = bananaMesh(d.Lo + 40, -150, -18); ban.rotation.z = 0.5; this.root.add(ban);
    if (this.first) {
      this.first = false;
      this.camera.position.set(-1.8 * d.Lo, -4 * d.Do, 3.5 * d.total.H + 250);
      this.controls.target.set(d.Lo / 2 + 30, d.Do / 2, d.H * 0.8);
      this.resize();
    }
  }
  snapshot() { this.renderer.render(this.scene, this.camera); return this.renderer.domElement.toDataURL('image/jpeg', 0.9); }
}
