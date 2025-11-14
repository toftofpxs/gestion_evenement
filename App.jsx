import React from 'react'
import AppRoutes from './routes/AppRoutes'
import NavBar from './components/NavBar'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <AppRoutes />
      </main>
    </div>
  )
}
