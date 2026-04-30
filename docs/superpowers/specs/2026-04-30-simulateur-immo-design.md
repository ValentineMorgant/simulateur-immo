# Simulateur Immobilier Île-de-France — Spec de design

**Date :** 2026-04-30  
**Destinataires :** Charlotte Bocahut & Valentine  
**Contexte :** Application React + Vite présentée à une banquière. Simule la capacité d'emprunt d'un couple pour un achat immobilier en Île-de-France.

---

## 1. Stack technique

- **React 18 + Vite** (TypeScript)
- **Tailwind CSS** pour le style
- Pas de routeur (SPA mono-page)
- Pas de backend ni de persistance — tout en mémoire (état React)
- Pas de librairie de state management externe — `useState` / `useReducer` + Context

---

## 2. Thème visuel

**Vert Confiance** :
- Fond global : `#f0fdf4` (vert très clair)
- Header : `#14532d` (vert forêt foncé), texte blanc
- Accent principal : `#16a34a` (vert moyen)
- Cartes : fond blanc, bordure `#bbf7d0`
- Texte principal : `#0f172a`, secondaire : `#64748b`
- Badges : vert `#dcfce7/#16a34a`, orange `#fef3c7/#92400e`, rouge `#fee2e2/#991b1b`

---

## 3. Structure de navigation — Double barre

```
┌──────────────────────────────────────────────────────┐
│  Header : "Simulateur Immobilier · Île-de-France"     │
├──────────────────────────────────────────────────────┤
│  Barre simulations (pills) :                          │
│  [Charlotte & Valentine ●]  [Simulation solo]  [＋]   │
├──────────────────────────────────────────────────────┤
│  Barre sections (tabs) :                              │
│  Profil  | Simulation ←  | Secteurs  | Dossier 7/18  │
└──────────────────────────────────────────────────────┘
│  Contenu de l'onglet actif                           │
```

- Barre simulations : pills cliquables + bouton "＋ Nouvelle simulation"
- Une nouvelle simulation s'initialise avec des valeurs vides / zéro (pas de copie de l'existante)
- Chaque simulation peut être renommée (clic sur le nom)
- Barre sections : 4 onglets, le badge sur "Dossier" affiche X/18
- La simulation active s'applique à tous les onglets

---

## 4. Modèle de données

```typescript
type Simulation = {
  id: string
  nom: string

  // Onglet Profil
  acheteur1: { nom: string; revenuFixe: number; revenuVariable: number }
  acheteur2: { nom: string; revenuFixe: number; revenuVariable: number }
  loyerActuel: number      // €/mois
  aideCaf: number          // €/mois
  apport: number           // €

  // Onglet Simulation (sliders)
  taux: number             // % (ex: 3.5)
  duree: number            // années (5–30)
  budgetTravaux: number    // € (0–100 000)
  ptzActif: boolean
  ptzMontant: number       // €

  // Onglet Simulation (comparatif)
  prixM2Ancien: number     // €/m²
  prixM2Neuf: number       // €/m²

  // Onglet Dossier
  dossier: Record<string, boolean>  // documentId → coché
}
```

**Valeurs par défaut de la première simulation "Charlotte & Valentine" :**
```typescript
{
  nom: "Charlotte & Valentine",
  acheteur1: { nom: "Charlotte", revenuFixe: 39000, revenuVariable: 2000 },
  acheteur2: { nom: "Valentine", revenuFixe: 45150, revenuVariable: 0 },
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
  dossier: {}
}
```

---

## 5. Logique de calcul

### Revenus retenus
```
revenuRetenu1 = revenuFixe1 + revenuVariable1 × 0.7
revenuRetenu2 = revenuFixe2 + revenuVariable2 × 0.7
revenusAnnuels = revenuRetenu1 + revenuRetenu2
revenusMensuels = revenusAnnuels / 12
```

### Mensualité maximale (taux d'endettement 35%)
```
mensualiteMax = revenusMensuels × 0.35
```

### Facteur d'emprunt (formule annuité constante)
```
r = taux / 100 / 12          // taux mensuel
n = duree × 12               // nombre de mensualités
facteur = (1 - (1+r)^(-n)) / r
```

### Capacité d'emprunt
```
capitalMax = mensualiteMax × facteur
capitalMax += ptzMontant (si ptzActif)
```

### Prix max du bien
```
prixMaxBien = capitalMax + apport - budgetTravaux
```

### Taux d'endettement affiché
```
tauxEndettement = mensualiteMax / revenusMensuels × 100  // = 35% par construction
```
Le taux affiché est toujours 35% (limite bancaire) puisque la capacité est calculée à ce plafond. La barre de progression sert à visualiser : "vous êtes à la limite autorisée".

### Surface accessible
```
surfaceAncien = prixMaxBien / prixM2Ancien
surfaceNeuf   = prixMaxBien / prixM2Neuf
```

### Coût total du crédit
```
coutTotal = mensualiteMax × n
interetsTotaux = coutTotal - capitalMax
```

---

## 6. Onglet Profil

**Layout :** grille 2 colonnes

- **Carte Acheteur 1** : prénom, revenu fixe annuel net, revenu variable annuel → affiche "Revenu retenu : X € / an (variable à 70%)"
- **Carte Acheteur 2** : idem
- **Carte Situation actuelle** : loyer mensuel actuel, aide CAF mensuelle
- **Carte Apport & Synthèse** : apport disponible + bloc récap calculé (revenus nets totaux/an, revenus nets/mois, mensualité max à 35%)

Tous les champs sont des `<input type="number">` éditables.

---

## 7. Onglet Simulation

