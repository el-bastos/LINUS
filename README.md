# linus

Interactive tool for exploring orbital hybridization through real wavefunction computation and 3D visualization. Select an atom, choose a hybridization scheme, and see the actual hybrid orbitals rendered from Slater-type orbital (STO) wavefunctions with Clementi–Raimondi exponents. Built with vanilla JavaScript and Three.js.

## Try it

Open `index.html` in a browser. No build step, no server, no dependencies to install.

Live demo: [huggingface.co/spaces/el-bastos/linus](https://huggingface.co/spaces/el-bastos/linus)

## Features

### Atoms

| Atom | Config | Hybridizations |
|------|--------|----------------|
| **H** | 1s¹ | — |
| **B** | 2s²2p¹ | sp² |
| **C** | 2s²2p² | sp, sp², sp³ |
| **N** | 2s²2p³ | sp, sp², sp³ |
| **O** | 2s²2p⁴ | sp², sp³ |
| **P** | 3s²3p³ | sp³, sp³d, sp³d² |
| **S** | 3s²3p⁴ | sp³, sp³d, sp³d² |

All Slater exponents from Clementi & Raimondi (1963) *J. Chem. Phys.* **38**, 2686–2689.

### 3D Viewer

- Isosurface rendering via marching cubes on a 64³ grid
- Phase coloring (blue = positive, orange = negative lobe)
- Show individual or all hybrid orbitals simultaneously
- Coordinate axes with labels
- Angle measurements between hybrid directions
- Camera presets (front, back, top, bottom, left, right)
- Adjustable isovalue

### Mixing

- Drag-and-drop or double-click AO cards into the mixing zone
- Automatic detection when a complete hybridization set is reached
- Single-click AO preview in the 3D viewer
- Preset hybridization buttons for quick selection

### Equations

- KaTeX-rendered hybridization equations
- Sign table showing coefficient signs for each hybrid
- Click an equation to highlight the corresponding orbital in 3D

## Architecture

```
linus/
├── index.html              # Single-page app
├── app.js                  # Main logic and state management
├── style.css               # Styles
├── data/
│   ├── atoms.js            # Atomic data and Slater exponents
│   └── hybridizations.js   # Coefficient matrices and metadata
└── modules/
    ├── orbital.js           # STO evaluation and grid computation
    ├── viewer3d.js          # Three.js 3D renderer
    ├── equationPanel.js     # Equation display and drag-and-drop mixing
    └── marchingCubes.js     # Isosurface extraction
```

## Author

**Erick Leite Bastos**
University of São Paulo, São Paulo, Brazil

elbastos@usp.br | [www.bastoslab.org](https://www.bastoslab.org)

## License

GPL-3.0
