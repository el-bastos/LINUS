// LINUS — Main application logic and state management
// Orchestrates: atom selection → AO availability → mixing (drag or preset)
//             → equation display → 3D rendering → rotation analogy

import { ATOMS } from './data/atoms.js';
import { HYBRIDIZATIONS, getAONames } from './data/hybridizations.js';
import { computeHybridGrid, computeCustomHybridGrid, computeAOGrid } from './modules/orbital.js';
import { OrbitalViewer } from './modules/viewer3d.js';
import { EquationPanel } from './modules/equationPanel.js';
import { SCharacterPanel } from './modules/sCharacterPanel.js';

// ── State ─────────────────────────────────────────────

const state = {
  atom: null,
  atomKey: null,
  hybridization: null,
  hybKey: null,
  showAll: false,
  activeHybrid: 0,
  isovalue: 0.08,
  gridSize: 64,
  mode: 'preset',  // 'preset' or 'manual' (drag-and-drop)
};

let viewer, eqPanel, sCharPanel;
let cachedGrids = null;
let cachedKey = '';

// ── Init ──────────────────────────────────────────────

function init() {
  viewer = new OrbitalViewer(document.getElementById('viewer3d'));
  eqPanel = new EquationPanel(
    document.getElementById('equation-panel'),
    onMixChange
  );

  // Hybrid selection from equation panel
  eqPanel.onHybridSelect = (idx) => {
    if (!state.showAll) {
      state.activeHybrid = idx;
      renderOrbitals();
    }
  };

  // Single-click AO preview
  eqPanel.onAOPreview = (aoName) => {
    if (!state.atom) return;
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Computing...';
    requestAnimationFrame(() => {
      const gridData = computeAOGrid(state.atom, aoName, 48);
      if (gridData) {
        viewer.renderHybrid(gridData, state.isovalue);
      }
      statusEl.textContent = '';
    });
  };

  sCharPanel = new SCharacterPanel(document.getElementById('schar-panel'));
  sCharPanel.onCoefficientsChange = onSCharChange;

  setupAtomButtons();
  setupHybridButtons();
  setupViewControls();

  // Default: Carbon selected, no hybridization active
  selectAtom('C');
  eqPanel.clearMix();
  viewer.clearMeshes();
}

// ── Atom selector ─────────────────────────────────────

function setupAtomButtons() {
  const container = document.getElementById('atom-buttons');
  for (const key of Object.keys(ATOMS)) {
    const atom = ATOMS[key];
    const btn = document.createElement('button');
    btn.className = 'atom-btn';
    btn.textContent = key;
    btn.dataset.atom = key;
    btn.title = atom.name;
    btn.addEventListener('click', () => selectAtom(key));
    container.appendChild(btn);
  }
}

function selectAtom(key) {
  state.atomKey = key;
  state.atom = ATOMS[key];
  cachedGrids = null;
  cachedKey = '';

  // Active state on buttons
  document.querySelectorAll('.atom-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.atom === key);
  });

  // Atom info display
  const infoDiv = document.getElementById('atom-info');
  infoDiv.innerHTML = `<span class="atom-name">${state.atom.name}</span><span class="atom-config">${state.atom.valenceConfig}</span>`;

  // Notes
  const notesDiv = document.getElementById('atom-notes');
  notesDiv.textContent = state.atom.notes || '';
  notesDiv.hidden = !state.atom.notes;

  // Update available hybridizations
  updateAvailableHybrids();

  // Set available AO cards in equation panel
  eqPanel.setAtomAOs(state.atom.availableAOs);
  eqPanel.clearMix();

  // Keep current hybridization if compatible, otherwise clear
  if (state.hybKey && state.atom.hybridizations.includes(state.hybKey)) {
    selectHybridization(state.hybKey);
  } else {
    state.hybKey = null;
    state.hybridization = null;
    document.querySelectorAll('.hybrid-btn').forEach(b => b.classList.remove('active'));
    eqPanel.updateEquations(null);
    viewer.clearMeshes();
    updateGeometryInfo(null);
    sCharPanel.deactivate();
  }
}

function updateAvailableHybrids() {
  document.querySelectorAll('.hybrid-btn').forEach(btn => {
    const available = state.atom && state.atom.hybridizations.includes(btn.dataset.hybrid);
    btn.disabled = !available;
    btn.classList.toggle('unavailable', !available);
  });
}

