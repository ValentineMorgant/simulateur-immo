# Brut → Net Cadre Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter des champs brut optionnels dans le ProfilTab qui calculent automatiquement le net (coefficient 0.775 cadre).

**Architecture:** State local `brutFixe` / `brutVariable` dans `AcheteurCard`. Quand brut change → net = Math.round(brut × 0.775) → injecté dans le champ net via `onChange`. Quand net est modifié manuellement → brut se vide. Rien n'est persisté côté Supabase.

**Tech Stack:** React 18, TypeScript, Tailwind CSS

---

## Fichiers impactés

- Modifier : `src/components/tabs/ProfilTab.tsx`

---

## Task 1 : Ajouter les champs brut dans AcheteurCard

**Files:**
- Modify: `src/components/tabs/ProfilTab.tsx`

- [ ] **Lire le fichier actuel**

```bash
cat src/components/tabs/ProfilTab.tsx
```

- [ ] **Ajouter le state brut et la constante cadre dans `AcheteurCard`**

Dans la fonction `AcheteurCard`, juste avant le `return`, ajouter :

```tsx
const COEFF_CADRE = 0.775

const [brutFixe, setBrutFixe] = useState('')
const [brutVariable, setBrutVariable] = useState('')
```

Et ajouter `useState` dans les imports React en haut du fichier :
```tsx
import { useState } from 'react'
```

- [ ] **Ajouter les handlers brut → net**

Dans `AcheteurCard`, ajouter ces deux fonctions après les déclarations de state :

```tsx
function handleBrutFixe(brut: string) {
  setBrutFixe(brut)
  const n = Number(brut)
  if (n > 0) onChange({ ...data, revenuFixe: Math.round(n * COEFF_CADRE) })
}

function handleBrutVariable(brut: string) {
  setBrutVariable(brut)
  const n = Number(brut)
  if (n > 0) onChange({ ...data, revenuVariable: Math.round(n * COEFF_CADRE) })
}

function handleNetFixe(v: number) {
  setBrutFixe('')
  onChange({ ...data, revenuFixe: v })
}

function handleNetVariable(v: number) {
  setBrutVariable('')
  onChange({ ...data, revenuVariable: v })
}
```

- [ ] **Remplacer les deux `NumInput` de revenus par des blocs brut + net**

Localiser dans le JSX de `AcheteurCard` ces deux lignes :
```tsx
<NumInput label="Revenu fixe annuel net" value={data.revenuFixe} onChange={v => onChange({ ...data, revenuFixe: v })} />
<NumInput label="Revenu variable annuel" value={data.revenuVariable} onChange={v => onChange({ ...data, revenuVariable: v })} />
```

Les remplacer par :

```tsx
{/* Revenu fixe */}
<div className="mb-3">
  <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1">Brut fixe annuel →</label>
  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden focus-within:border-green-300 mb-1.5">
    <input
      type="number"
      value={brutFixe}
      placeholder="ex: 50 000"
      onChange={e => handleBrutFixe(e.target.value)}
      className="flex-1 px-3 py-1.5 text-sm text-slate-700 bg-transparent outline-none"
    />
    <span className="px-3 text-xs text-slate-400">€ brut</span>
  </div>
  <NumInput label="Net fixe annuel" value={data.revenuFixe} onChange={handleNetFixe} />
</div>

{/* Revenu variable */}
<div className="mb-3">
  <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1">Brut variable annuel →</label>
  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden focus-within:border-green-300 mb-1.5">
    <input
      type="number"
      value={brutVariable}
      placeholder="ex: 5 000"
      onChange={e => handleBrutVariable(e.target.value)}
      className="flex-1 px-3 py-1.5 text-sm text-slate-700 bg-transparent outline-none"
    />
    <span className="px-3 text-xs text-slate-400">€ brut</span>
  </div>
  <NumInput label="Net variable annuel" value={data.revenuVariable} onChange={handleNetVariable} />
</div>
```

- [ ] **Vérifier que le build TypeScript passe**

```bash
npm run build
```

Attendu : `✓ built in Xms` sans erreurs.

- [ ] **Vérifier les tests existants**

```bash
npm test
```

Attendu : tous les tests passent (aucun test ProfilTab existant, les tests calculs.ts ne sont pas affectés).

- [ ] **Tester dans le navigateur**

```bash
npm run dev
```

Ouvrir http://localhost:5174, aller sur l'onglet Profil et vérifier :
- Saisir `50000` dans "Brut fixe annuel" → le champ "Net fixe annuel" affiche `38 750`
- Modifier le net manuellement → le champ brut se vide
- Saisir un brut variable → net variable se met à jour → le récap en bas recalcule
- Les KPIs de l'onglet Simulation se mettent à jour en conséquence

- [ ] **Commit**

```bash
git add src/components/tabs/ProfilTab.tsx
git commit -m "feat: add brut to net conversion for cadres in ProfilTab"
```

- [ ] **Push**

```bash
git push
```
