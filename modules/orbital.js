// Slater-type orbital (STO) evaluation and 3D grid computation
// ψ_nlm(r,θ,φ) = N · r^(n-1) · e^(-ζr) · Y_l^m(θ,φ)
// Supports s, p, and d orbitals.

import { AO_TYPE_MAP, AO_ZETA_MAP } from '../data/atoms.js';

// ── Normalization ──────────────────────────────────────

// Radial normalization for STO: N = (2ζ)^(n+1/2) / sqrt((2n)!)
function stoNormalization(n, zeta) {
  const numerator = Math.pow(2 * zeta, n + 0.5);
  let factorial = 1;
  for (let i = 2; i <= 2 * n; i++) factorial *= i;
  return numerator / Math.sqrt(factorial);
}

// ── Angular functions (real spherical harmonics) ──────

// All angular functions return the value including their normalization constant.
// Cartesian forms are used for efficiency.

const ANGULAR = {
  // l=0: Y_00 = 1/(2√π)
  s: (x, y, z, r) => 1 / (2 * Math.sqrt(Math.PI)),

  // l=1: Y_1m real forms, each with √(3/(4π)) prefactor
  px: (x, y, z, r) => Math.sqrt(3 / (4 * Math.PI)) * x / (r + 1e-30),
  py: (x, y, z, r) => Math.sqrt(3 / (4 * Math.PI)) * y / (r + 1e-30),
  pz: (x, y, z, r) => Math.sqrt(3 / (4 * Math.PI)) * z / (r + 1e-30),

  // l=2: Real spherical harmonics for d orbitals
  // dz2:    Y_20     = √(5/(16π)) · (2z²-x²-y²)/r²
  dz2: (x, y, z, r) => {
    const r2 = r * r + 1e-30;
    return Math.sqrt(5 / (16 * Math.PI)) * (2*z*z - x*x - y*y) / r2;
  },
  // dxz:    Y_21(real) = √(15/(4π)) · xz/r²
  dxz: (x, y, z, r) => {
    const r2 = r * r + 1e-30;
    return Math.sqrt(15 / (4 * Math.PI)) * x * z / r2;
  },
  // dyz:    Y_2-1(real) = √(15/(4π)) · yz/r²
  dyz: (x, y, z, r) => {
    const r2 = r * r + 1e-30;
    return Math.sqrt(15 / (4 * Math.PI)) * y * z / r2;
  },
  // dxy:    Y_2-2(real) = √(15/(4π)) · xy/r²  (factor of 1/2 absorbed differently in some conventions)
  dxy: (x, y, z, r) => {
    const r2 = r * r + 1e-30;
    return Math.sqrt(15 / (4 * Math.PI)) * x * y / r2;
  },
  // dx2y2:  Y_22(real) = √(15/(16π)) · (x²-y²)/r²
  dx2y2: (x, y, z, r) => {
    const r2 = r * r + 1e-30;
    return Math.sqrt(15 / (16 * Math.PI)) * (x*x - y*y) / r2;
  },
};

// ── Single STO evaluation ─────────────────────────────

// Evaluate ψ(x,y,z) for a single STO
// n: principal quantum number, zeta: Slater exponent, type: angular type string
function evaluateSTO(x, y, z, n, zeta, type) {
  const r = Math.sqrt(x * x + y * y + z * z);
  // p and d orbitals vanish at origin
  if (r < 1e-12 && type !== 's') return 0;

  const N = stoNormalization(n, zeta);
  const radial = Math.pow(r, n - 1) * Math.exp(-zeta * r);
  const angular = ANGULAR[type](x, y, z, r);

  return N * radial * angular;
}

// ── Grid computation ──────────────────────────────────

// Determine grid bounds based on orbital extent
function getGridBounds(n, zeta) {
  // ~95% of STO density is within r ≈ (n + 4) / ζ_min
  const rMax = (n + 5) / zeta;
  return { min: -rMax, max: rMax };
}

