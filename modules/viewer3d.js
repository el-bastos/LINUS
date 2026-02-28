// Three.js 3D orbital viewer
// Renders isosurface meshes with phase coloring
// Establishes 3D coordinate space with labeled axes and angle measurements

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { marchingCubes } from './marchingCubes.js';

const COLORS = {
  positive: 0x4488ff,
  negative: 0xff8844,
  background: 0x1a1a2e,
  xAxis: 0xff4444,
  yAxis: 0x44cc44,
  zAxis: 0x4488ff,
  grid: 0x333355,
  angleLine: 0xffff44,
};

export class OrbitalViewer {
  constructor(container) {
    this.container = container;
    this.meshes = [];
    this.angleObjects = [];
    this.showAxes = true;
    this.showAngles = false;
    this.hybData = null;

    this._initScene();
    this._initLights();
    this._initCoordinateSpace();
    this._animate();

    window.addEventListener('resize', () => this._onResize());
  }

  _initScene() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.background);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(6, 4, 6);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // CSS2D renderer for axis labels
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(w, h);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.left = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.container.appendChild(this.labelRenderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 30;
  }

  _initLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const dir1 = new THREE.DirectionalLight(0xffffff, 0.7);
    dir1.position.set(5, 5, 5);
    this.scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dir2.position.set(-3, -2, -4);
    this.scene.add(dir2);
  }

  // ── Coordinate space ────────────────────────────────

  _initCoordinateSpace() {
    this.coordGroup = new THREE.Group();
    this.scene.add(this.coordGroup);

    const axisLen = 4;
    const arrowLen = 0.3;
    const arrowRad = 0.06;

    // Axis lines and arrows
    const axes = [
      { dir: new THREE.Vector3(1, 0, 0), color: COLORS.xAxis, label: 'x' },
      { dir: new THREE.Vector3(0, 1, 0), color: COLORS.yAxis, label: 'y' },
      { dir: new THREE.Vector3(0, 0, 1), color: COLORS.zAxis, label: 'z' },
    ];

    for (const ax of axes) {
      // Line
      const mat = new THREE.LineBasicMaterial({ color: ax.color, linewidth: 2 });
      const points = [
        new THREE.Vector3().copy(ax.dir).multiplyScalar(-axisLen * 0.3),
        new THREE.Vector3().copy(ax.dir).multiplyScalar(axisLen),
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, mat);
      this.coordGroup.add(line);

      // Arrowhead
      const arrowGeom = new THREE.ConeGeometry(arrowRad, arrowLen, 8);
      const arrowMat = new THREE.MeshBasicMaterial({ color: ax.color });
      const arrow = new THREE.Mesh(arrowGeom, arrowMat);
      const tipPos = new THREE.Vector3().copy(ax.dir).multiplyScalar(axisLen);
      arrow.position.copy(tipPos);
      // Orient cone along axis direction
      arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ax.dir);
      this.coordGroup.add(arrow);

      // Label
      const labelEl = document.createElement('div');
      labelEl.className = 'axis-label';
      labelEl.textContent = ax.label;
      labelEl.style.color = '#' + ax.color.toString(16).padStart(6, '0');
      const labelObj = new CSS2DObject(labelEl);
      labelObj.position.copy(ax.dir).multiplyScalar(axisLen + 0.4);
      this.coordGroup.add(labelObj);
    }

    // Ground grid in xz plane
    const gridSize = 8;
    const gridDiv = 8;
    const gridHelper = new THREE.GridHelper(gridSize, gridDiv, COLORS.grid, COLORS.grid);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    this.coordGroup.add(gridHelper);

    // Origin sphere
    const originGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const originMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.coordGroup.add(new THREE.Mesh(originGeom, originMat));
  }

  toggleAxes(show) {
    this.showAxes = show;
    this.coordGroup.visible = show;
  }

  // ── Angle measurements ──────────────────────────────

  _clearAngles() {
    for (const obj of this.angleObjects) {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }
    this.angleObjects = [];
  }

  _showAnglesBetweenHybrids(hybData, gridDataArray) {
    this._clearAngles();
    if (!this.showAngles || !hybData || !gridDataArray) return;

    // Compute direction vectors for each hybrid from their p-coefficients
    const directions = hybData.coefficients.map(row => {
      // The direction is determined by the p (and d) coefficients
      // For s, px, py, pz: direction = (c_px, c_py, c_pz)
      const orbs = hybData.orbitals;
      let dx = 0, dy = 0, dz = 0;
      for (let i = 0; i < orbs.length; i++) {
        if (orbs[i] === 'px') dx = row[i];
        else if (orbs[i] === 'py') dy = row[i];
        else if (orbs[i] === 'pz') dz = row[i];
      }
      const len = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
      return new THREE.Vector3(dx/len, dy/len, dz/len);
    });

    // Draw angle arcs between adjacent pairs
    const scale = 2;
    for (let i = 0; i < directions.length; i++) {
      for (let j = i + 1; j < directions.length; j++) {
        const d1 = directions[i];
        const d2 = directions[j];
        const angle = Math.acos(Math.max(-1, Math.min(1, d1.dot(d2))));
        const angleDeg = (angle * 180 / Math.PI).toFixed(1);

        // Draw arc
        const arcPoints = [];
        const steps = 20;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const v = new THREE.Vector3().lerpVectors(d1, d2, t).normalize().multiplyScalar(scale);
          arcPoints.push(v);
        }
        const arcGeom = new THREE.BufferGeometry().setFromPoints(arcPoints);
        const arcMat = new THREE.LineBasicMaterial({ color: COLORS.angleLine, opacity: 0.6, transparent: true });
        const arc = new THREE.Line(arcGeom, arcMat);
        this.scene.add(arc);
        this.angleObjects.push(arc);

        // Angle label at midpoint of arc
        const midV = new THREE.Vector3().lerpVectors(d1, d2, 0.5).normalize().multiplyScalar(scale + 0.3);
        const labelEl = document.createElement('div');
        labelEl.className = 'angle-label';
        labelEl.textContent = angleDeg + '°';
        const labelObj = new CSS2DObject(labelEl);
        labelObj.position.copy(midV);
        this.scene.add(labelObj);
        this.angleObjects.push(labelObj);
      }
    }
  }

  toggleAngles(show) {
    this.showAngles = show;
    if (this.hybData && this._lastGridData) {
      this._showAnglesBetweenHybrids(this.hybData, this._lastGridData);
    } else {
      this._clearAngles();
    }
  }

  // ── Rendering ───────────────────────────────────────

  _onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  clearMeshes() {
    for (const mesh of this.meshes) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.meshes = [];
  }

  // Add isosurface mesh from grid data with phase coloring
  addOrbitalMesh(gridData, isovalue = 0.02, opacity = 0.85) {
    const { values, gridSize, bounds } = gridData;

    // Positive lobe
    const posResult = marchingCubes(values, gridSize, bounds, isovalue);
    if (posResult.positions.length > 0) {
      const mesh = this._createMesh(posResult, COLORS.positive, opacity);
      this.scene.add(mesh);
      this.meshes.push(mesh);
    }

    // Negative lobe — run MC at negative threshold, then flip normals/winding
    const negResult = marchingCubes(values, gridSize, bounds, -isovalue);
    if (negResult.positions.length > 0) {
      for (let i = 0; i < negResult.normals.length; i++) {
        negResult.normals[i] = -negResult.normals[i];
      }
      for (let i = 0; i < negResult.positions.length; i += 9) {
        for (let j = 0; j < 3; j++) {
          const tmp = negResult.positions[i+3+j];
          negResult.positions[i+3+j] = negResult.positions[i+6+j];
          negResult.positions[i+6+j] = tmp;
          const tmpN = negResult.normals[i+3+j];
          negResult.normals[i+3+j] = negResult.normals[i+6+j];
          negResult.normals[i+6+j] = tmpN;
        }
      }
      const mesh = this._createMesh(negResult, COLORS.negative, opacity);
      this.scene.add(mesh);
      this.meshes.push(mesh);
    }
  }

  _createMesh(result, color, opacity) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(result.positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(result.normals, 3));
    const material = new THREE.MeshPhongMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      side: THREE.DoubleSide,
      shininess: 60,
    });
    return new THREE.Mesh(geometry, material);
  }

  // Render a single hybrid orbital
  renderHybrid(gridData, isovalue = 0.02) {
    this.clearMeshes();
    this.addOrbitalMesh(gridData, isovalue);
  }

  // Render all hybrid orbitals with transparency
  renderAllHybrids(gridDataArray, isovalue = 0.02, hybData = null) {
    this.clearMeshes();
    this.hybData = hybData;
    this._lastGridData = gridDataArray;
    for (const gridData of gridDataArray) {
      this.addOrbitalMesh(gridData, isovalue, 0.55);
    }
    if (this.showAngles && hybData) {
      this._showAnglesBetweenHybrids(hybData, gridDataArray);
    }
  }

  setHybData(hybData, gridDataArray) {
    this.hybData = hybData;
    this._lastGridData = gridDataArray;
  }

  resetCamera() {
    this.camera.position.set(6, 4, 6);
    this.camera.lookAt(0, 0, 0);
    this.controls.reset();
  }
}
