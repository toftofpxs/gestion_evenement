import React, { useEffect, useState } from 'react'

export default function EventForm({ onSubmit, initial = {}, isLoading = false }){
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [date, setDate] = useState(initial.date || '')
  const [location, setLocation] = useState(initial.location || '')
  const [price, setPrice] = useState(initial.price || '')
  const [capacity, setCapacity] = useState(initial.capacity ?? '')
  const [photos, setPhotos] = useState([])
  const [existingPhotos, setExistingPhotos] = useState(initial.photos || [])
  const [photoPreviews, setPhotoPreviews] = useState([])

  useEffect(() => {
    setTitle(initial.title || '')
    setDescription(initial.description || '')
    setDate(initial.date || '')
    setLocation(initial.location || '')
    setPrice(initial.price || '')
    setCapacity(initial.capacity ?? '')
    setPhotos([])
    setExistingPhotos(initial.photos || [])
    setPhotoPreviews([])
  }, [initial])

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || [])
    setPhotos(files)
    
    const previews = files.map(file => URL.createObjectURL(file))
    setPhotoPreviews(previews)
  }

  const handleRemoveNewPhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index))
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index))
  }

  const handleRemoveExistingPhoto = (index) => {
    setExistingPhotos(existingPhotos.filter((_, i) => i !== index))
  }

  const submit = (e)=>{
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('title', title)
    formData.append('location', location)
    formData.append('date', date)
    formData.append('description', description)
    formData.append('price', price || 0)
    formData.append('capacity', capacity)
    
    // Ajouter photos existantes
    if (existingPhotos.length > 0) {
      formData.append('photos', JSON.stringify(existingPhotos))
    }
    
    // Ajouter nouvelles photos
    photos.forEach(photo => {
      formData.append('photos', photo)
    })

    onSubmit(formData)
    
    setTitle('')
    setDescription('')
    setDate('')
    setLocation('')
    setPrice('')
    setCapacity('')
    setPhotos([])
    setExistingPhotos([])
    setPhotoPreviews([])
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
      <input 
        value={title} 
        onChange={e=>setTitle(e.target.value)} 
        placeholder="Titre" 
        required
        className="border p-2 rounded w-full" 
      />
      <input 
        value={location} 
        onChange={e=>setLocation(e.target.value)} 
        placeholder="Lieu" 
        required
        className="border p-2 rounded w-full" 
      />
      <input 
        type="datetime-local" 
        value={date} 
        onChange={e=>setDate(e.target.value)} 
        required
        className="border p-2 rounded w-full" 
      />
      <input 
        value={price} 
        onChange={e=>setPrice(e.target.value)} 
        placeholder="Prix (optionnel)" 
        type="number"
        step="0.01"
        className="border p-2 rounded w-full" 
      />
      <input
        value={capacity}
        onChange={e=>setCapacity(e.target.value)}
        placeholder="Limite de participants"
        type="number"
        min="1"
        required
        className="border p-2 rounded w-full"
      />
      <textarea 
        value={description} 
        onChange={e=>setDescription(e.target.value)} 
        placeholder="Description" 
        required
        className="border p-2 rounded w-full" 
      />
      
      {/* Photos existantes */}
      {existingPhotos.length > 0 && (
        <div>
          <label className="block font-semibold mb-2">Photos actuelles</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {existingPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img src={photo} alt={`Photo ${index}`} className="w-full h-32 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingPhoto(index)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded text-white text-2xl font-bold transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload photos */}
      <div>
        <label className="block font-semibold mb-2">Ajouter des photos (max 5)</label>
        <input 
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoChange}
          disabled={photos.length >= 5}
          className="border p-2 rounded w-full"
        />
        
        {/* Aperçus des nouvelles photos */}
        {photoPreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img src={preview} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handleRemoveNewPhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button 
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  )
}
