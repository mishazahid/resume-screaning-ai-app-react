import { useState } from 'react'
import { formatDate, deleteSession, clearAllSessions } from '../utils/sessions'

function SessionRow({ session, onLoad, onDelete }) {
  return (
    <div className="group border border-slate-200 rounded-xl p-3.5 bg-white hover:border-indigo-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onLoad(session)}>
          {/* JD preview */}
          <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-snug">
            {session.jdPreview}
            {session.jdPreview.length >= 120 ? '…' : ''}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[11px] text-slate-400">{formatDate(session.timestamp)}</span>
            <span className="text-[11px] font-medium text-indigo-600">
              {session.candidateCount} candidate{session.candidateCount !== 1 ? 's' : ''}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              Top: {session.topScore}%
            </span>
          </div>

          {/* Top candidate */}
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            #{1}: {session.topCandidate.replace(/\.(pdf|txt)$/i, '')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={() => onLoad(session)}
            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 px-2 py-0.5 rounded hover:bg-indigo-50 transition-colors"
          >
            Load
          </button>
          <button
            onClick={() => onDelete(session.id)}
            className="text-[11px] text-slate-400 hover:text-red-500 px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HistoryPanel({ open, onClose, sessions, onLoad, onRefresh }) {
  const [search, setSearch] = useState('')

  if (!open) return null

  const filtered = search
    ? sessions.filter((s) =>
        s.jdPreview.toLowerCase().includes(search.toLowerCase()) ||
        s.topCandidate.toLowerCase().includes(search.toLowerCase())
      )
    : sessions

  const handleDelete = (id) => {
    deleteSession(id)
    onRefresh()
  }

  const handleClearAll = () => {
    if (window.confirm('Delete all screening history? This cannot be undone.')) {
      clearAllSessions()
      onRefresh()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-800">Screening History</h2>
            <p className="text-xs text-slate-400">{sessions.length} session{sessions.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 bg-white border-b border-slate-100">
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
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 opacity-40"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">
                {search ? 'No sessions match your search.' : 'No history yet — run a screening first.'}
              </p>
            </div>
          ) : (
            filtered.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                onLoad={(s) => { onLoad(s); onClose() }}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {sessions.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-white">
            <button
              onClick={handleClearAll}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Clear all history
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
