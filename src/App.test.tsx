// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import App from './App'
import { SimulationProvider } from './context/SimulationContext'

test('renders the app', () => {
  render(
    <SimulationProvider>
      <App />
    </SimulationProvider>
  )
  expect(screen.getByText(/Simulateur Immobilier/i)).toBeInTheDocument()
})
