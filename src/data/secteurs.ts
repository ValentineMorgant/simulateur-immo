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
