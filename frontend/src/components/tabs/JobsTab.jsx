import { formatDate, deleteSession } from '../../utils/sessions'

const REC_COLORS = {
  'Strong fit':  'text-emerald-600 bg-emerald-50 border-emerald-200',
  'Good fit':    'text-sky-600 bg-sky-50 border-sky-200',
  'Partial fit': 'text-amber-600 bg-amber-50 border-amber-200',
  'Weak fit':    'text-red-600 bg-red-50 border-red-200',
}

function JobCard({ session, isActive, onLoad, onDelete }) {
  const top = session.data?.results?.[0]
  const topRec = top?.scores?.recommendation ?? ''

  return (
    <div className={`
      bg-white rounded-2xl border-2 shadow-sm p-5 transition-all
      ${isActive ? 'border-indigo-400 shadow-indigo-100 shadow-md' : 'border-slate-200 hover:border-indigo-200'}
    `}>
      {/* Active badge */}
      {isActive && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-600 text-white mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Active
        </span>
      )}

      {/* JD preview */}
      <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 mb-1">
        {session.jdPreview}
        {session.jdPreview.length >= 120 ? '…' : ''}
      </p>
      <p className="text-xs text-slate-400 mb-4">{formatDate(session.timestamp)}</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center px-2 py-2 bg-slate-50 rounded-xl">
          <p className="text-lg font-extrabold text-indigo-600">{session.candidateCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Candidates</p>
        </div>
        <div className="text-center px-2 py-2 bg-slate-50 rounded-xl">
          <p className="text-lg font-extrabold text-emerald-600">{session.topScore}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Top Score</p>
        </div>
        <div className="text-center px-2 py-2 bg-slate-50 rounded-xl">
          <p className="text-xs font-bold text-slate-700 truncate leading-tight mt-1">
            {session.topCandidate.replace(/\.(pdf|txt)$/i, '').split(/[_-]/).map(
              w => w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Top Candidate</p>
        </div>
      </div>

      {/* Top rec badge */}
      {topRec && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold mb-4 ${REC_COLORS[topRec] ?? ''}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
          {topRec}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onLoad(session)}
          className={`
            flex-1 py-2 rounded-xl text-sm font-semibold transition-colors
            ${isActive
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}
          `}
        >
          {isActive ? 'Loaded' : 'Load'}
        </button>
        <button
          onClick={() => onDelete(session.id)}
          className="px-3 py-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-colors"
          title="Delete session"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function JobsTab({ sessions, currentSessionId, onLoad, onNewJob, onRefresh }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium mb-1">No job postings yet</p>
        <p className="text-sm text-slate-400 mb-6">Screen resumes against a JD to create your first job posting.</p>
        <button onClick={onNewJob}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors">
          + New Job Posting
        </button>
      </div>
    )
  }

  const handleDelete = (id) => {
    if (window.confirm('Remove this job posting from history?')) {
      deleteSession(id)
      onRefresh()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Active Job Postings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {sessions.length} role{sessions.length !== 1 ? 's' : ''} · click a card to load its results
          </p>
        </div>
        <button
          onClick={onNewJob}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Job
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <JobCard
            key={session.id}
            session={session}
            isActive={session.id === currentSessionId}
            onLoad={onLoad}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
