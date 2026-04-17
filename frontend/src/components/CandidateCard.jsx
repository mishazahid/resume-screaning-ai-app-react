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
// Main CandidateCard
// ---------------------------------------------------------------------------
export default function CandidateCard({ result, rank, defaultOpen, jdPreview }) {
  const [open, setOpen] = useState(defaultOpen)
  const [showEmail, setShowEmail]         = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [interview, setInterview]         = useState(() => {
    try { return JSON.parse(localStorage.getItem(`interview:${result.filename}`) || 'null') }
    catch { return null }
  })

  const { filename, scores, skill_match, explanation, sections, parse_error,
          education_label, experience_display } = result
  const rec = scores.recommendation
  const displayName = filename.replace(/\.(pdf|txt)$/i, '')
  const delta = scores.semantic_score - scores.tfidf_score
  const deltaDir = delta >= 0 ? 'above' : 'below'
  const interviewBadge = interview

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      {/* ── Card header / toggle ── */}
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {/* Rank badge */}
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
          #{rank}
        </span>

        {/* Filename */}
        <span className="flex-1 font-semibold text-slate-800 text-sm truncate">{displayName}</span>

        {/* Score */}
        <span className="text-base font-extrabold text-slate-700 tabular-nums">
          {scores.final_score_pct}%
        </span>

        {/* Rec badge */}
        <RecBadge rec={rec} />

        {/* Schedule Interview button always visible in header */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowScheduler(true) }}
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

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

                {/* Section checklist */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <SectionChecklist sections={sections} />
                </div>
              </div>

            </div>
          )}
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
