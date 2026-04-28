export const TABS = [
  { id: 'screen',     label: 'Screen'     },
  { id: 'candidates', label: 'Candidates', requiresData: true },
  { id: 'analytics',  label: 'Analytics',  requiresData: true },
  { id: 'ethics',     label: 'Ethics',     requiresData: true },
  { id: 'jobs',       label: 'Jobs'        },
  { id: 'history',    label: 'History'     },
]

function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-gray-100 text-gray-500',
    active:  'bg-indigo-100 text-indigo-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
  }
  return (
    <span className={`ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${styles[variant]}`}>
      {children}
    </span>
  )
}

export default function TabBar({ active, onChange, data, sessions, biasWarnings }) {
  const candidateCount = data?.results?.length ?? 0
  const hasWarnings = biasWarnings?.length > 0

  const getBadge = (id) => {
    if (id === 'candidates' && data)
      return <Badge variant={active === id ? 'active' : 'default'}>{candidateCount}</Badge>
    if (id === 'ethics' && data)
      return hasWarnings
        ? <Badge variant="warning">{biasWarnings.length}</Badge>
        : <Badge variant="success">✓</Badge>
    if (id === 'jobs' && sessions?.length > 0)
      return <Badge variant={active === id ? 'active' : 'default'}>{sessions.length}</Badge>
    if (id === 'history' && sessions?.length > 0)
      return <Badge variant={active === id ? 'active' : 'default'}>{sessions.length}</Badge>
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {TABS.map(({ id, label, requiresData }) => {
            const isActive = active === id
            const disabled = requiresData && !data

            return (
              <button
                key={id}
                onClick={() => !disabled && onChange(id)}
                disabled={disabled}
                className={`
                  flex items-center whitespace-nowrap px-4 py-3.5 text-sm font-medium
                  border-b-2 transition-colors duration-150 focus:outline-none
                  ${isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : disabled
                      ? 'border-transparent text-gray-300 cursor-not-allowed select-none'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {label}
                {getBadge(id)}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
