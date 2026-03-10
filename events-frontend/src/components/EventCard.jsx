import React, { useContext, useState, useMemo, useEffect } from 'react'
import api from '../services/api'
import { AuthContext } from '../contexts/AuthContext'

export default function EventCard({ event, isInscrit, onChanged }) {
  const { user } = useContext(AuthContext)
  const [busy, setBusy] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const maxParticipants = Number(event.capacity || 100)
  const participantsCount = Number(event.participantsCount || 0)

  const photos = useMemo(() => {
    if (Array.isArray(event.photos)) return event.photos
    if (typeof event.photos === 'string') {
      try {
        const parsed = JSON.parse(event.photos)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }, [event.photos])

  const getPhotoUrl = (photo) => {
    if (!photo) return ''
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo

    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '')
    return `${apiBase}${photo.startsWith('/') ? photo : `/${photo}`}`
  }

  const photoUrls = useMemo(() => photos.map((photo) => getPhotoUrl(photo)), [photos])

  const goPrevPhoto = () => {
    if (!selectedPhoto || photoUrls.length <= 1) return
    const currentIndex = photoUrls.indexOf(selectedPhoto)
    if (currentIndex === -1) return
    const prevIndex = (currentIndex - 1 + photoUrls.length) % photoUrls.length
    setSelectedPhoto(photoUrls[prevIndex])
  }

  const goNextPhoto = () => {
    if (!selectedPhoto || photoUrls.length <= 1) return
    const currentIndex = photoUrls.indexOf(selectedPhoto)
    if (currentIndex === -1) return
    const nextIndex = (currentIndex + 1) % photoUrls.length
    setSelectedPhoto(photoUrls[nextIndex])
  }

  useEffect(() => {
    if (!selectedPhoto) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null)
      }
      if (e.key === 'ArrowLeft') {
        goPrevPhoto()
      }
      if (e.key === 'ArrowRight') {
        goNextPhoto()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhoto, photoUrls])

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
      <p className="text-sm font-semibold text-gray-700 mb-3">
        Participants : {participantsCount} / {maxParticipants}
      </p>

      <button
        onClick={() => setShowPhotos((prev) => !prev)}
        className="block mb-5 bg-black text-white px-4 py-2 rounded hover:bg-gray-900"
      >
        Voir évènements
      </button>

      {showPhotos && (
        <div className="mb-5">
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo, index) => (
                <img
                  key={`${event.id}-photo-${index}`}
                  src={getPhotoUrl(photo)}
                  alt={`${event.title} - photo ${index + 1}`}
                  className="w-full h-28 object-cover rounded cursor-pointer hover:opacity-90"
                  onClick={() => setSelectedPhoto(getPhotoUrl(photo))}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-gray-600">Aucune photo pour cet événement.</p>
          )}
        </div>
      )}

      <div className="mt-3">
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

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          {photoUrls.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goPrevPhoto()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white text-black rounded px-3 py-2 font-semibold"
            >
              ←
            </button>
          )}

          <img
            src={selectedPhoto}
            alt="Photo événement en grand"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {photoUrls.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goNextPhoto()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-black rounded px-3 py-2 font-semibold"
            >
              →
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 bg-white text-black rounded px-3 py-1 font-semibold"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  )
}
