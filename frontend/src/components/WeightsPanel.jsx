import { useState } from 'react'

export const DEFAULT_WEIGHTS = {
  semantic:   50,
  skills:     30,
  experience: 15,
  education:   5,
}

const LABELS = {
  semantic:   'Semantic Match',
  skills:     'Skill Coverage',
  experience: 'Experience',
  education:  'Education',
}

const COLORS = {
  semantic:   'accent-indigo-600',
  skills:     'accent-violet-600',
  experience: 'accent-emerald-600',
  education:  'accent-amber-500',
}

const BAR_COLORS = {
  semantic:   'bg-indigo-500',
  skills:     'bg-violet-500',
  experience: 'bg-emerald-500',
  education:  'bg-amber-400',
}

export default function WeightsPanel({ weights, onChange }) {
  const [open, setOpen] = useState(false)
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  const isDefault = JSON.stringify(weights) === JSON.stringify(DEFAULT_WEIGHTS)

  function handleSlider(key, val) {
    onChange({ ...weights, [key]: Number(val) })
  }

  function reset() {
    onChange({ ...DEFAULT_WEIGHTS })
  }

  return (
    <div className="mb-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Scoring Weights
          </span>
          {!isDefault && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
              Custom
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Mini weight pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            {Object.entries(weights).map(([k, v]) => (
              <span key={k} className="text-[10px] text-slate-500 dark:text-slate-400">
                {LABELS[k].split(' ')[0]} <b className="text-slate-700 dark:text-slate-200">{v}%</b>
              </span>
            ))}
          </div>
          {total !== 100 && (
            <span className="text-[10px] text-red-500 font-semibold">≠ 100%</span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Sliders */}
      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3 space-y-4">
          <p className="text-[11px] text-slate-400">
            Adjust how much each factor contributes to the final score. Scores update instantly.
          </p>

          {Object.keys(DEFAULT_WEIGHTS).map((key) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {LABELS[key]}
                </label>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-10 text-right">
                  {weights[key]}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(e) => handleSlider(key, e.target.value)}
                  className={`flex-1 h-2 rounded-lg cursor-pointer ${COLORS[key]}`}
                />
                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${BAR_COLORS[key]} rounded-full transition-all`}
                    style={{ width: `${weights[key]}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Total + reset */}
          <div className="flex items-center justify-between pt-1">
            <span className={`text-xs font-semibold ${total === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
              Total: {total}% {total === 100 ? '✓' : `(${total > 100 ? '+' : ''}${total - 100} off)`}
            </span>
            {!isDefault && (
              <button
                onClick={reset}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Reset to defaults
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
