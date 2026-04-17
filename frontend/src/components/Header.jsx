import { useState } from 'react'
import SchedulerModal from './SchedulerModal'

export default function Header() {
  const [showScheduler, setShowScheduler] = useState(false)
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="py-6 flex items-center justify-between">

          {/* Logo + Brand */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md flex-shrink-0 border border-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight tracking-tight">
                RecruitR
              </h1>
              <p className="text-sm text-indigo-100 mt-1">
                Paste a job description, upload resumes, get ranked candidates instantly.
              </p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowScheduler(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold border border-white/40 backdrop-blur-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Interview
            </button>
            <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/20 text-white border border-white/40 backdrop-blur-sm">
              Beta
            </span>
          </div>

        </div>
      </div>

      {showScheduler && (
        <SchedulerModal
          candidate={{ filename: 'General Interview' }}
          jdPreview=""
          onClose={() => setShowScheduler(false)}
          onScheduled={() => {}}
        />
      )}
    </header>
  )
}
