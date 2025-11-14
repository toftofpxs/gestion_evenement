import React, { useState } from 'react'

export default function EventForm({ onSubmit, initial = {} }){
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [date, setDate] = useState(initial.date || '')
  const [location, setLocation] = useState(initial.location || '')

  const submit = (e)=>{
    e.preventDefault()
    onSubmit({ title, description, date, location })
    setTitle('')
    setDescription('')
    setDate('')
    setLocation('')
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre" className="border p-2 rounded w-full" />
      <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Lieu" className="border p-2 rounded w-full" />
      <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} className="border p-2 rounded w-full" />
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded w-full" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Enregistrer</button>
    </form>
  )
}
