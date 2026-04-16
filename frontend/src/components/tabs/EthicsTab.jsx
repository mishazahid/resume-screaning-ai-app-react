import { detectBias } from '../../utils/biasDetection'

// ── Score Distribution Chart ─────────────────────────────────────────────────
const REC_DOT = {
  'Strong fit':  'bg-emerald-500',
  'Good fit':    'bg-sky-500',
  'Partial fit': 'bg-amber-500',
  'Weak fit':    'bg-red-500',
}

function ScoreDistribution({ results }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Score Distribution (0 – 100%)
      </p>
      <div className="relative h-10 bg-slate-100 rounded-xl overflow-visible mb-6">
        {/* Track */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center px-4">
          <div className="w-full h-1 bg-slate-200 rounded-full relative">
            {results.map((r, i) => (
              <div
                key={i}
                title={`${r.filename.replace(/\.(pdf|txt)$/i, '')} — ${r.scores.final_score_pct}%`}
                style={{ left: `${r.scores.final_score_pct}%` }}
                className={`
                  absolute -translate-x-1/2 -translate-y-1/2 top-1/2
                  w-3.5 h-3.5 rounded-full border-2 border-white shadow-md cursor-pointer
                  hover:scale-125 transition-transform z-10
                  ${REC_DOT[r.scores.recommendation] ?? 'bg-slate-400'}
                `}
              />
            ))}
          </div>
        </div>
        {/* Scale labels */}
        <div className="absolute bottom-0 left-4 right-4 flex justify-between">
          {[0, 25, 50, 75, 100].map((v) => (
            <span key={v} className="text-[10px] text-slate-400">{v}%</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {['Strong fit', 'Good fit', 'Partial fit', 'Weak fit'].map((rec) => (
          <div key={rec} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className={`w-2.5 h-2.5 rounded-full ${REC_DOT[rec]}`} />
            {rec}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Education Breakdown Table ─────────────────────────────────────────────────
function EducationBreakdown({ results }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Education vs Final Score
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-2.5 text-left text-slate-500 font-semibold">Candidate</th>
              <th className="px-4 py-2.5 text-left text-slate-500 font-semibold">Education</th>
              <th className="px-4 py-2.5 text-center text-slate-500 font-semibold">Edu Score</th>
              <th className="px-4 py-2.5 text-center text-slate-500 font-semibold">Final Score</th>
              <th className="px-4 py-2.5 text-left text-slate-500 font-semibold">Fit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((r, i) => (
              <tr key={i} className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 font-medium text-slate-700 max-w-[180px] truncate">
                  {r.filename.replace(/\.(pdf|txt)$/i, '')}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{r.education_label}</td>
                <td className="px-4 py-2.5 text-center font-semibold text-slate-700">
                  {(r.scores.education_score * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-2.5 text-center font-bold text-indigo-600">
                  {r.scores.final_score_pct}%
                </td>
                <td className="px-4 py-2.5">
                  <span className={`
                    px-2 py-0.5 rounded-full text-[10px] font-semibold
                    ${{ 'Strong fit': 'bg-emerald-100 text-emerald-700',
                         'Good fit':   'bg-sky-100 text-sky-700',
                         'Partial fit':'bg-amber-100 text-amber-700',
                         'Weak fit':   'bg-red-100 text-red-700' }[r.scores.recommendation]}
                  `}>
                    {r.scores.recommendation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Warning card ──────────────────────────────────────────────────────────────
function WarningCard({ warning }) {
  const isWarn = warning.severity === 'warn'
  return (
    <div className={`flex gap-3 items-start border rounded-xl px-4 py-4 ${
      isWarn ? 'bg-amber-50 border-amber-300' : 'bg-sky-50 border-sky-300'
    }`}>
      <svg xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isWarn ? 'text-amber-500' : 'text-sky-500'}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d={isWarn
            ? 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
            : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
      </svg>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className={`font-semibold text-sm ${isWarn ? 'text-amber-800' : 'text-sky-800'}`}>
            {warning.title}
          </p>
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
            isWarn ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-sky-100 text-sky-700 border-sky-300'
          }`}>
            {isWarn ? 'Ethics / HR' : 'Info'}
          </span>
        </div>
        <p className={`text-xs leading-relaxed ${isWarn ? 'text-amber-700' : 'text-sky-700'}`}>
          {warning.message}
        </p>
      </div>
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function EthicsTab({ data }) {
  if (!data) return null

  const warnings = detectBias(data.results)
  const isClean = warnings.length === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Status banner */}
      <div className={`flex items-start gap-4 px-5 py-4 rounded-2xl border ${
        isClean ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isClean ? 'bg-emerald-100' : 'bg-amber-100'
        }`}>
          {isClean ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          )}
        </div>

        <div>
          <p className={`font-bold text-base ${isClean ? 'text-emerald-800' : 'text-amber-800'}`}>
            {isClean
              ? 'Ethics Check Passed — No Bias Detected'
              : `${warnings.length} Bias Issue${warnings.length > 1 ? 's' : ''} Flagged`}
          </p>
          <p className={`text-sm mt-0.5 ${isClean ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isClean
              ? `Checked ${data.results.length} candidates. Education, experience and scoring appear balanced.`
              : `Review the flagged issue${warnings.length > 1 ? 's' : ''} below before making hiring decisions.`}
          </p>
        </div>

        <span className={`ml-auto flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${
          isClean
            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
            : 'bg-amber-100 text-amber-700 border-amber-300'
        }`}>
          {isClean ? 'Clean ✓' : `${warnings.length} Warning${warnings.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Warning cards */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Detected Issues
          </h2>
          {warnings.map((w) => <WarningCard key={w.type} warning={w} />)}
        </div>
      )}

      {/* Score distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <ScoreDistribution results={data.results} />
      </div>

      {/* Education breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <EducationBreakdown results={data.results} />
      </div>

    </div>
  )
}
