// src/components/tabs/AnnoncesTab.tsx
import { useState } from 'react'
import { useSimulation } from '../../context/SimulationContext'
import { calculer } from '../../utils/calculs'
import { euros } from '../../utils/format'

type TypeBien   = 'tous' | 'appartement' | 'maison'
type DpeMax = '' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

type Criteres = {
  type:       TypeBien
  surfaceMin: number
  surfaceMax: number   // 0 = illimité
  prixMin:    number
  nbPieces:   number
  nbChambres: number   // 0 = indifférent
  parking:    boolean
  jardin:     boolean
  balcon:     boolean
  terrasse:   boolean
  cave:       boolean
  ascenseur:  boolean
  piscine:    boolean
  dpeMax:     DpeMax
  ville:      string
}

const DEFAULT: Criteres = {
  type: 'tous',
  surfaceMin: 50, surfaceMax: 0,
  prixMin: 0,
  nbPieces: 3, nbChambres: 0,
  parking: false, jardin: false, balcon: false,
  terrasse: false, cave: false, ascenseur: false, piscine: false,
  dpeMax: '',
  ville: '',
}

// ─── Builders URL ────────────────────────────────────────────────────────────

type BuildArgs = { budget: number; c: Criteres; typeNotaire: 'ancien' | 'neuf' }

function buildSeLoger({ budget, c, typeNotaire }: BuildArgs): string {
  const types   = c.type === 'appartement' ? '1' : c.type === 'maison' ? '2' : '1,2'
  const surfMax = c.surfaceMax > 0 ? c.surfaceMax : 0
  const parts = [
    `types=${types}`,
    'projects=2',
    'enterprise=0',
    `price=${c.prixMin}%2F${budget}`,
    `surface=${c.surfaceMin}%2F${surfMax}`,
    `rooms=${c.nbPieces}`,
    typeNotaire === 'neuf' ? 'isNew=1' : 'isNew=0',
  ]
  if (c.nbChambres > 0) parts.push(`bedrooms=${c.nbChambres}`)
  if (c.parking)   parts.push('hasParking=1')
  if (c.jardin)    parts.push('hasGarden=1')
  if (c.balcon)    parts.push('hasBalcony=1')
  if (c.terrasse)  parts.push('hasTerrace=1')
  if (c.cave)      parts.push('hasCellar=1')
  if (c.ascenseur) parts.push('hasElevator=1')
  if (c.piscine)   parts.push('hasPool=1')
  if (c.dpeMax)    parts.push(`dpe=${c.dpeMax}`)
  if (c.ville)     parts.push(`localisation=${encodeURIComponent(c.ville)}`)
  return `https://www.seloger.com/list.htm?${parts.join('&')}`
}

function buildLeBonCoin({ budget, c, typeNotaire }: BuildArgs): string {
  const surfMax = c.surfaceMax > 0 ? c.surfaceMax : 9999
  const parts = [
    'category=9',
    `price=${c.prixMin}-${budget}`,
    `rooms=${c.nbPieces}-99`,
    `surface=${c.surfaceMin}-${surfMax}`,
  ]
  if (c.type === 'appartement') parts.push('real_estate_type[]=2')
  else if (c.type === 'maison') parts.push('real_estate_type[]=1')
  if (typeNotaire === 'neuf') parts.push('is_new_construction[]=1')
  if (c.parking) parts.push('has_parking[]=1')
  if (c.ville)   parts.push(`locations=${encodeURIComponent(c.ville)}`)
  return `https://www.leboncoin.fr/recherche?${parts.join('&')}`
}

function buildBienIci({ budget, c, typeNotaire }: BuildArgs): string {
  const location = c.ville
    ? encodeURIComponent(c.ville.toLowerCase().replace(/\s+/g, '-'))
    : 'ile-de-france'
  const parts = [
    `prix-min=${c.prixMin}`,
    `prix-max=${budget}`,
    `surface-min=${c.surfaceMin}`,
    `nb-pieces-min=${c.nbPieces}`,
    typeNotaire === 'neuf' ? 'neuf=true' : 'ancien=true',
  ]
  if (c.surfaceMax > 0) parts.push(`surface-max=${c.surfaceMax}`)
  if (c.nbChambres > 0) parts.push(`nb-chambres-min=${c.nbChambres}`)
  if (c.type !== 'tous') parts.push(`typesDeLogement=${c.type}`)
  if (c.parking)   parts.push('garage=true')
  if (c.jardin)    parts.push('jardin=true')
  if (c.balcon)    parts.push('balcon=true')
  if (c.terrasse)  parts.push('terrasse=true')
  if (c.cave)      parts.push('cave=true')
  if (c.ascenseur) parts.push('ascenseur=true')
  if (c.piscine)   parts.push('piscine=true')
  if (c.dpeMax) {
    const all = ['A','B','C','D','E','F','G']
    all.slice(0, all.indexOf(c.dpeMax) + 1).forEach(d => parts.push(`classeEnergetique[]=${d}`))
  }
  return `https://www.bienici.com/recherche/achat/${location}?${parts.join('&')}`
}

