import React, { useEffect, useState } from 'react'
import { createEvent, getMyEvents, updateEvent, deleteEvent } from '../services/eventsService'
import EventForm from '../components/EventForm'

export default function Organizer(){
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(()=>{
    loadEvents()
  },[])

  const loadEvents = async () => {
    try {
      const data = await getMyEvents()
      setEvents(data || [])
    } catch (err) {
      setError('Erreur lors du chargement des événements')
    }
  }

  const handleCreateEvent = async (formData) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await createEvent(formData)
      setSuccess('Événement créé avec succès!')
      await loadEvents()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEvent = async (formData) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await updateEvent(editingId, formData)
      setSuccess('Événement modifié avec succès!')
      setEditingId(null)
      await loadEvents()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return
    try {
      setDeletingId(eventId)
      await deleteEvent(eventId)
      await loadEvents()
      setSuccess('Événement supprimé avec succès!')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Mes événements</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche : Formulaire */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
          </h2>
          <EventForm 
            onSubmit={editingId ? handleUpdateEvent : handleCreateEvent}
            initial={editingId ? events.find(e => (e._id || e.id) === editingId) : {}}
            isLoading={loading}
          />
          {editingId && (
            <button 
              onClick={() => setEditingId(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Annuler la modification
            </button>
          )}
        </div>

        {/* Colonne droite : Liste des événements */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Événements ({events.length})</h2>
          {events.length === 0 ? (
            <p className="text-gray-500">Aucun événement créé pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div 
                  key={event._id || event.id} 
                  className={`bg-white p-4 rounded shadow hover:shadow-lg transition ${editingId === (event._id || event.id) ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {event.photos && event.photos.length > 0 && (
                    <div className="mb-3 max-h-40 overflow-hidden rounded">
                      <img 
                        src={event.photos[0]} 
                        alt={event.title}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.location}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  
                  {event.price && <p className="text-sm font-semibold text-blue-600 mt-2">{event.price}€</p>}
                  
                  {event.photos && event.photos.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">{event.photos.length} photo(s)</p>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setEditingId(event._id || event.id)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id || event.id)}
                      disabled={deletingId === (event._id || event.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
                    >
                      {deletingId === (event._id || event.id) ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
