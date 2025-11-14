import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // édition
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    location: '',
    date: '',
    price: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [resUsers, resEvents] = await Promise.all([
          api.get('/users'),     // nécessite un endpoint admin-only côté backend
          api.get('/events'),    // tous les événements (à venir + non expirés si tu nettoies côté back)
        ])
        setUsers(resUsers.data || [])
        setEvents(resEvents.data || [])
      } catch (e) {
        console.error(e)
        setError("Impossible de charger les données admin.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const refreshEvents = async () => {
    const res = await api.get('/events')
    setEvents(res.data || [])
  }

  const startEdit = (ev) => {
    setEditingId(ev.id ?? ev._id)
    setForm({
      title: ev.title || '',
      location: ev.location || '',
      date: toDatetimeLocal(ev.date),       // format pour <input type="datetime-local">
      price: ev.price ?? '',
      description: ev.description || '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ title: '', location: '', date: '', price: '', description: '' })
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const id = editingId
      await api.put(`/events/${id}`, {
        title: form.title,
        location: form.location,
        date: form.date,              // backend convertit en Date()
        price: form.price || '0',
        description: form.description,
      })
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

  if (loading) return <div className="p-6">Chargement…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-2xl font-bold">Espace admin</h1>

      {/* Utilisateurs */}
      <section className="bg-gray-50 rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-3">Utilisateurs</h2>
        <ul className="divide-y">
          {users.map((u) => (
            <li key={u.id ?? u._id} className="py-2 flex items-center justify-between">
              <div>
                <span className="font-medium">{u.name}</span>{' '}
                <span className="text-gray-600">— {u.email}</span>
              </div>
              <span className="text-sm px-2 py-1 rounded bg-gray-200">{u.role}</span>
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
                        <div className="font-semibold">{ev.title}</div>
                        <div className="text-sm text-gray-600">
                          {ev.location} — {formatDateTime(ev.date)}
                        </div>
                        {ev.price != null && (
                          <div className="text-sm text-gray-700">Prix : {Number(ev.price)} €</div>
                        )}
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
                    <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        className="border p-2 rounded"
                        placeholder="Titre"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                      <input
                        className="border p-2 rounded"
                        placeholder="Lieu"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        required
                      />
                      <input
                        type="datetime-local"
                        className="border p-2 rounded"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                      />
                      <input
                        type="number"
                        className="border p-2 rounded"
                        placeholder="Prix (€)"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        min="0" step="0.01"
                      />
                      <textarea
                        className="border p-2 rounded md:col-span-2"
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                      />
                      <div className="md:col-span-2 flex gap-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          {saving ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
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

// convertit une date ISO/Date vers "YYYY-MM-DDTHH:mm" pour <input type="datetime-local">
function toDatetimeLocal(value) {
  try {
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mn = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mn}`
  } catch {
    return ''
  }
}
