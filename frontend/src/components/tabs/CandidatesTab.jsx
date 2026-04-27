import { useState, useMemo, useRef } from 'react'
import SummaryMetrics from '../SummaryMetrics'
import FilterBar from '../FilterBar'
import CandidateCard from '../CandidateCard'
import CompareModal from '../CompareModal'
import WeightsPanel, { DEFAULT_WEIGHTS } from '../WeightsPanel'
import { sendEmail } from '../../api'

function applyWeights(result, weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  if (total === 0) return result
  const w = {
    semantic:   weights.semantic   / total,
    skills:     weights.skills     / total,
    experience: weights.experience / total,
    education:  weights.education  / total,
  }
  const s = result.scores
  const final = Math.max(0, Math.min(1,
    s.semantic_score   * w.semantic  +
    s.skill_score      * w.skills    +
    s.experience_score * w.experience +
    s.education_score  * w.education
  ))
  const pct = Math.round(final * 1000) / 10
  const recommendation =
    final >= 0.75 ? 'Strong fit' :
    final >= 0.55 ? 'Good fit'   :
    final >= 0.35 ? 'Partial fit' : 'Weak fit'
  return {
    ...result,
    scores: { ...s, final_score: final, final_score_pct: pct, recommendation, weights },
  }
}

const DEFAULT_FILTERS = {
  search: '', minScore: 0, skill: '', recommendation: '', education: '',
}

const TEMPLATES = [
  { id: 'shortlist', label: 'Shortlist Notification' },
  { id: 'interview', label: 'Interview Invite' },
  { id: 'rejection', label: 'Rejection Email' },
]

function buildCsv(results) {
  const headers = [
    'Rank', 'Name', 'Email', 'Phone', 'LinkedIn', 'GitHub',
    'Final Score %', 'Recommendation',
    'Semantic Score', 'Skill Score', 'Experience Score', 'Education Score',
    'Experience', 'Education',
    'Matched Skills', 'Missing Skills',
  ]
  const rows = results.map((r, i) => [
    i + 1,
    r.filename.replace(/\.(pdf|txt)$/i, ''),
    r.candidate_email    || '',
    r.candidate_phone    || '',
    r.candidate_linkedin || '',
    r.candidate_github   || '',
    r.scores.final_score_pct,
    r.scores.recommendation,
    (r.scores.semantic_score   * 100).toFixed(1),
    (r.scores.skill_score      * 100).toFixed(1),
    (r.scores.experience_score * 100).toFixed(1),
    (r.scores.education_score  * 100).toFixed(1),
    r.experience_display || '',
    r.education_label    || '',
    r.skill_match.matched.join('; '),
    r.skill_match.missing.join('; '),
  ])
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
  return [headers, ...rows].map((row) => row.map(esc).join(',')).join('\n')
}

