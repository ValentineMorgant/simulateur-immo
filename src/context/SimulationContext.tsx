// src/context/SimulationContext.tsx
import { createContext, useContext, useState } from 'react'
import type { Simulation } from '../types'
import { DEFAULT_SIMULATION, newSimulation } from '../data/defaultSimulation'

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
  const [simulations, setSimulations] = useState<Simulation[]>(() => [
    { id: crypto.randomUUID(), ...DEFAULT_SIMULATION }
  ])
  const [activeId, setActiveId] = useState<string>(simulations[0].id)

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
