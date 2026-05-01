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
  // RER A direct → Auber
  { ville: 'Villiers-sur-Marne',       departement: '94', lignes: ['A'],      trajetMin: 28, prixAncien: 3400, prixNeuf: 4400 },
  { ville: 'Sucy-en-Brie',             departement: '94', lignes: ['A'],      trajetMin: 33, prixAncien: 3300, prixNeuf: 4300 },
  { ville: 'Cergy-Pontoise',           departement: '95', lignes: ['A'],      trajetMin: 52, prixAncien: 2800, prixNeuf: 3700 },
  { ville: 'Pontoise',                 departement: '95', lignes: ['A'],      trajetMin: 57, prixAncien: 2600, prixNeuf: 3500 },
  // RER B → Châtelet → RER A → Auber (~5 min correspondance)
  { ville: 'Massy-Palaiseau',          departement: '91', lignes: ['B'],      trajetMin: 35, prixAncien: 2800, prixNeuf: 3800 },
  { ville: 'Palaiseau',                departement: '91', lignes: ['B'],      trajetMin: 40, prixAncien: 2900, prixNeuf: 3900 },
  { ville: 'Gif-sur-Yvette',           departement: '91', lignes: ['B'],      trajetMin: 47, prixAncien: 3000, prixNeuf: 4000 },
  { ville: 'Saint-Rémy-lès-Chevreuse', departement: '78', lignes: ['B'],      trajetMin: 55, prixAncien: 3100, prixNeuf: 4100 },
  // RER C/D → Châtelet → RER A → Auber (~5 min correspondance)
  { ville: 'Juvisy-sur-Orge',          departement: '91', lignes: ['C', 'D'], trajetMin: 33, prixAncien: 3200, prixNeuf: 4200 },
  { ville: 'Savigny-sur-Orge',         departement: '91', lignes: ['C'],      trajetMin: 43, prixAncien: 3100, prixNeuf: 4000 },
  { ville: 'Évry-Courcouronnes',       departement: '91', lignes: ['D'],      trajetMin: 42, prixAncien: 2600, prixNeuf: 3500 },
  { ville: 'Yerres',                   departement: '91', lignes: ['D'],      trajetMin: 40, prixAncien: 3000, prixNeuf: 4000 },
  { ville: 'Brunoy',                   departement: '91', lignes: ['D'],      trajetMin: 44, prixAncien: 3100, prixNeuf: 4100 },
  { ville: 'Corbeil-Essonnes',         departement: '91', lignes: ['D'],      trajetMin: 50, prixAncien: 2200, prixNeuf: 3200 },
  // Sans RER direct — bus + RER D
  { ville: 'Draveil',                  departement: '91', lignes: [],         trajetMin: 55, prixAncien: 2500, prixNeuf: 3400 },
]
