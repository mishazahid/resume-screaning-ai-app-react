import { useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Template helpers (localStorage)
// ---------------------------------------------------------------------------
const TEMPLATES_KEY = 'jd_templates'

function loadTemplates() {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]') }
  catch { return [] }
}
function saveTemplates(list) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list))
}

// ---------------------------------------------------------------------------
// Templates dropdown
// ---------------------------------------------------------------------------
function TemplatesMenu({ jdText, onLoad }) {
  const [open, setOpen]     = useState(false)
  const [templates, setTpl] = useState(loadTemplates)
  const [naming, setNaming] = useState(false)
  const [name, setName]     = useState('')

  function handleSave() {
    if (!name.trim() || !jdText.trim()) return
    const updated = [{ name: name.trim(), text: jdText }, ...templates.filter(t => t.name !== name.trim())]
    saveTemplates(updated)
    setTpl(updated)
    setNaming(false)
    setName('')
  }

  function handleDelete(n) {
    const updated = templates.filter(t => t.name !== n)
    saveTemplates(updated)
    setTpl(updated)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        {jdText.trim() && (
          <button
            onClick={() => { setNaming((v) => !v); setOpen(false) }}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            + Save template
          </button>
        )}
        <button
          onClick={() => { setOpen((v) => !v); setNaming(false) }}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Templates {templates.length > 0 && `(${templates.length})`}
        </button>
      </div>

      {/* Save name input */}
      {naming && (
        <div className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-64">
          <p className="text-xs font-semibold text-slate-600 mb-2">Save as template</p>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Template name…"
            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-1.5 font-semibold transition-colors">
              Save
            </button>
            <button onClick={() => setNaming(false)} className="flex-1 text-xs border border-slate-200 rounded-lg py-1.5 text-slate-500 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Templates list */}
      {open && (
        <div className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-lg w-72 max-h-64 overflow-y-auto">
          {templates.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No saved templates yet.</p>
          ) : (
            <ul className="py-1">
              {templates.map(t => (
                <li key={t.name} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 group">
                  <button
                    onClick={() => { onLoad(t.text); setOpen(false) }}
                    className="flex-1 text-left text-xs font-medium text-slate-700 truncate hover:text-indigo-600"
                  >
                    {t.name}
                  </button>
                  <button
                    onClick={() => handleDelete(t.name)}
                    className="ml-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// File drop zone
// ---------------------------------------------------------------------------
function FileDropZone({ files, onAdd, onRemove }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const addFiles = (newFiles) => {
    const accepted = Array.from(newFiles).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.txt')
    )
    if (accepted.length) onAdd(accepted)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-150 select-none
          ${dragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
          }
        `}
      >
        <input ref={inputRef} type="file" accept=".pdf,.txt" multiple className="hidden"
          onChange={(e) => addFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-500" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">
              Drop files here, or{' '}
              <span className="text-indigo-600 font-semibold">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">PDF or TXT · multiple files supported</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`}
              className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`
                  flex-shrink-0 w-6 h-6 rounded flex items-center justify-center
                  text-[9px] font-bold
                  ${f.name.endsWith('.pdf') ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}
                `}>
                  {f.name.endsWith('.pdf') ? 'PDF' : 'TXT'}
                </span>
                <span className="text-sm text-slate-700 truncate">{f.name}</span>
              </div>
              <button onClick={() => onRemove(i)}
                className="ml-2 flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Language detection (simple heuristic)
// ---------------------------------------------------------------------------
const LANG_PATTERNS = [
  { lang: 'Arabic',  code: 'ar', re: /[\u0600-\u06FF]/ },
  { lang: 'Chinese', code: 'zh', re: /[\u4E00-\u9FFF]/ },
  { lang: 'French',  code: 'fr', re: /\b(nous|vous|notre|emploi|expérience|compétences)\b/i },
  { lang: 'German',  code: 'de', re: /\b(wir|ihrer|berufserfahrung|kenntnisse|stellenanzeige)\b/i },
  { lang: 'Spanish', code: 'es', re: /\b(nosotros|experiencia|habilidades|empleo|requisitos)\b/i },
  { lang: 'Urdu',    code: 'ur', re: /[\u0600-\u06FF\u0750-\u077F]/ },
]

function detectLanguage(text) {
  if (!text || text.trim().length < 30) return null
  for (const { lang, re } of LANG_PATTERNS) {
    if (re.test(text)) return lang
  }
  return 'English'
}

// ---------------------------------------------------------------------------
// Main InputPanel
// ---------------------------------------------------------------------------
export default function InputPanel({
  jdText, onJdChange, wordCount,
  files, onFilesChange,
  onLoadSamples, sampleReady,
}) {
  const handleAdd = (newFiles) => {
    onFilesChange((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...newFiles.filter((f) => !names.has(f.name))]
    })
  }

  const detectedLang = detectLanguage(jdText)
  const isNonEnglish = detectedLang && detectedLang !== 'English'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Job Description ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b border-indigo-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 10.414V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800">Job Description</h2>
            {wordCount > 0 && (
              <span className="ml-1 text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                {wordCount} words
              </span>
            )}
            {detectedLang && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isNonEnglish
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {detectedLang}
              </span>
            )}
            <div className="ml-auto">
              <TemplatesMenu jdText={jdText} onLoad={onJdChange} />
            </div>
          </div>
        </div>

        {isNonEnglish && (
          <div className="px-4 pt-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-amber-700">
                <strong>{detectedLang}</strong> detected — the AI model is optimised for English. Results may be less accurate.
              </p>
            </div>
          </div>
        )}

        <div className="p-4">
          <textarea
            value={jdText}
            onChange={(e) => onJdChange(e.target.value)}
            placeholder="Paste the complete job description here…"
            rows={14}
            className="
              w-full resize-none rounded-xl border border-slate-200 bg-slate-50
              px-3.5 py-3 text-sm text-slate-800 leading-relaxed
              placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
              transition
            "
          />
        </div>
      </div>

      {/* ── Upload Resumes ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col">
        <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-violet-100/50 border-b border-violet-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800">Upload Resumes</h2>
            {files.length > 0 && (
              <span className="ml-auto text-xs font-medium px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full border border-violet-200">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4 flex-1">
          <FileDropZone files={files} onAdd={handleAdd}
            onRemove={(i) => onFilesChange((prev) => prev.filter((_, idx) => idx !== i))} />

          <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-amber-700">Upload 3–5 resumes for a meaningful comparison.</p>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-auto">
            <p className="text-xs text-slate-400 mb-2 font-medium">Try with sample data</p>
            <button
              onClick={onLoadSamples}
              className="
                w-full py-2.5 rounded-lg border border-slate-200 bg-white
                text-sm font-medium text-slate-600
                hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600
                transition-all duration-150
              "
            >
              Load sample resumes + JD
            </button>
            {sampleReady && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-emerald-700 font-medium">
                  Sample data loaded — click <strong>Screen Resumes</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
