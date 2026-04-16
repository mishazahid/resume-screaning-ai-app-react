const ICONS = {
  warn: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const STYLES = {
  warn: {
    wrapper: 'bg-amber-50 border-amber-300 text-amber-800',
    icon: 'text-amber-500',
    label: 'bg-amber-100 text-amber-700 border-amber-300',
  },
  info: {
    wrapper: 'bg-sky-50 border-sky-300 text-sky-800',
    icon: 'text-sky-500',
    label: 'bg-sky-100 text-sky-700 border-sky-300',
  },
}

function AlertCard({ warning }) {
  const s = STYLES[warning.severity]
  return (
    <div className={`flex gap-3 items-start border rounded-xl px-4 py-3.5 ${s.wrapper}`}>
      <span className={s.icon}>{ICONS[warning.severity]}</span>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-sm">{warning.title}</p>
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${s.label}`}>
            {warning.severity === 'warn' ? 'Ethics / HR' : 'Info'}
          </span>
        </div>
        <p className="text-xs leading-relaxed opacity-90">{warning.message}</p>
      </div>
    </div>
  )
}

/**
 * Shows bias warnings when detected, or a "clean" badge when all checks pass.
 * Always renders after results are available so the user knows the check ran.
 */
export default function BiasAlert({ warnings, resultsCount }) {
  const hasWarnings = warnings && warnings.length > 0

  return (
    <div className="mb-6 space-y-2">

      {/* Status bar — always visible */}
      <div className={`
        flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium
        ${hasWarnings
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }
      `}>
        {/* Icon */}
        {hasWarnings ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-amber-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-emerald-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}

        {/* Label */}
        <span>
          <strong>Ethics &amp; Bias Check</strong>
          {' — '}
          {hasWarnings
            ? `${warnings.length} issue${warnings.length > 1 ? 's' : ''} flagged across ${resultsCount} candidates`
            : `No bias detected across ${resultsCount} candidate${resultsCount !== 1 ? 's' : ''}. Education, experience and scoring look balanced.`
          }
        </span>

        {/* Badge */}
        <span className={`
          ml-auto flex-shrink-0 text-[10px] font-bold uppercase tracking-wide
          px-2.5 py-0.5 rounded-full border
          ${hasWarnings
            ? 'bg-amber-100 text-amber-700 border-amber-300'
            : 'bg-emerald-100 text-emerald-700 border-emerald-300'
          }
        `}>
          {hasWarnings ? `${warnings.length} Warning${warnings.length > 1 ? 's' : ''}` : 'Clean ✓'}
        </span>
      </div>

      {/* Individual warning cards */}
      {hasWarnings && warnings.map((w) => (
        <AlertCard key={w.type} warning={w} />
      ))}
    </div>
  )
}
