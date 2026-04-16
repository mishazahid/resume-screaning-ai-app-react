function barColor(value) {
  if (value >= 0.7) return '#10B981'   // emerald
  if (value >= 0.4) return '#F59E0B'   // amber
  return '#EF4444'                     // red
}

function ScoreBar({ label, value, weight }) {
  const pct = Math.round(value * 100)
  const color = barColor(value)
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-600">{label}</span>
          <span className="text-[10px] text-slate-400">({weight})</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function ScoreBreakdown({ scores }) {
  return (
    <div className="mt-4">
      <ScoreBar label="Semantic Similarity" value={scores.semantic_score} weight="50%" />
      <ScoreBar label="Skill Match"         value={scores.skill_score}     weight="30%" />
      <ScoreBar label="Experience"          value={scores.experience_score} weight="15%" />
      <ScoreBar label="Education"           value={scores.education_score} weight="5%" />
    </div>
  )
}
