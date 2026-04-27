import { useState, useMemo } from 'react'
import SummaryMetrics from '../SummaryMetrics'
import FilterBar from '../FilterBar'
import CandidateCard from '../CandidateCard'

const DEFAULT_FILTERS = {
  search: '', minScore: 0, skill: '', recommendation: '', education: '',
}

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
    r.candidate_email  || '',
    r.candidate_phone  || '',
    r.candidate_linkedin || '',
    r.candidate_github || '',
    r.scores.final_score_pct,
    r.scores.recommendation,
    (r.scores.semantic_score  * 100).toFixed(1),
    (r.scores.skill_score     * 100).toFixed(1),
    (r.scores.experience_score* 100).toFixed(1),
    (r.scores.education_score * 100).toFixed(1),
    r.experience_display || '',
    r.education_label    || '',
    r.skill_match.matched.join('; '),
    r.skill_match.missing.join('; '),
  ])
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
  return [headers, ...rows].map((row) => row.map(esc).join(',')).join('\n')
}

export default function CandidatesTab({ data, jdText = '' }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    if (!data) return []
    const { search, minScore, skill, recommendation, education } = filters
    return data.results.filter((r) => {
      if (search && !r.filename.toLowerCase().includes(search.toLowerCase())) return false
      if (r.scores.final_score_pct < minScore) return false
      if (skill && !r.skill_match.matched.includes(skill)) return false
      if (recommendation && r.scores.recommendation !== recommendation) return false
      if (education && r.education_label !== education) return false
      return true
    })
  }, [data, filters])

  if (!data) return null

  const handleDownload = () => {
    const csv = buildCsv(filtered.length ? filtered : data.results)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'candidates.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Summary metrics */}
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
        Screening Summary
      </h2>
      <SummaryMetrics results={data.results} />

      <hr className="border-slate-200 my-8" />

      {/* Filter bar */}
      <div className="mb-5">
        <FilterBar
          results={filtered}
          jdSkills={data.jd_skills}
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>

      {/* Ranked candidates header + export button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Ranked Candidates
        </h2>
        <button onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV {filtered.length < data.results.length ? `(${filtered.length})` : ''}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400">
          <p className="text-sm font-medium">No candidates match the current filters.</p>
          <button onClick={() => setFilters(DEFAULT_FILTERS)}
            className="mt-3 text-indigo-600 text-sm hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <CandidateCard key={`${r.filename}-${i}`} result={r} rank={i + 1} defaultOpen={i === 0} jdPreview={jdText} />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400 text-right">
        {data.results.length} total · {filtered.length} shown
      </p>
    </div>
  )
}
