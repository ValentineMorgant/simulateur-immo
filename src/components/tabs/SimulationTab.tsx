// src/components/tabs/SimulationTab.tsx
import { useState } from 'react'
import { useSimulation } from '../../context/SimulationContext'
import { calculer } from '../../utils/calculs'
import { euros } from '../../utils/format'
import type { Simulation } from '../../types'

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center px-4 py-3">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-green-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange, fmt }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; fmt: (v: number) => string
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="text-green-600 font-semibold">{fmt(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded appearance-none cursor-pointer accent-green-600 bg-green-100"
      />
      <div className="flex justify-between text-xs text-slate-300 mt-0.5">
        <span>{fmt(min)}</span><span>{fmt(max)}</span>
      </div>
    </div>
  )
}

function PrixM2Input({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="mb-2">
      <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</label>
      <div className="flex items-center border border-green-200 rounded-lg bg-white overflow-hidden focus-within:border-green-400">
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="flex-1 px-2 py-1.5 text-sm font-bold text-green-900 bg-transparent outline-none"
        />
        <span className="px-2 text-xs text-green-600">€/m²</span>
      </div>
    </div>
  )
}

export function SimulationTab() {
  const { active, updateActive } = useSimulation()
  const r = calculer(active)
  const [showEndettInfo, setShowEndettInfo] = useState(false)

  function set<K extends keyof Simulation>(key: K, value: Simulation[K]) {
    updateActive({ [key]: value } as Partial<Simulation>)
  }

  const endettPct = Math.min(r.tauxEndettement, 50)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="bg-white rounded-xl border border-green-200 grid grid-cols-4 divide-x divide-green-100">
        <Kpi label="Capacité d'emprunt" value={euros(r.capitalMax)} />
        <Kpi label="Mensualité" value={euros(r.mensualiteMax) + '/mois'} sub={`dont assurance ${euros(r.mensualiteAssurance)}`} />
        <Kpi label="Taux d'endettement" value={r.tauxEndettement.toFixed(1) + ' %'} sub="/ 35% max" />
        <Kpi label="Prix max du bien" value={euros(r.prixMaxBien)} sub={`apport inclus${active.budgetTravaux > 0 ? ', travaux déduits' : ''}`} />
      </div>

      {/* Barre d'endettement */}
      <div className="bg-white rounded-xl border border-green-200 px-5 py-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span className="flex items-center gap-1.5">
            Taux d'endettement : <strong className="text-green-600">{r.tauxEndettement.toFixed(1)}%</strong>
            <button
              onClick={() => setShowEndettInfo(v => !v)}
              className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 hover:bg-green-100 hover:text-green-700 flex items-center justify-center text-xs font-bold leading-none transition-colors"
              title="Qu'est-ce que le taux d'endettement ?"
            >ℹ</button>
          </span>
          <span>Limite bancaire : <strong>35%</strong></span>
        </div>
        <div className="h-2.5 bg-green-100 rounded-full relative">
          <div
            className="h-2.5 bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
            style={{ width: `${(endettPct / 50) * 100}%` }}
          />
          <div className="absolute top-[-3px] h-4 w-0.5 bg-red-400 rounded" style={{ left: `${(35 / 50) * 100}%` }} />
        </div>
        <div className="relative text-xs text-slate-300 mt-0.5 h-4">
          <span className="absolute left-0">0%</span>
          <span className="absolute text-red-400" style={{ left: `${(35 / 50) * 100}%`, transform: 'translateX(-50%)' }}>35% ↑</span>
          <span className="absolute right-0">50%</span>
        </div>
        {showEndettInfo && (
          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-blue-800">Qu'est-ce que le taux d'endettement ?</p>
            <p>C'est la part de vos revenus nets mensuels consacrée au remboursement de crédit.</p>
            <p className="font-mono bg-white border border-blue-100 rounded px-2 py-1 text-slate-700">
              Taux = mensualité ÷ revenus mensuels × 100
            </p>
            <p>
              Ici : <strong>{euros(r.mensualiteMax)}/mois</strong> ÷ <strong>{euros(r.revenusMensuels)}/mois</strong> = <strong className="text-green-700">{r.tauxEndettement.toFixed(1)}%</strong>
            </p>
            <p className="text-slate-500">
              Depuis janvier 2022, le <strong>Haut Conseil de Stabilité Financière (HCSF)</strong> impose aux banques de ne pas dépasser <strong>35%</strong> (charges d'assurance incluses). Ce simulateur calcule votre capacité maximale à ce plafond.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Paramètres */}
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <h3 className="text-xs font-bold text-green-900 mb-4">Paramètres du prêt</h3>
          <Slider label="Taux d'endettement cible" value={active.tauxCible} min={20} max={45} step={0.5}
            onChange={v => set('tauxCible', v)} fmt={v => {
              if (v > 35) return v.toFixed(1) + ' % ⚠'
              return v.toFixed(1) + ' %'
            }} />
          {active.tauxCible > 35 && (
            <p className="text-xs text-amber-600 -mt-3 mb-3">Au-dessus de la limite HCSF (35%) — certaines banques acceptent jusqu'à 40% pour les hauts revenus.</p>
          )}
          <Slider label="Taux d'intérêt" value={active.taux} min={0.5} max={6} step={0.05}
            onChange={v => set('taux', v)} fmt={v => v.toFixed(2) + ' %'} />
          <Slider label="Assurance emprunteur" value={active.tauxAssurance} min={0.10} max={0.50} step={0.05}
            onChange={v => set('tauxAssurance', v)} fmt={v => v.toFixed(2) + ' %/an'} />
          <Slider label="Durée" value={active.duree} min={5} max={30} step={1}
            onChange={v => set('duree', v)} fmt={v => v + ' ans'} />
          <Slider label="Apport" value={active.apport} min={0} max={200000} step={1000}
            onChange={v => set('apport', v)} fmt={v => v.toLocaleString('fr-FR') + ' €'} />
          <Slider label="Budget travaux" value={active.budgetTravaux} min={0} max={100000} step={1000}
            onChange={v => set('budgetTravaux', v)} fmt={v => v.toLocaleString('fr-FR') + ' €'} />

          <div className="border-t border-green-100 pt-3 mt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Prêt à Taux Zéro (PTZ)</span>
              <button
                onClick={() => set('ptzActif', !active.ptzActif)}
                className={`w-10 h-5 rounded-full relative transition-colors ${active.ptzActif ? 'bg-green-600' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active.ptzActif ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {active.ptzActif && (
              <Slider label="Montant PTZ" value={active.ptzMontant} min={0} max={100000} step={1000}
                onChange={v => set('ptzMontant', v)} fmt={v => v.toLocaleString('fr-FR') + ' €'} />
            )}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-slate-600 space-y-1.5 mt-1">
              <p className="font-semibold text-amber-800">Conditions d'éligibilité au PTZ</p>
              <ul className="space-y-1 text-slate-600">
                <li className="flex gap-1.5"><span className="text-amber-500 flex-shrink-0">●</span><span><strong>Primo-accédant</strong> — ne pas avoir été propriétaire de sa résidence principale durant les 2 dernières années</span></li>
                <li className="flex gap-1.5"><span className="text-amber-500 flex-shrink-0">●</span><span><strong>Logement neuf</strong> en zone A, A<sub>bis</sub> ou B1 — ou ancien avec travaux importants en zone B2/C</span></li>
                <li className="flex gap-1.5"><span className="text-amber-500 flex-shrink-0">●</span><span><strong>Résidence principale</strong> — le bien doit être occupé dans l'année suivant l'achat</span></li>
                <li className="flex gap-1.5"><span className="text-amber-500 flex-shrink-0">●</span><span><strong>Plafonds de revenus</strong> (revenu fiscal de référence N-2) — ex. 2 personnes en zone A : 57 000 €/an max</span></li>
              </ul>
              <p className="text-slate-500 pt-0.5">
                L'Île-de-France est classée en zone <strong>A / A<sub>bis</sub></strong>. Le PTZ peut financer jusqu'à <strong>40 %</strong> du coût total du bien neuf.
                <a
                  href="https://www.service-public.fr/particuliers/vosdroits/F10871"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-600 underline hover:text-blue-800"
                >service-public.fr ↗</a>
              </p>

              {/* Calculateur PTZ */}
              <div className="border-t border-amber-200 pt-2 mt-1 space-y-2">
                <p className="font-semibold text-amber-800">Estimer mon PTZ — zone A/A<sub>bis</sub> (IDF)</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500">Nb d'occupants :</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => set('nbOccupants', n)}
                      className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                        active.nbOccupants === n
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border border-amber-200 text-slate-500 hover:border-amber-400'
                      }`}
                    >
                      {n === 5 ? '5+' : n}
                    </button>
                  ))}
                </div>
                {(() => {
                  const plafonds = [0, 150000, 210000, 255000, 300000, 345000]
                  const plafond = plafonds[Math.min(active.nbOccupants, 5)]
                  const ptzEstime = Math.round(plafond * 0.40)
                  return (
                    <div className="bg-white rounded-lg border border-amber-200 px-3 py-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-slate-500">PTZ estimé (40% × {plafond.toLocaleString('fr-FR')} €)</p>
                        <p className="text-lg font-extrabold text-amber-700">{ptzEstime.toLocaleString('fr-FR')} €</p>
                        <p className="text-slate-400 text-xs">Plafond indicatif 2024 — zone A/A<sub>bis</sub></p>
                      </div>
                      <button
                        onClick={() => {
                          set('ptzMontant', ptzEstime)
                          if (!active.ptzActif) set('ptzActif', true)
                        }}
                        className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
                      >
                        Appliquer
                      </button>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Comparatif */}
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <h3 className="text-xs font-bold text-green-900 mb-4">Comparatif Ancien / Neuf</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'ANCIEN', prixM2: active.prixM2Ancien, surface: r.surfaceAncien, key: 'prixM2Ancien' as const, fraisNotaire: r.fraisNotaireAncien, tauxNotaire: '7,5%' },
              { label: 'NEUF',   prixM2: active.prixM2Neuf,   surface: r.surfaceNeuf,   key: 'prixM2Neuf' as const,   fraisNotaire: r.fraisNotaireNeuf,   tauxNotaire: '2,5%' },
            ].map(col => (
              <div key={col.label} className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs font-semibold text-slate-500 mb-2">{col.label}</p>
                <PrixM2Input label="Prix/m²" value={col.prixM2} onChange={v => set(col.key, v)} />
                <p className="text-xs text-slate-500 mt-2">Surface accessible</p>
                <p className="text-2xl font-extrabold text-green-600">{Math.floor(col.surface)} m²</p>
                <div className="border-t border-green-200 mt-2 pt-2">
                  <p className="text-xs text-slate-400">Frais de notaire ({col.tauxNotaire})</p>
                  <p className="text-sm font-semibold text-slate-500">≈ {euros(col.fraisNotaire)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-green-100 pt-3 space-y-1">
            <p className="text-xs font-semibold text-green-900 mb-2">Coût total du crédit</p>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Capital emprunté</span><span className="font-semibold text-green-900">{euros(r.capitalMax)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Intérêts totaux</span><span className="text-slate-500">{euros(r.interetsTotaux)}</span></div>
            <div className="flex justify-between text-xs font-bold"><span className="text-slate-700">Total remboursé</span><span className="text-green-900">{euros(r.coutTotal)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
