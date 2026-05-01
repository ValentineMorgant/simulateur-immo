# Assurance emprunteur + Frais de notaire — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Intégrer l'assurance emprunteur dans le calcul de capacité d'emprunt et afficher les frais de notaire à titre indicatif dans le comparatif ancien/neuf.

**Architecture:** 3 tâches séquentielles : (1) types + defaults, (2) formule de calcul en TDD, (3) UI SimulationTab. Chaque tâche peut être commitée indépendamment.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest

---

## Fichiers impactés

| Fichier | Action |
|---|---|
| `src/types.ts` | Ajouter `tauxAssurance` dans `Simulation` ; `mensualiteAssurance`, `fraisNotaireAncien`, `fraisNotaireNeuf` dans `Resultats` |
| `src/data/defaultSimulation.ts` | Ajouter `tauxAssurance: 0.25` dans DEFAULT_SIMULATION et newSimulation() |
| `src/utils/calculs.ts` | Formule capitalPret corrigée + frais notaire |
| `src/utils/calculs.test.ts` | Fixture BASE mise à jour + nouveaux tests assurance |
| `src/components/tabs/SimulationTab.tsx` | Slider assurance, détail mensualité, frais notaire dans comparatif |

---

## Task 1 : Types et valeurs par défaut

**Files:**
- Modify: `src/types.ts`
- Modify: `src/data/defaultSimulation.ts`

- [ ] **Mettre à jour `src/types.ts`**

Remplacer le contenu complet du fichier :

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
  tauxCible: number
  tauxAssurance: number
  ptzActif: boolean
  ptzMontant: number
  nbOccupants: number
  prixM2Ancien: number
  prixM2Neuf: number
  dossier: Record<string, boolean>
}

