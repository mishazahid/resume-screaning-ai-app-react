import { SkillPillGroup } from './SkillPills'

const REC_COLORS = {
  'Strong fit':  'text-emerald-600 bg-emerald-50 border-emerald-200',
  'Good fit':    'text-sky-600     bg-sky-50     border-sky-200',
  'Partial fit': 'text-amber-600   bg-amber-50   border-amber-200',
  'Weak fit':    'text-red-600     bg-red-50     border-red-200',
}

function ScoreBar({ value, color = 'bg-indigo-500' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-10 text-right">{value.toFixed(1)}%</span>
    </div>
  )
}

function Cell({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 align-top border-r border-slate-100 last:border-r-0 ${className}`}>
      {children}
    </td>
  )
}

function Row({ label, children }) {
  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 whitespace-nowrap w-32">
        {label}
      </td>
      {children}
    </tr>
  )
}

export default function CompareModal({ candidates, onClose }) {
  const cols = candidates.slice(0, 3)

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">
            Candidate Comparison
            <span className="ml-2 text-xs font-normal text-slate-400">({cols.length} candidates)</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 bg-slate-50 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                  Field
                </th>
                {cols.map((c, i) => (
                  <th key={i} className="px-4 py-3 text-left border-r border-slate-100 last:border-r-0">
                    <p className="font-bold text-slate-800 truncate">
                      {c.filename.replace(/\.(pdf|txt)$/i, '')}
                    </p>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">#{i + 1} ranked</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>

              {/* Overall score */}
              <Row label="Score">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <span className="text-2xl font-extrabold text-slate-800 tabular-nums">
                      {c.scores.final_score_pct}
                      <span className="text-sm font-bold">%</span>
                    </span>
                  </Cell>
                ))}
              </Row>

              {/* Recommendation */}
              <Row label="Fit">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-semibold ${REC_COLORS[c.scores.recommendation] ?? ''}`}>
                      {c.scores.recommendation}
                    </span>
                  </Cell>
                ))}
              </Row>

              {/* Score breakdowns */}
              <Row label="Semantic">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <ScoreBar value={c.scores.semantic_score * 100} color="bg-indigo-400" />
                  </Cell>
                ))}
              </Row>

              <Row label="Skills">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <ScoreBar value={c.scores.skill_score * 100} color="bg-violet-400" />
                  </Cell>
                ))}
              </Row>

              <Row label="Experience">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <ScoreBar value={c.scores.experience_score * 100} color="bg-emerald-400" />
                  </Cell>
                ))}
              </Row>

              <Row label="Education">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <ScoreBar value={c.scores.education_score * 100} color="bg-amber-400" />
                  </Cell>
                ))}
              </Row>

              {/* Experience & Education labels */}
              <Row label="Exp.">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <span className="text-xs text-slate-700">{c.experience_display || 'Not detected'}</span>
                  </Cell>
                ))}
              </Row>

              <Row label="Degree">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <span className="text-xs text-slate-700">{c.education_label || 'Not detected'}</span>
                  </Cell>
                ))}
              </Row>

              {/* Matched skills */}
              <Row label="Matched">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="text-xs font-bold text-emerald-600">{c.skill_match.matched.length}</span>
                      <span className="text-xs text-slate-400">matched</span>
                    </div>
                    <SkillPillGroup skills={c.skill_match.matched.slice(0, 8)} variant="matched" emptyText="None" />
                    {c.skill_match.matched.length > 8 && (
                      <p className="text-[10px] text-slate-400 mt-1">+{c.skill_match.matched.length - 8} more</p>
                    )}
                  </Cell>
                ))}
              </Row>

              {/* Missing skills */}
              <Row label="Missing">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="text-xs font-bold text-red-500">{c.skill_match.missing.length}</span>
                      <span className="text-xs text-slate-400">missing</span>
                    </div>
                    <SkillPillGroup skills={c.skill_match.missing.slice(0, 8)} variant="missing" emptyText="None" />
                    {c.skill_match.missing.length > 8 && (
                      <p className="text-[10px] text-slate-400 mt-1">+{c.skill_match.missing.length - 8} more</p>
                    )}
                  </Cell>
                ))}
              </Row>

              {/* Contact */}
              <Row label="Contact">
                {cols.map((c, i) => (
                  <Cell key={i}>
                    <div className="space-y-1">
                      {c.candidate_email && (
                        <p className="text-xs text-indigo-600 truncate">{c.candidate_email}</p>
                      )}
                      {c.candidate_phone && (
                        <p className="text-xs text-slate-600">{c.candidate_phone}</p>
                      )}
                      {!c.candidate_email && !c.candidate_phone && (
                        <p className="text-xs text-slate-400">Not found</p>
                      )}
                    </div>
                  </Cell>
                ))}
              </Row>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
