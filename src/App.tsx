// src/App.tsx
import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { SimulationBar } from './components/SimulationBar'
import { SectionTabs } from './components/SectionTabs'
import { ProfilTab } from './components/tabs/ProfilTab'

type Section = 'profil' | 'simulation' | 'secteurs' | 'dossier'

export default function App() {
  const [section, setSection] = useState<Section>('simulation')

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <AppHeader />
      <SimulationBar />
      <SectionTabs active={section} onChange={setSection} />
      <main className="flex-1 p-5">
        {section === 'profil' && <ProfilTab />}
        {section !== 'profil' && <p className="text-slate-400 text-sm">Onglet : {section}</p>}
      </main>
    </div>
  )
}