export type Resultats = {
  revenusMensuels: number
  revenusAnnuels: number
  mensualiteMax: number
  mensualiteAssurance: number
  capitalMax: number
  prixMaxBien: number
  tauxEndettement: number
  coutTotal: number
  interetsTotaux: number
  surfaceAncien: number
  surfaceNeuf: number
  fraisNotaireAncien: number
  fraisNotaireNeuf: number
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

- [ ] **Mettre à jour `src/data/defaultSimulation.ts`**

Remplacer le contenu complet du fichier :

```typescript
// src/data/defaultSimulation.ts
import type { Simulation } from '../types'

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
  tauxCible: 35,
  tauxAssurance: 0.25,
  ptzActif: false,
  ptzMontant: 0,
  nbOccupants: 2,
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
    tauxCible: 35,
    tauxAssurance: 0.25,
    ptzActif: false,
    ptzMontant: 0,
    nbOccupants: 2,
    prixM2Ancien: 3500,
    prixM2Neuf: 4500,
    dossier: {},
  }
}
```

- [ ] **Vérifier que le build TypeScript passe**

```bash
npm run build 2>&1 | tail -5
```

Attendu : des erreurs TypeScript dans `calculs.ts` (nouveaux champs manquants dans le return) — normal, Task 2 les corrige.

- [ ] **Commit**

```bash
git add src/types.ts src/data/defaultSimulation.ts
git commit -m "feat: add tauxAssurance to Simulation type and defaults"
```

---

## Task 2 : Calculs (TDD)

**Files:**
- Modify: `src/utils/calculs.test.ts`
- Modify: `src/utils/calculs.ts`

- [ ] **Mettre à jour `src/utils/calculs.test.ts`**

Remplacer le contenu complet du fichier :

```typescript
// src/utils/calculs.test.ts
import { describe, it, expect } from 'vitest'
import { calculer } from './calculs'
import type { Simulation } from '../types'

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
  tauxCible: 35,
  tauxAssurance: 0.25,
  ptzActif: false,
  ptzMontant: 0,
  nbOccupants: 2,
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

  it('retourne un taux d\'endettement de 35%', () => {
    const r = calculer(BASE)
    expect(r.tauxEndettement).toBeCloseTo(35, 1)
  })

  it('calcule le capital max avec assurance 0.25%', () => {
    const r = calculer(BASE)
    // Avec assurance, le capital est inférieur au cas sans assurance (~496k)
    expect(r.capitalMax).toBeGreaterThan(470000)
    expect(r.capitalMax).toBeLessThan(490000)
  })

  it('sans assurance (0%), capital max = mensualiteMax × facteur', () => {
    const r = calculer({ ...BASE, tauxAssurance: 0 })
    const revenusMensuels = 85550 / 12
    const mensualiteMax = revenusMensuels * 0.35
    const rTaux = 0.035 / 12
    const n = 25 * 12
    const facteur = (1 - Math.pow(1 + rTaux, -n)) / rTaux
    expect(r.capitalMax).toBeCloseTo(mensualiteMax * facteur, 0)
  })

  it('avec assurance, la mensualiteAssurance est positive', () => {
    const r = calculer(BASE)
    expect(r.mensualiteAssurance).toBeGreaterThan(0)
    // mensualiteCredit + mensualiteAssurance = mensualiteMax
    const mensualiteCredit = r.mensualiteMax - r.mensualiteAssurance
    expect(mensualiteCredit).toBeGreaterThan(0)
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

  it('calcule les frais de notaire', () => {
    const r = calculer(BASE)
    expect(r.fraisNotaireAncien).toBeCloseTo(r.prixMaxBien * 0.075, -2)
    expect(r.fraisNotaireNeuf).toBeCloseTo(r.prixMaxBien * 0.025, -2)
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
    const r = calculer({ ...BASE, tauxAssurance: 0, taux: 0 })
    const n = 25 * 12
    const mensualite = (85550 / 12) * 0.35
    expect(r.capitalMax).toBeCloseTo(mensualite * n, 0)
  })
})
```

- [ ] **Lancer les tests — vérifier qu'ils échouent**

```bash
npm test 2>&1 | tail -6
```

Attendu : `FAIL src/utils/calculs.test.ts` (propriétés manquantes dans Resultats)

- [ ] **Mettre à jour `src/utils/calculs.ts`**

Remplacer le contenu complet du fichier :

```typescript
// src/utils/calculs.ts
import type { Simulation, Resultats } from '../types'

export function calculer(sim: Simulation): Resultats {
  const revenuRetenu1 = sim.acheteur1.revenuFixe + sim.acheteur1.revenuVariable * 0.7
  const revenuRetenu2 = sim.acheteur2.revenuFixe + sim.acheteur2.revenuVariable * 0.7
  const revenusAnnuels = revenuRetenu1 + revenuRetenu2
  const revenusMensuels = revenusAnnuels / 12
  const mensualiteMax = revenusMensuels * (sim.tauxCible / 100)

  const r = sim.taux / 100 / 12
  const n = sim.duree * 12
  const facteur = r > 0 ? (1 - Math.pow(1 + r, -n)) / r : n

  // Assurance intégrée dans mensualiteMax (HCSF : 35% inclut assurance)
  // mensualiteMax = mensualiteCredit + capitalPret × k
  // capitalPret = mensualiteMax × facteur / (1 + k × facteur)
  const k = sim.tauxAssurance / 100 / 12
  const capitalPret = facteur > 0
    ? mensualiteMax * facteur / (1 + k * facteur)
    : 0
  const mensualiteAssurance = capitalPret * k

  const capitalMax = capitalPret + (sim.ptzActif ? sim.ptzMontant : 0)
  const prixMaxBien = capitalMax + sim.apport - sim.budgetTravaux

  const tauxEndettement = revenusMensuels > 0
    ? (mensualiteMax / revenusMensuels) * 100
    : 0

  const coutTotal = mensualiteMax * n
  const interetsTotaux = coutTotal - capitalPret

  const surfaceAncien = sim.prixM2Ancien > 0 ? prixMaxBien / sim.prixM2Ancien : 0
  const surfaceNeuf   = sim.prixM2Neuf   > 0 ? prixMaxBien / sim.prixM2Neuf   : 0

  const fraisNotaireAncien = Math.round(prixMaxBien * 0.075)
  const fraisNotaireNeuf   = Math.round(prixMaxBien * 0.025)

  return {
    revenusMensuels,
    revenusAnnuels,
    mensualiteMax,
    mensualiteAssurance,
    capitalMax,
    prixMaxBien,
    tauxEndettement,
    coutTotal,
    interetsTotaux,
    surfaceAncien,
    surfaceNeuf,
    fraisNotaireAncien,
    fraisNotaireNeuf,
  }
}
```

- [ ] **Lancer les tests — tous doivent passer**

```bash
npm test 2>&1 | tail -6
```

Attendu : `12 passed` (les tests existants + les nouveaux)

- [ ] **Commit**

```bash
git add src/utils/calculs.ts src/utils/calculs.test.ts
git commit -m "feat: integrate assurance emprunteur in calcul and add frais notaire"
```

---

## Task 3 : UI SimulationTab

**Files:**
- Modify: `src/components/tabs/SimulationTab.tsx`

- [ ] **Ajouter le slider assurance après le slider "Taux d'intérêt"**

Localiser dans `SimulationTab.tsx` :
```tsx
          <Slider label="Taux d'intérêt" value={active.taux} min={0.5} max={6} step={0.05}
            onChange={v => set('taux', v)} fmt={v => v.toFixed(2) + ' %'} />
```

Ajouter juste après :
```tsx
          <Slider label="Assurance emprunteur" value={active.tauxAssurance} min={0.10} max={0.50} step={0.05}
            onChange={v => set('tauxAssurance', v)} fmt={v => v.toFixed(2) + ' %/an'} />
```

- [ ] **Mettre à jour le KPI Mensualité pour afficher le détail assurance**

Localiser :
```tsx
        <Kpi label="Mensualité" value={euros(r.mensualiteMax) + '/mois'} />
```

Remplacer par :
```tsx
        <Kpi label="Mensualité" value={euros(r.mensualiteMax) + '/mois'} sub={`dont assurance ${euros(r.mensualiteAssurance)}`} />
```

- [ ] **Ajouter les frais de notaire dans le comparatif**

Localiser le tableau des colonnes ancien/neuf :
```tsx
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
```

Remplacer par :
```tsx
            {[
              { label: 'ANCIEN', prixM2: active.prixM2Ancien, surface: r.surfaceAncien, key: 'prixM2Ancien' as const, fraisNotaire: r.fraisNotaireAncien, tauxNotaire: '7,5%' },
              { label: 'NEUF',   prixM2: active.prixM2Neuf,   surface: r.surfaceNeuf,   key: 'prixM2Neuf' as const,   fraisNotaire: r.fraisNotaireNeuf,   tauxNotaire: '2,5%' },
            ].map(col => (
              <div key={col.label} className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs font-semibold text-slate-500 mb-2">{col.label}</p>
                <PrixM2Input label="Prix/m²" value={col.prixM2} onChange={v => set(col.key, v)} />
                <p className="text-xs text-slate-500 mt-2">Surface accessible</p>
                <p className="text-2xl font-extrabold text-green-600">{Math.floor(col.surface)} m²</p>
                <div className="border-t border-green-200 mt-2 pt-2">
                  <p className="text-xs text-slate-400">Frais de notaire ({col.tauxNotaire})</p>
                  <p className="text-sm font-semibold text-slate-500">≈ {euros(col.fraisNotaire)}</p>
                </div>
              </div>
            ))}
```

- [ ] **Vérifier le build et les tests**

```bash
npm run build 2>&1 | tail -5 && npm test 2>&1 | tail -5
```

Attendu : build ✓, tous les tests passent.

- [ ] **Vérifier dans le navigateur** — http://localhost:5174

  - Slider "Assurance emprunteur" visible dans les paramètres du prêt
  - KPI Mensualité affiche "dont assurance X €" en sous-titre
  - Comparatif Ancien/Neuf affiche les frais de notaire sous la surface
  - Bouger le slider assurance réduit la capacité d'emprunt

- [ ] **Commit et push**

```bash
git add src/components/tabs/SimulationTab.tsx
git commit -m "feat: add assurance slider, mensualite detail and frais notaire in UI"
git push
```
