// src/components/tabs/AnnoncesTab.tsx
import { useState } from 'react'
import { useSimulation } from '../../context/SimulationContext'
import { calculer } from '../../utils/calculs'
import { euros } from '../../utils/format'

type TypeBien = 'tous' | 'appartement' | 'maison'

type Criteres = {
  type: TypeBien
  surfaceMin: number
  nbPieces: number
  parking: boolean
  jardin: boolean
  ville: string
}

function buildSeLoger(budget: number, c: Criteres): string {
  const types = c.type === 'appartement' ? '1' : c.type === 'maison' ? '2' : '1,2'
  const parts = [
    `types=${types}`,
    'projects=2',
    'enterprise=0',
    `price=0%2F${budget}`,
    `surface=${c.surfaceMin}%2F0`,
    `rooms=${c.nbPieces}`,
  ]
  if (c.parking) parts.push('hasParking=1')
  if (c.jardin) parts.push('hasGarden=1')
  if (c.ville) parts.push(`localisation=${encodeURIComponent(c.ville)}`)
  return `https://www.seloger.com/list.htm?${parts.join('&')}`
}

function buildLeBonCoin(budget: number, c: Criteres): string {
  const parts = [
    'category=9',
    `price=0-${budget}`,
    `rooms=${c.nbPieces}-99`,
    `surface=${c.surfaceMin}-9999`,
  ]
  if (c.type === 'appartement') parts.push('real_estate_type[]=2')
  else if (c.type === 'maison') parts.push('real_estate_type[]=1')
  if (c.ville) parts.push(`locations=${encodeURIComponent(c.ville)}`)
  return `https://www.leboncoin.fr/recherche?${parts.join('&')}`
}

function buildBienIci(budget: number, c: Criteres): string {
  const location = c.ville
    ? encodeURIComponent(c.ville.toLowerCase().replace(/\s+/g, '-'))
    : 'ile-de-france'
  const parts = [
    `prix-max=${budget}`,
    `surface-min=${c.surfaceMin}`,
    `nb-pieces-min=${c.nbPieces}`,
  ]
  if (c.type !== 'tous') parts.push(`typesDeLogement=${c.type}`)
  if (c.parking) parts.push('garage=true')
  if (c.jardin) parts.push('jardin=true')
  return `https://www.bienici.com/recherche/achat/${location}?${parts.join('&')}`
}

function buildLogicImmo(budget: number, c: Criteres): string {
  const location = c.ville
    ? `${encodeURIComponent(c.ville.toLowerCase())}`
    : 'ile-de-france,3_0'
  const typeSlug = c.type === 'appartement' ? 'appartement' : c.type === 'maison' ? 'maison' : 'immobilier'
  const parts = [
    `nb_pieces_min=${c.nbPieces}`,
    `surface_min=${c.surfaceMin}`,
    `prix_max=${budget}`,
  ]
  if (c.parking) parts.push('parking=1')
  return `https://www.logic-immo.com/vente-${typeSlug}/${location}/?${parts.join('&')}`
}

const PLATFORMS = [
  { id: 'seloger',   label: 'SeLoger',    bg: 'bg-[#e60000]', build: buildSeLoger },
  { id: 'leboncoin', label: 'LeBonCoin',  bg: 'bg-[#e84d0e]', build: buildLeBonCoin },
  { id: 'bienici',   label: "Bien'ici",   bg: 'bg-[#1a82c4]', build: buildBienIci },
  { id: 'logicimmo', label: 'Logic-Immo', bg: 'bg-[#00a650]', build: buildLogicImmo },
]

