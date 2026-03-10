import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import api from '../services/api'
import EventForm from '../components/EventForm'
import { createEvent, updateEvent } from '../services/eventsService'

export default function Dashboard() {
  const { user, refreshProfile } = useContext(AuthContext)

  const [inscriptions, setInscriptions] = useState({ enCours: [], passes: [] })
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [pseudo, setPseudo] = useState('')
  const [savingPseudo, setSavingPseudo] = useState(false)

  useEffect(() => {
    setPseudo(user?.name || '')
  }, [user?.name])

  // Charge inscriptions + mes événements (pour TOUT user connecté)
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // Inscriptions de l'utilisateur
        const resIns = await api.get('/inscriptions/me');
        if (mounted) setInscriptions(resIns.data);

        // Mes événements (toujours, peu importe le rôle)
        const resMine = await api.get('/events/mine');
        if (mounted) setMyEvents(resMine.data || []);
      } catch (err) {
        console.error(err);
        if (mounted) setMyEvents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  const refreshMyEvents = async () => {
    if (!user) return;
    const resMine = await api.get('/events/mine');
    setMyEvents(resMine.data || []);
  };

  const refreshInscriptions = async () => {
    const resIns = await api.get('/inscriptions/me')
    setInscriptions(resIns.data)
  }

  // Désinscription à partir de l’ID d’inscription
  const handleCancelInscription = async (inscriptionId) => {
    if (!window.confirm('Confirmer la désinscription ?')) return
    try {
      await api.delete(`/inscriptions/${inscriptionId}`)
      await refreshInscriptions()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la désinscription.")
    }
  }

  const handleCreateEvent = async (formData) => {
    try {
      setSubmitting(true)
      await createEvent(formData)
      await refreshMyEvents()
      setShowCreate(false) // refermer le formulaire
      alert('Événement créé 🎉')
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la création de l’événement.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateEvent = async (formData) => {
    if (!editingId) return
    try {
      setSubmitting(true)
      await updateEvent(editingId, formData)
      await refreshMyEvents()
      setEditingId(null)
      alert('Événement modifié ✅')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || "Erreur lors de la modification de l’événement.")
    } finally {
      setSubmitting(false)
    }
  }

  // Suppression d’un événement créé
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Supprimer cet événement ?')) return
    try {
      setDeletingId(eventId)
      await api.delete(`/events/${eventId}`)
      await refreshMyEvents()
      alert('Événement supprimé.')
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la suppression.")
    } finally {
      setDeletingId(null)
    }
  }

  const getPhotoUrl = (photo) => {
    if (!photo) return ''
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '')
    return `${apiBase}${photo.startsWith('/') ? photo : `/${photo}`}`
  }

  const handleUpdatePseudo = async (e) => {
    e.preventDefault()

    const normalized = (pseudo || '').trim()
    if (!normalized) {
      alert('Le pseudo est obligatoire.')
      return
    }

    if (!/^[A-Za-z0-9]+$/.test(normalized)) {
      alert('Le pseudo doit contenir uniquement des lettres et des chiffres.')
      return
    }

    try {
      setSavingPseudo(true)
      await api.put('/users/me', { name: normalized })
      await refreshProfile?.()
      alert('Pseudo modifié ✅')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Erreur lors de la modification du pseudo.')
    } finally {
      setSavingPseudo(false)
    }
  }

  if (loading) return <p className="p-6">Chargement…</p>

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 space-y-10">
      <h1 className="text-2xl font-bold">Bonjour, {user?.name}</h1>

      <section className="bg-gray-50 rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-3">Mon pseudo</h2>
        <form onSubmit={handleUpdatePseudo} className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="Pseudo (lettres et chiffres)"
            className="border p-2 rounded w-full md:max-w-sm"
            maxLength={30}
            required
          />
          <button
            type="submit"
            disabled={savingPseudo}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-60"
          >
            {savingPseudo ? 'Enregistrement…' : 'Modifier mon pseudo'}
          </button>
        </form>
      </section>

      {/* ——— Mes inscriptions ——— */}
      <section className="bg-gray-50 rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-3">Mes inscriptions en cours</h2>
        {inscriptions.enCours?.length ? (
          <ul className="space-y-2">
            {inscriptions.enCours.map((i) => (
              <li key={i.id || i._id} className="bg-white p-3 rounded shadow flex justify-between items-center">
                <div>
                  <strong>{i.event?.title}</strong>{' '}
                  <span className="text-sm text-gray-600">— {new Date(i.event?.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <button
                  onClick={() => handleCancelInscription(i.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Se désinscrire
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucune inscription en cours.</p>
        )}

        <h3 className="text-lg font-semibold mt-6 mb-2">Événements passés</h3>
        {inscriptions.passes?.length ? (
          <ul className="space-y-2">
            {inscriptions.passes.map((i) => (
              <li key={i.id || i._id} className="bg-gray-200 p-3 rounded flex justify-between items-center text-gray-700">
                <div>
                  <strong>{i.event?.title}</strong>{' '}
                  <span className="text-sm text-gray-600">— {new Date(i.event?.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <span className="italic text-sm">(terminé)</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun événement passé.</p>
        )}
      </section>

      {/* ——— Mes événements (désormais pour TOUT user connecté) ——— */}
      {user && (
        <section className="bg-gray-50 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Mes événements</h2>
            <button
              onClick={() => setShowCreate((s) => !s)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showCreate ? 'Fermer' : 'Créer un événement'}
            </button>
          </div>

          {/* Formulaire repliable */}
          {showCreate && (
            <div className="mb-6">
              <EventForm
                onSubmit={handleCreateEvent}
                initial={{}}
                isLoading={submitting}
              />
            </div>
          )}

          {/* Liste de MES événements */}
          {myEvents.length === 0 ? (
            <p>Tu n’as pas encore créé d’événement.</p>
          ) : (
            <ul className="space-y-2">
              {myEvents.map((ev) => (
                <li key={ev.id} className="bg-white p-3 rounded shadow flex flex-wrap md:flex-nowrap md:items-center justify-between gap-2">
                  <div>
                    {Array.isArray(ev.photos) && ev.photos.length > 0 && (
                      <img
                        src={getPhotoUrl(ev.photos[0])}
                        alt={ev.title}
                        className="w-20 h-20 object-cover rounded mb-2"
                      />
                    )}
                    <strong>{ev.title}</strong>{' '}
                    <span className="text-sm text-gray-600">
                      — {ev.location} — {new Date(ev.date).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(ev.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      disabled={deletingId === ev.id}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-60"
                    >
                      {deletingId === ev.id ? 'Suppression…' : 'Supprimer'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {editingId && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Modifier mon événement</h3>
              <EventForm
                onSubmit={handleUpdateEvent}
                initial={myEvents.find((e) => e.id === editingId) || {}}
                isLoading={submitting}
              />
              <button
                onClick={() => setEditingId(null)}
                className="mt-3 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
