import { useState } from 'react'
import { formatDate, deleteSession, clearAllSessions } from '../../utils/sessions'

function buildAllCsv(sessions) {
  const headers = ['Session ID','Date','JD Preview','Candidates','Top Score','Top Candidate']
  const rows = sessions.map((s) => [
    s.id, formatDate(s.timestamp),
    s.jdPreview.replace(/\n/g, ' '),
    s.candidateCount, s.topScore + '%',
    s.topCandidate.replace(/\.(pdf|txt)$/i, ''),
  ])
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
  return [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n')
}

export default function HistoryTab({ sessions, currentSessionId, onLoad, onRefresh }) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? sessions.filter((s) =>
        s.jdPreview.toLowerCase().includes(search.toLowerCase()) ||
        s.topCandidate.toLowerCase().includes(search.toLowerCase())
      )
    : sessions

  const handleDelete = (id) => {
    if (window.confirm('Delete this session from history?')) {
      deleteSession(id); onRefresh()
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Delete ALL screening history? This cannot be undone.')) {
      clearAllSessions(); onRefresh()
    }
  }

  const handleExportCsv = () => {
    const csv = buildAllCsv(sessions)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'screening_history.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium mb-1">No screening history yet</p>
        <p className="text-sm text-slate-400">Every screening session is automatically saved here.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1">
          <h2 className="text-base font-bold text-slate-800">Screening History (ATS Log)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} · fully searchable
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search history…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48"
          />
        </div>

        {/* Export CSV */}
        <button onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-slate-500 font-semibold">Date</th>
                <th className="px-5 py-3 text-left text-slate-500 font-semibold">Job Description</th>
                <th className="px-5 py-3 text-center text-slate-500 font-semibold">Candidates</th>
                <th className="px-5 py-3 text-center text-slate-500 font-semibold">Top Score</th>
                <th className="px-5 py-3 text-left text-slate-500 font-semibold">Top Candidate</th>
                <th className="px-5 py-3 text-right text-slate-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const isActive = s.id === currentSessionId
                return (
                  <tr key={s.id} className={`transition-colors ${isActive ? 'bg-indigo-50' : 'bg-white hover:bg-slate-50'}`}>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(s.timestamp)}
                    </td>
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <p className="text-slate-700 font-medium truncate">
                        {s.jdPreview}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-700">
                      {s.candidateCount}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-emerald-600">
                      {s.topScore}%
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-[160px] truncate">
                      {s.topCandidate.replace(/\.(pdf|txt)$/i, '')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isActive ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => onLoad(s)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                          >
                            Load
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No sessions match "{search}"
          </div>
        )}
      </div>

      {/* Clear all */}
      <div className="mt-4 text-right">
        <button onClick={handleClearAll}
          className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
          Clear all history
        </button>
      </div>
    </div>
  )
}
