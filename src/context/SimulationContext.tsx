// src/context/SimulationContext.tsx
import { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { Simulation } from '../types'
import { DEFAULT_SIMULATION, newSimulation } from '../data/defaultSimulation'
import { supabase } from '../lib/supabase'

const LS_SIMS = 'simulateur-immo:simulations'
const LS_ACTIVE = 'simulateur-immo:activeId'

function migrate(s: Simulation): Simulation {
  return { ...s, tauxCible: s.tauxCible ?? 35, nbOccupants: s.nbOccupants ?? 2, tauxAssurance: s.tauxAssurance ?? 0.25, typeNotaire: s.typeNotaire ?? 'ancien' }
}

function lsReadAndClear(): { simulations: Simulation[]; activeId: string } | null {
  try {
    const raw = localStorage.getItem(LS_SIMS)
    if (!raw) return null
    const simulations = (JSON.parse(raw) as Simulation[]).map(migrate)
    const saved = localStorage.getItem(LS_ACTIVE)
    const activeId = saved && simulations.some(s => s.id === saved) ? saved : simulations[0].id
    localStorage.removeItem(LS_SIMS)
    localStorage.removeItem(LS_ACTIVE)
    return { simulations, activeId }
  } catch { return null }
}

type SimCtx = {
  simulations: Simulation[]
  activeId: string
  active: Simulation
  loading: boolean
  setActive: (id: string) => void
  addSimulation: () => void
  updateActive: (updates: Partial<Simulation>) => void
  renameSimulation: (id: string, nom: string) => void
}

const SimulationContext = createContext<SimCtx | null>(null)

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const skipSync = useRef(false)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from('shared_state')
        .select('simulations, active_id')
        .eq('id', 'shared')
        .single()

      const remoteSims = data ? (data.simulations as Simulation[]) : []
      if (remoteSims.length > 0) {
        skipSync.current = true
        setSimulations(remoteSims.map(migrate))
        setActiveId(data!.active_id as string)
      } else {
        // Migration localStorage → Supabase, ou initialisation
        const ls = lsReadAndClear()
        const sims = ls?.simulations ?? [{ id: crypto.randomUUID(), ...DEFAULT_SIMULATION }]
        const aid  = ls?.activeId   ?? sims[0].id
        await supabase.from('shared_state').upsert({ id: 'shared', simulations: sims, active_id: aid })
        skipSync.current = true
        setSimulations(sims)
        setActiveId(aid)
      }

      setLoading(false)
    }

    init()

    const channel = supabase
      .channel('shared_state')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shared_state' }, payload => {
        const row = payload.new as { simulations: Simulation[]; active_id: string }
        skipSync.current = true
        setSimulations(row.simulations.map(migrate))
        setActiveId(row.active_id)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Sync vers Supabase avec debounce 500ms (évite de surcharger sur les sliders)
  useEffect(() => {
    if (loading) return
    if (skipSync.current) { skipSync.current = false; return }
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      supabase.from('shared_state').upsert({ id: 'shared', simulations, active_id: activeId })
    }, 500)
  }, [simulations, activeId, loading])

  const active = simulations.find(s => s.id === activeId) ?? simulations[0]

  function setActive(id: string) { setActiveId(id) }

  function addSimulation() {
    const sim = newSimulation()
    setSimulations(prev => [...prev, sim])
    setActiveId(sim.id)
  }

  function updateActive(updates: Partial<Simulation>) {
    setSimulations(prev => prev.map(s => s.id === activeId ? { ...s, ...updates } : s))
  }

  function renameSimulation(id: string, nom: string) {
    setSimulations(prev => prev.map(s => s.id === id ? { ...s, nom } : s))
  }

  return (
    <SimulationContext.Provider
      value={{ simulations, activeId, active, loading, setActive, addSimulation, updateActive, renameSimulation }}
    >
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}
