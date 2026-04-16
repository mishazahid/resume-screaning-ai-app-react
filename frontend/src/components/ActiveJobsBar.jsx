import { formatDate } from '../utils/sessions'

/**
 * Horizontal strip showing saved job sessions as clickable tabs.
 * Appears below the header when at least one session exists.
 */
export default function ActiveJobsBar({ sessions, currentSessionId, onLoad, onHistory }) {
  if (!sessions || sessions.length === 0) return null

  // Show the 6 most recent sessions as tabs
  const visible = sessions.slice(0, 6)

  // Extract a short job-title from the JD preview (first non-empty line)
  function jobTitle(preview) {
    const first = preview.split('\n').find((l) => l.trim())?.trim() || preview
    return first.length > 32 ? first.slice(0, 32) + '…' : first
  }

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">

          {/* Label */}
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-2 flex-shrink-0">
            Active Jobs
          </span>

          {visible.map((s) => {
            const active = s.id === currentSessionId
            return (
              <button
                key={s.id}
                onClick={() => onLoad(s)}
                title={s.jdPreview}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-lg
                  text-xs font-medium transition-all duration-150 whitespace-nowrap
                  ${active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                  }
                `}
              >
                {/* Dot indicator */}
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-white' : 'bg-slate-400'}`} />

                {/* Job title */}
                <span>{jobTitle(s.jdPreview)}</span>

                {/* Candidate count badge */}
                <span className={`
                  text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${active ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-500'}
                `}>
                  {s.candidateCount}
                </span>
              </button>
            )
          })}

          {/* "See all" link if more than 6 */}
          {sessions.length > 6 && (
            <button
              onClick={onHistory}
              className="flex-shrink-0 text-xs text-indigo-500 hover:text-indigo-700 font-medium ml-1 whitespace-nowrap"
            >
              +{sessions.length - 6} more →
            </button>
          )}

          {/* New job button */}
          <button
            onClick={() => onLoad(null)}
            className="
              flex-shrink-0 ml-2 flex items-center gap-1 px-3 py-1.5
              rounded-lg border border-dashed border-slate-300 text-slate-400
              hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50
              text-xs font-medium transition-all whitespace-nowrap
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Job
          </button>

        </div>
      </div>
    </div>
  )
}
