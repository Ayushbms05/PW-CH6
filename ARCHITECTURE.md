# AeroHaven Architecture & Design Document

This document describes the technical architecture, mathematical foundations, and security model of **AeroHaven**.

---

## 🏗️ System Architecture

```
[ User Browser / Device ]
         │
         ▼
[ Presentation & UI Layer (React 18 + TailwindCSS) ]
  ├── Smog & Inversion Radar (Diurnal Chart, Inversion Banner, Multi-Pollutant Grid)
  ├── AI Daily Routine Navigator (Household Profile Selector, Direct Impact Cards)
  ├── IAQ & Corsi-Rosenthal Studio (CADR Calculator, Hacks Catalog)
  ├── Sustainable Alternatives Simulators (Heating & Commute Modal Shifts)
  ├── Community Clean Air Hub (Carpool Syndicates, Purifier Library, Burning Reports)
  └── AI Emergency Co-Pilot (Multi-Turn Chat, Immediate Protocols)
         │
         ▼
[ Scientific Calculation Engines ]
  ├── InversionEngine: Diurnal boundary layer & solar breakout ventilation calculator
  ├── ImpactCalculator: PM2.5 inhalation, Berkeley Earth cigarette equivalence, CO2e savings
  └── CadrCalculator: Corsi-Rosenthal CFM, single-pass MERV efficiency, well-mixed ACH decay
         │
         ▼
[ Resilient Gemini API Client Layer (7 Pillars) ]
  ├── Pillar 1: Lazy Init & Security (No Key Leakage, Strict 35s Timeout)
  ├── Pillar 2: Tiered Model Fallback Chains (Light vs Heavy Routing)
  ├── Pillar 3: Intelligent HTTP Error Classification (401 halt, 404 fast-forward, 429 backoff)
  ├── Pillar 4: Output Validation & 1-Shot Self-Healing JSON Parser
  ├── Pillar 5: Async Mutex Rate Limiter & 60s Circuit Breaker
  ├── Pillar 6: Content-Addressable SHA-256 Cache & Offline Demo Knowledge Store
  └── Pillar 7: Observability, Structured Telemetry & Audit Logs
         │
         ▼
[ Google Gemini 2.5 / 2.0 / 1.5 Models (Live) OR Offline Fallback Store ]
```

---

## 📐 Scientific Formulation & Domain Logic

### 1. Diurnal Winter Inversion Modeling
During winter nights and early mornings:
- **Surface Radiative Cooling**: The ground cools rapidly, cooling the air in direct contact with it while warmer air remains aloft. This creates a temperature inversion ($\Delta T = T_{\text{ceiling}} - T_{\text{ground}} > 0$).
- **Boundary Layer Compression**: Mixing layer drops from typical daytime values of $1000\text{ m}$ down to $150 - 250\text{ m}$.
- **Emission Trap**: Stagnant winds ($<5\text{ km/h}$) prevent lateral advection, trapping vehicle exhaust and biomass smoke.
- **Solar Breakout Window**: Midday solar insolation ($12:30 - 15:00\text{ PM}$) heats the ground surface, establishing convective thermals that punch through the inversion lid, lifting the boundary layer to $>850\text{ m}$ and dispersing accumulated smog.

### 2. Particulate Exposure & Health Metrics
- **Ventilation Inhalation**:
  $$I = C_{\text{effective}} \times V_E \times t$$
  Where $V_E$ is calibrated from the EPA Exposure Factors Handbook ($0.45\text{ m}^3/\text{h}$ sleep, $0.55\text{ m}^3/\text{h}$ sedentary, $1.15\text{ m}^3/\text{h}$ light work, $2.10\text{ m}^3/\text{h}$ exercise).
- **Indoor Attenuation**:
  $$C_{\text{indoor}} = C_{\text{outdoor}} \times (1 - \eta_{\text{filtration}})$$
  With a Corsi-Rosenthal Box or sealed HEPA unit, $\eta \ge 0.85$.
- **Berkeley Earth Equivalence**:
  Based on epidemiological data linking $\text{PM}_{2.5}$ to cardiovascular/pulmonary mortality, inhaling $22 \mu\text{g/m}^3$ over $24\text{ hours}$ (equivalent to absorbing $\approx 528 \mu\text{g}$ of fine particulates) matches the health toll of 1 cigarette.

### 3. Indoor Air Quality (IAQ) Physics: Corsi-Rosenthal Box
- **Single-Pass Capture Efficiency**: Four MERV-13 pleated filters create a vast filter area ($\approx 2.2\text{ m}^2$). Because air moves slowly across each pleat (low face velocity), electrostatic attraction and impaction capture $>85\%$ of $\text{PM}_{2.5}$ particles on each pass.
- **CADR Formula**:
  $$\text{CADR}_{\text{PM2.5}} = \text{Flow Rate (CFM)} \times \eta_{\text{filter}}$$
- **Air Changes per Hour (ACH)**:
  $$\text{ACH} = \frac{\text{CADR} \times 60}{\text{Room Volume (cu ft)}}$$
- **Concentration Clearance Decay**:
  $$C(t) = C_0 \cdot e^{-\text{ACH} \cdot t}$$
  $$t_{90} = \frac{-\ln(0.10)}{\text{ACH}} \times 60 = \frac{138.15}{\text{ACH}} \text{ minutes}$$
  $$t_{99} = \frac{-\ln(0.01)}{\text{ACH}} \times 60 = \frac{276.31}{\text{ACH}} \text{ minutes}$$

---

## 🔒 Security Architecture

1. **Client-Side Credential Safety**:
   - API keys are entered via a modal and retained in private memory.
   - Keys are explicitly omitted from all content-addressable hash keys, telemetry records, error messages, and logs.
2. **Input Sanitization**:
   - User inputs and notes are validated and clamped.
   - Code fence stripping prevents malicious markdown injection.
3. **Zero Vulnerability Guarantee**:
   - Strict `npm audit` dependency enforcement (0 CVEs).

---

## ♿ Accessibility (WCAG 2.1 AA/AAA) Architecture

1. **Semantic HTML5 Landmarks**: Application structured using `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, and `<aside>`.
2. **Heading Level Continuity**: Heading levels strictly advance by one (`h1` → `h2` → `h3`) with zero skipped levels.
3. **Screen Reader Alternatives**: Every graphical visualization (such as the 24-hour diurnal smog chart) is accompanied by an accessible summary and toggleable data table.
4. **Keyboard Navigability**: Full tablist navigation with arrow key navigation, tab indexes, and visible focus rings (`focus-visible:ring-2`).
5. **High-Contrast Smog Visibility Mode**: One-click toggle adjusting text-to-background contrast ratios above 7:1 for low-vision users.
