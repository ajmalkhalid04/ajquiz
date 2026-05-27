import Link from 'next/link'

export default function QuranModePage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-10">
        <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm">
          ← Home
        </Link>
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-4">Quran Surahs</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 tracking-wide uppercase font-medium">114 surahs</p>
      </div>

      <div className="grid grid-cols-2 gap-4">

        {/* Learn */}
        <Link
          href="/quiz/quran/learn"
          className="group relative rounded-3xl overflow-hidden bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors duration-200 p-6 flex flex-col justify-between min-h-[180px]"
        >
          <span className="text-4xl">🃏</span>
          <div>
            <p className="text-2xl font-black text-white mt-4">Learn</p>
            <p className="text-emerald-200 dark:text-emerald-300 text-xs mt-0.5">Swipe through cards</p>
          </div>
          <span className="absolute bottom-5 right-5 text-white/40 group-hover:text-white/70 transition-colors text-xl leading-none">→</span>
        </Link>

        {/* Quiz */}
        <Link
          href="/quiz/quran/quiz"
          className="group relative rounded-3xl overflow-hidden bg-white dark:bg-emerald-900 border-2 border-emerald-600 dark:border-transparent hover:bg-emerald-50 dark:hover:bg-emerald-800 transition-colors duration-200 p-6 flex flex-col justify-between min-h-[180px]"
        >
          <span className="text-4xl">🏆</span>
          <div>
            <p className="text-2xl font-black text-emerald-700 dark:text-white mt-4">Quiz</p>
            <p className="text-emerald-500 dark:text-gray-400 text-xs mt-0.5">10 questions · 4 choices</p>
          </div>
          <span className="absolute bottom-5 right-5 text-emerald-300 dark:text-white/40 group-hover:text-emerald-500 dark:group-hover:text-white/70 transition-colors text-xl leading-none">→</span>
        </Link>

      </div>
    </div>
  )
}
