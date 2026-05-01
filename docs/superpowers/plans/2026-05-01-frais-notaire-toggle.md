# Toggle Ancien/Neuf Frais de Notaire — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un toggle ANCIEN/NEUF qui intègre les frais de notaire dans le calcul du prix max du bien en les déduisant algébriquement de l'apport.

**Architecture:** Nouveau champ `typeNotaire` dans Simulation. Formule prixMaxBien corrigée : `(capitalMax + apport - budgetTravaux) / (1 + tauxNotaire)`. Toggle UI dans SimulationTab, sous-titre KPI mis à jour, colonne comparatif mise en avant selon sélection.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest

---

## Task 1 : Types, defaults et migrate

**Files:**
- Modify: `src/types.ts`
- Modify: `src/data/defaultSimulation.ts`
- Modify: `src/context/SimulationContext.tsx`

- [ ] **Ajouter `typeNotaire` dans `src/types.ts`**

Localiser dans `Simulation` le champ `tauxAssurance: number` et ajouter après :

```typescript
  tauxAssurance: number
  typeNotaire: 'ancien' | 'neuf'
  ptzActif: boolean
```

- [ ] **Ajouter la valeur par défaut dans `src/data/defaultSimulation.ts`**

Dans DEFAULT_SIMULATION, après `tauxAssurance: 0.25` :
```typescript
  tauxAssurance: 0.25,
  typeNotaire: 'ancien' as const,
  ptzActif: false,
```

Dans newSimulation(), après `tauxAssurance: 0.25` :
```typescript
  tauxAssurance: 0.25,
  typeNotaire: 'ancien' as const,
  ptzActif: false,
```

- [ ] **Ajouter `typeNotaire` dans migrate() de `src/context/SimulationContext.tsx`**

Localiser :
```typescript
function migrate(s: Simulation): Simulation {
  return { ...s, tauxCible: s.tauxCible ?? 35, nbOccupants: s.nbOccupants ?? 2, tauxAssurance: s.tauxAssurance ?? 0.25 }
}
```

Remplacer par :
```typescript
function migrate(s: Simulation): Simulation {
  return { ...s, tauxCible: s.tauxCible ?? 35, nbOccupants: s.nbOccupants ?? 2, tauxAssurance: s.tauxAssurance ?? 0.25, typeNotaire: s.typeNotaire ?? 'ancien' }
}
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -5
```

Attendu : erreur TS dans calculs.ts (typeNotaire non utilisé encore) — normal, Task 2 corrige.

- [ ] **Commit**

```bash
git add src/types.ts src/data/defaultSimulation.ts src/context/SimulationContext.tsx
git commit -m "feat: add typeNotaire field to Simulation type and defaults"
```

---

## Task 2 : Calculs (TDD)

**Files:**
- Modify: `src/utils/calculs.ts`
- Modify: `src/utils/calculs.test.ts`

- [ ] **Ajouter les tests dans `src/utils/calculs.test.ts`**

Ajouter `typeNotaire: 'ancien'` dans la fixture BASE :

```typescript
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
  typeNotaire: 'ancien',
  ptzActif: false,
  ptzMontant: 0,
  nbOccupants: 2,
  prixM2Ancien: 3500,
  prixM2Neuf: 4500,
  dossier: {},
}
```

Ajouter ces deux tests à la fin du describe :

```typescript
  it('frais notaire ancien (7.5%) réduisent le prix max du bien', () => {
    const r = calculer({ ...BASE, typeNotaire: 'ancien' })
    const budgetBrut = r.capitalMax + 30000 // capitalMax + apport
    expect(r.prixMaxBien).toBeCloseTo(budgetBrut / 1.075, 0)
    expect(r.fraisNotaireAncien).toBeCloseTo(r.prixMaxBien * 0.075, -2)
  })

  it('frais notaire neuf (2.5%) donnent un prix max plus élevé que ancien', () => {
    const ancien = calculer({ ...BASE, typeNotaire: 'ancien' })
    const neuf = calculer({ ...BASE, typeNotaire: 'neuf' })
    expect(neuf.prixMaxBien).toBeGreaterThan(ancien.prixMaxBien)
    expect(neuf.fraisNotaireNeuf).toBeCloseTo(neuf.prixMaxBien * 0.025, -2)
  })
```

