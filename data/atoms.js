// Clementi–Raimondi Slater exponents (ζ) and atomic data
// Reference: Clementi, E.; Raimondi, D. L. (1963) J. Chem. Phys. 38, 2686–2689.

export const ATOMS = {
  H: {
    name: 'Hydrogen',
    symbol: 'H',
    Z: 1,
    n: 1,
    valenceConfig: '1s¹',
    zeta: { s: 1.000 },
    availableAOs: ['1s'],
    hybridizations: [],  // not hybridized — bonding partner only
    color: '#FFFFFF',
    notes: 'Not hybridized. Used as a bonding partner.',
  },
  B: {
    name: 'Boron',
    symbol: 'B',
    Z: 5,
    n: 2,
    valenceConfig: '2s²2p¹',
    zeta: { s: 1.3006, p: 1.0680 },
    availableAOs: ['2s', '2px', '2py', '2pz'],
    hybridizations: ['sp2'],
    color: '#FFB5B5',
    notes: 'sp² with one empty p orbital — Lewis acid.',
    emptyP: true,
  },
  C: {
    name: 'Carbon',
    symbol: 'C',
    Z: 6,
    n: 2,
    valenceConfig: '2s²2p²',
    zeta: { s: 1.5679, p: 1.5187 },
    availableAOs: ['2s', '2px', '2py', '2pz'],
    hybridizations: ['sp', 'sp2', 'sp3'],
    color: '#909090',
    notes: 'Four equivalent sp³ hybrids arise because the molecular wavefunction in compounds like CH₄ distributes electron density equally among four bonds.',
  },
  N: {
    name: 'Nitrogen',
    symbol: 'N',
    Z: 7,
    n: 2,
    valenceConfig: '2s²2p³',
    zeta: { s: 1.9237, p: 1.9170 },
    availableAOs: ['2s', '2px', '2py', '2pz'],
    hybridizations: ['sp', 'sp2', 'sp3'],
    color: '#3050F8',
    notes: 'sp³: three bonding hybrids + one lone pair. The lone pair occupies slightly more angular space, pushing bond angles below 109.5°.',
    lonePairs: { sp3: 1, sp2: 1, sp: 1 },
  },
  O: {
    name: 'Oxygen',
    symbol: 'O',
    Z: 8,
    n: 2,
    valenceConfig: '2s²2p⁴',
    zeta: { s: 2.2266, p: 2.2270 },
    availableAOs: ['2s', '2px', '2py', '2pz'],
    hybridizations: ['sp2', 'sp3'],
    color: '#FF0D0D',
    notes: 'sp³: two bonding hybrids + two lone pairs (water geometry).',
    lonePairs: { sp3: 2, sp2: 1 },
  },
  P: {
    name: 'Phosphorus',
    symbol: 'P',
    Z: 15,
    n: 3,
    valenceConfig: '3s²3p³',
    zeta: { s: 1.8860, p: 1.6288, d: 1.4000 },
    availableAOs: ['3s', '3px', '3py', '3pz', '3dz2', '3dxz', '3dyz', '3dxy', '3dx2y2'],
    hybridizations: ['sp3', 'sp3d', 'sp3d2'],
    color: '#FF8000',
    notes: 'The role of d orbitals in hypervalent bonding is debated in modern chemistry. These shapes are shown for completeness but the bonding may be better described without d-orbital participation.',
  },
  S: {
    name: 'Sulfur',
    symbol: 'S',
    Z: 16,
    n: 3,
    valenceConfig: '3s²3p⁴',
    zeta: { s: 2.1223, p: 1.8273, d: 1.5000 },
    availableAOs: ['3s', '3px', '3py', '3pz', '3dz2', '3dxz', '3dyz', '3dxy', '3dx2y2'],
    hybridizations: ['sp3', 'sp3d', 'sp3d2'],
    color: '#FFFF30',
    notes: 'Like phosphorus, hypervalent sulfur compounds (e.g. SF₆) traditionally use d-orbital hybridization.',
    lonePairs: { sp3: 2, sp3d: 1 },
  },
};

// AO display labels for UI
export const AO_LABELS = {
  '1s': '1s',
  '2s': '2s', '2px': '2p\u2093', '2py': '2p\u1D67', '2pz': '2p\u1D6A',
  '3s': '3s', '3px': '3p\u2093', '3py': '3p\u1D67', '3pz': '3p\u1D6A',
  '3dz2': '3d\u1D6A\u00B2', '3dxz': '3d\u2093\u1D6A', '3dyz': '3d\u1D67\u1D6A',
  '3dxy': '3d\u2093\u1D67', '3dx2y2': '3d\u2093\u00B2\u208B\u1D67\u00B2',
};

// Map AO names to their angular type for computation
export const AO_TYPE_MAP = {
  '1s': 's',
  '2s': 's', '2px': 'px', '2py': 'py', '2pz': 'pz',
  '3s': 's', '3px': 'px', '3py': 'py', '3pz': 'pz',
  '3dz2': 'dz2', '3dxz': 'dxz', '3dyz': 'dyz',
  '3dxy': 'dxy', '3dx2y2': 'dx2y2',
};

// Map AO names to which zeta to use
export const AO_ZETA_MAP = {
  '1s': 's',
  '2s': 's', '2px': 'p', '2py': 'p', '2pz': 'p',
  '3s': 's', '3px': 'p', '3py': 'p', '3pz': 'p',
  '3dz2': 'd', '3dxz': 'd', '3dyz': 'd',
  '3dxy': 'd', '3dx2y2': 'd',
};
