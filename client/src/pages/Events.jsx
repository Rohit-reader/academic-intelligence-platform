import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { TestTube, Plus } from 'lucide-react';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('WORKSHOP');
  const [date, setDate] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [description, setDescription] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/events');
      if (res.success) setEvents(res.data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchAPI('/events', {
        method: 'POST',
        body: {
          title,
          type,
          date,
          startTime: '09:00',
          endTime: '17:00',
          organizer: organizer || 'Department ACM Chapter',
          description,
        },
      });

      if (res.success) {
        alert('Event created successfully!');
        setTitle('');
        setDate('');
        setDescription('');
        loadEvents();
      }
    } catch (err) {
      alert(err.message || 'Failed to create event');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
          <TestTube className="w-5 h-5 text-[#7C3AED]" /> Workshops, Seminars & Placement Drives
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5 font-medium">Schedule co-curricular activities, evaluate room availability, and check academic timetable conflicts.</p>
      </div>

      {/* Event Form */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Schedule New Event</h3>

        <form onSubmit={handleCreateEvent} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Advanced Tech & Computing Summit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">Event Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            >
              <option value="WORKSHOP">WORKSHOP</option>
              <option value="PLACEMENT">PLACEMENT</option>
              <option value="SEMINAR">SEMINAR</option>
              <option value="CULTURAL">CULTURAL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#0F172A] mb-1">Organizer & Description</label>
            <input
              type="text"
              placeholder="e.g. ACM Student Chapter - Hands-on Cloud Architecture Workshop"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Event
            </button>
          </div>
        </form>
      </div>

      {/* Events Roster */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Scheduled Academic & Placement Events</h3>

        {loading ? (
          <div className="p-8 text-center text-[#64748B] text-xs">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-xs">No events scheduled.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div key={ev._id} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#7C3AED]">{ev.title}</h4>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-[#7C3AED] border border-purple-200">
                    {ev.type}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] font-medium">{ev.description || 'No description provided.'}</p>
                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B] font-mono">
                  <span>{new Date(ev.date).toLocaleDateString()}</span>
                  <span>Org: {ev.organizer}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
