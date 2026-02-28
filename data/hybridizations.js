// Hybridization coefficient matrices and metadata
// Each row = one hybrid orbital; columns = AO coefficients
// Algebraic values for display; decimal for computation.

const S2 = Math.sqrt(2);
const S3 = Math.sqrt(3);
const S6 = Math.sqrt(6);
const S10 = Math.sqrt(10);
const S12 = Math.sqrt(12);
const S15 = Math.sqrt(15);

export const HYBRIDIZATIONS = {
  sp: {
    label: 'sp',
    orbitals: ['s', 'px'],
    count: 2,
    coefficients: [
      [ 1/S2,  1/S2 ],
      [ 1/S2, -1/S2 ],
    ],
    labels: ['h₁', 'h₂'],
    latex: [
      'h_1 = \\tfrac{1}{\\sqrt{2}}(s + p_x)',
      'h_2 = \\tfrac{1}{\\sqrt{2}}(s - p_x)',
    ],
    geometry: 'linear',
    idealAngle: 180,
    description: 'Two equivalent hybrids pointing in opposite directions along x.',
  },

  sp2: {
    label: 'sp²',
    orbitals: ['s', 'px', 'py'],
    count: 3,
    coefficients: [
      [ 1/S3,  S2/S3,      0 ],
      [ 1/S3, -1/S6,   1/S2 ],
      [ 1/S3, -1/S6,  -1/S2 ],
    ],
    labels: ['h₁', 'h₂', 'h₃'],
    latex: [
      'h_1 = \\tfrac{1}{\\sqrt{3}}\\,s + \\sqrt{\\tfrac{2}{3}}\\,p_x',
      'h_2 = \\tfrac{1}{\\sqrt{3}}\\,s - \\tfrac{1}{\\sqrt{6}}\\,p_x + \\tfrac{1}{\\sqrt{2}}\\,p_y',
      'h_3 = \\tfrac{1}{\\sqrt{3}}\\,s - \\tfrac{1}{\\sqrt{6}}\\,p_x - \\tfrac{1}{\\sqrt{2}}\\,p_y',
    ],
    geometry: 'trigonal planar',
    idealAngle: 120,
    unhybridized: ['pz'],
    description: 'Three equivalent hybrids in the xy-plane at 120° apart. One p orbital (pz) remains unhybridized.',
  },

  sp3: {
    label: 'sp³',
    orbitals: ['s', 'px', 'py', 'pz'],
    count: 4,
    coefficients: [
      [ 0.5,  0.5,  0.5,  0.5 ],
      [ 0.5,  0.5, -0.5, -0.5 ],
      [ 0.5, -0.5,  0.5, -0.5 ],
      [ 0.5, -0.5, -0.5,  0.5 ],
    ],
    labels: ['h₁', 'h₂', 'h₃', 'h₄'],
    latex: [
      'h_1 = \\tfrac{1}{2}(s + p_x + p_y + p_z)',
      'h_2 = \\tfrac{1}{2}(s + p_x - p_y - p_z)',
      'h_3 = \\tfrac{1}{2}(s - p_x + p_y - p_z)',
      'h_4 = \\tfrac{1}{2}(s - p_x - p_y + p_z)',
    ],
    geometry: 'tetrahedral',
    idealAngle: 109.5,
    description: 'Four equivalent hybrids pointing to vertices of a tetrahedron.',
  },

  sp3d: {
    label: 'sp³d',
    orbitals: ['s', 'px', 'py', 'pz', 'dz2'],
    count: 5,
    // Trigonal bipyramidal: 3 equatorial (sp²-like in xy-plane) + 2 axial (pd along z)
    coefficients: [
      // Equatorial (in xy-plane, using s, px, py)
      [ 1/S3,   S2/S3,       0,    0,      0 ],
      [ 1/S3,  -1/S6,    1/S2,    0,      0 ],
      [ 1/S3,  -1/S6,   -1/S2,    0,      0 ],
      // Axial (along z, using pz and dz2)
      [     0,      0,       0, 1/S2,  1/S2 ],
      [     0,      0,       0, 1/S2, -1/S2 ],
    ],
    labels: ['h₁(eq)', 'h₂(eq)', 'h₃(eq)', 'h₄(ax)', 'h₅(ax)'],
    latex: [
      'h_1 = \\tfrac{1}{\\sqrt{3}}\\,s + \\sqrt{\\tfrac{2}{3}}\\,p_x',
      'h_2 = \\tfrac{1}{\\sqrt{3}}\\,s - \\tfrac{1}{\\sqrt{6}}\\,p_x + \\tfrac{1}{\\sqrt{2}}\\,p_y',
      'h_3 = \\tfrac{1}{\\sqrt{3}}\\,s - \\tfrac{1}{\\sqrt{6}}\\,p_x - \\tfrac{1}{\\sqrt{2}}\\,p_y',
      'h_4 = \\tfrac{1}{\\sqrt{2}}(p_z + d_{z^2})',
      'h_5 = \\tfrac{1}{\\sqrt{2}}(p_z - d_{z^2})',
    ],
    geometry: 'trigonal bipyramidal',
    idealAngle: 90,  // axial-equatorial
    description: 'Five hybrids: three equatorial at 120° in the xy-plane, two axial along z. Axial and equatorial are not equivalent.',
  },

  sp3d2: {
    label: 'sp³d²',
    orbitals: ['s', 'px', 'py', 'pz', 'dz2', 'dx2y2'],
    count: 6,
    // Octahedral: six equivalent directions along ±x, ±y, ±z
    coefficients: [
      [ 1/S6,  1/S2,     0,     0,  1/S12,  0.5 ],   // +x
      [ 1/S6, -1/S2,     0,     0,  1/S12,  0.5 ],   // -x
      [ 1/S6,     0,  1/S2,     0,  1/S12, -0.5 ],   // +y
      [ 1/S6,     0, -1/S2,     0,  1/S12, -0.5 ],   // -y
      [ 1/S6,     0,     0,  1/S2, -1/S3,     0 ],   // +z
      [ 1/S6,     0,     0, -1/S2, -1/S3,     0 ],   // -z
    ],
    labels: ['h₁(+x)', 'h₂(−x)', 'h₃(+y)', 'h₄(−y)', 'h₅(+z)', 'h₆(−z)'],
    latex: [
      'h_1 = \\tfrac{1}{\\sqrt{6}}\\,s + \\tfrac{1}{\\sqrt{2}}\\,p_x + \\tfrac{1}{\\sqrt{12}}\\,d_{z^2} + \\tfrac{1}{2}\\,d_{x^2\\!-\\!y^2}',
      'h_2 = \\tfrac{1}{\\sqrt{6}}\\,s - \\tfrac{1}{\\sqrt{2}}\\,p_x + \\tfrac{1}{\\sqrt{12}}\\,d_{z^2} + \\tfrac{1}{2}\\,d_{x^2\\!-\\!y^2}',
      'h_3 = \\tfrac{1}{\\sqrt{6}}\\,s + \\tfrac{1}{\\sqrt{2}}\\,p_y + \\tfrac{1}{\\sqrt{12}}\\,d_{z^2} - \\tfrac{1}{2}\\,d_{x^2\\!-\\!y^2}',
      'h_4 = \\tfrac{1}{\\sqrt{6}}\\,s - \\tfrac{1}{\\sqrt{2}}\\,p_y + \\tfrac{1}{\\sqrt{12}}\\,d_{z^2} - \\tfrac{1}{2}\\,d_{x^2\\!-\\!y^2}',
      'h_5 = \\tfrac{1}{\\sqrt{6}}\\,s + \\tfrac{1}{\\sqrt{2}}\\,p_z - \\tfrac{1}{\\sqrt{3}}\\,d_{z^2}',
      'h_6 = \\tfrac{1}{\\sqrt{6}}\\,s - \\tfrac{1}{\\sqrt{2}}\\,p_z - \\tfrac{1}{\\sqrt{3}}\\,d_{z^2}',
    ],
    geometry: 'octahedral',
    idealAngle: 90,
    description: 'Six equivalent hybrids pointing along ±x, ±y, ±z axes of an octahedron.',
  },
};

// Map hybridization orbital labels to AO names for a given atom
export function getAONames(atom, hybKey) {
  const hyb = HYBRIDIZATIONS[hybKey];
  const n = atom.n;
  return hyb.orbitals.map(o => {
    if (o === 's') return `${n}s`;
    if (o.startsWith('p')) return `${n}${o}`;
    if (o.startsWith('d')) return `${n}${o}`;
    return o;
  });
}

// Get sign table data
export function getSignTable(hybKey) {
  const hyb = HYBRIDIZATIONS[hybKey];
  return hyb.coefficients.map((row, i) => ({
    label: hyb.labels[i],
    signs: row.map(c => c > 1e-10 ? '+' : c < -1e-10 ? '−' : '0'),
  }));
}
