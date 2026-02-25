import React, { useContext, useState, useMemo } from 'react'
import api from '../services/api'
import { AuthContext } from '../contexts/AuthContext'

export default function EventCard({ event, isInscrit, onChanged }) {
  const { user } = useContext(AuthContext)
  const [busy, setBusy] = useState(false)

  const expired = useMemo(() => {
    try {
      return new Date(event.date) < new Date()
    } catch {
      return false
    }
  }, [event.date])

  const handleInscription = async () => {
    if (!user) return alert("Connecte-toi pour t’inscrire")
    if (expired) return

    try {
      setBusy(true)
      // backend: POST /inscriptions  body: { event_id }
      await api.post('/inscriptions', { event_id: event.id })
      onChanged?.()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l’inscription.")
    } finally {
      setBusy(false)
    }
  }

  const handleDesinscription = async () => {
    if (!window.confirm('Confirmer la désinscription ?')) return
    try {
      setBusy(true)
      // Variante simple (recommandée): endpoint by-event
      // DELETE /inscriptions/by-event/:eventId
      await api.delete(`/inscriptions/by-event/${event.id}`)
      onChanged?.()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la désinscription.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={`p-5 rounded-lg shadow transition ${
        expired ? 'bg-gray-200 text-gray-500' : 'bg-white hover:shadow-lg'
      }`}
    >
      <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
      {event.description && (
        <p className="mb-1 text-gray-700 line-clamp-3">{event.description}</p>
      )}
      <p className="text-sm text-gray-600">
       {event.location} — {new Date(event.date).toLocaleDateString('fr-FR')}
      </p>
      <p className="text-sm text-gray-600 mb-3">
         {event.price ? `${event.price} €` : 'Gratuit'}
      </p>

      {!expired ? (
        user ? (
          isInscrit ? (
            <button
              onClick={handleDesinscription}
              disabled={busy}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-60"
            >
              Se désinscrire
            </button>
          ) : (
            <button
              onClick={handleInscription}
              disabled={busy}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              S’inscrire
            </button>
          )
        ) : (
          <p className="text-sm italic text-gray-600">Connecte-toi pour t’inscrire.</p>
        )
      ) : (
        <p className="italic text-gray-500 mt-2">⏰ Événement terminé</p>
      )}
    </div>
  )
}
