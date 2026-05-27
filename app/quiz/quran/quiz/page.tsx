'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Surah, QuizQuestion, QuizPhase } from '@/types/quiz'
import ProgressBar from '@/components/ProgressBar'
import QuizCard from '@/components/QuizCard'
import ScoreSummary from '@/components/ScoreSummary'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const QUESTIONS_PER_ROUND = 10

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type QType = 'name_from_number' | 'number_from_name' | 'before' | 'after'

function makeQuestion(type: QType, surah: Surah, all: Surah[]): QuizQuestion {
  const pool = fisherYates(all.filter((s) => s.number !== surah.number))

  if (type === 'name_from_number') {
    return {
      question: `What is the name of Surah #${surah.number}?`,
      surah,
      choices: fisherYates([surah.name_english, ...pool.slice(0, 3).map((s) => s.name_english)]),
      correctAnswer: surah.name_english,
    }
  }
  if (type === 'number_from_name') {
    return {
      question: `Which number surah is ${surah.name_english}?`,
      surah,
      choices: fisherYates([String(surah.number), ...pool.slice(0, 3).map((s) => String(s.number))]),
      correctAnswer: String(surah.number),
    }
  }
  if (type === 'before') {
    const prev = all.find((s) => s.number === surah.number - 1)!
    return {
      question: `Which surah comes before ${surah.name_english}?`,
      surah,
      choices: fisherYates([prev.name_english, ...pool.filter((s) => s.number !== prev.number).slice(0, 3).map((s) => s.name_english)]),
      correctAnswer: prev.name_english,
    }
  }
  // after
  const next = all.find((s) => s.number === surah.number + 1)!
  return {
    question: `Which surah comes after ${surah.name_english}?`,
    surah,
    choices: fisherYates([next.name_english, ...pool.filter((s) => s.number !== next.number).slice(0, 3).map((s) => s.name_english)]),
    correctAnswer: next.name_english,
  }
}

function buildRound(allSurahs: Surah[]): QuizQuestion[] {
  const shuffled = fisherYates(allSurahs)
  const qs: QuizQuestion[] = []
  for (const surah of shuffled) {
    if (qs.length >= QUESTIONS_PER_ROUND) break
    const types: QType[] = ['name_from_number', 'number_from_name']
    if (surah.number > 1) types.push('before')
    if (surah.number < allSurahs.length) types.push('after')
    const type = types[Math.floor(Math.random() * types.length)]
    qs.push(makeQuestion(type, surah, allSurahs))
  }
  return qs
}

export default function QuranQuizPage() {
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [phase, setPhase] = useState<QuizPhase>('loading')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  const startRound = useCallback((allSurahs: Surah[]) => {
    const qs = buildRound(allSurahs)
    setQuestions(qs)
    setCurrentIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setPhase('playing')
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchSurahs() {
      const { data, error } = await getSupabase()
        .from('quran_surahs')
        .select('number, name_arabic, name_english, name_meaning, revelation_type, verse_count')
        .order('number', { ascending: true })

      if (cancelled) return
      if (error || !data) { setPhase('error'); return }
      setSurahs(data as Surah[])
      startRound(data as Surah[])
    }
    fetchSurahs()
    return () => { cancelled = true }
  }, [startRound])

  function handleAnswer(choice: string) {
    if (selectedAnswer !== null) return
    setSelectedAnswer(choice)
    if (choice === questions[currentIndex].correctAnswer) setScore((s) => s + 1)
    setPhase('answered')
  }

  function handleNext() {
    if (currentIndex + 1 >= QUESTIONS_PER_ROUND) { setPhase('finished'); return }
    setCurrentIndex((i) => i + 1)
    setSelectedAnswer(null)
    setPhase('playing')
  }

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">Loading surahs…</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-red-500 text-lg font-medium">Failed to load surah data.</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Check your Supabase credentials in <code>.env.local</code>.</p>
        <Link href="/quiz/quran" className="text-emerald-600 dark:text-emerald-400 underline mt-2">← Back</Link>
      </div>
    )
  }

  if (phase === 'finished') {
    return <ScoreSummary score={score} total={QUESTIONS_PER_ROUND} onReplay={() => startRound(surahs)} />
  }

  const question = questions[currentIndex]
  if (!question) return null

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/quiz/quran" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm">← Back</Link>
        <h1 className="text-xl font-bold text-gray-700 dark:text-gray-200">Quiz</h1>
      </div>

      <ProgressBar current={currentIndex + 1} total={QUESTIONS_PER_ROUND} />

      <QuizCard question={question} selectedAnswer={selectedAnswer} onAnswer={handleAnswer} />

      {phase === 'answered' && (
        <div className="mt-4 text-center">
          <p className={`text-sm font-medium mb-3 ${selectedAnswer === question.correctAnswer ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {selectedAnswer === question.correctAnswer
              ? '✓ Correct!'
              : `✗ The answer is: ${question.correctAnswer}`}
          </p>
          <button
            onClick={handleNext}
            className="rounded-xl bg-emerald-600 px-8 py-3 text-white font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
          >
            {currentIndex + 1 < QUESTIONS_PER_ROUND ? 'Next Question →' : 'See Results'}
          </button>
        </div>
      )}
    </div>
  )
}
