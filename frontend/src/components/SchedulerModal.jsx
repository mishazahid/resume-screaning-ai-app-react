import { useState } from 'react'

function formatGCalDate(date, time) {
  const pad = n => String(n).padStart(2, '0')
  const dt = new Date(`${date}T${time}`)
  return `${dt.getFullYear()}${pad(dt.getMonth()+1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`
}

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  const pad = n => String(n).padStart(2, '0')
  return `${pad(Math.floor(total/60) % 24)}:${pad(total % 60)}`
}

const DURATIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
]

export default function SchedulerModal({ candidate, jdPreview, onClose, onScheduled }) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate]         = useState(today)
  const [time, setTime]         = useState('10:00')
  const [duration, setDuration] = useState(45)
  const [scheduled, setScheduled] = useState(false)

  const name = candidate.filename
    .replace(/\.(pdf|txt)$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  const handleSchedule = () => {
    const startStr = formatGCalDate(date, time)
    const endStr   = formatGCalDate(date, addMinutes(time, duration))

    const calUrl = [
      'https://calendar.google.com/calendar/render?action=TEMPLATE',
      `&text=${encodeURIComponent(`Interview with ${name}`)}`,
      `&details=${encodeURIComponent(`Candidate interview for: ${jdPreview.slice(0, 100)}`)}`,
      `&dates=${startStr}/${endStr}`,
    ].join('')

    // Save to localStorage
    const slot = { date, time, duration, name, filename: candidate.filename }
    localStorage.setItem(`interview:${candidate.filename}`, JSON.stringify(slot))

    // Notify parent
    onScheduled(slot)

    // Open Google Calendar
    window.open(calUrl, '_blank')
    setScheduled(true)
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Schedule Interview</h2>
              <p className="text-xs text-slate-400">with {name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {scheduled ? (
            <div className="rounded-xl p-5 text-center bg-violet-50 border border-violet-200">
              <div className="w-12 h-12 rounded-full bg-violet-100 mx-auto mb-3 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-violet-800 mb-1">Interview Scheduled!</p>
              <p className="text-xs text-slate-500">Google Calendar has been opened with the event details.</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(`${date}T${time}`).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })} at {time}
              </p>
              <button onClick={onClose}
                className="mt-4 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Interview Date</label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* Time */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Start Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        duration === d.value
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Opens <strong>Google Calendar</strong> with a pre-filled {duration}-minute event.
                  The slot will also appear on this candidate's card.
                </p>
              </div>

              {/* Schedule button */}
              <button
                onClick={handleSchedule}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule &amp; Open Google Calendar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
