// s-Character slider panel
// Varies s character in sp³ bonding hybrids via Coulson's theorem:
//   cos(θ) = -s²/(1-s²)
// Lone pairs absorb remaining s character to maintain normalization.
// Recomputes hybrid orbital coefficients and renders all 4 hybrids live.

export class SCharacterPanel {
  constructor(container) {
    this.container = container;
    this.active = false;
    this.nLonePairs = 0;
    this.nBonding = 4;
    this.sBond = 0.25;  // s² fraction per bonding hybrid (ideal sp³ = 0.25)

    // Callbacks set by app.js
    this.onCoefficientsChange = null;

    this._build();
  }

  _build() {
    this.container.innerHTML = `
      <div class="schar-panel" hidden>
        <div class="panel-header">s Character</div>
        <div class="schar-body">
          <div class="schar-slider-row">
            <label class="schar-label">Bonding s²</label>
            <input type="range" class="schar-slider" min="0.05" max="0.50" step="0.005" value="0.25">
            <span class="schar-val">25.0%</span>
          </div>
          <div class="schar-angle-row">
            <span class="schar-angle-label">Bond angle (Coulson)</span>
            <span class="schar-angle-val">109.5°</span>
          </div>
          <div class="schar-lp-row" hidden>
            <span class="schar-lp-label">Lone pair s²</span>
            <span class="schar-lp-val">—</span>
          </div>
          <div class="schar-eq"></div>
          <div class="schar-refs">
            <span class="schar-ref-marker" data-angle="109.47" title="ideal sp³">sp³ 109.5°</span>
          </div>
        </div>
      </div>
    `;

    this.panel = this.container.querySelector('.schar-panel');
    this.slider = this.container.querySelector('.schar-slider');
    this.valSpan = this.container.querySelector('.schar-val');
    this.angleVal = this.container.querySelector('.schar-angle-val');
    this.lpRow = this.container.querySelector('.schar-lp-row');
    this.lpVal = this.container.querySelector('.schar-lp-val');
    this.eqDiv = this.container.querySelector('.schar-eq');
    this.refsDiv = this.container.querySelector('.schar-refs');

    this.slider.addEventListener('input', () => this._onSliderInput());
  }

  // Activate the panel for a given atom with lone pairs
  activate(atomData, nLonePairs) {
    this.active = true;
    this.nLonePairs = nLonePairs;
    this.nBonding = 4 - nLonePairs;
    this.panel.hidden = false;

    // Set slider range: max s² per bonding hybrid is 1/nBonding (all s to bonding)
    // min is something small but physical
    const maxS = 1 / this.nBonding;
    this.slider.max = Math.min(maxS, 0.50).toFixed(3);
    this.slider.min = '0.050';
    this.slider.value = '0.250';
    this.sBond = 0.25;

    // Show lone pair row if applicable
    this.lpRow.hidden = nLonePairs === 0;

    // Set reference markers
    this._buildRefMarkers(atomData);

    this._update();
  }

  deactivate() {
    this.active = false;
    this.panel.hidden = true;
  }

  _buildRefMarkers(atomData) {
    let html = '<span class="schar-ref-marker" data-angle="109.47" title="ideal sp³">sp³ 109.5°</span>';
    // Add experimental reference for known molecules
    const sym = atomData.symbol;
    if (sym === 'N') {
      html += '<span class="schar-ref-marker expt" data-angle="107.8" title="NH₃ experimental">NH₃ 107.8°</span>';
    } else if (sym === 'O') {
      html += '<span class="schar-ref-marker expt" data-angle="104.5" title="H₂O experimental">H₂O 104.5°</span>';
    }
    this.refsDiv.innerHTML = html;

    // Make ref markers clickable to set that angle
    this.refsDiv.querySelectorAll('.schar-ref-marker').forEach(marker => {
      marker.addEventListener('click', () => {
        const targetAngle = parseFloat(marker.dataset.angle);
        const s2 = this._angleToS2(targetAngle);
        if (s2 !== null) {
          this.slider.value = s2.toFixed(3);
          this._onSliderInput();
        }
      });
    });
  }

  _onSliderInput() {
    this.sBond = parseFloat(this.slider.value);
    this._update();
  }

  _update() {
    const s2 = this.sBond;
    const angle = this._s2ToAngle(s2);
    const lpS2 = this.nLonePairs > 0
      ? (1 - this.nBonding * s2) / this.nLonePairs
      : 0;

    this.valSpan.textContent = (s2 * 100).toFixed(1) + '%';
    this.angleVal.textContent = angle.toFixed(1) + '°';

    if (this.nLonePairs > 0) {
      this.lpVal.textContent = (lpS2 * 100).toFixed(1) + '%';
    }

    // Render equation with KaTeX
    this._renderEquation(s2, angle, lpS2);

    // Compute coefficients and notify
    if (this.onCoefficientsChange) {
      const coeffs = this._computeCoefficients(s2, lpS2);
      this.onCoefficientsChange(coeffs, angle, s2, lpS2);
    }
  }

