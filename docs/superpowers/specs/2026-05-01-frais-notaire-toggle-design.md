# Toggle Ancien/Neuf pour frais de notaire — Spec de design

**Date :** 2026-05-01
**Scope :** types, calculs, SimulationTab

---

## Contexte

Les frais de notaire sont actuellement affichés à titre indicatif dans le comparatif sans affecter le calcul. L'objectif est de les intégrer dans le prix max du bien en les déduisant de l'apport, avec un toggle pour choisir le taux applicable (ancien ou neuf).

---

## Nouveau champ

```typescript
typeNotaire: 'ancien' | 'neuf'   // défaut : 'ancien'
```

---

## Formule corrigée de prixMaxBien

Les frais de notaire viennent de l'apport — résolution algébrique de la dépendance circulaire :

```
tauxNotaire = 0.075 si 'ancien', 0.025 si 'neuf'

prixMaxBien = (capitalMax + apport - budgetTravaux) / (1 + tauxNotaire)
fraisNotaire = Math.round(prixMaxBien × tauxNotaire)
```

Les champs `fraisNotaireAncien` et `fraisNotaireNeuf` dans `Resultats` sont conservés pour le comparatif (calculés depuis le nouveau `prixMaxBien`).

---

## UI — SimulationTab

### Toggle dans les paramètres du prêt

Positionné juste avant le slider Apport :

```
Type de bien
  [ ANCIEN ]  [ NEUF ]   ← pills sélectionnables
```

- ANCIEN sélectionné → fond vert, frais 7,5%
- NEUF sélectionné → fond vert, frais 2,5%

### KPI "Prix max du bien"

Sous-titre mis à jour pour indiquer les frais déduits :
```
Prix max du bien
497 000 €
frais notaire ~12 300 € inclus
```

### Comparatif

La colonne correspondant au `typeNotaire` sélectionné est visuellement mise en avant (bordure verte plus marquée). Les frais de notaire affichés restent cohérents avec `prixMaxBien`.

---

## Fichiers impactés

| Fichier | Action |
|---|---|
| `src/types.ts` | Ajouter `typeNotaire: 'ancien' \| 'neuf'` dans `Simulation` |
| `src/data/defaultSimulation.ts` | `typeNotaire: 'ancien'` dans DEFAULT_SIMULATION et newSimulation() |
| `src/context/SimulationContext.tsx` | Ajouter `typeNotaire: 'ancien'` dans migrate() |
| `src/utils/calculs.ts` | Nouvelle formule prixMaxBien avec tauxNotaire |
| `src/utils/calculs.test.ts` | Fixture BASE + nouveaux tests |
| `src/components/tabs/SimulationTab.tsx` | Toggle UI + sous-titre KPI + mise en avant colonne |

---

## Ce qui ne change pas

- La formule de capitalMax (assurance, PTZ inchangés)
- Les onglets Profil, Secteurs, Dossier
- La sync Supabase
