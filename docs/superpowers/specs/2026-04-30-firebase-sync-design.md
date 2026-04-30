# Design — Synchronisation Firebase Firestore

**Date :** 2026-04-30
**Statut :** Approuvé

## Contexte

Le simulateur immobilier stocke actuellement les simulations dans le `localStorage` du navigateur. Les données ne sont donc accessibles que sur l'ordinateur où elles ont été saisies. L'objectif est de les rendre accessibles depuis n'importe quel appareil, sans login, via Firebase Firestore.

## Périmètre

- Usage personnel (Charlotte & Valentine uniquement)
- Pas d'authentification
- Espace partagé : toutes les simulations sont dans un seul document Firestore
- Sync temps réel entre les appareils
- Migration automatique du localStorage existant vers Firestore au premier lancement

## Architecture

### Structure des données Firestore

```
Collection : "data"
  Document  : "shared"
    simulations : Simulation[]   ← tableau de toutes les simulations
    activeId    : string         ← ID de la simulation active
```

Un seul document partagé, sans segmentation par utilisateur.

### Fichiers impactés

| Fichier | Action | Description |
|---|---|---|
| `src/lib/firebase.ts` | Créer | Initialisation Firebase (config + export `db`) |
| `src/context/SimulationContext.tsx` | Modifier | Remplacer localStorage par Firestore + écoute temps réel |
| `src/main.tsx` | Vérifier | S'assurer que Firebase est initialisé avant le rendu |

### Aucun changement pour

- Tous les composants (`tabs/`, `SimulationBar`, etc.)
- La logique de calcul (`utils/`)
- Les types (`types.ts`)
- Le routing, le build, les tests existants

## Flux de données

### Démarrage

1. `SimulationContext` s'initialise avec `loading: true`
2. Appel `onSnapshot("data/shared")` — écoute temps réel
3. Si le document existe → charger `simulations` et `activeId`
4. Si le document n'existe pas → détecter localStorage → migrer → vider localStorage
5. `loading: false`, rendu de l'app

### Modification

1. L'utilisateur modifie une simulation
2. `updateActive()` met à jour le state React (comme avant)
3. Un `useEffect` écrit le nouveau state dans Firestore (`setDoc`)
4. L'autre appareil reçoit la mise à jour via `onSnapshot` → state React mis à jour automatiquement

### Hors ligne

Firebase SDK gère nativement le mode hors ligne avec un cache local. L'app continue de fonctionner et re-synchronise au retour de la connexion.

## État de chargement

Pendant la connexion initiale à Firestore, afficher un spinner centré à la place du contenu principal. Durée typique : < 1 seconde sur une bonne connexion.

## Sécurité

Règles Firestore restreintes au seul document `data/shared` :

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /data/shared {
      allow read, write: if true;
    }
  }
}
```

Acceptable pour un usage personnel sur des machines privées. Si l'app est un jour déployée publiquement, ajouter une authentification.

## Migration localStorage

Au premier lancement avec Firestore vide :
1. Lire `simulateur-immo:simulations` et `simulateur-immo:activeId` dans localStorage
2. Si données présentes → écrire dans `data/shared`
3. Supprimer les clés localStorage

## Dépendances à ajouter

```bash
npm install firebase
```

## Ce qui ne change pas

- Toute la logique de calcul
- L'interface utilisateur
- Les tests existants
- Le build Vite / TypeScript