function buildLogicImmo({ budget, c, typeNotaire }: BuildArgs): string {
  const location = c.ville ? encodeURIComponent(c.ville.toLowerCase()) : 'ile-de-france,3_0'
  const typeSlug = c.type === 'appartement' ? 'appartement' : c.type === 'maison' ? 'maison' : 'immobilier'
  const parts = [
    `prix_min=${c.prixMin}`,
    `prix_max=${budget}`,
    `surface_min=${c.surfaceMin}`,
    `nb_pieces_min=${c.nbPieces}`,
    typeNotaire === 'neuf' ? 'neuf=1' : 'ancien=1',
  ]
  if (c.surfaceMax > 0) parts.push(`surface_max=${c.surfaceMax}`)
  if (c.nbChambres > 0) parts.push(`nb_chambres_min=${c.nbChambres}`)
  if (c.parking)   parts.push('parking=1')
  if (c.jardin)    parts.push('jardin=1')
  if (c.balcon)    parts.push('balcon=1')
  if (c.terrasse)  parts.push('terrasse=1')
  if (c.cave)      parts.push('cave=1')
  if (c.ascenseur) parts.push('ascenseur=1')
  if (c.piscine)   parts.push('piscine=1')
  return `https://www.logic-immo.com/vente-${typeSlug}/${location}/?${parts.join('&')}`
}

const PLATFORMS = [
  { id: 'seloger',   label: 'SeLoger',    bg: 'bg-[#e60000]', build: buildSeLoger   },
  { id: 'leboncoin', label: 'LeBonCoin',  bg: 'bg-[#e84d0e]', build: buildLeBonCoin },
  { id: 'bienici',   label: "Bien'ici",   bg: 'bg-[#1a82c4]', build: buildBienIci   },
  { id: 'logicimmo', label: 'Logic-Immo', bg: 'bg-[#00a650]', build: buildLogicImmo },
] as const

