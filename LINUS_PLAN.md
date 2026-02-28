# LINUS — Linear Combinations Unveiled Interactively for Students

**A webapp for visualizing orbital hybridization from first principles**

Deployment: [https://huggingface.co/spaces/el-bastos/linus](https://huggingface.co/spaces/el-bastos/linus)

---

## 1. Purpose and Pedagogical Philosophy

LINUS teaches hybridization as what it truly is: a mathematical mixing of atomic orbitals that produces new orbital shapes with specific directional properties. Students interact with the actual equations and see the geometric consequences in 3D, without the process feeling like magic.

### Core Principles

- **The equations are shown, never hidden.** Coefficients come from the normalization and orthogonality constraints — the tool presents them as a definite recipe from quantum mechanics. The derivation comes later; the recipe is honest and explicit.
- **The vector rotation analogy is central.** Students already understand that rotating coordinate axes produces new basis vectors with cosine/sine coefficients. Hybridization is the same operation in orbital space. A 2D rotation panel makes this connection visible.
- **Orbital shapes use real atomic data.** Slater-type orbitals with Clementi–Raimondi exponents for each atom ensure that a carbon sp³ looks different from a nitrogen sp³. These are not generic cartoons.
- **No animation replaces understanding.** The student builds the hybrid by dragging orbitals into a mixing panel. The result is a consequence of their action plus the displayed equation, not a mysterious transformation.

### Target Audience

Undergraduate students in general or organic chemistry who have not yet studied quantum mechanics. They know vectors and basic algebra. They do not know what a wavefunction is.

---

## 2. Historical Context Panel

A collapsible sidebar or introductory screen providing brief context:

- **Heitler & London (1927):** Showed quantum mechanics explains the covalent bond via orbital overlap.
- **Pauling (1931):** Proposed that atomic orbitals mix (hybridize) to form directed bonding orbitals. Developed sp, sp², sp³, and d-orbital hybrid schemes.
- **Slater (1931):** Independently showed that maximum overlap produces the strongest bonds — the physical reason hybridization works.
- **Coulson (1940s–50s):** Put hybridization on rigorous mathematical footing. Showed fractional hybridization exists and that VBT and MOT converge to the same answer.

This panel is optional reading. It gives students the "who and when" without interrupting the interactive flow.

---

## 3. Supported Atoms and Their Data

### Atoms

| Atom | Valence Config | Available AOs | Common Hybridizations |
|------|---------------|---------------|----------------------|
| H    | 1s¹           | 1s            | (none — used as bonding partner) |
| B    | 2s²2p¹        | 2s, 2pₓ, 2p_y, 2p_z | sp² (empty p) |
| C    | 2s²2p²        | 2s, 2pₓ, 2p_y, 2p_z | sp, sp², sp³ |
| N    | 2s²2p³        | 2s, 2pₓ, 2p_y, 2p_z | sp, sp², sp³ |
| O    | 2s²2p⁴        | 2s, 2pₓ, 2p_y, 2p_z | sp², sp³ |
| P    | 3s²3p³        | 3s, 3pₓ, 3p_y, 3p_z | sp³, sp³d (optional) |
| S    | 3s²3p⁴        | 3s, 3pₓ, 3p_y, 3p_z | sp³, sp³d, sp³d² (optional) |

### Orbital Data

Each atom uses Slater-type orbitals (STOs):

$$\psi_{nlm}(r, \theta, \varphi) = N \cdot r^{n-1} \cdot e^{-\zeta r} \cdot Y_l^m(\theta, \varphi)$$

- **Yₗₘ(θ,φ):** Spherical harmonics (exact, same for all atoms). These give the angular shape.
- **ζ (zeta):** Slater exponent from Clementi & Raimondi (1963) tables. Atom-specific. Controls size and compactness.
- **N:** Normalization constant.

The angular part is universal; ζ differentiates atoms. A lookup table of ζ values for each atom and orbital (2s, 2p, 3s, 3p) is hardcoded into the app.

---

## 4. App Structure and Layout

### 4.1 Screen Layout (Three-Panel Design)

```
┌──────────────────────────────────────────────────────────────────┐
│  LINUS — Orbital Hybridization Explorer            [?] [History] │
├──────────────┬──────────────────────┬────────────────────────────┤
│              │                      │                            │
│  LEFT PANEL  │   CENTER PANEL       │   RIGHT PANEL              │
│              │                      │                            │
│  Rotation    │   Equation           │   3D Orbital               │
│  Analogy     │   Display            │   Viewer                   │
│  Diagram     │   +                  │                            │
│              │   Mixing Panel       │   (rotatable,              │
│  (2D for sp) │                      │    zoomable)               │
│  (3D for sp²)│   Drag AOs here      │                            │
│              │                      │                            │
├──────────────┴──────────────────────┴────────────────────────────┤
│  BOTTOM BAR: Atom selector  |  Preset buttons (sp, sp², sp³)    │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Panel Descriptions

**Bottom Bar — Atom Selector**
- Row of element buttons: H, B, C, N, O, P, S
- Selecting an atom populates the available AOs panel and updates Slater exponents
- Shows electron configuration in box notation (arrows in boxes)
- Shows valence orbital energy levels (qualitative energy diagram with the s-p gap indicated)

**Center Panel — Equation and Mixing Panel**
- Top section: the hybridization equation, rendered with KaTeX or MathJax, updates in real time
- Below: a "mixing zone" where AO icons can be dragged
- Available AOs displayed as draggable 3D thumbnail cards (small rotatable previews of s, pₓ, p_y, p_z)
- When an AO is dragged into the mixing zone, the equation updates and the coefficients appear
- Preset buttons (sp, sp², sp³) auto-populate the mixing zone

**Left Panel — Vector Rotation Analogy**
- For **sp mixing:** a 2D coordinate system with axes labeled "s" and "p"
  - Two unit vectors shown at 45° rotation from the original axes
  - Projections onto s and p axes shown with dashed lines
  - Projection lengths labeled as 1/√2
  - Caption: "Rotating axes in s–p space gives the hybrid coefficients"
- For **sp² mixing:** a 3D coordinate system showing three vectors in s–pₓ–p_y space
- For **sp³:** text note explaining that 4D rotation can't be drawn, but the same principle applies
- This diagram updates when the hybridization type changes

**Right Panel — 3D Orbital Viewer**
- WebGL-rendered isosurface of the resulting hybrid orbital(s)
- Mouse drag to rotate, scroll to zoom
- Phase coloring: positive lobe in one color, negative lobe in another (e.g., blue/red)
- Toggle buttons:
  - Show single hybrid vs. all hybrids on the atom simultaneously
  - Show/hide coordinate axes
  - Show/hide angle measurements between hybrid lobes
  - Wireframe vs. solid rendering
  - Isosurface threshold slider (to see how the shape changes with different cutoff values)

---

## 5. Interaction Flow

### Step-by-Step User Journey

**Step 1: Select an atom**
- Student clicks "C" in the bottom bar
- The center panel shows four available AOs as draggable cards: 2s, 2pₓ, 2p_y, 2p_z
- Each card shows a small 3D preview of the orbital shape (computed with carbon's ζ values)
- An energy level diagram appears showing the relative energies of 2s and 2p

**Step 2: Build a hybrid (drag method)**
- Student drags 2s into the mixing zone → equation shows just "s", right panel shows a sphere
- Student drags 2pₓ into the mixing zone → equation updates to:

$$h_1 = \frac{1}{\sqrt{2}}(s + p_x) \qquad h_2 = \frac{1}{\sqrt{2}}(s - p_x)$$

- Right panel shows the sp hybrid — an asymmetric lobe
- Left panel shows the 45° rotation diagram with projections

**Step 2 (alternative): Use a preset**
- Student clicks the "sp³" preset button
- All four AOs populate the mixing zone
- Equation shows all four hybrid formulas
- Right panel shows four directed lobes at tetrahedral angles

**Step 3: Inspect the result**
- Student rotates the 3D view to see the hybrid from all angles
- Toggles "show all hybrids" to see the full set on the atom
- Enables "angle measurement" to see 109.5° between sp³ lobes
- Sees that + and − signs in the equations produce different spatial directions

**Step 4: Compare atoms**
- Student switches from C to N with the same sp³ scheme
- The hybrid lobes become visibly more compact (larger ζ for nitrogen)
- One lobe is highlighted differently as a lone pair
- The angle display can show slight deviations from ideal (Bent's rule — see Section 7)

---

## 6. The Equation Display — Design Details

### What the student sees

For sp³ carbon, the equation panel shows:

$$h_1 = \tfrac{1}{2}(s + p_x + p_y + p_z)$$
$$h_2 = \tfrac{1}{2}(s + p_x - p_y - p_z)$$
$$h_3 = \tfrac{1}{2}(s - p_x + p_y - p_z)$$
$$h_4 = \tfrac{1}{2}(s - p_x - p_y + p_z)$$

### Explaining the coefficients (expandable box)

A collapsible panel labeled **"Where do these numbers come from?"** contains:

> The coefficients obey two rules:
>
> **Rule 1 — Completeness:** The squares of the coefficients in each row add to 1. Each hybrid is a full orbital, nothing gained or lost.
>
> For sp³: (1/2)² + (1/2)² + (1/2)² + (1/2)² = 1/4 + 1/4 + 1/4 + 1/4 = 1 ✓
>
> **Rule 2 — Independence:** Each hybrid is independent of the others (mathematically: orthogonal). Two bonds from the same atom cannot interfere with each other.
>
> These two rules, plus the requirement that all hybrids be equivalent, uniquely determine the coefficients.

### The sign table

Below the equations, a matrix makes the sign pattern explicit:

|        |  s  |  pₓ |  p_y |  p_z |
|--------|-----|-----|------|------|
| **h₁** |  +  |  +  |   +  |   +  |
| **h₂** |  +  |  +  |   −  |   −  |
| **h₃** |  +  |  −  |   +  |   −  |
| **h₄** |  +  |  −  |   −  |   +  |

Caption: "The s coefficient is always positive (all hybrids have the same s character). The signs on p orbitals determine the direction each hybrid points."

---

## 7. Atom-Specific Features

### Carbon (C)
- **Promotion shown explicitly:** before hybridization, display the ground state config (2s² 2p²) and the promoted state (2s¹ 2p³) in box notation
- **Energy cost note:** "Promotion costs energy, but forming four bonds instead of two more than compensates"
- All three hybridization types available: sp, sp², sp³

### Nitrogen (N)
- sp³: three bonding hybrids + one lone pair
- sp²: in contexts like pyridine
- **Lone pair visualization:** the lone pair hybrid is rendered in a distinct color (e.g., green or translucent) and labeled
- Note on geometry: "The lone pair occupies slightly more angular space, pushing bond angles below 109.5°"

### Oxygen (O)
- sp³: two bonding hybrids + two lone pairs (water)
- sp²: in contexts like carbonyl
- Two lone pair hybrids highlighted

### Boron (B)
- sp²: three bonding hybrids + one **empty** p orbital
- The empty p orbital rendered as a translucent outline/wireframe
- Note: "This empty orbital is why BH₃ is a Lewis acid — it can accept electron density"

### Phosphorus (P) and Sulfur (S)
- Standard sp³ available
- Optional: sp³d and sp³d² for hypervalent cases
- **Note of caution:** "The role of d orbitals in hypervalent bonding is debated in modern chemistry. These shapes are shown for completeness but the bonding may be better described without d-orbital participation."
- Larger orbital sizes visible due to n=3 Slater exponents

### Hydrogen (H)
- Not hybridized. Shown only as a bonding partner in illustrative overlaps
- Available in a "show bonding" secondary mode (see Section 9, Future Extensions)

---

## 8. Technical Architecture

### 8.1 Platform

- **Hosting:** Hugging Face Spaces (static or Gradio-based)
- **Recommended approach:** Static HTML/JS/CSS app deployed as a Hugging Face Space with `sdk: static`
- **Alternative:** Gradio with custom HTML blocks, if interactivity with Python backend is needed

### 8.2 Frontend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| 3D rendering | **Three.js** with WebGL | Isosurface rendering of orbitals |
| Isosurface extraction | **Marching Cubes** algorithm | Convert 3D scalar field to mesh |
| Math rendering | **KaTeX** | Real-time equation display |
| UI framework | **Vanilla JS** or **React** | Interface, drag-and-drop, state management |
| Styling | **Tailwind CSS** or custom CSS | Responsive layout |

### 8.3 Computational Pipeline

All computation happens client-side in the browser. The pipeline for generating one hybrid orbital:

```
1. User selects atom → load Slater exponents (ζ) from lookup table
2. User selects hybridization → load coefficient matrix
3. For each point on a 3D grid:
   a. Evaluate each AO: ψ_s(r,θ,φ), ψ_px(r,θ,φ), ψ_py(r,θ,φ), ψ_pz(r,θ,φ)
      using STO formula with atom-specific ζ
   b. Combine: ψ_hybrid = c₁·ψ_s + c₂·ψ_px + c₃·ψ_py + c₄·ψ_pz
   c. Store |ψ_hybrid|² (for density) or ψ_hybrid (for phase-colored rendering)
4. Run Marching Cubes on the grid at a chosen isosurface threshold
5. Render the mesh in Three.js with phase-dependent coloring
```

### 8.4 Performance Considerations

- **Grid size:** 64³ to 128³ points is sufficient for smooth isosurfaces
- **Evaluation:** ~250K to ~2M point evaluations per orbital. The STO formula involves only exponentials and trigonometric functions — very fast in JS
- **Marching Cubes:** well-optimized JS implementations exist (e.g., from the Three.js examples)
- **Target:** < 200ms to regenerate an orbital on a modern laptop
- **Optimization:** precompute radial grid values; only recompute angular mixing when coefficients change

### 8.5 Data Tables (Hardcoded)

**Clementi–Raimondi Slater Exponents:**

| Atom | Orbital | ζ (zeta) |
|------|---------|----------|
| H    | 1s      | 1.000    |
| B    | 2s      | 1.3006   |
| B    | 2p      | 1.0680   |
| C    | 2s      | 1.5679   |
| C    | 2p      | 1.5187   |
| N    | 2s      | 1.9237   |
| N    | 2p      | 1.9170   |
| O    | 2s      | 2.2266   |
| O    | 2p      | 2.2270   |
| P    | 3s      | 1.8860   |
| P    | 3p      | 1.6288   |
| S    | 3s      | 2.1223   |
| S    | 3p      | 1.8273   |

*(These values should be verified against the original Clementi & Raimondi 1963 paper before implementation.)*

**Hybridization Coefficient Matrices:**

Stored as arrays. For sp³:
```
[[ 0.5,  0.5,  0.5,  0.5],
 [ 0.5,  0.5, -0.5, -0.5],
 [ 0.5, -0.5,  0.5, -0.5],
 [ 0.5, -0.5, -0.5,  0.5]]
```

For sp:
```
[[ 0.7071,  0.7071],
 [ 0.7071, -0.7071]]
```

For sp² (one standard choice):
```
[[ 0.5774,  0.8165,  0.0000],
 [ 0.5774, -0.4082,  0.7071],
 [ 0.5774, -0.4082, -0.7071]]
```

*(Values are 1/√3, √(2/3), 1/√2, etc. — exact algebraic forms should be shown in the equation panel, decimal forms used for computation.)*

---

## 9. Future Extensions (Not in v1)

These features are natural follow-ups but should not be in the initial release:

### 9.1 Bonding Mode
- Show what happens when a hybrid orbital on one atom overlaps with an orbital on another atom (e.g., C sp³ + H 1s)
- Demonstrate that head-on overlap is σ bonding
- Show the leftover unhybridized p orbital in sp² and its role in π bonding

### 9.2 Bent's Rule Explorer
- Allow slight adjustment of s/p character ratios (fractional hybridization)
- Show how more electronegative substituents draw p character, changing angles
- Connect to Coulson's work on non-integer hybridization

### 9.3 Comparison Mode
- Side-by-side view of two atoms with the same hybridization
- Directly see the size/shape differences due to different Slater exponents
- Example: carbon sp³ vs. silicon sp³

### 9.4 VSEPR Connection
- After building hybrids, place electron pairs (bonding and lone) and show repulsion
- Demonstrate why lone pairs compress bond angles

### 9.5 Connection to MOT
- Show the canonical MOs of methane (a₁ + t₂) alongside the localized VBT picture
- Demonstrate that localizing the MOs recovers the hybrid picture
- Bridge to Walsh diagrams

---

## 10. UI/UX Notes

### Accessibility
- Color choices must be colorblind-safe (avoid red/green for orbital phases; use blue/orange or blue/yellow)
- All interactive elements keyboard-accessible
- Screen reader text for orbital descriptions

### Responsiveness
- Minimum supported width: 768px (tablet landscape)
- On smaller screens, panels stack vertically: equation on top, 3D viewer below, rotation analogy collapsible
- Touch gestures for 3D rotation on mobile/tablet

### Onboarding
- First-time tooltip walkthrough (dismissable): "Select an atom → drag orbitals to mix → inspect the result"
- No more than 3 tooltip steps

### Visual Style
- Clean, minimal aesthetic — academic but not sterile
- Dark background for the 3D viewer (orbitals read better against dark)
- Light background for equation and rotation panels
- Consistent color scheme for orbital phases throughout the app

---

## 11. Content for the "About" Panel

> **LINUS** is named after Linus Pauling, who in 1931 proposed that atomic
> orbitals on the same atom can mix — hybridize — to form new orbitals
> with specific directional properties. This insight, built on the quantum
> mechanical foundations of Heitler, London, and Slater, remains one of the
> most powerful tools in a chemist's toolkit for understanding molecular
> geometry.
>
> This tool lets you explore hybridization by interacting with the actual
> mathematical equations and seeing their geometric consequences. The
> orbital shapes use real atomic data (Slater-type orbitals with
> Clementi–Raimondi exponents), so what you see reflects genuine
> differences between atoms.
>
> The coefficients in the hybridization equations are not arbitrary — they
> are uniquely determined by two physical requirements: each hybrid must be
> complete (normalized), and the hybrids must be independent of each other
> (orthogonal). The vector rotation analogy panel shows that this is the
> same mathematics as rotating coordinate axes.

---

## 12. Development Phases

### Phase 1 — Core (MVP)
- Atom selector (C, N, O only)
- Preset hybridization buttons (sp, sp², sp³)
- Equation display with KaTeX
- 3D viewer with single hybrid + all-hybrids toggle
- Phase coloring
- Basic rotation/zoom controls

### Phase 2 — Full Atom Set and Pedagogy
- Add B, H, P, S
- Drag-and-drop AO mixing
- Vector rotation analogy panel (2D for sp)
- Lone pair visualization
- Angle measurement display
- "Where do the coefficients come from?" expandable panel
- Sign table display
- Electron configuration and energy level diagrams

### Phase 3 — Polish and Extensions
- Isosurface threshold slider
- Comparison mode (two atoms side by side)
- Historical context sidebar
- Onboarding tooltips
- Mobile/tablet responsive layout
- Accessibility audit

### Phase 4 — Advanced Features (Future)
- Bonding overlap visualization
- Fractional hybridization / Bent's rule
- MOT connection panel
- VSEPR bridge

---

## 13. File Structure (Suggested)

```
linus/
├── index.html              # Main entry point
├── style.css               # Global styles
├── app.js                  # Main application logic and state
├── data/
│   ├── atoms.json          # Slater exponents, configs, energy levels
│   └── hybridizations.json # Coefficient matrices, sign tables
├── modules/
│   ├── orbital.js          # STO evaluation, grid computation
│   ├── marchingCubes.js    # Isosurface extraction
│   ├── viewer3d.js         # Three.js scene, camera, rendering
│   ├── equationPanel.js    # KaTeX rendering, equation updates
│   ├── rotationPanel.js    # 2D/3D vector rotation diagram
│   ├── dragDrop.js         # AO drag-and-drop logic
│   └── uiControls.js       # Buttons, toggles, sliders
├── assets/
│   └── fonts/              # KaTeX fonts if needed
└── README.md               # App description for HF Spaces
```

---

## 14. Key References

- Pauling, L. (1931). "The Nature of the Chemical Bond." *J. Am. Chem. Soc.* 53, 1367–1400.
- Slater, J. C. (1931). "Directed Valence in Polyatomic Molecules." *Phys. Rev.* 37, 481–489.
- Coulson, C. A. (1952). *Valence.* Oxford University Press.
- Clementi, E.; Raimondi, D. L. (1963). "Atomic Screening Constants from SCF Functions." *J. Chem. Phys.* 38, 2686–2689.
- Bent, H. A. (1961). "An Appraisal of Valence-Bond Structures and Hybridization in Compounds of the First-Row Elements." *Chem. Rev.* 61, 275–311.
