interface ScoreSummaryProps {
  score: number
  total: number
  onReplay: () => void
}

function getMessage(score: number, total: number): string {
  const pct = score / total
  if (pct >= 0.9) return 'Excellent! Mashallah!'
  if (pct >= 0.7) return 'Great job! Keep it up!'
  if (pct >= 0.5) return 'Good effort. Keep practising!'
  return "Keep learning — you'll improve inshallah!"
}

function scoreColor(score: number, total: number): string {
  const pct = score / total
  if (pct >= 0.7) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 0.4) return 'text-amber-500 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
}

export default function ScoreSummary({ score, total, onReplay }: ScoreSummaryProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Round Complete!</h2>

      <div className={`text-6xl font-bold ${scoreColor(score, total)}`}>
        {score} / {total}
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-lg">{getMessage(score, total)}</p>

      <button
        onClick={onReplay}
        className="mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-8 py-3 text-white font-semibold text-lg active:scale-95 transition-all"
      >
        Play Again
      </button>
    </div>
  )
}
