import type { QuizQuestion } from '@/types/quiz'

interface QuizCardProps {
  question: QuizQuestion
  selectedAnswer: string | null
  onAnswer: (choice: string) => void
}

function choiceStyle(
  choice: string,
  selectedAnswer: string | null,
  correctAnswer: string
): string {
  const base =
    'w-full rounded-xl border-2 px-4 py-3 text-left font-medium transition-all text-sm sm:text-base'
  if (selectedAnswer === null) {
    return `${base} border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 active:scale-95`
  }
  if (choice === correctAnswer) {
    return `${base} border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300`
  }
  if (choice === selectedAnswer) {
    return `${base} border-red-400 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300`
  }
  return `${base} border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500`
}

export default function QuizCard({ question, selectedAnswer, onAnswer }: QuizCardProps) {
  const { question: questionText, choices, correctAnswer } = question

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6 leading-snug">
        {questionText}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => onAnswer(choice)}
            disabled={selectedAnswer !== null}
            className={choiceStyle(choice, selectedAnswer, correctAnswer)}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  )
}
