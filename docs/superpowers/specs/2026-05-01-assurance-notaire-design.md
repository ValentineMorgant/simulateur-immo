# Assurance emprunteur + Frais de notaire — Spec de design

**Date :** 2026-05-01
**Scope :** calculs.ts, SimulationTab, types, defaultSimulation

---

## 1. Assurance emprunteur

### Contexte

Le champ `taux` actuel est le taux d'intérêt pur. La règle HCSF 35% inclut l'assurance dans la mensualité totale — sans la prendre en compte, on surestime la capacité d'emprunt.

### Nouveau champ

```typescript
tauxAssurance: number  // % annuel, ex: 0.25
```

Valeur par défaut : `0.25` (tarif cadre standard, bon profil de santé).

### Formule corrigée dans `calculs.ts`

L'assurance est calculée sur le capital emprunté, à taux fixe mensuel :

```
k = tauxAssurance / 100 / 12          // taux mensuel assurance
capitalPret = mensualiteMax × facteur / (1 + k × facteur)
mensualiteAssurance = capitalPret × k
mensualiteCredit = mensualiteMax - mensualiteAssurance
```

La mensualité max reste `revenusMensuels × tauxCible / 100` — elle couvre désormais crédit + assurance.

### Nouveau champ dans Resultats

```typescript
mensualiteAssurance: number   // part assurance dans la mensualité
```

### UI — SimulationTab

Slider dans la carte "Paramètres du prêt", après le taux d'intérêt :

- Label : "Assurance emprunteur"
- Plage : 0,10% – 0,50%, pas 0,05%
- Format affiché : `0,25 %/an`

Dans les KPIs, le détail de la mensualité affiche :
```
Mensualité totale : X €/mois
  dont crédit     : Y €
  dont assurance  : Z €
```

---

## 2. Frais de notaire

### Taux fixes

| Type | Taux |
|------|------|
| Ancien | 7,5% du prix du bien |
| Neuf   | 2,5% du prix du bien |

Non configurables — valeurs indicatives standard.

### Calcul

```
fraisNotaireAncien = prixMaxBien × 0.075
fraisNotaireNeuf   = prixMaxBien × 0.025
```

### Nouveau champ dans Resultats

```typescript
fraisNotaireAncien: number
fraisNotaireNeuf: number
```

### UI — SimulationTab, carte Comparatif

Dans chaque colonne (Ancien / Neuf), sous le prix/m² :

```
Frais de notaire estimés
7,5% → 37 000 €          (pour Ancien)
2,5% →  12 000 €         (pour Neuf)
```

Affiché en texte secondaire, non interactif.

---

## 3. Fichiers impactés

| Fichier | Action |
|---|---|
| `src/types.ts` | Ajouter `tauxAssurance` dans `Simulation`, `mensualiteAssurance` + `fraisNotaireAncien` + `fraisNotaireNeuf` dans `Resultats` |
| `src/data/defaultSimulation.ts` | `tauxAssurance: 0.25` dans DEFAULT_SIMULATION et newSimulation() |
| `src/utils/calculs.ts` | Formule capitalPret corrigée, calcul frais notaire |
| `src/utils/calculs.test.ts` | Mise à jour BASE fixture + nouveaux tests assurance |
| `src/components/tabs/SimulationTab.tsx` | Slider assurance, détail mensualité, frais notaire dans comparatif |

---

## 4. Ce qui ne change pas

- `prixMaxBien` = capitalMax + apport − budgetTravaux (inchangé — les frais de notaire sont juste affichés)
- Onglets Profil, Secteurs, Dossier
- Sync Supabase
- Type `AcheteurData`
