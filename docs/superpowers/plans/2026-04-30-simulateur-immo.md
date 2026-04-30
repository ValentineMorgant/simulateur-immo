# Simulateur Immobilier Île-de-France — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une SPA React affichant la capacité d'emprunt immobilier pour des couples en Île-de-France, conçue pour une présentation bancaire.

**Architecture:** Context React unique (`SimulationContext`) gérant un tableau de simulations. Double barre de navigation (pills simulations + onglets sections). Calculs financiers isolés dans des fonctions pures testées avec Vitest.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS v3, Vitest, @testing-library/react

---

## Structure des fichiers

```
simulateur-immo/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts                          # Simulation, Resultats, Document types
│   ├── data/
│   │   ├── defaultSimulation.ts          # Valeurs Charlotte & Valentine + newSimulation()
│   │   └── secteurs.ts                   # 15 villes RER avec prix indicatifs
│   ├── context/
│   │   └── SimulationContext.tsx         # SimulationProvider + useSimulation hook
│   ├── utils/
│   │   └── calculs.ts                    # Fonctions pures de calcul financier
│   ├── components/
│   │   ├── AppHeader.tsx
│   │   ├── SimulationBar.tsx
│   │   ├── SectionTabs.tsx
│   │   └── tabs/
│   │       ├── ProfilTab.tsx
│   │       ├── SimulationTab.tsx
│   │       ├── SecteursTab.tsx
│   │       └── DossierTab.tsx
│   └── test/
│       └── setup.ts
```

---

## Task 1 : Scaffold du projet

**Files:**
- Create: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `src/index.css`, `src/main.tsx`, `src/App.tsx`, `src/test/setup.ts`

- [ ] **Initialiser le projet Vite**

```bash
cd /Users/charlottebocahut/Documents/simulateur-immo
npm create vite@latest . -- --template react-ts
```

Répondre `y` si demandé pour écraser les fichiers existants (seul `.superpowers/` et `docs/` existent déjà).

- [ ] **Installer les dépendances**

```bash
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Configurer Tailwind** — remplacer `tailwind.config.js` par `tailwind.config.ts` :

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

- [ ] **Configurer Vite avec Vitest** — remplacer `vite.config.ts` :

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Ajouter les scripts de test dans `package.json`** — dans la section `"scripts"` :

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Créer le fichier de setup des tests**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Remplacer `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Créer un App.tsx minimal pour le test de fumée**

```typescript
// src/App.tsx
export default function App() {
  return <div>Simulateur Immobilier</div>
}
```

- [ ] **Écrire le test de fumée**

```typescript
// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the app', () => {
  render(<App />)
  expect(screen.getByText(/Simulateur Immobilier/i)).toBeInTheDocument()
})
```

- [ ] **Vérifier que le test passe**

```bash
npm test
```

Attendu : `✓ src/App.test.tsx > renders the app`

- [ ] **Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold React + Vite + Tailwind + Vitest"
```

---

## Task 2 : Types, données statiques et liste documents

**Files:**
- Create: `src/types.ts`, `src/data/defaultSimulation.ts`, `src/data/secteurs.ts`

- [ ] **Créer `src/types.ts`**

```typescript
// src/types.ts
export type AcheteurData = {
  nom: string
  revenuFixe: number
  revenuVariable: number
}

export type Simulation = {
  id: string
  nom: string
  acheteur1: AcheteurData
  acheteur2: AcheteurData
  loyerActuel: number
  aideCaf: number
  apport: number
  taux: number
  duree: number
  budgetTravaux: number
  ptzActif: boolean
  ptzMontant: number
  prixM2Ancien: number
  prixM2Neuf: number
  dossier: Record<string, boolean>
}

export type Resultats = {
  revenusMensuels: number
  revenusAnnuels: number
  mensualiteMax: number
  capitalMax: number
  prixMaxBien: number
  tauxEndettement: number
  coutTotal: number
  interetsTotaux: number
  surfaceAncien: number
  surfaceNeuf: number
}

export type DocumentItem = {
  id: string
  label: string
  categorie: 'identite' | 'revenus' | 'bancaire' | 'projet'
}

export const DOCUMENTS: DocumentItem[] = [
  { id: 'id-a1',           label: "Pièce d'identité (Acheteur 1)",               categorie: 'identite' },
  { id: 'id-a2',           label: "Pièce d'identité (Acheteur 2)",               categorie: 'identite' },
  { id: 'domicile',        label: 'Justificatif de domicile',                     categorie: 'identite' },
  { id: 'pacs',            label: 'Contrat de PACS / mariage',                    categorie: 'identite' },
  { id: 'bulletins-a1',   label: '3 derniers bulletins de salaire (Acheteur 1)', categorie: 'revenus'  },
  { id: 'bulletins-a2',   label: '3 derniers bulletins de salaire (Acheteur 2)', categorie: 'revenus'  },
  { id: 'avis-impo',       label: "2 derniers avis d'imposition",                 categorie: 'revenus'  },
  { id: 'contrat-a1',      label: 'Contrat de travail (Acheteur 1)',              categorie: 'revenus'  },
  { id: 'contrat-a2',      label: 'Contrat de travail (Acheteur 2)',              categorie: 'revenus'  },
  { id: 'attestation-emp', label: 'Attestation employeur',                        categorie: 'revenus'  },
  { id: 'releves',         label: '3 derniers relevés de compte',                 categorie: 'bancaire' },
  { id: 'epargne',         label: 'Relevés épargne (livret A, PEL…)',             categorie: 'bancaire' },
  { id: 'amortissement',   label: "Tableau d'amortissement crédit en cours",      categorie: 'bancaire' },
  { id: 'cpt-joint',       label: 'Relevés compte joint (si applicable)',         categorie: 'bancaire' },
  { id: 'caf',             label: 'Attestation CAF',                              categorie: 'bancaire' },
  { id: 'compromis',       label: 'Compromis ou promesse de vente',               categorie: 'projet'   },
  { id: 'descriptif',      label: 'Descriptif du bien (surface, DPE…)',           categorie: 'projet'   },
  { id: 'copro',           label: 'Règlement de copropriété (si applicable)',     categorie: 'projet'   },
]
```

- [ ] **Créer `src/data/defaultSimulation.ts`**

```typescript
// src/data/defaultSimulation.ts
import { Simulation } from '../types'