// ---------------------------------------------------------------------------
// Floating bulk-email action bar
// ---------------------------------------------------------------------------
function BulkEmailBar({ selected, candidates, jdText, onClear, onCompare }) {
  const [template, setTemplate] = useState('shortlist')
  const [sending, setSending]   = useState(false)
  const [done, setDone]         = useState(null)

  const selectedCandidates = candidates.filter((r) => selected.has(r.filename))

  async function handleSendAll() {
    setSending(true)
    const sentList    = []
    const skippedList = []

    for (const r of selectedCandidates) {
      const name = r.filename.replace(/\.(pdf|txt)$/i, '').replace(/[_-]/g, ' ')
      if (!r.candidate_email) {
        skippedList.push({ name, reason: 'No email found in resume' })
        continue
      }
      try {
        await sendEmail(r.candidate_email, name, template, jdText)
        sentList.push(name)
      } catch {
        skippedList.push({ name, reason: 'Send failed' })
      }
    }

    setSending(false)
    setDone({ sentList, skippedList })
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-4 min-w-[500px] max-w-lg">
      {done ? (
        // ── Result summary ──
        <div className="space-y-2">
          {done.sentList.length > 0 && (
            <p className="text-sm text-emerald-400 font-semibold">
              ✓ Sent to: {done.sentList.join(', ')}
            </p>
          )}
          {done.skippedList.length > 0 && (
            <div>
              <p className="text-sm text-amber-400 font-semibold mb-1">
                ✗ Skipped ({done.skippedList.length}):
              </p>
              <ul className="space-y-0.5">
                {done.skippedList.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="text-red-400">•</span>
                    <span className="font-medium">{s.name}</span>
                    <span className="text-slate-400">— {s.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-white underline mt-1"
          >
            Dismiss
          </button>
        </div>
      ) : (
        // ── Send controls ──
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold flex-shrink-0">
            {selected.size} selected
          </span>

          {/* Compare button — only when 2-3 selected */}
          {selected.size >= 2 && selected.size <= 3 && (
            <button
              onClick={onCompare}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-xl text-xs font-semibold transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              Compare
            </button>
          )}

          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-600 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          <button
            onClick={handleSendAll}
            disabled={sending}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm font-semibold transition-colors"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending…
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send to All
              </>
            )}
          </button>

          <button
            onClick={onClear}
            className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
            title="Deselect all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main tab
// ---------------------------------------------------------------------------
export default function CandidatesTab({ data, jdText = '' }) {
  const [filters, setFilters]     = useState(DEFAULT_FILTERS)
  const [selected, setSelected]   = useState(new Set())
  const [comparing, setComparing] = useState(false)
  const [weights, setWeights]     = useState({ ...DEFAULT_WEIGHTS })
  const [dragOrder, setDragOrder] = useState(null) // null = score order
  const dragIndexRef              = useRef(null)

  const weighted = useMemo(() =>
    data ? data.results.map((r) => applyWeights(r, weights)) : []
  , [data, weights])

  const filtered = useMemo(() => {
    if (!data) return []
    const { search, minScore, skill, recommendation, education } = filters
    return weighted
      .filter((r) => {
        if (search && !r.filename.toLowerCase().includes(search.toLowerCase())) return false
        if (r.scores.final_score_pct < minScore) return false
        if (skill && !r.skill_match.matched.includes(skill)) return false
        if (recommendation && r.scores.recommendation !== recommendation) return false
        if (education && r.education_label !== education) return false
        return true
      })
      .sort((a, b) => b.scores.final_score - a.scores.final_score)
  }, [weighted, filters])

  // Apply manual drag order on top of filtered list
  const displayed = useMemo(() => {
    if (!dragOrder) return filtered
    const map = Object.fromEntries(filtered.map((r) => [r.filename, r]))
    return dragOrder.filter((f) => map[f]).map((f) => map[f])
  }, [filtered, dragOrder])

  if (!data) return null

  function handleDragStart(i) { dragIndexRef.current = i }

  function handleDragOver(e, i) {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === i) return
    const base = dragOrder || filtered.map((r) => r.filename)
    const next = [...base]
    const [moved] = next.splice(from, 1)
    next.splice(i, 0, moved)
    dragIndexRef.current = i
    setDragOrder(next)
  }

  function handleDragEnd() { dragIndexRef.current = null }

  function toggleSelect(filename) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(filename) ? next.delete(filename) : next.add(filename)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((r) => r.filename)))
    }
  }

  function handleDownload() {
    const csv  = buildCsv(filtered.length ? filtered : data.results)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'candidates.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
        Screening Summary
      </h2>
      <SummaryMetrics results={data.results} />

      <hr className="border-slate-200 my-8" />

      <WeightsPanel weights={weights} onChange={setWeights} />

      <div className="mb-5">
        <FilterBar
          results={filtered}
          jdSkills={data.jd_skills}
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Ranked Candidates
          </h2>
          {filtered.length > 0 && (
            <button onClick={toggleSelectAll} className="text-xs text-indigo-600 hover:underline">
              {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
          {dragOrder && (
            <button
              onClick={() => setDragOrder(null)}
              className="text-xs text-amber-600 hover:underline font-semibold"
            >
              ↺ Reset order
            </button>
          )}
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV {filtered.length < data.results.length ? `(${filtered.length})` : ''}
        </button>
      </div>

      {/* Candidate list */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400">
          <p className="text-sm font-medium">No candidates match the current filters.</p>
          <button onClick={() => setFilters(DEFAULT_FILTERS)} className="mt-3 text-indigo-600 text-sm hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((r, i) => (
            <div
              key={r.filename}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className="flex items-start gap-2 group"
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 mt-5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <div className="flex-1">
                <CandidateCard
                  result={r}
                  rank={i + 1}
                  defaultOpen={i === 0}
                  jdPreview={jdText}
                  selected={selected.has(r.filename)}
                  onToggleSelect={toggleSelect}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400 text-right">
        {data.results.length} total · {displayed.length} shown
        {dragOrder && <span className="ml-2 text-amber-500">· manually reordered</span>}
      </p>

      {selected.size > 0 && (
        <BulkEmailBar
          selected={selected}
          candidates={data.results}
          jdText={jdText}
          onClear={() => setSelected(new Set())}
          onCompare={() => setComparing(true)}
        />
      )}

      {comparing && (
        <CompareModal
          candidates={data.results.filter((r) => selected.has(r.filename))}
          onClose={() => setComparing(false)}
        />
      )}
    </div>
  )
}
