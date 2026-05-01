// src/utils/calculs.ts
import type { Simulation, Resultats } from '../types'

export function calculer(sim: Simulation): Resultats {
  const revenuRetenu1 = sim.acheteur1.revenuFixe + sim.acheteur1.revenuVariable * 0.7
  const revenuRetenu2 = sim.acheteur2.revenuFixe + sim.acheteur2.revenuVariable * 0.7
  const revenusAnnuels = revenuRetenu1 + revenuRetenu2
  const revenusMensuels = revenusAnnuels / 12
  const mensualiteMax = revenusMensuels * (sim.tauxCible / 100)

  const r = sim.taux / 100 / 12
  const n = sim.duree * 12
  const facteur = r > 0 ? (1 - Math.pow(1 + r, -n)) / r : n

  // Assurance intégrée dans mensualiteMax (règle HCSF : 35% inclut assurance)
  // capitalPret = mensualiteMax × facteur / (1 + k × facteur)
  const k = (sim.tauxAssurance ?? 0) / 100 / 12
  const capitalPret = facteur > 0
    ? mensualiteMax * facteur / (1 + k * facteur)
    : 0
  const mensualiteAssurance = capitalPret * k

  const capitalMax = capitalPret + (sim.ptzActif ? sim.ptzMontant : 0)
  const prixMaxBien = capitalMax + sim.apport - sim.budgetTravaux

  const tauxEndettement = revenusMensuels > 0
    ? (mensualiteMax / revenusMensuels) * 100
    : 0

  const coutTotal = mensualiteMax * n
  const interetsTotaux = coutTotal - capitalPret

  const surfaceAncien = sim.prixM2Ancien > 0 ? prixMaxBien / sim.prixM2Ancien : 0
  const surfaceNeuf   = sim.prixM2Neuf   > 0 ? prixMaxBien / sim.prixM2Neuf   : 0

  const fraisNotaireAncien = Math.round(prixMaxBien * 0.075)
  const fraisNotaireNeuf   = Math.round(prixMaxBien * 0.025)

  return {
    revenusMensuels,
    revenusAnnuels,
    mensualiteMax,
    mensualiteAssurance,
    capitalMax,
    prixMaxBien,
    tauxEndettement,
    coutTotal,
    interetsTotaux,
    surfaceAncien,
    surfaceNeuf,
    fraisNotaireAncien,
    fraisNotaireNeuf,
  }
}
