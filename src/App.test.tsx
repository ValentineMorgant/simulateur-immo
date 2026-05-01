// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import App from './App'
import { SimulationProvider } from './context/SimulationContext'

test('renders the app header', () => {
  render(<SimulationProvider><App /></SimulationProvider>)
  // Header is always visible regardless of Supabase loading state
  expect(screen.getByText(/Simulateur Immobilier/i)).toBeInTheDocument()
})
