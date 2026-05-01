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
  typeNotaire: 'ancien' as const,
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
    typeNotaire: 'ancien' as const,
    ptzActif: false,
    ptzMontant: 0,
    nbOccupants: 2,
    prixM2Ancien: 3500,
    prixM2Neuf: 4500,
    dossier: {},
  }
}