export const DEFAULT_SIMULATION: Omit<Simulation, 'id'> = {
  nom: 'Charlotte & Valentine',
  acheteur1: { nom: 'Charlotte', revenuFixe: 39000, revenuVariable: 2000 },
  acheteur2: { nom: 'Valentine', revenuFixe: 45150, revenuVariable: 0 },
  loyerActuel: 1200,
  aideCaf: 180,
  apport: 30000,
  taux: 3.5,
  duree: 25,
  budgetTravaux: 0,
  ptzActif: false,
  ptzMontant: 0,
  prixM2Ancien: 3500,
  prixM2Neuf: 4500,
  dossier: {},
}

export function newSimulation(): Simulation {
  return {
    id: crypto.randomUUID(),
    nom: 'Nouvelle simulation',
    acheteur1: { nom: 'Acheteur 1', revenuFixe: 0, revenuVariable: 0 },
    acheteur2: { nom: 'Acheteur 2', revenuFixe: 0, revenuVariable: 0 },
    loyerActuel: 0,
    aideCaf: 0,
    apport: 0,
    taux: 3.5,
    duree: 25,
    budgetTravaux: 0,
    ptzActif: false,
    ptzMontant: 0,
    prixM2Ancien: 3500,
    prixM2Neuf: 4500,
    dossier: {},
  }
}
```

- [ ] **Créer `src/data/secteurs.ts`**

```typescript
// src/data/secteurs.ts
export type Secteur = {
  ville: string
  departement: string
  lignes: string[]
  trajetMin: number
  prixAncien: number
  prixNeuf: number
}

export const SECTEURS: Secteur[] = [
  { ville: 'Massy-Palaiseau',          departement: '91', lignes: ['B'],      trajetMin: 30, prixAncien: 2800, prixNeuf: 3800 },
  { ville: 'Palaiseau',                departement: '91', lignes: ['B'],      trajetMin: 35, prixAncien: 2900, prixNeuf: 3900 },
  { ville: 'Gif-sur-Yvette',           departement: '91', lignes: ['B'],      trajetMin: 40, prixAncien: 3000, prixNeuf: 4000 },
  { ville: 'Saint-Rémy-lès-Chevreuse', departement: '78', lignes: ['B'],      trajetMin: 45, prixAncien: 3100, prixNeuf: 4100 },
  { ville: 'Évry-Courcouronnes',       departement: '91', lignes: ['D'],      trajetMin: 35, prixAncien: 2600, prixNeuf: 3500 },
  { ville: 'Corbeil-Essonnes',         departement: '91', lignes: ['D'],      trajetMin: 40, prixAncien: 2200, prixNeuf: 3200 },
  { ville: 'Juvisy-sur-Orge',          departement: '91', lignes: ['C', 'D'], trajetMin: 25, prixAncien: 3200, prixNeuf: 4200 },
  { ville: 'Yerres',                   departement: '91', lignes: ['D'],      trajetMin: 30, prixAncien: 3000, prixNeuf: 4000 },
  { ville: 'Brunoy',                   departement: '91', lignes: ['D'],      trajetMin: 32, prixAncien: 3100, prixNeuf: 4100 },
  { ville: 'Cergy-Pontoise',           departement: '95', lignes: ['A'],      trajetMin: 45, prixAncien: 2800, prixNeuf: 3700 },
  { ville: 'Pontoise',                 departement: '95', lignes: ['A'],      trajetMin: 50, prixAncien: 2600, prixNeuf: 3500 },
  { ville: 'Villiers-sur-Marne',       departement: '94', lignes: ['A'],      trajetMin: 25, prixAncien: 3400, prixNeuf: 4400 },
  { ville: 'Sucy-en-Brie',             departement: '94', lignes: ['A'],      trajetMin: 30, prixAncien: 3300, prixNeuf: 4300 },
  { ville: 'Draveil',                  departement: '91', lignes: [],         trajetMin: 35, prixAncien: 2500, prixNeuf: 3400 },
  { ville: 'Savigny-sur-Orge',         departement: '91', lignes: ['C'],      trajetMin: 28, prixAncien: 3100, prixNeuf: 4000 },
]
```

- [ ] **Commit**

```bash
git add src/types.ts src/data/
git commit -m "feat: add types, default simulation data and secteurs"
```

---

## Task 3 : Calculs financiers (TDD)

**Files:**
- Create: `src/utils/calculs.ts`, `src/utils/calculs.test.ts`

- [ ] **Écrire les tests en premier**

```typescript
// src/utils/calculs.test.ts
import { describe, it, expect } from 'vitest'
import { calculer } from './calculs'
import { Simulation } from '../types'

const BASE: Simulation = {
  id: '1',
  nom: 'Test',
  acheteur1: { nom: 'Charlotte', revenuFixe: 39000, revenuVariable: 2000 },
  acheteur2: { nom: 'Valentine', revenuFixe: 45150, revenuVariable: 0 },
  loyerActuel: 1200,
  aideCaf: 180,
  apport: 30000,
  taux: 3.5,
  duree: 25,
  budgetTravaux: 0,
  ptzActif: false,
  ptzMontant: 0,
  prixM2Ancien: 3500,
  prixM2Neuf: 4500,
  dossier: {},
}