  // Coulson's theorem: cos(θ) = -s²/(1-s²)
  _s2ToAngle(s2) {
    const p2 = 1 - s2;
    if (p2 < 1e-10) return 180;
    const cosTheta = -s2 / p2;
    return Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 180 / Math.PI;
  }

  // Inverse: given angle, find s²
  _angleToS2(angleDeg) {
    const cosTheta = Math.cos(angleDeg * Math.PI / 180);
    // cos(θ) = -s²/(1-s²) → s² = -cosθ/(1 - cosθ)
    const denom = 1 - cosTheta;
    if (Math.abs(denom) < 1e-10) return null;
    const s2 = -cosTheta / denom;
    if (s2 < 0.01 || s2 > 0.99) return null;
    return s2;
  }

  _renderEquation(s2, angle, lpS2) {
    if (typeof katex === 'undefined') return;
    const cosVal = (-s2 / (1 - s2)).toFixed(4);
    let latex = `\\cos\\theta = \\frac{-s^2}{1-s^2} = \\frac{-${s2.toFixed(3)}}{${(1-s2).toFixed(3)}} = ${cosVal}`;
    latex += `\\quad\\Rightarrow\\quad \\theta = ${angle.toFixed(1)}°`;
    this.eqDiv.innerHTML = katex.renderToString(latex, { displayMode: true, throwOnError: false });
  }

  // Build the 4×4 coefficient matrix for non-equivalent sp³
  // nBonding hybrids with s character s2_bond, nLP lone pairs with s2_lp
  // Returns { coefficients: number[][], labels: string[], orbitals: string[],
  //           count: 4, bondingCount, lpCount }
  _computeCoefficients(s2Bond, s2LP) {
    // Each hybrid: h = a·s + b·(p combination)
    // where a² = s² (s character) and b² = 1-s² (p character)
    // The bonding hybrids point toward vertices of a triangular pyramid (for 3 bonding)
    // or tetrahedron (for 4 bonding)

    const nB = this.nBonding;
    const nLP = this.nLonePairs;
    const aBond = Math.sqrt(s2Bond);
    const bBond = Math.sqrt(1 - s2Bond);
    const aLP = nLP > 0 ? Math.sqrt(Math.max(0, s2LP)) : 0;
    const bLP = nLP > 0 ? Math.sqrt(Math.max(0, 1 - s2LP)) : 0;

    // For sp³ with variable s character, we place orbitals using
    // the same directional structure as standard sp³ but scale the
    // s and p contributions independently.
    //
    // Standard sp³ directions (from p-coefficient signs):
    //   h1: (+px, +py, +pz)  → direction (1,1,1)/√3
    //   h2: (+px, -py, -pz)  → direction (1,-1,-1)/√3
    //   h3: (-px, +py, -pz)  → direction (-1,1,-1)/√3
    //   h4: (-px, -py, +pz)  → direction (-1,-1,1)/√3
    //
    // For N (1 LP): h4 is the lone pair (along -x,-y,+z direction)
    // For O (2 LP): h3, h4 are lone pairs

    const dirs = [
      [ 1,  1,  1],  // h1 bonding
      [ 1, -1, -1],  // h2 bonding
      [-1,  1, -1],  // h3 bonding (or LP for O)
      [-1, -1,  1],  // h4 LP for N, LP for O
    ];

    const coefficients = [];
    const labels = [];
    const invSqrt3 = 1 / Math.sqrt(3);

    for (let i = 0; i < 4; i++) {
      const isLP = i >= nB;
      const a = isLP ? aLP : aBond;
      const b = isLP ? bLP : bBond;
      const d = dirs[i];

      // Coefficients: [s, px, py, pz]
      // s coefficient = a (positive by convention)
      // p coefficients = b * d[j] / √3 (unit direction normalization)
      coefficients.push([
        a,
        b * d[0] * invSqrt3,
        b * d[1] * invSqrt3,
        b * d[2] * invSqrt3,
      ]);

      if (isLP) {
        labels.push(`lp${i - nB + 1}`);
      } else {
        labels.push(`h${i + 1}`);
      }
    }

    return {
      coefficients,
      labels,
      orbitals: ['s', 'px', 'py', 'pz'],
      count: 4,
      bondingCount: nB,
      lpCount: nLP,
    };
  }
}
