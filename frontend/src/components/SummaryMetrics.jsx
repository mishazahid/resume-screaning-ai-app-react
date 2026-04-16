function MetricCard({ label, value, sub, accent }) {
  const accentMap = {
    indigo: 'border-indigo-400 bg-indigo-50',
    emerald: 'border-emerald-400 bg-emerald-50',
    violet: 'border-violet-400 bg-violet-50',
    sky: 'border-sky-400 bg-sky-50',
  }
  const textMap = {
    indigo: 'text-indigo-700',
    emerald: 'text-emerald-700',
    violet: 'text-violet-700',
    sky: 'text-sky-700',
  }

  return (
    <div className={`bg-white rounded-2xl border-l-4 shadow-sm p-5 ${accentMap[accent]}`}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${textMap[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function SummaryMetrics({ results }) {
  if (!results || results.length === 0) return null

  const total = results.length
  const top = results[0]
  const topName = top.filename
    .replace(/\.(pdf|txt)$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const topPct = top.scores.final_score_pct
  const avgPct = (
    results.reduce((sum, r) => sum + r.scores.final_score_pct, 0) / total
  ).toFixed(1)

  const strongFit = results.filter((r) => r.scores.recommendation === 'Strong fit').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <MetricCard
        label="Resumes Screened"
        value={total}
        sub={`${strongFit} strong fit${strongFit !== 1 ? 's' : ''}`}
        accent="indigo"
      />
      <MetricCard
        label="Top Candidate"
        value={topName}
        sub={top.scores.recommendation}
        accent="emerald"
      />
      <MetricCard
        label="Top Score"
        value={`${topPct}%`}
        sub="weighted hybrid"
        accent="violet"
      />
      <MetricCard
        label="Average Score"
        value={`${avgPct}%`}
        sub="across all resumes"
        accent="sky"
      />
    </div>
  )
}
