// Equation panel with mixing zone and draggable AO cards
// Center panel: equation display (top) + available AOs (draggable) + mixing zone

import { AO_LABELS } from '../data/atoms.js';

export class EquationPanel {
  constructor(container, onMixChange) {
    this.container = container;
    this.onMixChange = onMixChange; // callback when mixing changes
    this.mixedAOs = [];             // AO names currently in the mix
    this.hybData = null;            // set when a preset is active
    this.activeHybrid = 0;

    this.container.innerHTML = `
      <div class="panel-header">Equations</div>
      <div class="eq-equations"></div>
      <div class="eq-sign-table-wrapper">
        <button class="eq-toggle-table" aria-expanded="false">Sign pattern table ▸</button>
        <div class="eq-sign-table" hidden></div>
      </div>
      <div class="eq-coefficients-box" hidden>
        <button class="eq-toggle-coeffs" aria-expanded="false">Where do these numbers come from? ▸</button>
        <div class="eq-coeffs-content" hidden></div>
      </div>
      <div class="panel-header mixing-header">Mixing Zone</div>
      <div class="mixing-zone" data-empty="true">
        <div class="mixing-placeholder">Drag orbitals here to mix them</div>
        <div class="mixing-items"></div>
      </div>
      <div class="panel-header ao-header">Available Orbitals</div>
      <div class="ao-cards"></div>
    `;

    this.eqDiv = this.container.querySelector('.eq-equations');
    this.tableToggle = this.container.querySelector('.eq-toggle-table');
    this.tableDiv = this.container.querySelector('.eq-sign-table');
    this.coeffsBox = this.container.querySelector('.eq-coefficients-box');
    this.coeffsToggle = this.container.querySelector('.eq-toggle-coeffs');
    this.coeffsContent = this.container.querySelector('.eq-coeffs-content');
    this.mixingZone = this.container.querySelector('.mixing-zone');
    this.mixingItems = this.container.querySelector('.mixing-items');
    this.mixingPlaceholder = this.container.querySelector('.mixing-placeholder');
    this.aoCards = this.container.querySelector('.ao-cards');

    this._setupToggles();
    this._setupDropZone();
  }

  _setupToggles() {
    this.tableToggle.addEventListener('click', () => {
      const expanded = this.tableToggle.getAttribute('aria-expanded') === 'true';
      this.tableToggle.setAttribute('aria-expanded', !expanded);
      this.tableToggle.textContent = expanded ? 'Sign pattern table ▸' : 'Sign pattern table ▾';
      this.tableDiv.hidden = expanded;
    });

    this.coeffsToggle.addEventListener('click', () => {
      const expanded = this.coeffsToggle.getAttribute('aria-expanded') === 'true';
      this.coeffsToggle.setAttribute('aria-expanded', !expanded);
      this.coeffsToggle.textContent = expanded
        ? 'Where do these numbers come from? ▸'
        : 'Where do these numbers come from? ▾';
      this.coeffsContent.hidden = expanded;
    });
  }

  // ── Drag & Drop ─────────────────────────────────────

