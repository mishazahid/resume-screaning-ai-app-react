export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-5">
      {/* Spinner */}
      <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />

      <div className="text-center">
        <p className="text-white text-lg font-semibold">Analysing resumes…</p>
        <p className="text-indigo-200 text-sm mt-1">
          Running semantic scoring &amp; skill matching
        </p>
      </div>
    </div>
  )
}