**Layout :** KPIs en haut (pleine largeur), puis 2 colonnes

### Bloc KPIs (4 métriques)
| Métrique | Valeur |
|---|---|
| Capacité d'emprunt | capitalMax |
| Mensualité | mensualiteMax |
| Taux d'endettement | % avec barre de progression |
| Prix max du bien | prixMaxBien |

**Barre de progression** sous les KPIs : taux d'endettement vs limite 35%, marqueur rouge à 35%.

### Colonne gauche — Paramètres du prêt (sliders)
- Taux d'intérêt : 0,5% – 6%, pas 0,05%
- Durée : 5 – 30 ans, pas 1 an
- Apport : 0 – 200 000 €, pas 1 000 €
- Budget travaux : 0 – 100 000 €, pas 1 000 € *(nouveau)*
- PTZ : toggle on/off → si activé, affiche slider montant PTZ (0 – 100 000 €)

### Colonne droite — Comparatif Ancien / Neuf
- Deux cartes côte à côte
- Prix/m² éditable dans chaque carte
- Surface accessible calculée (= prixMaxBien / prixM2)
- En bas : coût total du crédit (capital, intérêts, total)

---

## 8. Onglet Secteurs

**Layout :** filtres + tableau

### Filtres
- Boutons pills : Toutes les lignes / RER A / RER B / RER C / RER D / RER E
- Tri par colonne cliquable

### Colonnes du tableau
| Ville | Département | Ligne(s) | Trajet Paris | Prix ancien /m² | Prix neuf /m² | Surface accessible |

La surface accessible est recalculée dynamiquement depuis `prixMaxBien` de la simulation active.

### Villes (~15)
| Ville | Dép. | Ligne | Trajet | Ancien | Neuf |
|---|---|---|---|---|---|
| Massy-Palaiseau | 91 | B | 30 min | 2 800 € | 3 800 € |
| Palaiseau | 91 | B | 35 min | 2 900 € | 3 900 € |
| Gif-sur-Yvette | 91 | B | 40 min | 3 000 € | 4 000 € |
| Saint-Rémy-lès-Chevreuse | 78 | B | 45 min | 3 100 € | 4 100 € |
| Évry-Courcouronnes | 91 | D | 35 min | 2 600 € | 3 500 € |
| Corbeil-Essonnes | 91 | D | 40 min | 2 200 € | 3 200 € |
| Juvisy-sur-Orge | 91 | C/D | 25 min | 3 200 € | 4 200 € |
| Yerres | 91 | D | 30 min | 3 000 € | 4 000 € |
| Brunoy | 91 | D | 32 min | 3 100 € | 4 100 € |
| Cergy-Pontoise | 95 | A | 45 min | 2 800 € | 3 700 € |
| Pontoise | 95 | A | 50 min | 2 600 € | 3 500 € |
| Villiers-sur-Marne | 94 | A | 25 min | 3 400 € | 4 400 € |
| Sucy-en-Brie | 94 | A | 30 min | 3 300 € | 4 300 € |
| Draveil | 91 | — | 35 min (bus RER) | 2 500 € | 3 400 € |
| Savigny-sur-Orge | 91 | C | 28 min | 3 100 € | 4 000 € |

Prix indicatifs 2024-2025, mention explicite dans l'interface.

---

## 9. Onglet Dossier

**Layout :** barre de progression globale + grille 2 colonnes de 4 catégories

### Progression globale
Barre pleine largeur : X / 18 documents, pourcentage, statut textuel.

### Catégories et documents (18 total)

**Identité (4)**
- Pièce d'identité (Acheteur 1)
- Pièce d'identité (Acheteur 2)
- Justificatif de domicile
- Contrat de PACS / mariage

**Revenus (6)**
- 3 derniers bulletins de salaire (Acheteur 1)
- 3 derniers bulletins de salaire (Acheteur 2)
- 2 derniers avis d'imposition
- Contrat de travail (Acheteur 1)
- Contrat de travail (Acheteur 2)
- Attestation employeur

**Situation bancaire (5)**
- 3 derniers relevés de compte
- Relevés épargne (livret A, PEL, etc.)
- Tableau d'amortissement crédit en cours (si applicable)
- Relevés compte joint (si applicable)
- Attestation CAF

**Projet immobilier (3)**
- Compromis ou promesse de vente
- Descriptif du bien (surface, DPE, etc.)
- Règlement de copropriété (si applicable)

Chaque document = checkbox. Badge par catégorie : vert (complet), orange (partiel), rouge (vide).

---

## 10. Architecture des composants

```
App
├── AppHeader                    // Titre + date
├── SimulationBar                // Pills de simulations + bouton ＋
├── SectionTabs                  // 4 onglets
└── TabContent
    ├── ProfilTab
    │   ├── AcheteurCard (×2)
    │   ├── SituationActuelleCard
    │   └── ApportSyntheseCard
    ├── SimulationTab
    │   ├── KpiBar               // 4 métriques
    │   ├── EndettementBar       // barre de progression
    │   ├── ParamsCard           // sliders
    │   └── ComparatifCard       // ancien / neuf
    ├── SecteursTab
    │   ├── SecteursFilter
    │   └── SecteursTable
    └── DossierTab
        ├── DossierProgress
        └── DossierCategory (×4)
```

Contexte React unique `SimulationContext` : liste des simulations + simulation active.

---

## 11. Ce qui n'est pas dans le scope

- Persistance (localStorage, base de données)
- Export PDF
- Authentification
- Données immobilières en temps réel (API)
- Calcul notaire / frais d'agence (hors scope pour cette version)
