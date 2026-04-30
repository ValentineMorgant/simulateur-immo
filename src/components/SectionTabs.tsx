// src/components/SectionTabs.tsx
import { useSimulation } from '../context/SimulationContext'
import { DOCUMENTS } from '../types'

type Section = 'profil' | 'simulation' | 'secteurs' | 'dossier'

type Props = {
  active: Section
  onChange: (s: Section) => void
}

export function SectionTabs({ active, onChange }: Props) {
  const { active: sim } = useSimulation()
  const checked = DOCUMENTS.filter(d => sim.dossier[d.id]).length
  const total = DOCUMENTS.length

  const tabs: { id: Section; label: string; badge?: string }[] = [
    { id: 'profil',     label: 'Profil' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'secteurs',   label: 'Secteurs' },
    { id: 'dossier',    label: 'Dossier', badge: `${checked}/${total}` },
  ]

  return (
    <div className="bg-white border-b-2 border-green-200 px-5 flex">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium flex items-center gap-1.5 border-b-2 -mb-0.5 transition-colors ${
            tab.id === active
              ? 'text-green-600 border-green-600'
              : 'text-slate-500 border-transparent hover:text-green-600'
          }`}
        >
          {tab.label}
          {tab.badge && (
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${
              tab.id === active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