- [ ] **Lancer les tests — vérifier qu'ils échouent**

```bash
npm test 2>&1 | grep -E "FAIL|pass|fail" | tail -5
```

Attendu : tests qui échouent (typeNotaire non utilisé dans calculs.ts)

- [ ] **Mettre à jour `src/utils/calculs.ts`**

Remplacer la ligne de calcul de prixMaxBien :

```typescript
  // Avant :
  const prixMaxBien = capitalMax + sim.apport - sim.budgetTravaux

  // Après — frais de notaire déduits algébriquement de l'apport :
  const tauxNotaire = sim.typeNotaire === 'neuf' ? 0.025 : 0.075
  const prixMaxBien = (capitalMax + sim.apport - sim.budgetTravaux) / (1 + tauxNotaire)
```

- [ ] **Lancer les tests — tous doivent passer**

```bash
npm test 2>&1 | tail -6
```

Attendu : `17 passed`

- [ ] **Commit**

```bash
git add src/utils/calculs.ts src/utils/calculs.test.ts
git commit -m "feat: integrate typeNotaire in prixMaxBien formula"
```

---

## Task 3 : UI SimulationTab

**Files:**
- Modify: `src/components/tabs/SimulationTab.tsx`

- [ ] **Ajouter le toggle ANCIEN/NEUF avant le slider Apport**

Localiser dans SimulationTab.tsx :
```tsx
          <Slider label="Apport" value={active.apport} min={0} max={200000} step={1000}
```

Ajouter juste avant :
```tsx
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-500">Type de bien</span>
              <span className="text-green-600 font-semibold text-xs">
                {active.typeNotaire === 'ancien' ? 'Frais notaire 7,5%' : 'Frais notaire 2,5%'}
              </span>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-green-200">
              {(['ancien', 'neuf'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => set('typeNotaire', t)}
                  className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                    active.typeNotaire === t
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-slate-500 hover:bg-green-50'
                  }`}
                >
                  {t === 'ancien' ? 'Ancien (7,5%)' : 'Neuf (2,5%)'}
                </button>
              ))}
            </div>
          </div>
```

- [ ] **Mettre à jour le sous-titre du KPI "Prix max du bien"**

Localiser :
```tsx
        <Kpi label="Prix max du bien" value={euros(r.prixMaxBien)} sub={`apport inclus${active.budgetTravaux > 0 ? ', travaux déduits' : ''}`} />
```

Remplacer par :
```tsx
        <Kpi label="Prix max du bien" value={euros(r.prixMaxBien)} sub={`frais notaire ${active.typeNotaire === 'ancien' ? '7,5%' : '2,5%'} inclus`} />
```

- [ ] **Mettre en avant la colonne active dans le comparatif**

Localiser dans le `.map(col => (` du comparatif :
```tsx
              <div key={col.label} className="bg-green-50 rounded-lg p-3 text-center">
```

Remplacer par :
```tsx
              <div key={col.label} className={`rounded-lg p-3 text-center transition-colors ${
                (col.label === 'ANCIEN' && active.typeNotaire === 'ancien') ||
                (col.label === 'NEUF'   && active.typeNotaire === 'neuf')
                  ? 'bg-green-100 border-2 border-green-400'
                  : 'bg-green-50 border-2 border-transparent'
              }`}>
```

- [ ] **Vérifier le build et les tests**

```bash
npm run build 2>&1 | tail -4 && npm test 2>&1 | tail -4
```

Attendu : build ✓, 17 tests passent.

- [ ] **Vérifier dans le navigateur** — http://localhost:5174

  - Toggle ANCIEN/NEUF visible dans les paramètres
  - Basculer sur NEUF → KPI "Prix max du bien" augmente, sous-titre change
  - La colonne correspondante du comparatif est mise en avant (bordure verte)
  - Les frais de notaire affichés sont cohérents avec le prixMaxBien

- [ ] **Commit et push**

```bash
git add src/components/tabs/SimulationTab.tsx docs/superpowers/plans/2026-05-01-frais-notaire-toggle.md
git commit -m "feat: add ancien/neuf toggle for notary fees integrated in prixMaxBien"
git push
```