  _setupDropZone() {
    this.mixingZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.mixingZone.classList.add('drag-over');
    });

    this.mixingZone.addEventListener('dragleave', () => {
      this.mixingZone.classList.remove('drag-over');
    });

    this.mixingZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.mixingZone.classList.remove('drag-over');
      const aoName = e.dataTransfer.getData('text/plain');
      if (aoName && !this.mixedAOs.includes(aoName)) {
        this.addToMix(aoName);
      }
    });
  }

  // ── AO cards for a given atom ───────────────────────

  setAtomAOs(availableAOs) {
    this.aoCards.innerHTML = '';
    for (const aoName of availableAOs) {
      const card = document.createElement('div');
      card.className = 'ao-card';
      card.draggable = true;
      card.dataset.ao = aoName;

      const label = AO_LABELS[aoName] || aoName;
      card.innerHTML = `<span class="ao-card-label">${label}</span>`;

      // Color-code by type
      const type = aoName.includes('d') ? 'ao-d' : aoName.includes('p') ? 'ao-p' : 'ao-s';
      card.classList.add(type);

      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', aoName);
        e.dataTransfer.effectAllowed = 'copy';
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      // Also support click-to-add
      card.addEventListener('click', () => {
        if (!this.mixedAOs.includes(aoName)) {
          this.addToMix(aoName);
        }
      });

      this.aoCards.appendChild(card);
    }
  }

  // ── Mix management ──────────────────────────────────

  addToMix(aoName) {
    this.mixedAOs.push(aoName);
    this._updateMixDisplay();
    this.hybData = null; // clear preset since we're in manual mode
    this.onMixChange(this.mixedAOs);
  }

  removeFromMix(aoName) {
    this.mixedAOs = this.mixedAOs.filter(a => a !== aoName);
    this._updateMixDisplay();
    this.hybData = null;
    this.onMixChange(this.mixedAOs);
  }

  clearMix() {
    this.mixedAOs = [];
    this._updateMixDisplay();
    this.onMixChange(this.mixedAOs);
  }

  // Set mix from a preset hybridization
  setPresetMix(hybData, atomAOs) {
    this.hybData = hybData;
    this.activeHybrid = 0;
    // Map hybridization orbital names to actual AO names
    // hybData.orbitals: ['s', 'px', 'py', 'pz'] → need to find matching AO names
    this.mixedAOs = [];
    for (const orbType of hybData.orbitals) {
      const match = atomAOs.find(ao => {
        const aoType = ao.replace(/^[0-9]+/, ''); // strip principal quantum number
        return aoType === orbType;
      });
      if (match) this.mixedAOs.push(match);
    }
    this._updateMixDisplay();
  }

  _updateMixDisplay() {
    const empty = this.mixedAOs.length === 0;
    this.mixingZone.dataset.empty = empty;
    this.mixingPlaceholder.style.display = empty ? '' : 'none';
    this.mixingItems.innerHTML = '';

    // Update AO card states (dim if already in mix)
    this.aoCards.querySelectorAll('.ao-card').forEach(card => {
      const inMix = this.mixedAOs.includes(card.dataset.ao);
      card.classList.toggle('in-mix', inMix);
    });

    for (const aoName of this.mixedAOs) {
      const chip = document.createElement('div');
      chip.className = 'mix-chip';
      const label = AO_LABELS[aoName] || aoName;
      chip.innerHTML = `<span>${label}</span><button class="mix-chip-remove" title="Remove">×</button>`;
      chip.querySelector('.mix-chip-remove').addEventListener('click', () => {
        this.removeFromMix(aoName);
      });
      this.mixingItems.appendChild(chip);
    }

    // Add clear button if there are items
    if (!empty) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'mix-clear';
      clearBtn.textContent = 'Clear all';
      clearBtn.addEventListener('click', () => this.clearMix());
      this.mixingItems.appendChild(clearBtn);
    }

    // Build equation for manual mix
    if (!this.hybData && this.mixedAOs.length > 0) {
      this._updateManualEquation();
    }
  }

  _updateManualEquation() {
    // Show simple equation: ψ = Σ cᵢ · AOᵢ (equal coefficients for now)
    const n = this.mixedAOs.length;
    const coeff = (1 / Math.sqrt(n)).toFixed(4);
    const terms = this.mixedAOs.map(ao => {
      const label = ao.replace(/^[0-9]+/, '');
      return label;
    });
    const latex = `\\psi = \\tfrac{1}{\\sqrt{${n}}}(${terms.join(' + ')})`;
    this.eqDiv.innerHTML = `<div class="eq-line eq-active">${katex.renderToString(latex, { displayMode: true, throwOnError: false })}</div>`;

    // Hide sign table and coefficients box in manual mode
    this.tableDiv.innerHTML = '';
    this.tableDiv.hidden = true;
    this.coeffsBox.hidden = true;
  }

  // ── Preset equation display ─────────────────────────

  updateEquations(hybData, activeIndex = -1) {
    this.hybData = hybData;
    this.activeHybrid = activeIndex >= 0 ? activeIndex : 0;

    if (!hybData) {
      this.eqDiv.innerHTML = '<p class="eq-placeholder">Select a hybridization or drag orbitals to mix</p>';
      this.tableDiv.innerHTML = '';
      this.tableDiv.hidden = true;
      this.coeffsBox.hidden = true;
      return;
    }

    // Render each equation line
    let html = '';
    for (let i = 0; i < hybData.latex.length; i++) {
      const activeClass = i === this.activeHybrid ? ' eq-active' : '';
      html += `<div class="eq-line${activeClass}" data-idx="${i}">`;
      html += katex.renderToString(hybData.latex[i], {
        displayMode: true,
        throwOnError: false,
      });
      html += '</div>';
    }
    this.eqDiv.innerHTML = html;

    // Click to select individual hybrid
    this.eqDiv.querySelectorAll('.eq-line').forEach(line => {
      line.addEventListener('click', () => {
        const idx = parseInt(line.dataset.idx);
        this.activeHybrid = idx;
        this.highlightHybrid(idx);
        if (this._onHybridSelect) this._onHybridSelect(idx);
      });
    });

    // Build sign table
    this._buildSignTable(hybData);

    // Coefficients explanation
    this._buildCoeffExplanation(hybData);
  }

  set onHybridSelect(fn) { this._onHybridSelect = fn; }

  highlightHybrid(index) {
    this.activeHybrid = index;
    this.eqDiv.querySelectorAll('.eq-line').forEach((line, i) => {
      line.classList.toggle('eq-active', i === index);
    });
  }

  clearHighlight() {
    this.eqDiv.querySelectorAll('.eq-line').forEach(line => {
      line.classList.remove('eq-active');
    });
  }

  _buildSignTable(hybData) {
    const orbitals = hybData.orbitals;
    let html = '<table><thead><tr><th></th>';
    for (const ao of orbitals) {
      let label = ao;
      if (ao === 's') label = 's';
      else if (ao.startsWith('p')) label = 'p<sub>' + ao.slice(1) + '</sub>';
      else if (ao.startsWith('d')) label = 'd<sub>' + ao.slice(1) + '</sub>';
      html += `<th>${label}</th>`;
    }
    html += '</tr></thead><tbody>';

    for (let i = 0; i < hybData.coefficients.length; i++) {
      html += `<tr><td class="eq-label">${hybData.labels[i]}</td>`;
      for (let j = 0; j < hybData.coefficients[i].length; j++) {
        const c = hybData.coefficients[i][j];
        const sign = c > 1e-10 ? '+' : c < -1e-10 ? '−' : '0';
        const cls = c > 1e-10 ? 'sign-pos' : c < -1e-10 ? 'sign-neg' : 'sign-zero';
        html += `<td class="${cls}">${sign}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    html += '<p class="eq-caption">The s coefficient is always positive (all hybrids have the same s character). The signs on p orbitals determine the direction each hybrid points.</p>';
    this.tableDiv.innerHTML = html;
  }

  _buildCoeffExplanation(hybData) {
    this.coeffsBox.hidden = false;
    const n = hybData.count;
    const orbs = hybData.orbitals.length;
    const c = hybData.coefficients[0];
    const sumSq = c.reduce((s, v) => s + v * v, 0);

    let html = '<div class="coeffs-text">';
    html += '<p>The coefficients obey two rules:</p>';
    html += '<p><strong>Rule 1 — Completeness:</strong> The squares of the coefficients in each row add to 1. Each hybrid is a full orbital, nothing gained or lost.</p>';
    html += `<p class="coeffs-math">`;
    html += c.map(v => `(${v.toFixed(4)})²`).join(' + ');
    html += ` = ${sumSq.toFixed(4)} ✓</p>`;
    html += '<p><strong>Rule 2 — Independence:</strong> Each hybrid is independent of the others (mathematically: orthogonal). Two bonds from the same atom cannot interfere with each other.</p>';
    html += '<p>These two rules, plus the requirement that all hybrids be equivalent, uniquely determine the coefficients.</p>';
    html += '</div>';
    this.coeffsContent.innerHTML = html;
  }
}