// ── Hybridization selector ────────────────────────────

function setupHybridButtons() {
  const container = document.getElementById('hybrid-buttons');
  for (const key of Object.keys(HYBRIDIZATIONS)) {
    const hyb = HYBRIDIZATIONS[key];
    const btn = document.createElement('button');
    btn.className = 'hybrid-btn';
    btn.textContent = hyb.label;
    btn.dataset.hybrid = key;
    btn.addEventListener('click', () => selectHybridization(key));
    container.appendChild(btn);
  }
}

function selectHybridization(key) {
  state.hybKey = key;
  state.hybridization = HYBRIDIZATIONS[key];
  state.activeHybrid = 0;
  state.mode = 'preset';
  cachedGrids = null;
  cachedKey = '';

  document.querySelectorAll('.hybrid-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.hybrid === key);
  });

  // Populate mixing zone with the preset AOs
  const aoNames = getAONames(state.atom, key);
  eqPanel.setPresetMix(state.hybridization, state.atom.availableAOs);

  // Update equations
  eqPanel.updateEquations(state.hybridization, state.activeHybrid);

  // Activate s-character panel for sp³ with lone pairs
  if (key === 'sp3' && state.atom.lonePairs && state.atom.lonePairs.sp3 > 0) {
    sCharPanel.activate(state.atom, state.atom.lonePairs.sp3);
  } else {
    sCharPanel.deactivate();
  }

  // Update geometry info
  updateGeometryInfo(state.hybridization);

  // Compute and render
  recompute();
}

function updateGeometryInfo(hyb) {
  const div = document.getElementById('geometry-info');
  if (!hyb) {
    div.innerHTML = '';
    return;
  }
  div.innerHTML = `
    <span class="geom-type">${hyb.geometry}</span>
    <span class="geom-angle">${hyb.idealAngle}°</span>
    <span class="geom-desc">${hyb.description}</span>
  `;
}

// ── Manual mixing (drag-and-drop callback) ────────────

function onMixChange(mixedAOs) {
  cachedGrids = null;
  cachedKey = '';

  if (mixedAOs.length === 0) {
    state.mode = 'manual';
    viewer.clearMeshes();
    viewer._clearAngles();
    document.querySelectorAll('.hybrid-btn').forEach(b => b.classList.remove('active'));
    updateGeometryInfo(null);
    sCharPanel.deactivate();
    return;
  }

  // Check if the mixed AOs match a known hybridization — if so, use the preset
  const matchingHyb = detectHybridization(mixedAOs);
  if (matchingHyb) {
    selectHybridization(matchingHyb);
    return;
  }

  // Partial mix — show the combined orbital incrementally
  state.mode = 'manual';
  document.querySelectorAll('.hybrid-btn').forEach(b => b.classList.remove('active'));
  updateGeometryInfo(null);

  const customAOs = mixedAOs.map(ao => ({ aoName: ao, coefficient: 1 }));
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Computing...';

  requestAnimationFrame(() => {
    const gridData = computeCustomHybridGrid(state.atom, customAOs, state.gridSize);
    if (gridData) {
      viewer.renderHybrid(gridData, state.isovalue);
    }
    statusEl.textContent = '';
  });
}

// ── s-Character slider callback ─────────────────────