export function AnnoncesTab() {
  const { active } = useSimulation()
  const r = calculer(active)
  const budget = Math.floor(r.prixMaxBien)

  const [criteres, setCriteres] = useState<Criteres>({
    type: 'tous',
    surfaceMin: 50,
    nbPieces: 3,
    parking: false,
    jardin: false,
    ville: '',
  })

  function set<K extends keyof Criteres>(key: K, value: Criteres[K]) {
    setCriteres(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      {/* Budget banner */}
      <div className="bg-white rounded-xl border border-green-200 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Budget max simulé</p>
          <p className="text-2xl font-extrabold text-green-900">{euros(budget)}</p>
          <p className="text-xs text-slate-400">frais notaire {active.typeNotaire === 'ancien' ? '7,5%' : '2,5%'} inclus</p>
        </div>
        <div className="text-xs text-slate-400 text-right space-y-0.5">
          <p>Apport : <span className="font-semibold text-slate-600">{euros(active.apport)}</span></p>
          <p>Emprunt : <span className="font-semibold text-slate-600">{euros(r.capitalMax)}</span></p>
          <p>Mensualité : <span className="font-semibold text-slate-600">{euros(r.mensualiteMax)}/mois</span></p>
        </div>
      </div>

      {/* Critères */}
      <div className="bg-white rounded-xl border border-green-200 p-4 space-y-4">
        <h3 className="text-xs font-bold text-green-900">Critères de recherche</h3>

        {/* Type de bien */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Type de bien</p>
          <div className="flex rounded-lg overflow-hidden border border-green-200">
            {(['tous', 'appartement', 'maison'] as const).map(t => (
              <button
                key={t}
                onClick={() => set('type', t)}
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                  criteres.type === t
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-slate-500 hover:bg-green-50'
                }`}
              >
                {t === 'tous' ? 'Tous' : t === 'appartement' ? 'Appartement' : 'Maison'}
              </button>
            ))}
          </div>
        </div>

        {/* Surface + Pièces */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Surface minimum</p>
            <div className="flex items-center border border-green-200 rounded-lg overflow-hidden focus-within:border-green-400">
              <input
                type="number"
                min={0}
                value={criteres.surfaceMin || ''}
                onChange={e => set('surfaceMin', Number(e.target.value) || 0)}
                className="flex-1 px-3 py-1.5 text-sm font-bold text-green-900 outline-none bg-transparent"
              />
              <span className="px-2 text-xs text-green-600 bg-green-50 self-stretch flex items-center border-l border-green-200">m²</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Pièces minimum</p>
            <div className="flex rounded-lg overflow-hidden border border-green-200">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => set('nbPieces', n)}
                  className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                    criteres.nbPieces === n
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-slate-500 hover:bg-green-50'
                  }`}
                >
                  {n === 5 ? '5+' : n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Options */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Options souhaitées</p>
          <div className="flex gap-2 flex-wrap">
            {([
              { key: 'parking' as const, label: '🅿 Parking' },
              { key: 'jardin'  as const, label: '🌿 Jardin'  },
            ]).map(opt => (
              <button
                key={opt.key}
                onClick={() => set(opt.key, !criteres[opt.key])}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  criteres[opt.key]
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-slate-500 border-green-200 hover:border-green-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Localisation */}
        <div>
          <p className="text-xs text-slate-500 mb-1.5">
            Ville ou arrondissement
            <span className="text-slate-300 ml-1">(optionnel — Île-de-France par défaut)</span>
          </p>
          <input
            type="text"
            value={criteres.ville}
            onChange={e => set('ville', e.target.value)}
            placeholder="Paris 15, Boulogne-Billancourt, Vincennes…"
            className="w-full border border-green-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400 text-slate-700 placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Plateformes */}
      <div className="bg-white rounded-xl border border-green-200 p-4">
        <h3 className="text-xs font-bold text-green-900 mb-1">Voir les annonces</h3>
        <p className="text-xs text-slate-400 mb-3">Budget, surface et pièces pré-remplis sur chaque site</p>
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map(p => (
            <a
              key={p.id}
              href={p.build(budget, criteres)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${p.bg} text-white rounded-lg px-4 py-3 text-center font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
            >
              {p.label}
              <span className="text-xs opacity-75">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
