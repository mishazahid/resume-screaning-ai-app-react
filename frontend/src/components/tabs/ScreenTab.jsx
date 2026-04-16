import InputPanel from '../InputPanel'

export default function ScreenTab({
  jdText, onJdChange, wordCount,
  files, onFilesChange,
  onLoadSamples, sampleReady,
  onScreen, isLoading,
  error, hasResults, onViewResults,
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <InputPanel
        jdText={jdText}
        onJdChange={onJdChange}
        wordCount={wordCount}
        files={files}
        onFilesChange={onFilesChange}
        onLoadSamples={onLoadSamples}
        sampleReady={sampleReady}
      />

      {/* Screen button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onScreen}
          disabled={isLoading}
          className="
            px-12 py-3.5 rounded-xl font-semibold text-base tracking-wide
            bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
            disabled:opacity-50 disabled:cursor-not-allowed
            text-white shadow-md hover:shadow-lg transition-all duration-200
          "
        >
          {isLoading ? 'Analysing…' : 'Screen Resumes'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      {/* Results-ready banner */}
      {hasResults && !isLoading && (
        <div className="mt-6 flex items-center justify-between px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 flex-shrink-0"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-emerald-800">
              Screening complete! Results are ready.
            </p>
          </div>
          <button
            onClick={onViewResults}
            className="flex-shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
          >
            View Candidates →
          </button>
        </div>
      )}
    </div>
  )
}
