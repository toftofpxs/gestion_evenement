import React, { useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import EventForm from '../components/EventForm'
import { updateEvent as updateEventWithFiles } from '../services/eventsService'
import { AuthContext } from '../contexts/AuthContext'

export default function Admin() {
  const { user: currentUser } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [eventsSummary, setEventsSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // édition
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [processingUserId, setProcessingUserId] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState('')

  const getPhotoUrl = (photo) => {
    if (!photo) return ''
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '')
    return `${apiBase}${photo.startsWith('/') ? photo : `/${photo}`}`
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [resUsers, resEvents, resEventsSummary] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/events-all'),
          api.get('/admin/events-summary'),
        ])
        setUsers(resUsers.data || [])
        setEvents(resEvents.data || [])
        setEventsSummary(resEventsSummary.data || [])
      } catch (e) {
        console.error(e)
        setError("Impossible de charger les données admin.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const refreshUsers = async () => {
    const res = await api.get('/admin/users')
    setUsers(res.data || [])
  }

  const refreshEvents = async () => {
    const [resEvents, resEventsSummary] = await Promise.all([
      api.get('/admin/events-all'),
      api.get('/admin/events-summary'),
    ])
    setEvents(resEvents.data || [])
    setEventsSummary(resEventsSummary.data || [])
  }

  const participantsCountByEvent = useMemo(() => {
    const map = new Map()
    for (const row of eventsSummary) {
      map.set(row.id, Number(row.participantsCount || 0))
    }
    return map
  }, [eventsSummary])

  const organizerUsers = useMemo(() => {
    return users.filter((u) => u.role === 'organisateur' || u.role === 'organizer')
  }, [users])

  const eventsCountByOrganizer = useMemo(() => {
    const map = new Map()
    for (const row of eventsSummary) {
      const organizerId = row.organizer_id
      if (!organizerId) continue
      map.set(organizerId, (map.get(organizerId) || 0) + 1)
    }
    return map
  }, [eventsSummary])

  const selectedUser = useMemo(() => {
    const id = Number(selectedUserId)
    if (!id) return null
    return users.find((u) => Number(u.id) === id) || null
  }, [selectedUserId, users])

  const getRoleChipClass = (role) => {
    if (role === 'admin') return 'bg-red-100 text-red-700 border-red-200'
    if (role === 'organisateur' || role === 'organizer') return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    return 'bg-cyan-100 text-cyan-700 border-cyan-200'
  }

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'ADMIN'
    if (role === 'organisateur' || role === 'organizer') return 'ORG'
    return 'PART'
  }

  const startEdit = (ev) => setEditingId(ev.id ?? ev._id)

  const cancelEdit = () => setEditingId(null)

  const submitEdit = async (formData) => {
    try {
      setSaving(true)
      const id = editingId
      await updateEventWithFiles(id, formData)
      await refreshEvents()
      cancelEdit()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || "Erreur lors de la mise à jour.")
    } finally {
      setSaving(false)
    }
  }

  const deleteEvent = async (id) => {
    if (!window.confirm('Supprimer cet événement ?')) return
    try {
      setDeletingId(id)
      await api.delete(`/events/${id}`)
      setEvents((list) => list.filter((e) => (e.id ?? e._id) !== id))
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || "Suppression impossible.")
    } finally {
      setDeletingId(null)
    }
  }

  const handlePromoteUser = async (userId, userName) => {
    if (!window.confirm(`Promouvoir ${userName} en admin ?`)) return
    try {
      setProcessingUserId(userId)
      await api.post(`/admin/users/${userId}/promote`)
      await refreshUsers()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Erreur lors de la promotion utilisateur.')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleRenameUser = async (userId, currentName) => {
    const newName = window.prompt('Nouveau nom utilisateur :', currentName)
    if (newName === null) return
    const trimmed = newName.trim()
    if (!trimmed) {
      alert('Le nom ne peut pas être vide.')
      return
    }

    try {
      setProcessingUserId(userId)
      await api.patch(`/admin/users/${userId}/name`, { name: trimmed })
      await refreshUsers()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Erreur lors du changement de nom.')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleDemoteUser = async (userId, userName) => {
    if (!window.confirm(`Rétrograder ${userName} en participant ?`)) return
    try {
      setProcessingUserId(userId)
      await api.post(`/admin/users/${userId}/demote`)
      await refreshUsers()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Erreur lors de la rétrogradation utilisateur.')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleSetOrganizer = async (userId, userName) => {
    if (!window.confirm(`Passer ${userName} en organisateur ?`)) return
    try {
      setProcessingUserId(userId)
      await api.post(`/admin/users/${userId}/set-organizer`)
      await refreshUsers()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Erreur lors du passage en organisateur.')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleSetParticipant = async (userId, userName) => {
    if (!window.confirm(`Passer ${userName} en participant ?`)) return
    try {
      setProcessingUserId(userId)
      await api.post(`/admin/users/${userId}/set-participant`)
      await refreshUsers()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Erreur lors du passage en participant.')
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleDeleteUser = async (userId, userName, userRole) => {
    if (userRole === 'admin') {
      alert('Les admins ne peuvent pas se supprimer entre eux.')
      return
    }

    if (!window.confirm(`Supprimer le compte de ${userName} ?`)) return

    try {
      setProcessingUserId(userId)
      await api.delete(`/admin/users/${userId}`)
      await refreshUsers()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Erreur lors de la suppression utilisateur.')
    } finally {
      setProcessingUserId(null)
    }
  }

  if (loading) return <div className="p-6">Chargement…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-2xl font-bold">Espace admin</h1>

      {/* Statistiques */}
      <section className="bg-gray-50 rounded-lg p-4 shadow space-y-4">
        <h2 className="text-xl font-semibold">Statistiques du site</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded p-3 shadow-sm">
            <p className="text-sm text-gray-600">Personnes inscrites</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-white rounded p-3 shadow-sm">
            <p className="text-sm text-gray-600">Nombre d'organisateurs</p>
            <p className="text-2xl font-bold">{organizerUsers.length}</p>
          </div>
          <div className="bg-white rounded p-3 shadow-sm">
            <p className="text-sm text-gray-600">Événements créés</p>
            <p className="text-2xl font-bold">{events.length}</p>
          </div>
        </div>

        <div className="bg-white rounded p-3 shadow-sm">
          <label className="block text-sm text-gray-600 mb-2">Liste déroulante de tous les users</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Sélectionner un user --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>

          {selectedUser && (
            <div className="mt-3 text-sm text-gray-700">
              <p><strong>Nom :</strong> {selectedUser.name}</p>
              <p><strong>Email :</strong> {selectedUser.email}</p>
              <p><strong>Rôle :</strong> {selectedUser.role}</p>
              <p><strong>Événements créés :</strong> {eventsCountByOrganizer.get(Number(selectedUser.id)) || 0}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded p-3 shadow-sm">
          <h3 className="font-semibold mb-2">Organisateurs et nombre d'événements créés</h3>
          {organizerUsers.length === 0 ? (
            <p className="text-sm text-gray-600">Aucun organisateur trouvé.</p>
          ) : (
            <ul className="space-y-2">
              {organizerUsers.map((org) => (
                <li key={org.id} className="flex items-center justify-between border rounded px-3 py-2">
                  <span>{org.name} <span className="text-gray-500">({org.email})</span></span>
                  <span className="font-semibold">{eventsCountByOrganizer.get(Number(org.id)) || 0} événement(s)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Utilisateurs */}
      <section className="bg-gray-50 rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-3">Utilisateurs</h2>
        <ul className="divide-y">
          {users.map((u) => (
            <li key={u.id ?? u._id} className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded border ${getRoleChipClass(u.role)}`}>
                  {getRoleLabel(u.role)}
                </span>
                <div>
                  <span className="font-medium">{u.name}</span>{' '}
                  <span className="text-gray-600">— {u.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm px-2 py-1 rounded bg-gray-200">{u.role}</span>

                <button
                  type="button"
                  onClick={() => handleRenameUser(u.id, u.name)}
                  disabled={processingUserId === u.id}
                  className="px-3 py-1 rounded bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  Renommer
                </button>

                {u.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => handlePromoteUser(u.id, u.name)}
                    disabled={processingUserId === u.id}
                    className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    Promouvoir
                  </button>
                )}

                {u.role !== 'admin' && u.role !== 'organisateur' && (
                  <button
                    type="button"
                    onClick={() => handleSetOrganizer(u.id, u.name)}
                    disabled={processingUserId === u.id}
                    className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    Organisateur
                  </button>
                )}

                {u.role !== 'admin' && u.role !== 'participant' && (
                  <button
                    type="button"
                    onClick={() => handleSetParticipant(u.id, u.name)}
                    disabled={processingUserId === u.id}
                    className="px-3 py-1 rounded bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
                  >
                    Participant
                  </button>
                )}

                {u.role === 'admin' && u.id !== currentUser?.id && (
                  <button
                    type="button"
                    onClick={() => handleDemoteUser(u.id, u.name)}
                    disabled={processingUserId === u.id}
                    className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                  >
                    Rétrograder
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteUser(u.id, u.name, u.role)}
                  disabled={processingUserId === u.id || u.role === 'admin' || u.id === currentUser?.id}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  title={u.role === 'admin' ? 'Suppression admin interdite' : u.id === currentUser?.id ? 'Vous ne pouvez pas vous supprimer' : ''}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Événements */}
      <section className="bg-gray-50 rounded-lg p-4 shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Tous les événements</h2>
          <button
            onClick={refreshEvents}
            className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-black"
          >
            Rafraîchir
          </button>
        </div>

        {events.length === 0 ? (
          <p>Aucun événement.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((ev, idx) => {
              const id = ev.id ?? ev._id ?? idx
              const isEditing = editingId === id

              return (
                <li key={id} className="bg-white rounded shadow p-3">
                  {!isEditing ? (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        {Array.isArray(ev.photos) && ev.photos.length > 0 && (
                          <img
                            src={getPhotoUrl(ev.photos[0])}
                            alt={ev.title}
                            className="w-24 h-24 object-cover rounded mb-2"
                          />
                        )}
                        <div className="font-semibold">{ev.title}</div>
                        <div className="text-sm text-gray-600">
                          {ev.location} — {formatDateTime(ev.date)}
                        </div>
                        {ev.price != null && (
                          <div className="text-sm text-gray-700">Prix : {Number(ev.price)} €</div>
                        )}
                        <div className="text-sm text-gray-700">Participants : {participantsCountByEvent.get(Number(id)) || 0}</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(ev)}
                          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteEvent(id)}
                          disabled={deletingId === id}
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {deletingId === id ? 'Suppression…' : 'Supprimer'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <EventForm
                        onSubmit={submitEdit}
                        initial={events.find((e) => (e.id ?? e._id) === id) || {}}
                        isLoading={saving}
                      />
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

/* ---------- Helpers ---------- */

// format pour affichage (fr-FR)
function formatDateTime(value) {
  try {
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleString('fr-FR')
  } catch {
    return ''
  }
}

