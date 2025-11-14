import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export default function NavBar(){
  const { user, logout } = useContext(AuthContext)
  const nav = useNavigate()

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">Hangout</Link>
        <nav className="flex items-center gap-4">
          <Link to="/">Événements</Link>
          {!user && <><Link to="/login">Se connecter</Link><Link to="/register">S'inscrire</Link></>}
          {user && (
            <>
              <Link to="/dashboard">Mon compte</Link>
              {user.role === 'organisateur' && <Link to="/organizer">Organisateur</Link>}
              {user.role === 'admin' && <Link to="/admin">Admin</Link>}
              <button onClick={()=>{ logout(); nav('/') }} className="ml-2">Déconnexion</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