// Compute a hybrid orbital on a 3D grid
// atomData: from ATOMS table
// hybData: from HYBRIDIZATIONS table
// hybridIndex: which hybrid (row index)
// gridSize: resolution (default 64)
// Returns { values: Float32Array, gridSize, bounds }
export function computeHybridGrid(atomData, hybData, hybridIndex, gridSize = 64) {
  const { n, zeta } = atomData;
  const coeffs = hybData.coefficients[hybridIndex];
  const orbitalTypes = hybData.orbitals; // e.g. ['s', 'px', 'py', 'pz']

  // Grid bounds: use the smallest zeta for the largest extent
  const zetaValues = orbitalTypes.map(o => {
    const zetaKey = o === 's' ? 's' : o.startsWith('p') ? 'p' : 'd';
    return zeta[zetaKey];
  });
  const zetaMin = Math.min(...zetaValues);
  const bounds = getGridBounds(n, zetaMin);
  const step = (bounds.max - bounds.min) / (gridSize - 1);
  const values = new Float32Array(gridSize * gridSize * gridSize);

  for (let iz = 0; iz < gridSize; iz++) {
    const zz = bounds.min + iz * step;
    for (let iy = 0; iy < gridSize; iy++) {
      const yy = bounds.min + iy * step;
      for (let ix = 0; ix < gridSize; ix++) {
        const xx = bounds.min + ix * step;
        let val = 0;
        for (let a = 0; a < orbitalTypes.length; a++) {
          if (Math.abs(coeffs[a]) < 1e-15) continue;
          const aoType = orbitalTypes[a];
          const zetaKey = aoType === 's' ? 's' : aoType.startsWith('p') ? 'p' : 'd';
          val += coeffs[a] * evaluateSTO(xx, yy, zz, n, zeta[zetaKey], aoType);
        }
        values[iz * gridSize * gridSize + iy * gridSize + ix] = val;
      }
    }
  }

  return { values, gridSize, bounds };
}

// Compute a single AO on a 3D grid (for AO card previews)
export function computeAOGrid(atomData, aoName, gridSize = 32) {
  const { n, zeta } = atomData;
  const aoType = AO_TYPE_MAP[aoName];
  const zetaKey = AO_ZETA_MAP[aoName];
  const zetaVal = zeta[zetaKey];

  const bounds = getGridBounds(n, zetaVal);
  const step = (bounds.max - bounds.min) / (gridSize - 1);
  const values = new Float32Array(gridSize * gridSize * gridSize);

  for (let iz = 0; iz < gridSize; iz++) {
    const zz = bounds.min + iz * step;
    for (let iy = 0; iy < gridSize; iy++) {
      const yy = bounds.min + iy * step;
      for (let ix = 0; ix < gridSize; ix++) {
        const xx = bounds.min + ix * step;
        values[iz * gridSize * gridSize + iy * gridSize + ix] =
          evaluateSTO(xx, yy, zz, n, zetaVal, aoType);
      }
    }
  }

  return { values, gridSize, bounds };
}

// Compute a custom hybrid from a list of AOs with coefficients
// Used for the incremental drag-and-drop mixing
// mixedAOs: [{ aoName, coefficient }]
export function computeCustomHybridGrid(atomData, mixedAOs, gridSize = 64) {
  const { n, zeta } = atomData;

  if (mixedAOs.length === 0) return null;

  // Normalize coefficients so the hybrid is properly normalized
  const sumSq = mixedAOs.reduce((s, ao) => s + ao.coefficient * ao.coefficient, 0);
  const norm = Math.sqrt(sumSq);

  const zetaValues = mixedAOs.map(ao => {
    const zetaKey = AO_ZETA_MAP[ao.aoName];
    return zeta[zetaKey];
  });
  const zetaMin = Math.min(...zetaValues);
  const bounds = getGridBounds(n, zetaMin);
  const step = (bounds.max - bounds.min) / (gridSize - 1);
  const values = new Float32Array(gridSize * gridSize * gridSize);

  for (let iz = 0; iz < gridSize; iz++) {
    const zz = bounds.min + iz * step;
    for (let iy = 0; iy < gridSize; iy++) {
      const yy = bounds.min + iy * step;
      for (let ix = 0; ix < gridSize; ix++) {
        const xx = bounds.min + ix * step;
        let val = 0;
        for (const ao of mixedAOs) {
          const aoType = AO_TYPE_MAP[ao.aoName];
          const zetaKey = AO_ZETA_MAP[ao.aoName];
          val += (ao.coefficient / norm) * evaluateSTO(xx, yy, zz, n, zeta[zetaKey], aoType);
        }
        values[iz * gridSize * gridSize + iy * gridSize + ix] = val;
      }
    }
  }

  return { values, gridSize, bounds };
}
