// Rotation analogy panel
// Shows that hybridization = rotating axes in orbital space.
// - sp:  2D rotation in s–p plane (interactive angle)
// - sp²: 3D view of 3 vectors in s–px–py space
// - sp³: text explanation (4D can't be drawn)
// - sp³d/sp³d²: text explanation

export class RotationPanel {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'rotation-canvas';
    this.ctx = null;
    this.hybType = null;

    this.container.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'panel-header';
    title.textContent = 'Vector Rotation Analogy';
    this.container.appendChild(title);

    this.subtitle = document.createElement('div');
    this.subtitle.className = 'rotation-subtitle';
    this.container.appendChild(this.subtitle);

    this.canvasWrap = document.createElement('div');
    this.canvasWrap.className = 'rotation-canvas-wrap';
    this.canvasWrap.appendChild(this.canvas);
    this.container.appendChild(this.canvasWrap);

    this.caption = document.createElement('div');
    this.caption.className = 'rotation-caption';
    this.container.appendChild(this.caption);

    this._setupCanvas();
    window.addEventListener('resize', () => this._setupCanvas());
  }

  _setupCanvas() {
    const w = this.canvasWrap.clientWidth || 240;
    const h = Math.min(w, 240);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
    this.w = w;
    this.h = h;
    if (this.hybType) this._draw();
  }

  update(hybType) {
    this.hybType = hybType;
    this._draw();
  }

  _draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    switch (this.hybType) {
      case 'sp':
        this._drawSP();
        break;
      case 'sp2':
        this._drawSP2();
        break;
      case 'sp3':
        this._drawSP3Text();
        break;
      case 'sp3d':
      case 'sp3d2':
        this._drawHigherText();
        break;
      default:
        this._drawEmpty();
    }
  }

  // ── sp: 2D rotation in s–p space ─────────────────────

  _drawSP() {
    const ctx = this.ctx;
    const cx = this.w / 2;
    const cy = this.h / 2;
    const R = Math.min(cx, cy) - 30;
    const angle = Math.PI / 4; // 45° rotation

    // Draw original axes (s and p)
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // s axis (horizontal)
    ctx.beginPath();
    ctx.moveTo(cx - R - 10, cy);
    ctx.lineTo(cx + R + 10, cy);
    ctx.stroke();

    // p axis (vertical)
    ctx.beginPath();
    ctx.moveTo(cx, cy + R + 10);
    ctx.lineTo(cx, cy - R - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels for original axes
    ctx.fillStyle = '#999';
    ctx.font = '13px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('s', cx + R + 14, cy + 4);
    ctx.textAlign = 'center';
    ctx.fillText('p', cx, cy - R - 14);

    // Draw rotated vectors (hybrids h1, h2)
    const h1x = Math.cos(angle);
    const h1y = -Math.sin(angle);
    const h2x = Math.cos(angle + Math.PI);
    const h2y = -Math.sin(angle + Math.PI);

    // h1 vector
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + h1x * R, cy + h1y * R);
    ctx.stroke();
    this._drawArrowhead(ctx, cx + h1x * R, cy + h1y * R, Math.atan2(h1y, h1x), '#4488ff');

    // h2 vector
    ctx.strokeStyle = '#ff8844';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + h2x * R * 0.7, cy + h2y * R * 0.7);
    ctx.stroke();
    this._drawArrowhead(ctx, cx + h2x * R * 0.7, cy + h2y * R * 0.7, Math.atan2(h2y, h2x), '#ff8844');

    // Dashed projection lines for h1
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    // projection onto s axis
    ctx.beginPath();
    ctx.moveTo(cx + h1x * R, cy + h1y * R);
    ctx.lineTo(cx + h1x * R, cy);
    ctx.stroke();
    // projection onto p axis
    ctx.beginPath();
    ctx.moveTo(cx + h1x * R, cy + h1y * R);
    ctx.lineTo(cx, cy + h1y * R);
    ctx.stroke();
    ctx.setLineDash([]);

    // Projection length labels
    ctx.fillStyle = '#4488ff';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1/√2', cx + h1x * R / 2, cy + 16);
    ctx.fillText('1/√2', cx - 24, cy + h1y * R / 2 + 4);

    // Vector labels
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.fillStyle = '#4488ff';
    ctx.fillText('h₁', cx + h1x * R + 14, cy + h1y * R - 4);
    ctx.fillStyle = '#ff8844';
    ctx.fillText('h₂', cx + h2x * R * 0.7 - 14, cy + h2y * R * 0.7 + 4);

    // Angle arc
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, -angle, true);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText('45°', cx + 30, cy - 8);

    this.subtitle.textContent = 'sp — rotation in s–p plane';
    this.caption.textContent = 'Rotating axes in s–p space by 45° gives the hybrid coefficients. Each hybrid projects equally onto s and p: coefficient = cos(45°) = 1/√2.';
  }

  // ── sp²: 3D view of 3 vectors ────────────────────────

  _drawSP2() {
    const ctx = this.ctx;
    const cx = this.w / 2;
    const cy = this.h / 2 + 10;
    const R = Math.min(cx, cy) - 35;

    // Simple pseudo-3D: show three vectors in the s–px–py space
    // Use an oblique projection
    const proj = (sx, sy, sz) => {
      // sx = s axis (right), sy = px axis (up-right), sz = py axis (up)
      const px = cx + R * (sx * 0.9 + sy * -0.35);
      const py = cy + R * (-sz * 0.85 + sy * -0.35 - sx * 0.1);
      return [px, py];
    };

    // Draw faint original axes
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const axes = [
      { dir: [1, 0, 0], label: 's' },
      { dir: [0, 1, 0], label: 'pₓ' },
      { dir: [0, 0, 1], label: 'pᵧ' },
    ];
    for (const ax of axes) {
      const [ex, ey] = proj(...ax.dir);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.fillStyle = '#999';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ax.label, ex + (ex - cx) * 0.15, ey + (ey - cy) * 0.15);
    }
    ctx.setLineDash([]);

    // Three hybrid vectors (from sp² coefficients)
    const S3 = Math.sqrt(3);
    const S6 = Math.sqrt(6);
    const S2 = Math.sqrt(2);
    const hybrids = [
      { s: 1/S3, px: S2/S3, py: 0, color: '#4488ff', label: 'h₁' },
      { s: 1/S3, px: -1/S6, py: 1/S2, color: '#ff8844', label: 'h₂' },
      { s: 1/S3, px: -1/S6, py: -1/S2, color: '#44bb66', label: 'h₃' },
    ];

    for (const h of hybrids) {
      const [hx, hy] = proj(h.s, h.px, h.py);
      ctx.strokeStyle = h.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      this._drawArrowhead(ctx, hx, hy, Math.atan2(hy - cy, hx - cx), h.color);
      ctx.fillStyle = h.color;
      ctx.font = 'bold 12px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(h.label, hx + (hx - cx) * 0.12, hy + (hy - cy) * 0.12);
    }

    this.subtitle.textContent = 'sp² — three vectors in s–pₓ–pᵧ space';
    this.caption.textContent = 'Three hybrid vectors in the 3D space spanned by s, pₓ, and pᵧ. Each vector projects 1/√3 onto s (equal s-character) and the remainder onto the p orbitals.';
  }

  // ── sp³: text (4D rotation) ──────────────────────────

  _drawSP3Text() {
    const ctx = this.ctx;
    ctx.fillStyle = '#666';
    ctx.font = '13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const lines = [
      'sp³ hybridization involves',
      'four orbitals: s, pₓ, pᵧ, p_z.',
      '',
      'The rotation happens in 4D',
      'orbital space — it cannot be',
      'drawn, but the same principle',
      'applies: rotating four axes',
      'gives four equivalent hybrids.',
    ];
    const y0 = this.h / 2 - (lines.length * 18) / 2;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], this.w / 2, y0 + i * 18);
    }

    this.subtitle.textContent = 'sp³ — 4D rotation (cannot be drawn)';
    this.caption.textContent = 'Four equivalent hybrids pointing to the vertices of a tetrahedron. The coefficients (all ±1/2) come from the same rotation principle applied in 4D.';
  }

  // ── sp³d / sp³d²: text ───────────────────────────────

  _drawHigherText() {
    const ctx = this.ctx;
    ctx.fillStyle = '#666';
    ctx.font = '13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const label = this.hybType === 'sp3d' ? 'sp³d' : 'sp³d²';
    const dim = this.hybType === 'sp3d' ? '5D' : '6D';
    const geom = this.hybType === 'sp3d' ? 'trigonal bipyramidal' : 'octahedral';
    const lines = [
      `${label} involves ${dim} orbital space.`,
      '',
      `The rotation analogy extends to`,
      `higher dimensions. The resulting`,
      `geometry is ${geom}.`,
      '',
      `Note: d-orbital participation in`,
      `hypervalent bonding is debated`,
      `in modern chemistry.`,
    ];
    const y0 = this.h / 2 - (lines.length * 18) / 2;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], this.w / 2, y0 + i * 18);
    }

    this.subtitle.textContent = `${label} — ${dim} rotation`;
    this.caption.textContent = `The rotation principle generalizes to any number of orbitals, but cannot be visualized beyond 3D.`;
  }

  _drawEmpty() {
    this.subtitle.textContent = '';
    this.caption.textContent = 'Select a hybridization to see the rotation analogy.';
  }

  _drawArrowhead(ctx, x, y, angle, color) {
    const size = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - 0.4), y - size * Math.sin(angle - 0.4));
    ctx.lineTo(x - size * Math.cos(angle + 0.4), y - size * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }
}
