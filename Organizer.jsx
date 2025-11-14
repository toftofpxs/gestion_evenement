import React, { useEffect, useState } from 'react'
import api from '../services/api'
import EventForm from '../components/EventForm'

export default function Organizer(){
  const [events, setEvents] = useState([])

  useEffect(()=>{
    api.get('/events').then(res=> setEvents(res.data)).catch(()=>{})
  },[])

  const createEvent = async (payload)=>{
    await api.post('/events', payload)
    // recharger
    const res = await api.get('/events')
    setEvents(res.data)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Espace organisateur</h1>
      <div className="mt-4">
        <EventForm onSubmit={createEvent} />
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(e=> (
          <div key={e._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{e.title}</h3>
            <p className="text-sm">{e.location}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