describe('calculer', () => {
  it('calcule les revenus annuels (variable à 70%)', () => {
    const r = calculer(BASE)
    // Charlotte: 39000 + 2000*0.7 = 40400 ; Valentine: 45150
    expect(r.revenusAnnuels).toBe(85550)
  })

  it('calcule les revenus mensuels', () => {
    const r = calculer(BASE)
    expect(r.revenusMensuels).toBeCloseTo(85550 / 12, 2)
  })

  it('calcule la mensualité max à 35%', () => {
    const r = calculer(BASE)
    expect(r.mensualiteMax).toBeCloseTo((85550 / 12) * 0.35, 2)
  })

  it('retourne un taux d'endettement de 35%', () => {
    const r = calculer(BASE)
    expect(r.tauxEndettement).toBeCloseTo(35, 1)
  })

  it('calcule le capital max via annuité constante', () => {
    const r = calculer(BASE)
    // facteur ≈ 199.7 pour taux=3.5% sur 25 ans
    expect(r.capitalMax).toBeGreaterThan(490000)
    expect(r.capitalMax).toBeLessThan(510000)
  })

  it('ajoute le PTZ au capital max si actif', () => {
    const base = calculer(BASE)
    const withPTZ = calculer({ ...BASE, ptzActif: true, ptzMontant: 50000 })
    expect(withPTZ.capitalMax).toBeCloseTo(base.capitalMax + 50000, 0)
  })

  it('déduit le budget travaux du prix max du bien', () => {
    const base = calculer(BASE)
    const withTravaux = calculer({ ...BASE, budgetTravaux: 20000 })
    expect(withTravaux.prixMaxBien).toBeCloseTo(base.prixMaxBien - 20000, 0)
  })

  it('prix max bien = capital + apport - travaux', () => {
    const r = calculer(BASE)
    expect(r.prixMaxBien).toBeCloseTo(r.capitalMax + 30000, 0)
  })

  it('calcule les surfaces accessibles', () => {
    const r = calculer(BASE)
    expect(r.surfaceAncien).toBeCloseTo(r.prixMaxBien / 3500, 1)
    expect(r.surfaceNeuf).toBeCloseTo(r.prixMaxBien / 4500, 1)
  })

  it('gère revenus nuls sans diviser par zéro', () => {
    const r = calculer({
      ...BASE,
      acheteur1: { nom: 'A', revenuFixe: 0, revenuVariable: 0 },
      acheteur2: { nom: 'B', revenuFixe: 0, revenuVariable: 0 },
    })
    expect(r.tauxEndettement).toBe(0)
    expect(r.capitalMax).toBe(0)
  })

  it('gère taux à 0% (prêt in fine)', () => {
    const r = calculer({ ...BASE, taux: 0 })
    // facteur = n quand r=0
    const n = 25 * 12
    const mensualite = (85550 / 12) * 0.35
    expect(r.capitalMax).toBeCloseTo(mensualite * n, 0)
  })
})
```

- [ ] **Lancer les tests — s'assurer qu'ils échouent**

```bash
npm test
```

Attendu : `FAIL src/utils/calculs.test.ts` (module introuvable)

- [ ] **Créer `src/utils/calculs.ts`**

```typescript
// src/utils/calculs.ts
import { Simulation, Resultats } from '../types'

export function calculer(sim: Simulation): Resultats {
  const revenuRetenu1 = sim.acheteur1.revenuFixe + sim.acheteur1.revenuVariable * 0.7
  const revenuRetenu2 = sim.acheteur2.revenuFixe + sim.acheteur2.revenuVariable * 0.7
  const revenusAnnuels = revenuRetenu1 + revenuRetenu2
  const revenusMensuels = revenusAnnuels / 12
  const mensualiteMax = revenusMensuels * 0.35

  const r = sim.taux / 100 / 12
  const n = sim.duree * 12
  const facteur = r > 0 ? (1 - Math.pow(1 + r, -n)) / r : n

  const capitalPret = mensualiteMax * facteur
  const capitalMax = capitalPret + (sim.ptzActif ? sim.ptzMontant : 0)
  const prixMaxBien = capitalMax + sim.apport - sim.budgetTravaux

  const tauxEndettement = revenusMensuels > 0
    ? (mensualiteMax / revenusMensuels) * 100
    : 0

  const coutTotal = mensualiteMax * n
  const interetsTotaux = coutTotal - capitalPret

  const surfaceAncien = sim.prixM2Ancien > 0 ? prixMaxBien / sim.prixM2Ancien : 0
  const surfaceNeuf   = sim.prixM2Neuf   > 0 ? prixMaxBien / sim.prixM2Neuf   : 0

  return {
    revenusMensuels,
    revenusAnnuels,
    mensualiteMax,
    capitalMax,
    prixMaxBien,
    tauxEndettement,
    coutTotal,
    interetsTotaux,
    surfaceAncien,
    surfaceNeuf,
  }
}
```

- [ ] **Lancer les tests — tous doivent passer**

```bash
npm test
```

Attendu : `✓ src/utils/calculs.test.ts (10 tests)`

- [ ] **Commit**

```bash
git add src/utils/
git commit -m "feat: add financial calculation utils with tests"
```

---

## Task 4 : SimulationContext

**Files:**
- Create: `src/context/SimulationContext.tsx`

- [ ] **Créer `src/context/SimulationContext.tsx`**

```typescript
// src/context/SimulationContext.tsx
import { createContext, useContext, useState } from 'react'
import type { Simulation } from '../types'
import { DEFAULT_SIMULATION, newSimulation } from '../data/defaultSimulation'

type SimCtx = {
  simulations: Simulation[]
  activeId: string
  active: Simulation
  setActive: (id: string) => void
  addSimulation: () => void
  updateActive: (updates: Partial<Simulation>) => void
  renameSimulation: (id: string, nom: string) => void
}

