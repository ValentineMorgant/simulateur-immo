// src/components/AppHeader.tsx
import { useSimulation } from '../context/SimulationContext'

export function AppHeader() {
  const { syncStatus } = useSimulation()
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <header className="bg-green-900 text-white px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-base font-bold tracking-wide">🏡 Simulateur Immobilier</h1>
        <p className="text-xs text-green-300">Île-de-France · Achat en couple</p>
      </div>
      <div className="flex items-center gap-3">
        {syncStatus === 'saving' && (
          <span className="flex items-center gap-1.5 text-xs text-green-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Sauvegarde…
          </span>
        )}
        {syncStatus === 'error' && (
          <span className="flex items-center gap-1.5 text-xs text-red-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Erreur de sync
          </span>
        )}
        <span className="text-xs text-green-400">{today}</span>
      </div>
    </header>
  )
}
