// src/components/tabs/SecteursTab.tsx
import { useState, useMemo } from 'react'
import { useSimulation } from '../../context/SimulationContext'
import { calculer } from '../../utils/calculs'
import { SECTEURS } from '../../data/secteurs'

type SortKey = 'ville' | 'trajetMin' | 'prixAncien' | 'prixNeuf' | 'surfaceAncien' | 'surfaceNeuf'
type Filter = 'all' | 'A' | 'B' | 'C' | 'D' | 'E'

const LINE_COLORS: Record<string, string> = {
  A: 'bg-red-100 text-red-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-green-100 text-green-700',
  E: 'bg-purple-100 text-purple-700',
}

type ThProps = {
  label: string
  k: SortKey
  sortKey: SortKey
  sortAsc: boolean
  onToggle: (k: SortKey) => void
}

function Th({ label, k, sortKey, sortAsc, onToggle }: ThProps) {
  return (
    <th
      onClick={() => onToggle(k)}
      className="px-4 py-2.5 text-left text-xs font-semibold tracking-wide cursor-pointer select-none hover:bg-green-800 transition-colors"
    >
      {label} {sortKey === k ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  )
}

export function SecteursTab() {
  const { active } = useSimulation()
  const r = calculer(active)
  const [filter, setFilter] = useState<Filter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('prixAncien')
  const [sortAsc, setSortAsc] = useState(true)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const rows = useMemo(() => {
    const filtered = filter === 'all'
      ? SECTEURS
      : SECTEURS.filter(s => s.lignes.includes(filter))

    return [...filtered]
      .map(s => ({
        ...s,
        surfaceAncien: s.prixAncien > 0 ? r.prixMaxBien / s.prixAncien : 0,
        surfaceNeuf:   s.prixNeuf   > 0 ? r.prixMaxBien / s.prixNeuf   : 0,
      }))
      .sort((a, b) => {
        const va = a[sortKey as keyof typeof a] as number | string
        const vb = b[sortKey as keyof typeof b] as number | string
        const cmp = typeof va === 'string' ? (va as string).localeCompare(vb as string) : (va as number) - (vb as number)
        return sortAsc ? cmp : -cmp
      })
  }, [filter, sortKey, sortAsc, r.prixMaxBien])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">Filtrer :</span>
        {(['all', 'A', 'B', 'C', 'D', 'E'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filter === f ? 'bg-green-600 text-white' : 'bg-white border border-slate-300 text-slate-500 hover:border-green-400'
            }`}
          >
            {f === 'all' ? 'Toutes les lignes' : `RER ${f}`}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          Budget max : <strong className="text-green-700">{Math.round(r.prixMaxBien).toLocaleString('fr-FR')} €</strong>
        </span>
      </div>

      <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-green-900 text-white text-xs">
            <tr>
              <Th label="Ville" k="ville" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
              <th className="px-4 py-2.5 text-left text-xs font-semibold">Ligne(s)</th>
              <Th label="Trajet → Auber" k="trajetMin" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
              <Th label="Prix ancien /m²" k="prixAncien" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
              <Th label="Prix neuf /m²" k="prixNeuf" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
              <Th label="Surface accessible" k="surfaceAncien" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
              <Th label="Surface (neuf)" k="surfaceNeuf" sortKey={sortKey} sortAsc={sortAsc} onToggle={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={s.ville} className={i % 2 === 0 ? 'bg-green-50/40' : 'bg-white'}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-green-900">{s.ville}</p>
                  <p className="text-xs text-slate-400">{s.departement}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {s.lignes.length > 0
                      ? s.lignes.map(l => (
                          <span key={l} className={`text-xs font-bold rounded px-1.5 py-0.5 ${LINE_COLORS[l] ?? 'bg-slate-100 text-slate-600'}`}>{l}</span>
                        ))
                      : <span className="text-xs text-slate-400">—</span>
                    }
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{s.trajetMin} min</td>
                <td className="px-4 py-3 font-semibold text-green-900">{s.prixAncien.toLocaleString('fr-FR')} €</td>
                <td className="px-4 py-3 font-semibold text-green-900">{s.prixNeuf.toLocaleString('fr-FR')} €</td>
                <td className="px-4 py-3">
                  <span className="text-lg font-extrabold text-green-600">{Math.floor(s.surfaceAncien)} m²</span>
                  <span className="text-xs text-slate-400 ml-1">(ancien)</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-lg font-extrabold text-green-600">{Math.floor(s.surfaceNeuf)} m²</span>
                  <span className="text-xs text-slate-400 ml-1">(neuf)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 text-center">Prix indicatifs 2024-2025. Trajets estimés vers <strong>Auber</strong> (RER A), correspondance incluse. Surface calculée sur le budget max de la simulation active.</p>
    </div>
  )
}
