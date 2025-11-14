import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import EventCard from '../components/EventCard'
import { AuthContext } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useContext(AuthContext)
  const [events, setEvents] = useState([])
  const [userEventIds, setUserEventIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1) Récupère les événements
      const resEv = await api.get('/events')
      const list = Array.isArray(resEv.data) ? resEv.data : []
      setEvents(list)

      // 2) Si user connecté, récupère ses inscriptions
      if (user) {
        const resIns = await api.get('/inscriptions/me')
        // backend renvoie { enCours: [], passes: [] }
        const all = [
          ...(resIns.data?.enCours ?? []),
          ...(resIns.data?.passes ?? []),
        ]
        // on récupère les ID d’événements inscrits
        const ids = new Set(all.map(i => i.event?.id ?? i.event_id))
        setUserEventIds(ids)
      } else {
        setUserEventIds(new Set())
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError("Erreur lors du chargement des événements")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // recharger quand user change (login/logout)
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Chargement des événements...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Événements à venir</h1>

      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Aucun événement disponible pour le moment
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard
              key={event.id}               // ✅ Drizzle: id numérique
              event={event}
              isInscrit={userEventIds.has(event.id)}
              onChanged={fetchAll}         // ✅ pour rafraîchir après inscription/désinscription
            />
          ))}
        </div>
      )}
    </div>
  )
}
