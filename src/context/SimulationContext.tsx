// src/context/SimulationContext.tsx
import { createContext, useContext, useState, useEffect } from 'react'
import type { Simulation } from '../types'
import { DEFAULT_SIMULATION, newSimulation } from '../data/defaultSimulation'

const LS_SIMS = 'simulateur-immo:simulations'
const LS_ACTIVE = 'simulateur-immo:activeId'

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function lsSet(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

function migrate(s: Simulation): Simulation {
  return {
    tauxCible: 35,
    nbOccupants: 2,
    ...s,
  }
}

function loadSimulations(): Simulation[] {
  const raw = lsGet(LS_SIMS)
  if (raw) try { return (JSON.parse(raw) as Simulation[]).map(migrate) } catch { /* ignore */ }
  return [{ id: crypto.randomUUID(), ...DEFAULT_SIMULATION }]
}

function loadActiveId(simulations: Simulation[]): string {
  const saved = lsGet(LS_ACTIVE)
  if (saved && simulations.some(s => s.id === saved)) return saved
  return simulations[0].id
}

type SimCtx = {
  simulations: Simulation[]
  activeId: string
  active: Simulation
  setActive: (id: string) => void
  addSimulation: () => void
  updateActive: (updates: Partial<Simulation>) => void
  renameSimulation: (id: string, nom: string) => void
}

const SimulationContext = createContext<SimCtx | null>(null)

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [simulations, setSimulations] = useState<Simulation[]>(loadSimulations)
  const [activeId, setActiveId] = useState<string>(() => loadActiveId(simulations))

  useEffect(() => {
    lsSet(LS_SIMS, JSON.stringify(simulations))
  }, [simulations])

  useEffect(() => {
    lsSet(LS_ACTIVE, activeId)
  }, [activeId])

  const active = simulations.find(s => s.id === activeId) ?? simulations[0]

  function setActive(id: string) { setActiveId(id) }

  function addSimulation() {
    const sim = newSimulation()
    setSimulations(prev => [...prev, sim])
    setActiveId(sim.id)
  }

  function updateActive(updates: Partial<Simulation>) {
    setSimulations(prev =>
      prev.map(s => s.id === activeId ? { ...s, ...updates } : s)
    )
  }

  function renameSimulation(id: string, nom: string) {
    setSimulations(prev => prev.map(s => s.id === id ? { ...s, nom } : s))
  }

  return (
    <SimulationContext.Provider
      value={{ simulations, activeId, active, setActive, addSimulation, updateActive, renameSimulation }}
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
