// src/components/AppHeader.tsx
export function AppHeader() {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <header className="bg-green-900 text-white px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-base font-bold tracking-wide">🏡 Simulateur Immobilier</h1>
        <p className="text-xs text-green-300">Île-de-France · Achat en couple</p>
      </div>
      <span className="text-xs text-green-400">{today}</span>
    </header>
  )
}
