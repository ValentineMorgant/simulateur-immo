// src/components/tabs/SimulationTab.tsx
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

  function set<K extends keyof Simulation>(key: K, value: Simulation[K]) {
    updateActive({ [key]: value } as Partial<Simulation>)
  }

  const endettPct = Math.min(r.tauxEndettement, 50)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="bg-white rounded-xl border border-green-200 grid grid-cols-4 divide-x divide-green-100">
        <Kpi label="Capacité d'emprunt" value={euros(r.capitalMax)} />
        <Kpi label="Mensualité" value={euros(r.mensualiteMax) + '/mois'} />
        <Kpi label="Taux d'endettement" value={r.tauxEndettement.toFixed(1) + ' %'} sub="/ 35% max" />
        <Kpi label="Prix max du bien" value={euros(r.prixMaxBien)} sub={`apport inclus${active.budgetTravaux > 0 ? ', travaux déduits' : ''}`} />
      </div>

      {/* Barre d'endettement */}
      <div className="bg-white rounded-xl border border-green-200 px-5 py-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Taux d'endettement : <strong className="text-green-600">{r.tauxEndettement.toFixed(1)}%</strong></span>
          <span>Limite bancaire : <strong>35%</strong></span>
        </div>
        <div className="h-2.5 bg-green-100 rounded-full relative">
          <div
            className="h-2.5 bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
            style={{ width: `${(endettPct / 50) * 100}%` }}
          />
          <div className="absolute top-[-3px] h-4 w-0.5 bg-red-400 rounded" style={{ left: `${(35 / 50) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-300 mt-0.5">
          <span>0%</span><span className="text-red-400">35% ↑</span><span>50%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Paramètres */}
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <h3 className="text-xs font-bold text-green-900 mb-4">Paramètres du prêt</h3>
          <Slider label="Taux d'intérêt" value={active.taux} min={0.5} max={6} step={0.05}
            onChange={v => set('taux', v)} fmt={v => v.toFixed(2) + ' %'} />
          <Slider label="Durée" value={active.duree} min={5} max={30} step={1}
            onChange={v => set('duree', v)} fmt={v => v + ' ans'} />
          <Slider label="Apport" value={active.apport} min={0} max={200000} step={1000}
            onChange={v => set('apport', v)} fmt={v => v.toLocaleString('fr-FR') + ' €'} />
          <Slider label="Budget travaux" value={active.budgetTravaux} min={0} max={100000} step={1000}
            onChange={v => set('budgetTravaux', v)} fmt={v => v.toLocaleString('fr-FR') + ' €'} />

          <div className="border-t border-green-100 pt-3 mt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Prêt à Taux Zéro (PTZ)</span>
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
            {!active.ptzActif && (
              <p className="text-xs text-slate-400">Activer si éligible (neuf, primo-accédant, zone A/B)</p>
            )}
          </div>
        </div>

        {/* Comparatif */}
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <h3 className="text-xs font-bold text-green-900 mb-4">Comparatif Ancien / Neuf</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'ANCIEN', prixM2: active.prixM2Ancien, surface: r.surfaceAncien, key: 'prixM2Ancien' as const },
              { label: 'NEUF',   prixM2: active.prixM2Neuf,   surface: r.surfaceNeuf,   key: 'prixM2Neuf' as const },
            ].map(col => (
              <div key={col.label} className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs font-semibold text-slate-500 mb-2">{col.label}</p>
                <PrixM2Input label="Prix/m²" value={col.prixM2} onChange={v => set(col.key, v)} />
                <p className="text-xs text-slate-500 mt-2">Surface accessible</p>
                <p className="text-2xl font-extrabold text-green-600">{Math.floor(col.surface)} m²</p>
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
