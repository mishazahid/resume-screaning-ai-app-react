export function SkillPill({ label, variant }) {
  const styles = {
    matched: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    missing: 'bg-red-100 text-red-800 border-red-200',
    extra:   'bg-slate-100 text-slate-600 border-slate-200',
  }
  return (
    <span className={`
      inline-block px-2.5 py-0.5 rounded-full border text-xs font-medium
      ${styles[variant] ?? styles.extra}
    `}>
      {label}
    </span>
  )
}

export function SkillPillGroup({ skills, variant, emptyText = 'None found' }) {
  if (!skills || skills.length === 0) {
    return <p className="text-xs text-slate-400 italic">{emptyText}</p>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <SkillPill key={s} label={s} variant={variant} />
      ))}
    </div>
  )
}