// ─── Composant ───────────────────────────────────────────────────────────────

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? 'bg-green-600 text-white border-green-600'
          : 'bg-white text-slate-500 border-green-200 hover:border-green-400'
      }`}
    >
      {label}
    </button>
  )
}

function SurfaceInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1.5">{label}</p>
      <div className="flex items-center border border-green-200 rounded-lg overflow-hidden focus-within:border-green-400">
        <input
          type="number" min={0}
          value={value || ''}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="flex-1 px-3 py-1.5 text-sm font-bold text-green-900 outline-none bg-transparent"
        />
        <span className="px-2 text-xs text-green-600 bg-green-50 self-stretch flex items-center border-l border-green-200">m²</span>
      </div>
    </div>
  )
}

export function AnnoncesTab() {
  const { active } = useSimulation()
  const r = calculer(active)
  const budget = Math.floor(r.prixMaxBien)

  const [c, setC] = useState<Criteres>(DEFAULT)

  const typeNotaire = active.typeNotaire

  function set<K extends keyof Criteres>(key: K, value: Criteres[K]) {
    setC(prev => ({ ...prev, [key]: value }))
  }
  function tog(key: keyof Pick<Criteres, 'parking'|'jardin'|'balcon'|'terrasse'|'cave'|'ascenseur'|'piscine'>) {
    setC(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const DPE_LEVELS: DpeMax[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  const DPE_COLORS: Record<string, string> = {
    A: 'bg-green-700', B: 'bg-green-500', C: 'bg-lime-400 text-slate-800',
    D: 'bg-yellow-400 text-slate-800', E: 'bg-orange-400', F: 'bg-orange-600', G: 'bg-red-700',
  }

  return (
    <div className="space-y-4">

      {/* Budget banner */}
      <div className="bg-white rounded-xl border border-green-200 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Budget max simulé</p>
          <p className="text-2xl font-extrabold text-green-900">{euros(budget)}</p>
          <p className="text-xs text-slate-400">
            {typeNotaire === 'ancien' ? 'Bien ancien — frais notaire 7,5%' : 'Bien neuf — frais notaire 2,5%'}
          </p>
        </div>
        <div className="text-xs text-slate-400 text-right space-y-0.5">
          <p>Apport : <span className="font-semibold text-slate-600">{euros(active.apport)}</span></p>
          <p>Emprunt : <span className="font-semibold text-slate-600">{euros(r.capitalMax)}</span></p>
          <p>Mensualité : <span className="font-semibold text-slate-600">{euros(r.mensualiteMax)}/mois</span></p>
        </div>
      </div>

      {/* Critères */}
      <div className="bg-white rounded-xl border border-green-200 p-4 space-y-5">
        <h3 className="text-xs font-bold text-green-900">Critères de recherche</h3>

        {/* Type de bien */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Type de bien</p>
          <div className="flex rounded-lg overflow-hidden border border-green-200">
            {(['tous', 'appartement', 'maison'] as const).map(t => (
              <button key={t} onClick={() => set('type', t)}
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${c.type === t ? 'bg-green-600 text-white' : 'bg-white text-slate-500 hover:bg-green-50'}`}>
                {t === 'tous' ? 'Tous' : t === 'appartement' ? 'Appartement' : 'Maison'}
              </button>
            ))}
          </div>
        </div>

        {/* Surface */}
        <div className="grid grid-cols-2 gap-4">
          <SurfaceInput label="Surface minimum" value={c.surfaceMin} onChange={v => set('surfaceMin', v)} />
          <SurfaceInput label="Surface maximum" value={c.surfaceMax} onChange={v => set('surfaceMax', v)} />
        </div>

        {/* Prix min */}
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Prix minimum <span className="text-slate-300">(budget max = {euros(budget)})</span></p>
          <div className="flex items-center border border-green-200 rounded-lg overflow-hidden focus-within:border-green-400">
            <input
              type="number" min={0} step={10000}
              value={c.prixMin || ''}
              onChange={e => set('prixMin', Number(e.target.value) || 0)}
              className="flex-1 px-3 py-1.5 text-sm font-bold text-green-900 outline-none bg-transparent"
            />
            <span className="px-2 text-xs text-green-600 bg-green-50 self-stretch flex items-center border-l border-green-200">€</span>
          </div>
        </div>

        {/* Pièces + Chambres */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Pièces minimum</p>
            <div className="flex rounded-lg overflow-hidden border border-green-200">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => set('nbPieces', n)}
                  className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${c.nbPieces === n ? 'bg-green-600 text-white' : 'bg-white text-slate-500 hover:bg-green-50'}`}>
                  {n === 5 ? '5+' : n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Chambres minimum</p>
            <div className="flex rounded-lg overflow-hidden border border-green-200">
              {[0, 1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => set('nbChambres', n)}
                  className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${c.nbChambres === n ? 'bg-green-600 text-white' : 'bg-white text-slate-500 hover:bg-green-50'}`}>
                  {n === 0 ? '—' : n === 4 ? '4+' : n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Équipements</p>
          <div className="flex gap-2 flex-wrap">
            <Toggle label="🅿 Parking"   active={c.parking}   onClick={() => tog('parking')} />
            <Toggle label="🌿 Jardin"    active={c.jardin}    onClick={() => tog('jardin')} />
            <Toggle label="🌅 Balcon"    active={c.balcon}    onClick={() => tog('balcon')} />
            <Toggle label="☀️ Terrasse"  active={c.terrasse}  onClick={() => tog('terrasse')} />
            <Toggle label="📦 Cave"      active={c.cave}      onClick={() => tog('cave')} />
            <Toggle label="🛗 Ascenseur" active={c.ascenseur} onClick={() => tog('ascenseur')} />
            <Toggle label="🏊 Piscine"   active={c.piscine}   onClick={() => tog('piscine')} />
          </div>
        </div>

        {/* DPE */}
        <div>
          <p className="text-xs text-slate-500 mb-2">DPE maximum <span className="text-slate-300">(ex. C = biens classés A, B ou C)</span></p>
          <div className="flex gap-1.5">
            <button
              onClick={() => set('dpeMax', '')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                c.dpeMax === '' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500 border-green-200 hover:border-green-400'
              }`}
            >
              Tous
            </button>
            {DPE_LEVELS.map(d => (
              <button
                key={d}
                onClick={() => set('dpeMax', d)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-opacity ${DPE_COLORS[d]} text-white ${
                  c.dpeMax === d ? 'ring-2 ring-offset-1 ring-green-600' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {d}
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
            value={c.ville}
            onChange={e => set('ville', e.target.value)}
            placeholder="Paris 15, Boulogne-Billancourt, Vincennes…"
            className="w-full border border-green-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400 text-slate-700 placeholder:text-slate-300"
          />
        </div>

        {/* Reset */}
        <button
          onClick={() => setC(DEFAULT)}
          className="text-xs text-slate-400 hover:text-slate-600 underline"
        >
          Réinitialiser les critères
        </button>
      </div>

      {/* Plateformes */}
      <div className="bg-white rounded-xl border border-green-200 p-4">
        <h3 className="text-xs font-bold text-green-900 mb-1">Voir les annonces</h3>
        <p className="text-xs text-slate-400 mb-3">Tous les critères sont pré-remplis sur chaque plateforme</p>
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map(p => (
            <a
              key={p.id}
              href={p.build({ budget, c, typeNotaire })}
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