function onSCharChange(coeffData, angle, s2Bond, s2LP) {
  if (!state.atom) return;

  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Computing...';

  // Build a hybData-like object for rendering
  const hybLike = {
    orbitals: coeffData.orbitals,
    coefficients: coeffData.coefficients,
    count: coeffData.count,
    labels: coeffData.labels,
    geometry: `${angle.toFixed(1)}° (Coulson)`,
    idealAngle: angle,
    description: `${coeffData.bondingCount} bonding + ${coeffData.lpCount} lone pair${coeffData.lpCount !== 1 ? 's' : ''}`,
    latex: coeffData.coefficients.map((row, i) => {
      const label = coeffData.labels[i];
      const terms = row.map((c, j) => {
        if (Math.abs(c) < 1e-10) return null;
        const aoName = coeffData.orbitals[j] === 's' ? 's' : `p_${coeffData.orbitals[j].slice(1)}`;
        const sign = c >= 0 ? '+' : '-';
        return `${sign}${Math.abs(c).toFixed(4)}\\,${aoName}`;
      }).filter(Boolean).join(' ');
      return `${label} = ${terms}`;
    }),
  };

  // Use lower grid while dragging for responsiveness
  const gridSize = 48;

  requestAnimationFrame(() => {
    cachedGrids = [];
    for (let i = 0; i < hybLike.count; i++) {
      cachedGrids.push(computeHybridGrid(state.atom, hybLike, i, gridSize));
    }
    cachedKey = '';  // don't cache s-character variants

    // Always show all hybrids in s-character mode
    state.showAll = true;
    const showAllBtn = document.getElementById('btn-show-all');
    showAllBtn.classList.add('active');
    showAllBtn.textContent = 'Single';

    viewer.renderAllHybrids(cachedGrids, state.isovalue, hybLike);
    updateGeometryInfo(hybLike);
    statusEl.textContent = '';
  });
}

function detectHybridization(mixedAOs) {
  // Check if the set of mixed AOs matches a known hybridization
  const types = mixedAOs.map(ao => ao.replace(/^[0-9]+/, '')); // strip quantum number
  const sorted = types.slice().sort().join(',');

  const patterns = {
    'px,s': 'sp',
    'px,py,s': 'sp2',
    'px,py,pz,s': 'sp3',
    'dz2,px,py,pz,s': 'sp3d',
    'dx2y2,dz2,px,py,pz,s': 'sp3d2',
  };

  return patterns[sorted] || null;
}

// ── Computation ───────────────────────────────────────

function recompute() {
  if (!state.atom || !state.hybridization) return;

  const key = `${state.atomKey}-${state.hybKey}`;
  if (cachedKey === key && cachedGrids) {
    renderOrbitals();
    return;
  }

  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Computing...';

  requestAnimationFrame(() => {
    cachedGrids = [];
    for (let i = 0; i < state.hybridization.count; i++) {
      cachedGrids.push(computeHybridGrid(state.atom, state.hybridization, i, state.gridSize));
    }
    cachedKey = key;
    statusEl.textContent = '';
    renderOrbitals();
  });
}

function renderOrbitals() {
  if (!cachedGrids) return;

  if (state.showAll) {
    viewer.renderAllHybrids(cachedGrids, state.isovalue, state.hybridization);
    eqPanel.clearHighlight();
  } else {
    const idx = Math.min(state.activeHybrid, cachedGrids.length - 1);
    viewer.renderHybrid(cachedGrids[idx], state.isovalue);
    viewer.setHybData(state.hybridization, cachedGrids);
    eqPanel.highlightHybrid(idx);
  }
}

// ── View controls ─────────────────────────────────────

function setupViewControls() {
  // Show all / single toggle
  const showAllBtn = document.getElementById('btn-show-all');
  showAllBtn.addEventListener('click', () => {
    state.showAll = !state.showAll;
    showAllBtn.classList.toggle('active', state.showAll);
    showAllBtn.textContent = state.showAll ? 'Single' : 'Show all';
    renderOrbitals();
  });

  // Axes toggle
  const axesBtn = document.getElementById('btn-axes');
  axesBtn.addEventListener('click', () => {
    const show = !viewer.showAxes;
    viewer.toggleAxes(show);
    axesBtn.classList.toggle('active', show);
  });

  // Angles toggle
  const anglesBtn = document.getElementById('btn-angles');
  anglesBtn.addEventListener('click', () => {
    const show = !viewer.showAngles;
    viewer.toggleAngles(show);
    anglesBtn.classList.toggle('active', show);
  });

  // Reset camera
  document.getElementById('btn-reset-cam').addEventListener('click', () => {
    viewer.resetCamera();
  });

  // View orientation buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      viewer.setView(btn.dataset.view);
    });
  });

  // Isovalue slider
  const slider = document.getElementById('iso-slider');
  const sliderVal = document.getElementById('iso-value');
  slider.addEventListener('input', () => {
    state.isovalue = parseFloat(slider.value);
    sliderVal.textContent = state.isovalue.toFixed(3);
    renderOrbitals();
  });
}

// ── Boot ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
