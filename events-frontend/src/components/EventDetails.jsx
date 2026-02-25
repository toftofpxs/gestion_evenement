import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../contexts/AuthContext'

export default function EventDetails() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inscrit, setInscrit] = useState(false)
  const { user } = useContext(AuthContext)

  // 🔹 Charger les infos de l'événement
  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`)
      setEvent(res.data)

      // Vérifie si l'utilisateur est déjà inscrit
      if (user && res.data.inscriptions) {
        const isIn = res.data.inscriptions.some(i => i.user_id === user.id)
        setInscrit(isIn)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Vérifie si l’événement est expiré
  const isExpired = (date) => new Date(date) < new Date()

  // 🔹 Inscription
  const handleInscription = async () => {
    if (!user) return alert('Connectez-vous pour vous inscrire')
    try {
      await api.post('/inscriptions', { event_id: id })
      alert('Inscription réussie 🎉')
      setInscrit(true)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de l’inscription')
    }
  }

  // 🔹 Désinscription
  const handleDesinscription = async () => {
    if (!window.confirm('Confirmer la désinscription ?')) return
    try {
      await api.delete(`/inscriptions/${id}`)
      alert('Désinscription effectuée ❌')
      setInscrit(false)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la désinscription')
    }
  }

  if (loading) return <div>Chargement...</div>
  if (!event) return <div>Événement introuvable.</div>

  const expired = isExpired(event.date)

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow mt-6">
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      <p className="text-sm text-gray-600">
        📍 {event.location} — 📅 {new Date(event.date).toLocaleString('fr-FR')}
      </p>

      <p className="mt-4 text-gray-700">{event.description}</p>

      {event.price > 0 && (
        <p className="mt-2 text-gray-800 font-semibold">
          💰 {event.price} €
        </p>
      )}

      <div className="mt-6">
        {expired ? (
          <p className="italic text-gray-500">⏰ Cet événement est terminé.</p>
        ) : user ? (
          inscrit ? (
            <button
              onClick={handleDesinscription}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Se désinscrire
            </button>
          ) : (
            <button
              onClick={handleInscription}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              S’inscrire
            </button>
          )
        ) : (
          <p className="text-sm text-gray-600 italic mt-2">
            Connectez-vous pour vous inscrire à cet événement.
          </p>
        )}
      </div>
    </div>
  )
}
