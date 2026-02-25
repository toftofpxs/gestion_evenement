import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export default function NavBar(){
  const { user, logout } = useContext(AuthContext)
  const nav = useNavigate()

  const isOrganizer = user?.role === 'organisateur' || user?.role === 'organizer'
  const isAdmin = user?.role === 'admin'

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">Hangout</Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className="hover:text-blue-600">Événements</Link>
          {!user && (
            <>
              <Link to="/login" className="hover:text-blue-600">Se connecter</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">S'inscrire</Link>
            </>
          )}
          {user && (
            <>
              {isOrganizer && <Link to="/organizer" className="text-green-600 font-semibold hover:text-green-700">Organisateur</Link>}
              <Link to="/dashboard" className="hover:text-blue-600">Mon compte</Link>
              {isAdmin && <Link to="/admin" className="text-purple-600 font-semibold hover:text-purple-700">Admin</Link>}
              <button 
                onClick={()=>{ logout(); nav('/') }} 
                className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Déconnexion
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
