// src/components/SimulationBar.tsx
import { useState } from 'react'
import { useSimulation } from '../context/SimulationContext'

export function SimulationBar() {
  const { simulations, activeId, setActive, addSimulation, renameSimulation } = useSimulation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  function startEdit(id: string, nom: string) {
    setEditingId(id)
    setEditValue(nom)
  }

  function commitEdit(id: string) {
    if (editValue.trim()) renameSimulation(id, editValue.trim())
    setEditingId(null)
  }

  return (
    <div className="bg-green-50 border-b border-green-200 px-5 py-2.5 flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500 font-medium">Simulations :</span>
      {simulations.map(sim => (
        <div key={sim.id}>
          {editingId === sim.id ? (
            <input
              autoFocus
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={() => commitEdit(sim.id)}
              onKeyDown={e => e.key === 'Enter' && commitEdit(sim.id)}
              className="border border-green-400 rounded-full px-3 py-1 text-xs outline-none bg-white"
            />
          ) : (
            <button
              onClick={() => setActive(sim.id)}
              onDoubleClick={() => startEdit(sim.id, sim.nom)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                sim.id === activeId
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white border border-slate-300 text-slate-500 hover:border-green-400'
              }`}
            >
              {sim.nom}
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addSimulation}
        className="rounded-full px-3 py-1 text-base leading-none text-green-600 border border-dashed border-green-400 hover:bg-green-100 transition-colors"
        title="Nouvelle simulation"
      >
        ＋
      </button>
    </div>
  )
}
