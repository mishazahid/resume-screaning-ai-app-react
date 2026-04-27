import { useState } from 'react'
import ScoreBreakdown from './ScoreBreakdown'
import { SkillPillGroup } from './SkillPills'
import EmailModal from './EmailModal'
import SchedulerModal from './SchedulerModal'

// ---------------------------------------------------------------------------
// Recommendation badge
// ---------------------------------------------------------------------------
const REC_STYLES = {
  'Strong fit':  { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  'Good fit':    { badge: 'bg-sky-100 text-sky-800 border-sky-300',             dot: 'bg-sky-500' },
  'Partial fit': { badge: 'bg-amber-100 text-amber-800 border-amber-300',       dot: 'bg-amber-500' },
  'Weak fit':    { badge: 'bg-red-100 text-red-800 border-red-300',             dot: 'bg-red-500' },
}

function RecBadge({ rec }) {
  const s = REC_STYLES[rec] ?? REC_STYLES['Weak fit']
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold
      ${s.badge}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {rec}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Score ring (large circular percentage)
// ---------------------------------------------------------------------------
function ScoreRing({ pct, rec }) {
  const colorMap = {
    'Strong fit':  'text-emerald-600',
    'Good fit':    'text-sky-600',
    'Partial fit': 'text-amber-600',
    'Weak fit':    'text-red-600',
  }
  return (
    <div className="flex flex-col items-center">
      <div className={`text-5xl font-extrabold tabular-nums ${colorMap[rec] ?? 'text-slate-700'}`}>
        {pct}
        <span className="text-2xl font-bold">%</span>
      </div>
      <p className="text-[11px] text-slate-400 mt-1 font-medium uppercase tracking-wide">Overall Score</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section checklist
// ---------------------------------------------------------------------------
const SECTION_LABELS = ['summary', 'skills', 'experience', 'education', 'projects']

function SectionChecklist({ sections }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sections Found</p>
      <ul className="space-y-1">
        {SECTION_LABELS.map((sec) => {
          const found = Boolean(sections?.[sec])
          return (
            <li key={sec} className="flex items-center gap-2 text-xs">
              {found ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-300 flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              )}
              <span className={found ? 'text-slate-700' : 'text-slate-400'}>
                {sec.charAt(0).toUpperCase() + sec.slice(1)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status Pipeline
// ---------------------------------------------------------------------------
const STATUSES = ['Screened', 'Interviewed', 'Offered', 'Hired', 'Rejected']
const STATUS_STYLES = {
  Screened:   'bg-slate-100  text-slate-600  border-slate-300',
  Interviewed:'bg-sky-100    text-sky-700    border-sky-300',
  Offered:    'bg-violet-100 text-violet-700 border-violet-300',
  Hired:      'bg-emerald-100 text-emerald-700 border-emerald-300',
  Rejected:   'bg-red-100    text-red-700    border-red-300',
}

function StatusPipeline({ filename }) {
  const key = `status:${filename}`
  const [status, setStatus] = useState(() => localStorage.getItem(key) || 'Screened')

  function handleChange(s) {
    setStatus(s)
    localStorage.setItem(key, s)
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => handleChange(s)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
            status === s
              ? STATUS_STYLES[s] + ' ring-2 ring-offset-1 ring-current'
              : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main CandidateCard
// ---------------------------------------------------------------------------
export default function CandidateCard({ result, rank, defaultOpen, jdPreview, selected, onToggleSelect }) {
  const [open, setOpen] = useState(defaultOpen)
  const [showEmail, setShowEmail]         = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [interview, setInterview]         = useState(() => {
    try { return JSON.parse(localStorage.getItem(`interview:${result.filename}`) || 'null') }
    catch { return null }
  })
  const [notes, setNotes] = useState(() =>
    localStorage.getItem(`notes:${result.filename}`) || ''
  )
  const [notesSaved, setNotesSaved] = useState(false)

  function handleNotesChange(e) {
    const val = e.target.value
    setNotes(val)
    localStorage.setItem(`notes:${result.filename}`, val)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 1500)
  }

  const { filename, scores, skill_match, explanation, sections, parse_error,
          education_label, experience_display,
          candidate_email, candidate_phone, candidate_linkedin, candidate_github } = result
  const rec = scores.recommendation
  const displayName = filename.replace(/\.(pdf|txt)$/i, '')
  const delta = scores.semantic_score - scores.tfidf_score
  const deltaDir = delta >= 0 ? 'above' : 'below'
  const interviewBadge = interview

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-colors ${selected ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200'}`}>

      {/* ── Card header ── */}
      <div className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors">

        {/* Checkbox */}
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleSelect(filename)}
            className="flex-shrink-0 w-4 h-4 rounded accent-indigo-600 cursor-pointer"
          />
        )}

        {/* Rank badge */}
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
          #{rank}
        </span>

        {/* Filename — clicking expands */}
        <button
          className="flex-1 text-left font-semibold text-slate-800 text-sm truncate"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {displayName}
        </button>

        {/* Score */}
        <span className="text-base font-extrabold text-slate-700 tabular-nums">
          {scores.final_score_pct}%
        </span>

        {/* Rec badge */}
        <RecBadge rec={rec} />

        {/* Schedule Interview */}
        <button
          onClick={() => setShowScheduler(true)}
          className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
            interviewBadge
              ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
              : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {interviewBadge ? 'Scheduled' : 'Schedule Interview'}
        </button>

        {/* Chevron */}
        <button onClick={() => setOpen((v) => !v)} className="flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

      </div>

      {/* ── Modals ── */}
      {showEmail && (
        <EmailModal
          candidate={result}
          jdPreview={jdPreview}
          onClose={() => setShowEmail(false)}
        />
      )}

      {showScheduler && (
        <SchedulerModal
          candidate={result}
          jdPreview={jdPreview}
          onClose={() => setShowScheduler(false)}
          onScheduled={(slot) => setInterview(slot)}
        />
      )}

      {/* ── Expanded body ── */}
      {open && (
        <div className="border-t border-slate-100 p-5 accordion-enter">

          {/* ── Status Pipeline ── */}
          <div className="mb-4 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</p>
            <StatusPipeline filename={filename} />
          </div>

          {/* ── Action buttons ── */}
          <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-slate-100">
            <button
              onClick={() => setShowEmail(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
              {result.candidate_email && (
                <span className="text-[10px] text-indigo-400 font-normal">({result.candidate_email})</span>
              )}
            </button>

            <button
              onClick={() => setShowScheduler(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Interview
            </button>

            {interview && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Interview: {new Date(`${interview.date}T${interview.time}`).toLocaleDateString('en-US', { month:'short', day:'numeric' })} at {interview.time}
              </span>
            )}
          </div>

          {parse_error ? (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              Could not parse this resume: {parse_error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* ── Column 1: Score & Insight ── */}
              <div>
                <div className="flex flex-col items-center py-4 bg-slate-50 rounded-xl mb-4">
                  <ScoreRing pct={scores.final_score_pct} rec={rec} />
                  <div className="mt-3">
                    <RecBadge rec={rec} />
                  </div>
                </div>

                {/* AI Insight */}
                {explanation && (
                  <div className="border-l-4 border-indigo-400 bg-indigo-50/60 rounded-r-xl px-3 py-3 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">
                      AI Insight
                    </p>
                    <div
                      className="explanation-html text-slate-700"
                      dangerouslySetInnerHTML={{ __html: explanation }}
                    />
                  </div>
                )}

                {/* Score bars */}
                <ScoreBreakdown scores={scores} />
              </div>

              {/* ── Column 2: Skills ── */}
              <div>
                <section className="mb-5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    Matched Skills
                    <span className="ml-auto font-bold text-emerald-600">{skill_match.matched.length}</span>
                  </h3>
                  <SkillPillGroup skills={skill_match.matched} variant="matched" emptyText="No matches found" />
                </section>

                <section className="mb-5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    Missing Skills
                    <span className="ml-auto font-bold text-red-600">{skill_match.missing.length}</span>
                  </h3>
                  <SkillPillGroup skills={skill_match.missing} variant="missing" emptyText="None — full coverage!" />
                </section>

                {skill_match.extra && skill_match.extra.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                      Bonus Skills
                      <span className="ml-auto text-slate-500 font-bold">{skill_match.extra.length}</span>
                    </h3>
                    <SkillPillGroup
                      skills={skill_match.extra.slice(0, 12)}
                      variant="extra"
                      emptyText=""
                    />
                    {skill_match.extra.length > 12 && (
                      <p className="text-xs text-slate-400 mt-1.5">
                        +{skill_match.extra.length - 12} more not shown
                      </p>
                    )}
                  </section>
                )}
              </div>

              {/* ── Column 3: Details ── */}
              <div className="space-y-5">

                {/* Scores detail */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Score Detail</p>

                  <DetailRow label="Semantic score" value={`${(scores.semantic_score * 100).toFixed(1)}%`} />
                  <DetailRow label="TF-IDF baseline" value={`${(scores.tfidf_score * 100).toFixed(1)}%`} />
                  <p className="text-[11px] text-slate-400 pl-0 pb-1">
                    Semantic is {Math.abs(delta * 100).toFixed(1)}% {deltaDir} TF-IDF
                  </p>

                  <div className="border-t border-slate-200 pt-2">
                    <DetailRow label="Experience" value={experience_display ?? 'Not detected'} />
                    <DetailRow label="Education"  value={education_label  ?? 'Not detected'} />
                    {scores.detected_jd_years && (
                      <DetailRow label="JD requires" value={`${scores.detected_jd_years}+ years`} />
                    )}
                  </div>
                </div>

                {/* Contact info */}
                {(candidate_email || candidate_phone || candidate_linkedin || candidate_github) && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact Info</p>
                    {candidate_email && (
                      <a href={`mailto:${candidate_email}`} className="flex items-center gap-2 text-xs text-indigo-600 hover:underline truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {candidate_email}
                      </a>
                    )}
                    {candidate_phone && (
                      <a href={`tel:${candidate_phone}`} className="flex items-center gap-2 text-xs text-slate-600 hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {candidate_phone}
                      </a>
                    )}
                    {candidate_linkedin && (
                      <a href={candidate_linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {candidate_github && (
                      <a href={candidate_github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-slate-700 hover:underline truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </a>
                    )}
                  </div>
                )}

                {/* Section checklist */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <SectionChecklist sections={sections} />
                </div>
              </div>

            </div>
          )}

          {/* ── Interview Notes ── */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interview Notes</p>
              {notesSaved && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add interview notes, observations, or follow-up items…"
              rows={3}
              className="w-full text-xs text-slate-700 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition"
            />
          </div>

        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-700">{value}</span>
    </div>
  )
}
