export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-slate-400 text-center sm:text-left">
          Resume Screening AI — Sentence-BERT &middot; scikit-learn &middot; FastAPI &middot; React
        </p>
        <p className="text-xs text-slate-400 text-center sm:text-right">
          Scores are decision-support signals, not automated hiring decisions.
        </p>
      </div>
    </footer>
  )
}
