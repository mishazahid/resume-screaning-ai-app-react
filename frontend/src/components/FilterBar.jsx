const RECOMMENDATIONS = ['Strong fit', 'Good fit', 'Partial fit', 'Weak fit']
const EDUCATION_LEVELS = ["PhD / Doctorate", "Master's", "Bachelor's", "Associate / Diploma", "Not detected"]

function Select({ value, onChange, children, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
        ${className}
      `}
    >
      {children}
    </select>
  )
}

export default function FilterBar({ results, jdSkills = [], filters, onChange, onClear }) {
  // Count active (non-default) filters
  const activeCount = [
    filters.search,
    filters.minScore > 0,
    filters.skill,
    filters.recommendation,
    filters.education,
  ].filter(Boolean).length

  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <svg xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="
              w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200
              text-xs text-slate-700 placeholder:text-slate-400 bg-slate-50
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
            "
          />
        </div>

        {/* Min score slider */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Min score</span>
          <input
            type="range"
            min={0} max={100} step={5}
            value={filters.minScore}
            onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
            className="w-24 accent-indigo-600"
          />
          <span className="text-xs font-semibold text-indigo-600 w-8 text-right tabular-nums">
            {filters.minScore}%
          </span>
        </div>

        {/* Required skill */}
        <Select value={filters.skill} onChange={(v) => onChange({ ...filters, skill: v })}>
          <option value="">All skills</option>
          {jdSkills.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        {/* Recommendation */}
        <Select value={filters.recommendation} onChange={(v) => onChange({ ...filters, recommendation: v })}>
          <option value="">All recommendations</option>
          {RECOMMENDATIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>

        {/* Education */}
        <Select value={filters.education} onChange={(v) => onChange({ ...filters, education: v })}>
          <option value="">All education</option>
          {EDUCATION_LEVELS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </Select>

        {/* Clear + count */}
        <div className="flex items-center gap-2 ml-auto">
          {activeCount > 0 && (
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              {activeCount} active
            </span>
          )}
          <span className="text-xs text-slate-400">
            {results.length} shown
          </span>
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
