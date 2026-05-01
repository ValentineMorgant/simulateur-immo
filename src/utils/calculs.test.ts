// src/utils/calculs.test.ts
import { describe, it, expect } from 'vitest'
import { calculer } from './calculs'
import type { Simulation } from '../types'

const BASE: Simulation = {
  id: '1',
  nom: 'Test',
  acheteur1: { nom: 'Charlotte', revenuFixe: 39000, revenuVariable: 2000 },
  acheteur2: { nom: 'Valentine', revenuFixe: 45150, revenuVariable: 0 },
  loyerActuel: 1200,
  aideCaf: 180,
  apport: 30000,
  taux: 3.5,
  duree: 25,
  budgetTravaux: 0,
  tauxCible: 35,
  ptzActif: false,
  ptzMontant: 0,
  nbOccupants: 2,
  prixM2Ancien: 3500,
  prixM2Neuf: 4500,
  dossier: {},
}

describe('calculer', () => {
  it('calcule les revenus annuels (variable à 70%)', () => {
    const r = calculer(BASE)
    // Charlotte: 39000 + 2000*0.7 = 40400 ; Valentine: 45150
    expect(r.revenusAnnuels).toBe(85550)
  })

  it('calcule les revenus mensuels', () => {
    const r = calculer(BASE)
    expect(r.revenusMensuels).toBeCloseTo(85550 / 12, 2)
  })

  it('calcule la mensualité max à 35%', () => {
    const r = calculer(BASE)
    expect(r.mensualiteMax).toBeCloseTo((85550 / 12) * 0.35, 2)
  })

  it('retourne un taux d\'endettement de 35%', () => {
    const r = calculer(BASE)
    expect(r.tauxEndettement).toBeCloseTo(35, 1)
  })

  it('calcule le capital max via annuité constante', () => {
    const r = calculer(BASE)
    // facteur ≈ 199.7 pour taux=3.5% sur 25 ans
    expect(r.capitalMax).toBeGreaterThan(490000)
    expect(r.capitalMax).toBeLessThan(510000)
  })

  it('ajoute le PTZ au capital max si actif', () => {
    const base = calculer(BASE)
    const withPTZ = calculer({ ...BASE, ptzActif: true, ptzMontant: 50000 })
    expect(withPTZ.capitalMax).toBeCloseTo(base.capitalMax + 50000, 0)
  })

  it('déduit le budget travaux du prix max du bien', () => {
    const base = calculer(BASE)
    const withTravaux = calculer({ ...BASE, budgetTravaux: 20000 })
    expect(withTravaux.prixMaxBien).toBeCloseTo(base.prixMaxBien - 20000, 0)
  })

  it('prix max bien = capital + apport - travaux', () => {
    const r = calculer(BASE)
    expect(r.prixMaxBien).toBeCloseTo(r.capitalMax + 30000, 0)
  })

  it('calcule les surfaces accessibles', () => {
    const r = calculer(BASE)
    expect(r.surfaceAncien).toBeCloseTo(r.prixMaxBien / 3500, 1)
    expect(r.surfaceNeuf).toBeCloseTo(r.prixMaxBien / 4500, 1)
  })

  it('gère revenus nuls sans diviser par zéro', () => {
    const r = calculer({
      ...BASE,
      acheteur1: { nom: 'A', revenuFixe: 0, revenuVariable: 0 },
      acheteur2: { nom: 'B', revenuFixe: 0, revenuVariable: 0 },
    })
    expect(r.tauxEndettement).toBe(0)
    expect(r.capitalMax).toBe(0)
  })

  it('gère taux à 0% (prêt in fine)', () => {
    const r = calculer({ ...BASE, taux: 0 })
    // facteur = n quand r=0
    const n = 25 * 12
    const mensualite = (85550 / 12) * 0.35
    expect(r.capitalMax).toBeCloseTo(mensualite * n, 0)
  })
})
