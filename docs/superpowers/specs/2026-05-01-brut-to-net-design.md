# Conversion Brut → Net Cadre — Spec de design

**Date :** 2026-05-01
**Scope :** ProfilTab uniquement

---

## Contexte

Les champs de revenus (`revenuFixe`, `revenuVariable`) sont actuellement saisis en net annuel. L'utilisatrice doit faire le calcul brut → net elle-même. L'objectif est d'ajouter un champ brut optionnel qui calcule le net automatiquement.

## Coefficient cadre

```
NET = BRUT × 0.775
```

Approximation standard pour un cadre en France (2025), charges salariales ~22.5% (Sécu, retraite complémentaire AGIRC-ARRCO, CSG/CRDS, prévoyance). Coefficient fixe, non configurable.

## Comportement

- Chaque `AcheteurCard` dans `ProfilTab` affiche un champ "Brut" au-dessus de chaque champ net
- L'utilisatrice saisit un brut → le net est calculé (`Math.round(brut × 0.775)`) et injecté dans le champ net
- Le champ net reste éditable manuellement — si l'utilisatrice le modifie directement, le champ brut se vide
- Le brut est du **state local** dans `AcheteurCard` : il n'est pas persisté dans Supabase
- Ce qui est sauvegardé ne change pas : uniquement le net (`revenuFixe`, `revenuVariable`)

## UI — par champ de revenu

```
Revenu fixe annuel
  [ Brut : _________ € ]   →  net estimé : X €
  [ Net  : _________ € ]   ← auto-rempli, reste éditable

Revenu variable annuel
  [ Brut : _________ € ]   →  net estimé : X €
  [ Net  : _________ € ]   ← auto-rempli, reste éditable
```

Le champ brut est visuellement plus léger (fond gris clair, label "Brut →") pour indiquer qu'il est auxiliaire.

## Fichiers impactés

| Fichier | Action |
|---|---|
| `src/components/tabs/ProfilTab.tsx` | Modifier — ajouter champs brut dans `AcheteurCard` |

Aucun autre fichier n'est modifié (types, calculs, context, Supabase inchangés).

## Ce qui ne change pas

- Type `Simulation` (pas de nouveaux champs)
- Logique de calcul financier
- Persistance Supabase
- Les autres onglets