const SimulationContext = createContext<SimCtx | null>(null)

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const first: Simulation = { id: crypto.randomUUID(), ...DEFAULT_SIMULATION }
  const [simulations, setSimulations] = useState<Simulation[]>([first])
  const [activeId, setActiveId] = useState(first.id)

  const active = simulations.find(s => s.id === activeId) ?? simulations[0]

  function setActive(id: string) { setActiveId(id) }

  function addSimulation() {
    const sim = newSimulation()
    setSimulations(prev => [...prev, sim])
    setActiveId(sim.id)
  }

  function updateActive(updates: Partial<Simulation>) {
    setSimulations(prev =>
      prev.map(s => s.id === activeId ? { ...s, ...updates } : s)
    )
  }

  function renameSimulation(id: string, nom: string) {
    setSimulations(prev => prev.map(s => s.id === id ? { ...s, nom } : s))
  }

  return (
    <SimulationContext.Provider
      value={{ simulations, activeId, active, setActive, addSimulation, updateActive, renameSimulation }}
    >
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}
```

- [ ] **Mettre à jour `src/main.tsx` pour inclure le Provider**

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SimulationProvider } from './context/SimulationContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimulationProvider>
      <App />
    </SimulationProvider>
  </StrictMode>,
)
```

- [ ] **Commit**

```bash
git add src/context/ src/main.tsx
git commit -m "feat: add SimulationContext with multi-simulation state"
```

---

## Task 5 : Shell de l'application (Header + SimulationBar + SectionTabs)

**Files:**
- Create: `src/components/AppHeader.tsx`, `src/components/SimulationBar.tsx`, `src/components/SectionTabs.tsx`
- Modify: `src/App.tsx`

- [ ] **Créer `src/components/AppHeader.tsx`**

```tsx
// src/components/AppHeader.tsx
export function AppHeader() {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <header className="bg-green-900 text-white px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-base font-bold tracking-wide">🏡 Simulateur Immobilier</h1>
        <p className="text-xs text-green-300">Île-de-France · Achat en couple</p>
      </div>
      <span className="text-xs text-green-400">{today}</span>
    </header>
  )
}
```

- [ ] **Créer `src/components/SimulationBar.tsx`**

```tsx
// src/components/SimulationBar.tsx
import { useState } from 'react'
import { useSimulation } from '../context/SimulationContext'

export function SimulationBar() {
  const { simulations, activeId, setActive, addSimulation, renameSimulation } = useSimulation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  function startEdit(id: string, nom: string) {
    setEditingId(id)
    setEditValue(nom)
  }

  function commitEdit(id: string) {
    if (editValue.trim()) renameSimulation(id, editValue.trim())
    setEditingId(null)
  }

  return (
    <div className="bg-green-50 border-b border-green-200 px-5 py-2.5 flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500 font-medium">Simulations :</span>
      {simulations.map(sim => (
        <div key={sim.id}>
          {editingId === sim.id ? (
            <input
              autoFocus
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={() => commitEdit(sim.id)}
              onKeyDown={e => e.key === 'Enter' && commitEdit(sim.id)}
              className="border border-green-400 rounded-full px-3 py-1 text-xs outline-none bg-white"
            />
          ) : (
            <button
              onClick={() => setActive(sim.id)}
              onDoubleClick={() => startEdit(sim.id, sim.nom)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                sim.id === activeId
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white border border-slate-300 text-slate-500 hover:border-green-400'
              }`}
            >
              {sim.nom}
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addSimulation}
        className="rounded-full px-3 py-1 text-base leading-none text-green-600 border border-dashed border-green-400 hover:bg-green-100 transition-colors"
        title="Nouvelle simulation"
      >
        ＋
      </button>
    </div>
  )
}
```

- [ ] **Créer `src/components/SectionTabs.tsx`**

```tsx
// src/components/SectionTabs.tsx
import { useSimulation } from '../context/SimulationContext'
import { DOCUMENTS } from '../types'

type Section = 'profil' | 'simulation' | 'secteurs' | 'dossier'

type Props = {
  active: Section
  onChange: (s: Section) => void
}

export function SectionTabs({ active, onChange }: Props) {
  const { active: sim } = useSimulation()
  const checked = DOCUMENTS.filter(d => sim.dossier[d.id]).length
  const total = DOCUMENTS.length

  const tabs: { id: Section; label: string; badge?: string }[] = [
    { id: 'profil',     label: 'Profil' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'secteurs',   label: 'Secteurs' },
    { id: 'dossier',    label: 'Dossier', badge: `${checked}/${total}` },
  ]

  return (
    <div className="bg-white border-b-2 border-green-200 px-5 flex">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 border-b-2 -mb-0.5 transition-colors ${
            tab.id === active
              ? 'text-green-600 border-green-600'
              : 'text-slate-500 border-transparent hover:text-green-600'
          }`}
        >
          {tab.label}
          {tab.badge && (
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${
              tab.id === active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Mettre à jour `src/App.tsx` pour assembler le shell**

```tsx
// src/App.tsx
import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { SimulationBar } from './components/SimulationBar'
import { SectionTabs } from './components/SectionTabs'

type Section = 'profil' | 'simulation' | 'secteurs' | 'dossier'

export default function App() {
  const [section, setSection] = useState<Section>('simulation')

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <AppHeader />
      <SimulationBar />
      <SectionTabs active={section} onChange={setSection} />
      <main className="flex-1 p-5">
        <p className="text-slate-400 text-sm">Onglet : {section}</p>
      </main>
    </div>
  )
}
```

- [ ] **Lancer le dev server et vérifier le shell**

```bash
npm run dev
```

Ouvrir http://localhost:5173. Vérifier : header vert foncé, pill "Charlotte & Valentine", 4 onglets, badge "0/18" sur Dossier.

- [ ] **Mettre à jour le test de fumée**

```typescript
// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import App from './App'
import { SimulationProvider } from './context/SimulationContext'

test('renders the app shell', () => {
  render(<SimulationProvider><App /></SimulationProvider>)
  expect(screen.getByText(/Simulateur Immobilier/i)).toBeInTheDocument()
  expect(screen.getByText('Charlotte & Valentine')).toBeInTheDocument()
  expect(screen.getByText('Profil')).toBeInTheDocument()
  expect(screen.getByText('Simulation')).toBeInTheDocument()
})
```

- [ ] **Vérifier que les tests passent**

```bash
npm test
```

Attendu : tous les tests passent.

- [ ] **Commit**

```bash
git add src/components/AppHeader.tsx src/components/SimulationBar.tsx src/components/SectionTabs.tsx src/App.tsx src/App.test.tsx
git commit -m "feat: add app shell with header, simulation bar and section tabs"
```

---

## Task 6 : Onglet Profil

**Files:**
- Create: `src/components/tabs/ProfilTab.tsx`
- Modify: `src/App.tsx`

- [ ] **Créer `src/components/tabs/ProfilTab.tsx`**

```tsx
// src/components/tabs/ProfilTab.tsx
import { useSimulation } from '../../context/SimulationContext'
import { calculer } from '../../utils/calculs'
import type { AcheteurData, Simulation } from '../../types'

function euros(n: number) {
  return n.toLocaleString('fr-FR') + ' €'
}

function NumInput({ label, value, onChange, suffix = '€' }: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      <div className="flex items-center border border-green-200 rounded-lg bg-green-50 overflow-hidden focus-within:border-green-400">
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="flex-1 px-3 py-2 text-sm text-slate-800 bg-transparent outline-none"
        />
        <span className="px-3 text-sm text-green-600 font-medium">{suffix}</span>
      </div>
    </div>
  )
}

function TextInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-green-200 rounded-lg bg-green-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-400"
      />
    </div>
  )
}

function AcheteurCard({ num, data, onChange }: {
  num: 1 | 2
  data: AcheteurData
  onChange: (d: AcheteurData) => void
}) {
  const revenuRetenu = data.revenuFixe + data.revenuVariable * 0.7
  return (
    <div className="bg-white rounded-xl p-4 border border-green-200">
      <h3 className="text-xs font-bold text-green-900 mb-3 flex items-center gap-2">
        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{num}</span>
        Acheteur·se {num}
      </h3>
      <TextInput label="Prénom" value={data.nom} onChange={v => onChange({ ...data, nom: v })} />
      <NumInput label="Revenu fixe annuel net" value={data.revenuFixe} onChange={v => onChange({ ...data, revenuFixe: v })} />
      <NumInput label="Revenu variable annuel" value={data.revenuVariable} onChange={v => onChange({ ...data, revenuVariable: v })} />
      <div className="bg-green-50 rounded-lg px-3 py-2 text-xs text-slate-500 mt-1">
        Revenu retenu : <strong className="text-green-900">{euros(revenuRetenu)} / an</strong>
        {data.revenuVariable > 0 && <span className="block mt-0.5 text-slate-400">(variable compté à 70%)</span>}
      </div>
    </div>
  )
}

