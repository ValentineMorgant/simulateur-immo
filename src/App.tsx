// src/App.tsx
import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { SimulationBar } from './components/SimulationBar'
import { SectionTabs } from './components/SectionTabs'
import { ProfilTab } from './components/tabs/ProfilTab'
import { SimulationTab } from './components/tabs/SimulationTab'
import { SecteursTab } from './components/tabs/SecteursTab'
import { DossierTab } from './components/tabs/DossierTab'
import { AnnoncesTab } from './components/tabs/AnnoncesTab'
import { useSimulation } from './context/SimulationContext'

type Section = 'profil' | 'simulation' | 'secteurs' | 'annonces' | 'dossier'

function AppContent() {
  const { loading } = useSimulation()
  const [section, setSection] = useState<Section>('simulation')

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Connexion à la base de données…</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <SimulationBar />
      <SectionTabs active={section} onChange={setSection} />
      <main className="flex-1 p-5">
        {section === 'profil'     && <ProfilTab />}
        {section === 'simulation' && <SimulationTab />}
        {section === 'secteurs'   && <SecteursTab />}
        {section === 'annonces'   && <AnnoncesTab />}
        {section === 'dossier'    && <DossierTab />}
      </main>
    </>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <AppHeader />
      <AppContent />
    </div>
  )
}
