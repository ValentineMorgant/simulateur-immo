// src/components/tabs/ProfilTab.tsx
import { useSimulation } from '../../context/SimulationContext'
import { calculer } from '../../utils/calculs'
import { euros } from '../../utils/format'
import type { AcheteurData, Simulation } from '../../types'

function NumInput({ label, value, onChange, suffix = '€' }: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      <div className="flex items-center border border-green-200 rounded-lg bg-green-50 overflow-hidden focus-within:border-green-400">
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="flex-1 px-3 py-2 text-sm text-slate-800 bg-transparent outline-none"
        />
        <span className="px-3 text-sm text-green-600 font-medium">{suffix}</span>
      </div>
    </div>
  )
}

function TextInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-green-200 rounded-lg bg-green-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-400"
      />
    </div>
  )
}

function AcheteurCard({ num, data, onChange }: {
  num: 1 | 2
  data: AcheteurData
  onChange: (d: AcheteurData) => void
}) {
  const revenuRetenu = data.revenuFixe + data.revenuVariable * 0.7
  return (
    <div className="bg-white rounded-xl p-4 border border-green-200">
      <h3 className="text-xs font-bold text-green-900 mb-3 flex items-center gap-2">
        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{num}</span>
        Acheteur·se {num}
      </h3>
      <TextInput label="Prénom" value={data.nom} onChange={v => onChange({ ...data, nom: v })} />
      <NumInput label="Revenu fixe annuel net" value={data.revenuFixe} onChange={v => onChange({ ...data, revenuFixe: v })} />
      <NumInput label="Revenu variable annuel" value={data.revenuVariable} onChange={v => onChange({ ...data, revenuVariable: v })} />
      <div className="bg-green-50 rounded-lg px-3 py-2 text-xs text-slate-500 mt-1">
        Revenu retenu : <strong className="text-green-900">{euros(revenuRetenu)} / an</strong>
        {data.revenuVariable > 0 && <span className="block mt-0.5 text-slate-400">(variable compté à 70%)</span>}
      </div>
    </div>
  )
}

export function ProfilTab() {
  const { active, updateActive } = useSimulation()
  const r = calculer(active)

  function set<K extends keyof Simulation>(key: K, value: Simulation[K]) {
    updateActive({ [key]: value } as Partial<Simulation>)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <AcheteurCard num={1} data={active.acheteur1} onChange={v => set('acheteur1', v)} />
      <AcheteurCard num={2} data={active.acheteur2} onChange={v => set('acheteur2', v)} />

      <div className="bg-white rounded-xl p-4 border border-green-200">
        <h3 className="text-xs font-bold text-green-900 mb-3">Situation actuelle</h3>
        <NumInput label="Loyer mensuel actuel" value={active.loyerActuel} onChange={v => set('loyerActuel', v)} suffix="€/mois" />
        <NumInput label="Aide CAF mensuelle" value={active.aideCaf} onChange={v => set('aideCaf', v)} suffix="€/mois" />
        <p className="text-xs text-slate-400 mt-2">Ces informations sont données à titre indicatif.</p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-green-200">
        <h3 className="text-xs font-bold text-green-900 mb-3">Apport &amp; Synthèse</h3>
        <NumInput label="Apport disponible" value={active.apport} onChange={v => set('apport', v)} />
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 mt-2 space-y-1.5">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">Synthèse</p>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Revenus nets totaux / an</span><strong className="text-green-900">{euros(r.revenusAnnuels)}</strong></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Revenus nets / mois</span><strong className="text-green-900">{euros(r.revenusMensuels)}</strong></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Mensualité max (35%)</span><strong className="text-green-600">{euros(r.mensualiteMax)}</strong></div>
        </div>
      </div>
    </div>
  )
}