export function ProfilTab() {
  const { active, updateActive } = useSimulation()
  const r = calculer(active)

  function set<K extends keyof Simulation>(key: K, value: Simulation[K]) {
    updateActive({ [key]: value } as Partial<Simulation>)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <AcheteurCard num={1} data={active.acheteur1} onChange={v => set('acheteur1', v)} />
      <AcheteurCard num={2} data={active.acheteur2} onChange={v => set('acheteur2', v)} />

      <div className="bg-white rounded-xl p-4 border border-green-200">
        <h3 className="text-xs font-bold text-green-900 mb-3">Situation actuelle</h3>
        <NumInput label="Loyer mensuel actuel" value={active.loyerActuel} onChange={v => set('loyerActuel', v)} suffix="€/mois" />
        <NumInput label="Aide CAF mensuelle" value={active.aideCaf} onChange={v => set('aideCaf', v)} suffix="€/mois" />
      </div>

      <div className="bg-white rounded-xl p-4 border border-green-200">
        <h3 className="text-xs font-bold text-green-900 mb-3">Apport &amp; Synthèse</h3>
        <NumInput label="Apport disponible" value={active.apport} onChange={v => set('apport', v)} />
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 mt-2 space-y-1.5">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">Synthèse</p>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Revenus nets totaux / an</span><strong className="text-green-900">{euros(r.revenusAnnuels)}</strong></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Revenus nets / mois</span><strong className="text-green-900">{euros(Math.round(r.revenusMensuels))}</strong></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Mensualité max (35%)</span><strong className="text-green-600">{euros(Math.round(r.mensualiteMax))}</strong></div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Brancher ProfilTab dans `src/App.tsx`**

Remplacer le `<main>` de App.tsx :

```tsx
// src/App.tsx
import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { SimulationBar } from './components/SimulationBar'
import { SectionTabs } from './components/SectionTabs'
import { ProfilTab } from './components/tabs/ProfilTab'

type Section = 'profil' | 'simulation' | 'secteurs' | 'dossier'

export default function App() {
  const [section, setSection] = useState<Section>('simulation')

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <AppHeader />
      <SimulationBar />
      <SectionTabs active={section} onChange={setSection} />
      <main className="flex-1 p-5">
        {section === 'profil' && <ProfilTab />}
        {section !== 'profil' && <p className="text-slate-400 text-sm">Onglet : {section}</p>}
      </main>
    </div>
  )
}
```

- [ ] **Vérifier dans le navigateur** — cliquer sur "Profil" : les 4 cartes s'affichent avec les données Charlotte & Valentine. Modifier un revenu → la synthèse se met à jour immédiatement.

- [ ] **Commit**

```bash
git add src/components/tabs/ProfilTab.tsx src/App.tsx
git commit -m "feat: add ProfilTab with editable inputs and live recap"
```

---

## Task 7 : Onglet Simulation

**Files:**
- Create: `src/components/tabs/SimulationTab.tsx`
- Modify: `src/App.tsx`

- [ ] **Créer `src/components/tabs/SimulationTab.tsx`**

```tsx
// src/components/tabs/SimulationTab.tsx
import { useSimulation } from '../../context/SimulationContext'
import { calculer } from '../../utils/calculs'
import type { Simulation } from '../../types'

function euros(n: number) {
  return Math.round(n).toLocaleString('fr-FR') + ' €'
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center px-4 py-3">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-green-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange, fmt }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; fmt: (v: number) => string
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="text-green-600 font-semibold">{fmt(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded appearance-none cursor-pointer accent-green-600 bg-green-100"
      />
      <div className="flex justify-between text-xs text-slate-300 mt-0.5">
        <span>{fmt(min)}</span><span>{fmt(max)}</span>
      </div>
    </div>
  )
}

function PrixM2Input({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="mb-2">
      <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</label>
      <div className="flex items-center border border-green-200 rounded-lg bg-white overflow-hidden focus-within:border-green-400">
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="flex-1 px-2 py-1.5 text-sm font-bold text-green-900 bg-transparent outline-none"
        />
        <span className="px-2 text-xs text-green-600">€/m²</span>
      </div>
    </div>
  )
}

export function SimulationTab() {
  const { active, updateActive } = useSimulation()
  const r = calculer(active)

  function set<K extends keyof Simulation>(key: K, value: Simulation[K]) {
    updateActive({ [key]: value } as Partial<Simulation>)
  }

  const endettPct = Math.min(r.tauxEndettement, 50)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="bg-white rounded-xl border border-green-200 grid grid-cols-4 divide-x divide-green-100">
        <Kpi label="Capacité d'emprunt" value={euros(r.capitalMax)} />
        <Kpi label="Mensualité" value={euros(r.mensualiteMax) + '/mois'} />
        <Kpi label="Taux d'endettement" value={r.tauxEndettement.toFixed(1) + ' %'} sub="/ 35% max" />
        <Kpi label="Prix max du bien" value={euros(r.prixMaxBien)} sub={`apport inclus${active.budgetTravaux > 0 ? ', travaux déduits' : ''}`} />
      </div>

      {/* Barre d'endettement */}
      <div className="bg-white rounded-xl border border-green-200 px-5 py-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Taux d'endettement : <strong className="text-green-600">{r.tauxEndettement.toFixed(1)}%</strong></span>
          <span>Limite bancaire : <strong>35%</strong></span>
        </div>
        <div className="h-2.5 bg-green-100 rounded-full relative">
          <div
            className="h-2.5 bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
            style={{ width: `${(endettPct / 50) * 100}%` }}
          />
          <div className="absolute top-[-3px] h-4 w-0.5 bg-red-400 rounded" style={{ left: `${(35 / 50) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-300 mt-0.5">
          <span>0%</span><span className="text-red-400">35% ↑</span><span>50%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Paramètres */}
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <h3 className="text-xs font-bold text-green-900 mb-4">Paramètres du prêt</h3>
          <Slider label="Taux d'intérêt" value={active.taux} min={0.5} max={6} step={0.05}
            onChange={v => set('taux', v)} fmt={v => v.toFixed(2) + ' %'} />
          <Slider label="Durée" value={active.duree} min={5} max={30} step={1}
            onChange={v => set('duree', v)} fmt={v => v + ' ans'} />
          <Slider label="Apport" value={active.apport} min={0} max={200000} step={1000}
            onChange={v => set('apport', v)} fmt={v => v.toLocaleString('fr-FR') + ' €'} />
          <Slider label="Budget travaux" value={active.budgetTravaux} min={0} max={100000} step={1000}
            onChange={v => set('budgetTravaux', v)} fmt={v => v.toLocaleString('fr-FR') + ' €'} />

          <div className="border-t border-green-100 pt-3 mt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Prêt à Taux Zéro (PTZ)</span>
              <button
                onClick={() => set('ptzActif', !active.ptzActif)}
                className={`w-10 h-5 rounded-full relative transition-colors ${active.ptzActif ? 'bg-green-600' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active.ptzActif ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {active.ptzActif && (
              <Slider label="Montant PTZ" value={active.ptzMontant} min={0} max={100000} step={1000}
                onChange={v => set('ptzMontant', v)} fmt={v => v.toLocaleString('fr-FR') + ' €'} />
            )}
            {!active.ptzActif && (
              <p className="text-xs text-slate-400">Activer si éligible (neuf, primo-accédant, zone A/B)</p>
            )}
          </div>
        </div>

        {/* Comparatif */}
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <h3 className="text-xs font-bold text-green-900 mb-4">Comparatif Ancien / Neuf</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'ANCIEN', prixM2: active.prixM2Ancien, surface: r.surfaceAncien, key: 'prixM2Ancien' as const },
              { label: 'NEUF',   prixM2: active.prixM2Neuf,   surface: r.surfaceNeuf,   key: 'prixM2Neuf' as const },
            ].map(col => (
              <div key={col.label} className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs font-semibold text-slate-500 mb-2">{col.label}</p>
                <PrixM2Input label="Prix/m²" value={col.prixM2} onChange={v => set(col.key, v)} />
                <p className="text-xs text-slate-500 mt-2">Surface accessible</p>
                <p className="text-2xl font-extrabold text-green-600">{Math.floor(col.surface)} m²</p>
              </div>
            ))}
          </div>
          <div className="border-t border-green-100 pt-3 space-y-1">
            <p className="text-xs font-semibold text-green-900 mb-2">Coût total du crédit</p>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Capital emprunté</span><span className="font-semibold text-green-900">{euros(r.capitalMax)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Intérêts totaux</span><span className="text-slate-500">{euros(r.interetsTotaux)}</span></div>
            <div className="flex justify-between text-xs font-bold"><span className="text-slate-700">Total remboursé</span><span className="text-green-900">{euros(r.coutTotal)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Brancher SimulationTab dans `src/App.tsx`**

```tsx
// src/App.tsx — section <main> complète
import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { SimulationBar } from './components/SimulationBar'
import { SectionTabs } from './components/SectionTabs'
import { ProfilTab } from './components/tabs/ProfilTab'
import { SimulationTab } from './components/tabs/SimulationTab'

type Section = 'profil' | 'simulation' | 'secteurs' | 'dossier'

export default function App() {
  const [section, setSection] = useState<Section>('simulation')

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <AppHeader />
      <SimulationBar />
      <SectionTabs active={section} onChange={setSection} />
      <main className="flex-1 p-5">
        {section === 'profil'     && <ProfilTab />}
        {section === 'simulation' && <SimulationTab />}
        {(section === 'secteurs' || section === 'dossier') && (
          <p className="text-slate-400 text-sm">Onglet : {section}</p>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Vérifier dans le navigateur** — onglet Simulation : KPIs, sliders, toggle PTZ, prix/m² éditables, surfaces recalculées en temps réel.

- [ ] **Lancer les tests**

```bash
npm test
```

Attendu : tous les tests passent.

- [ ] **Commit**

```bash
git add src/components/tabs/SimulationTab.tsx src/App.tsx
git commit -m "feat: add SimulationTab with sliders, KPIs, PTZ toggle and comparatif"
```

---

## Task 8 : Onglet Secteurs

**Files:**
- Create: `src/components/tabs/SecteursTab.tsx`
- Modify: `src/App.tsx`

- [ ] **Créer `src/components/tabs/SecteursTab.tsx`**

```tsx
// src/components/tabs/SecteursTab.tsx
import { useState, useMemo } from 'react'
import { useSimulation } from '../../context/SimulationContext'
import { calculer } from '../../utils/calculs'
import { SECTEURS } from '../../data/secteurs'

type SortKey = 'ville' | 'trajetMin' | 'prixAncien' | 'prixNeuf' | 'surfaceAncien'
type Filter = 'all' | 'A' | 'B' | 'C' | 'D' | 'E'

const LINE_COLORS: Record<string, string> = {
  A: 'bg-red-100 text-red-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-green-100 text-green-700',
  E: 'bg-purple-100 text-purple-700',
}

export function SecteursTab() {
  const { active } = useSimulation()
  const r = calculer(active)
  const [filter, setFilter] = useState<Filter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('prixAncien')
  const [sortAsc, setSortAsc] = useState(true)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const rows = useMemo(() => {
    const filtered = filter === 'all'
      ? SECTEURS
      : SECTEURS.filter(s => s.lignes.includes(filter))

    return [...filtered]
      .map(s => ({
        ...s,
        surfaceAncien: s.prixAncien > 0 ? r.prixMaxBien / s.prixAncien : 0,
        surfaceNeuf:   s.prixNeuf   > 0 ? r.prixMaxBien / s.prixNeuf   : 0,
      }))
      .sort((a, b) => {
        const va = a[sortKey as keyof typeof a] as number | string
        const vb = b[sortKey as keyof typeof b] as number | string
        const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number)
        return sortAsc ? cmp : -cmp
      })
  }, [filter, sortKey, sortAsc, r.prixMaxBien])

  function Th({ label, k }: { label: string; k: SortKey }) {
    return (
      <th
        onClick={() => toggleSort(k)}
        className="px-4 py-2.5 text-left text-xs font-semibold tracking-wide cursor-pointer select-none hover:bg-green-800 transition-colors"
      >
        {label} {sortKey === k ? (sortAsc ? '↑' : '↓') : ''}
      </th>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">Filtrer :</span>
        {(['all', 'A', 'B', 'C', 'D', 'E'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filter === f ? 'bg-green-600 text-white' : 'bg-white border border-slate-300 text-slate-500 hover:border-green-400'
            }`}
          >
            {f === 'all' ? 'Toutes les lignes' : `RER ${f}`}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          Budget max : <strong className="text-green-700">{Math.round(r.prixMaxBien).toLocaleString('fr-FR')} €</strong>
        </span>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-green-900 text-white text-xs">
            <tr>
              <Th label="Ville" k="ville" />
              <th className="px-4 py-2.5 text-left text-xs font-semibold">Ligne(s)</th>
              <Th label="Trajet" k="trajetMin" />
              <Th label="Prix ancien /m²" k="prixAncien" />
              <Th label="Prix neuf /m²" k="prixNeuf" />
              <Th label="Surface accessible" k="surfaceAncien" />
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={s.ville} className={i % 2 === 0 ? 'bg-green-50/40' : 'bg-white'}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-green-900">{s.ville}</p>
                  <p className="text-xs text-slate-400">{s.departement}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {s.lignes.length > 0
                      ? s.lignes.map(l => (
                          <span key={l} className={`text-xs font-bold rounded px-1.5 py-0.5 ${LINE_COLORS[l] ?? 'bg-slate-100 text-slate-600'}`}>{l}</span>
                        ))
                      : <span className="text-xs text-slate-400">—</span>
                    }
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{s.trajetMin} min</td>
                <td className="px-4 py-3 font-semibold text-green-900">{s.prixAncien.toLocaleString('fr-FR')} €</td>
                <td className="px-4 py-3 font-semibold text-green-900">{s.prixNeuf.toLocaleString('fr-FR')} €</td>
                <td className="px-4 py-3">
                  <span className="text-lg font-extrabold text-green-600">{Math.floor(s.surfaceAncien)} m²</span>
                  <span className="text-xs text-slate-400 ml-1">(ancien)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 text-center">Prix indicatifs 2024-2025. Surface calculée sur le budget max de la simulation active.</p>
    </div>
  )
}
```

- [ ] **Brancher SecteursTab dans `src/App.tsx`**

```tsx
// src/App.tsx — importer et brancher SecteursTab
import { SecteursTab } from './components/tabs/SecteursTab'

// Dans <main> remplacer le placeholder secteurs :
{section === 'secteurs' && <SecteursTab />}
```

- [ ] **Vérifier dans le navigateur** — filtres par ligne, tri par colonne, surfaces qui changent quand on modifie un revenu dans Profil.

- [ ] **Commit**

```bash
git add src/components/tabs/SecteursTab.tsx src/App.tsx
git commit -m "feat: add SecteursTab with filterable sortable cities table"
```

---

## Task 9 : Onglet Dossier

**Files:**
- Create: `src/components/tabs/DossierTab.tsx`
- Modify: `src/App.tsx`

- [ ] **Créer `src/components/tabs/DossierTab.tsx`**

```tsx
// src/components/tabs/DossierTab.tsx
import { useSimulation } from '../../context/SimulationContext'
import { DOCUMENTS } from '../../types'

const CATEGORIES = [
  { id: 'identite' as const, label: 'Identité' },
  { id: 'revenus'  as const, label: 'Revenus' },
  { id: 'bancaire' as const, label: 'Situation bancaire' },
  { id: 'projet'   as const, label: 'Projet immobilier' },
]

function badgeClass(checked: number, total: number) {
  if (checked === total) return 'bg-green-100 text-green-700'
  if (checked === 0)     return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

export function DossierTab() {
  const { active, updateActive } = useSimulation()
  const dossier = active.dossier

  const total   = DOCUMENTS.length
  const checked = DOCUMENTS.filter(d => dossier[d.id]).length
  const pct     = total > 0 ? Math.round((checked / total) * 100) : 0

  function toggle(id: string) {
    updateActive({ dossier: { ...dossier, [id]: !dossier[id] } })
  }

  let statusText = 'Dossier incomplet'
  if (pct === 100) statusText = 'Dossier complet — prêt pour la banque ✓'
  else if (pct >= 50) statusText = `Dossier à compléter — ${total - checked} document${total - checked > 1 ? 's' : ''} manquant${total - checked > 1 ? 's' : ''}`
  else statusText = `Dossier incomplet — ${total - checked} documents manquants`

  return (
    <div className="space-y-4">
      {/* Progression globale */}
      <div className="bg-white rounded-xl border border-green-200 p-4 flex items-center gap-5">
        <div className="text-center min-w-[60px]">
          <p className="text-3xl font-extrabold text-green-600">{checked}</p>
          <p className="text-xs text-slate-400">/ {total} docs</p>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Progression du dossier</span>
            <span className="text-green-600 font-semibold">{pct}%</span>
          </div>
          <div className="h-2.5 bg-green-100 rounded-full">
            <div
              className="h-2.5 bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">{statusText}</p>
        </div>
      </div>

      {/* Catégories */}
      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map(cat => {
          const docs    = DOCUMENTS.filter(d => d.categorie === cat.id)
          const catDone = docs.filter(d => dossier[d.id]).length
          return (
            <div key={cat.id} className="bg-white rounded-xl border border-green-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-green-900">{cat.label}</h3>
                <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${badgeClass(catDone, docs.length)}`}>
                  {catDone}/{docs.length}{catDone === docs.length ? ' ✓' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {docs.map(doc => (
                  <label key={doc.id} className="flex items-start gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => toggle(doc.id)}
                      className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        dossier[doc.id]
                          ? 'bg-green-600 border-green-600'
                          : 'border-slate-300 group-hover:border-green-400'
                      }`}
                    >
                      {dossier[doc.id] && <span className="text-white text-xs leading-none">✓</span>}
                    </div>
                    <span
                      onClick={() => toggle(doc.id)}
                      className={`text-xs leading-relaxed ${dossier[doc.id] ? 'text-green-800 line-through decoration-green-400' : 'text-slate-600'}`}
                    >
                      {doc.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Brancher DossierTab dans `src/App.tsx`** — version finale complète :

```tsx
// src/App.tsx — version finale
import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { SimulationBar } from './components/SimulationBar'
import { SectionTabs } from './components/SectionTabs'
import { ProfilTab } from './components/tabs/ProfilTab'
import { SimulationTab } from './components/tabs/SimulationTab'
import { SecteursTab } from './components/tabs/SecteursTab'
import { DossierTab } from './components/tabs/DossierTab'

type Section = 'profil' | 'simulation' | 'secteurs' | 'dossier'

export default function App() {
  const [section, setSection] = useState<Section>('simulation')

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <AppHeader />
      <SimulationBar />
      <SectionTabs active={section} onChange={setSection} />
      <main className="flex-1 p-5">
        {section === 'profil'     && <ProfilTab />}
        {section === 'simulation' && <SimulationTab />}
        {section === 'secteurs'   && <SecteursTab />}
        {section === 'dossier'    && <DossierTab />}
      </main>
    </div>
  )
}
```

- [ ] **Vérifier dans le navigateur** — cocher des documents, badge "X/18" dans l'onglet se met à jour, barre de progression globale réactive.

- [ ] **Lancer les tests une dernière fois**

```bash
npm test
```

Attendu : tous les tests passent.

- [ ] **Commit final**

```bash
git add src/components/tabs/DossierTab.tsx src/App.tsx
git commit -m "feat: add DossierTab with checklist and progress tracking"
```

---

## Task 10 : Lancement et vérification finale

- [ ] **Lancer le serveur de dev**

```bash
npm run dev
```

Ouvrir http://localhost:5173.

- [ ] **Checklist de vérification**

  - [ ] Onglet Simulation s'affiche par défaut avec les données Charlotte & Valentine
  - [ ] Modifier un revenu dans Profil → KPIs de Simulation se recalculent
  - [ ] Sliders taux / durée / apport / travaux → recalcul immédiat
  - [ ] Toggle PTZ → slider montant apparaît / disparaît
  - [ ] Prix/m² éditables dans Comparatif → surfaces recalculées
  - [ ] Onglet Secteurs → tableau de 15 villes, filtres et tri fonctionnels
  - [ ] Surfaces dans Secteurs changent quand le budget change
  - [ ] Onglet Dossier → cases cochables, badge mis à jour dans l'onglet
  - [ ] Bouton "＋" crée une nouvelle simulation vide
  - [ ] Double-clic sur une simulation permet de la renommer
  - [ ] Chaque simulation a son propre état indépendant

- [ ] **Commit de fin**

```bash
git add -A
git commit -m "chore: verify all features working end-to-end"
```
