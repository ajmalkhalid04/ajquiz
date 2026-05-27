import Link from 'next/link'
import Image from 'next/image'

const categories = [
  {
    slug: 'quran',
    label: 'Quran Surahs',
    description: 'Memorize all 114 surah names',
    icon: '📖',
    href: '/quiz/quran',
    active: true,
  },
  { slug: 'flags', label: 'Flag Quiz', description: 'Match the flag to the country', icon: '🚩', href: '#', active: false },
  { slug: 'animals', label: 'Animal Quiz', description: 'Identify the animal from the image', icon: '🐾', href: '#', active: false },
  { slug: 'wordle', label: 'Wordle', description: 'Guess the hidden word', icon: '🟩', href: '#', active: false },
  { slug: 'sudoku', label: 'Sudoku', description: 'Classic number puzzle', icon: '🔢', href: '#', active: false },
]

export default function HomePage() {
  return (
    <div>
      <div className="mb-10 text-center">
        <Image
          src="/logo.png"
          alt="AJQuiz"
          width={260}
          height={84}
          priority
          className="mx-auto [mix-blend-mode:multiply] dark:invert dark:[mix-blend-mode:screen]"
        />
        <p className="text-gray-500 dark:text-gray-400 text-lg mt-2">Choose a quiz to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {categories.map((cat) =>
          cat.active ? (
            <Link
              key={cat.slug}
              href={cat.href}
              className="flex items-start gap-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <span className="text-4xl">{cat.icon}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{cat.label}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{cat.description}</p>
              </div>
            </Link>
          ) : (
            <div
              key={cat.slug}
              className="flex items-start gap-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 opacity-60 cursor-not-allowed"
            >
              <span className="text-4xl">{cat.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400">{cat.label}</h2>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{cat.description}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
