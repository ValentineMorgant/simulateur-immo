// src/components/tabs/DossierTab.tsx
import { useSimulation } from '../../context/SimulationContext'
import { DOCUMENTS } from '../../types'

const CATEGORIES = [
  { id: 'identite' as const, label: 'Identité' },
  { id: 'revenus'  as const, label: 'Revenus' },
  { id: 'bancaire' as const, label: 'Situation bancaire' },
  { id: 'projet'   as const, label: 'Projet immobilier' },
]

function badgeClass(checked: number, total: number) {
  if (checked === total) return 'bg-green-100 text-green-700'
  if (checked === 0)     return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

export function DossierTab() {
  const { active, updateActive } = useSimulation()
  const dossier = active.dossier

  const total   = DOCUMENTS.length
  const checked = DOCUMENTS.filter(d => dossier[d.id]).length
  const pct     = total > 0 ? Math.round((checked / total) * 100) : 0

  function toggle(id: string) {
    updateActive({ dossier: { ...dossier, [id]: !dossier[id] } })
  }

  let statusText = 'Dossier incomplet'
  if (pct === 100) statusText = 'Dossier complet — prêt pour la banque ✓'
  else if (pct >= 50) statusText = `Dossier à compléter — ${total - checked} document${total - checked > 1 ? 's' : ''} manquant${total - checked > 1 ? 's' : ''}`
  else statusText = `Dossier incomplet — ${total - checked} documents manquants`

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-green-200 p-4 flex items-center gap-5">
        <div className="text-center min-w-[60px]">
          <p className="text-3xl font-extrabold text-green-600">{checked}</p>
          <p className="text-xs text-slate-400">/ {total} docs</p>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Progression du dossier</span>
            <span className="text-green-600 font-semibold">{pct}%</span>
          </div>
          <div className="h-2.5 bg-green-100 rounded-full">
            <div
              className="h-2.5 bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">{statusText}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map(cat => {
          const docs    = DOCUMENTS.filter(d => d.categorie === cat.id)
          const catDone = docs.filter(d => dossier[d.id]).length
          return (
            <div key={cat.id} className="bg-white rounded-xl border border-green-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-green-900">{cat.label}</h3>
                <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${badgeClass(catDone, docs.length)}`}>
                  {catDone}/{docs.length}{catDone === docs.length ? ' ✓' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {docs.map(doc => (
                  <label key={doc.id} className="flex items-start gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => toggle(doc.id)}
                      className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        dossier[doc.id]
                          ? 'bg-green-600 border-green-600'
                          : 'border-slate-300 group-hover:border-green-400'
                      }`}
                    >
                      {dossier[doc.id] && <span className="text-white text-xs leading-none">✓</span>}
                    </div>
                    <span
                      onClick={() => toggle(doc.id)}
                      className={`text-xs leading-relaxed ${dossier[doc.id] ? 'text-green-800 line-through decoration-green-400' : 'text-slate-600'}`}
                    >
                      {doc.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
