'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { Surah, SurahFact } from '@/types/quiz'
import Link from 'next/link'
import ProgressBar from '@/components/ProgressBar'

export const dynamic = 'force-dynamic'

interface Question {
  question: string
  choices: string[]
  correct: string
  factSurah: Surah
  facts: SurahFact[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function quizSafe(facts: SurahFact[]): SurahFact[] {
  return facts.filter(
    (f) => f.hadith_grade === null || f.hadith_grade === 'sahih' || f.hadith_grade === 'hasan'
  )
}

function buildQuestions(surah: Surah, all: Surah[], allFacts: SurahFact[]): Question[] {
  const others = shuffle(all.filter((s) => s.number !== surah.number))
  const surahFacts = allFacts.filter((f) => f.surah_number === surah.number)
  const qs: Question[] = []

  // Q1 — name from number
  qs.push({
    question: `What is the name of Surah #${surah.number}?`,
    choices: shuffle([surah.name_english, ...others.slice(0, 3).map((s) => s.name_english)]),
    correct: surah.name_english,
    factSurah: surah,
    facts: surahFacts,
  })

  // Q2 — number from name
  qs.push({
    question: `Which number surah is ${surah.name_english}?`,
    choices: shuffle([String(surah.number), ...others.slice(3, 6).map((s) => String(s.number))]),
    correct: String(surah.number),
    factSurah: surah,
    facts: surahFacts,
  })

  // Q3 — surah before (if not first)
  if (surah.number > 1) {
    const prev = all.find((s) => s.number === surah.number - 1)!
    const prevFacts = allFacts.filter((f) => f.surah_number === prev.number)
    qs.push({
      question: `Which surah comes before ${surah.name_english}?`,
      choices: shuffle([prev.name_english, ...others.filter((s) => s.number !== prev.number).slice(0, 3).map((s) => s.name_english)]),
      correct: prev.name_english,
      factSurah: prev,
      facts: prevFacts,
    })
  }

  // Q4 — surah after (if not last)
  if (surah.number < all.length) {
    const next = all.find((s) => s.number === surah.number + 1)!
    const nextFacts = allFacts.filter((f) => f.surah_number === next.number)
    qs.push({
      question: `Which surah comes after ${surah.name_english}?`,
      choices: shuffle([next.name_english, ...others.filter((s) => s.number !== next.number).slice(0, 3).map((s) => s.name_english)]),
      correct: next.name_english,
      factSurah: next,
      facts: nextFacts,
    })
  }

  // Q5 — revelation type (binary)
  qs.push({
    question: `Was ${surah.name_english} revealed in Mecca or Madina?`,
    choices: shuffle(['Mecca 🕋', 'Madina 🕌']),
    correct: surah.revelation_type === 'Meccan' ? 'Mecca 🕋' : 'Madina 🕌',
    factSurah: surah,
    facts: surahFacts,
  })

  // Q6 — verse count (if available)
  if (surah.verse_count != null) {
    const verseOthers = others.filter((s) => s.verse_count != null).slice(0, 3)
    qs.push({
      question: `How many verses does ${surah.name_english} have?`,
      choices: shuffle([String(surah.verse_count), ...verseOthers.map((s) => String(s.verse_count))]),
      correct: String(surah.verse_count),
      factSurah: surah,
      facts: surahFacts,
    })
  }

  // Q7 — juz (if available)
  if (surah.juz_start != null) {
    const allJuz = Array.from({ length: 30 }, (_, i) => String(i + 1))
    const juzDistractors = shuffle(allJuz.filter((j) => j !== String(surah.juz_start))).slice(0, 3)
    qs.push({
      question: `In which Juz does Surah ${surah.name_english} begin?`,
      choices: shuffle([String(surah.juz_start), ...juzDistractors]),
      correct: String(surah.juz_start),
      factSurah: surah,
      facts: surahFacts,
    })
  }

  // Q8 — meaning (if available)
  if (surah.name_meaning) {
    const meaningOthers = others.filter((s) => s.name_meaning).slice(0, 3)
    qs.push({
      question: `What does "${surah.name_english}" mean?`,
      choices: shuffle([surah.name_meaning, ...meaningOthers.map((s) => s.name_meaning!)]),
      correct: surah.name_meaning,
      factSurah: surah,
      facts: surahFacts,
    })
  }

  // Q9 — alt name → answer is the alt name title
  const safeAltNames = quizSafe(allFacts.filter((f) => f.fact_type === 'alt_name'))
  const surahAltNames = safeAltNames.filter((f) => f.surah_number === surah.number)
  if (surahAltNames.length > 0 && safeAltNames.length >= 4) {
    const target = surahAltNames[0]
    const distractors = shuffle(safeAltNames.filter((f) => f.surah_number !== surah.number))
      .slice(0, 3)
      .map((f) => f.title)
    qs.push({
      question: `What is another name for Surah ${surah.name_english}?`,
      choices: shuffle([target.title, ...distractors]),
      correct: target.title,
      factSurah: surah,
      facts: surahFacts,
    })
  }

  // Q10 — distinction → answer is the surah name
  const surahDistinctions = quizSafe(surahFacts.filter((f) => f.fact_type === 'distinction'))
  if (surahDistinctions.length > 0) {
    const target = surahDistinctions[0]
    qs.push({
      question: `Which surah is known for: "${target.title}"?`,
      choices: shuffle([surah.name_english, ...others.slice(0, 3).map((s) => s.name_english)]),
      correct: surah.name_english,
      factSurah: surah,
      facts: surahFacts,
    })
  }

  // Q11 — famous ayah → answer is the surah name
  const surahFamousAyahs = quizSafe(surahFacts.filter((f) => f.fact_type === 'famous_ayah'))
  if (surahFamousAyahs.length > 0) {
    const target = surahFamousAyahs[0]
    qs.push({
      question: `Which surah contains ${target.title}?`,
      choices: shuffle([surah.name_english, ...others.slice(0, 3).map((s) => s.name_english)]),
      correct: surah.name_english,
      factSurah: surah,
      facts: surahFacts,
    })
  }

  // Q12 — linguistic/structural → answer is the surah name
  const surahLinguistic = surahFacts.filter((f) => f.fact_type === 'linguistic')
  if (surahLinguistic.length > 0) {
    const target = surahLinguistic[0]
    qs.push({
      question: `Which surah ${target.title.charAt(0).toLowerCase() + target.title.slice(1)}?`,
      choices: shuffle([surah.name_english, ...others.slice(0, 3).map((s) => s.name_english)]),
      correct: surah.name_english,
      factSurah: surah,
      facts: surahFacts,
    })
  }

  return qs
}

function choiceStyle(choice: string, selected: string | null, correct: string): string {
  const base = 'w-full rounded-xl border-2 px-4 py-3 text-left font-semibold transition-all text-sm'
  if (selected === null) {
    return `${base} border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 active:scale-95`
  }
  if (choice === correct) {
    return `${base} border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300`
  }
  if (choice === selected) {
    return `${base} border-red-400 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300`
  }
  return `${base} border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500`
}

function HadithBadge({ grade, ref: hadithRef }: { grade: string | null; ref: string | null }) {
  if (!grade) return null
  if (grade === 'sahih') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300">
        ✓ Sahih{hadithRef ? ` · ${hadithRef}` : ''}
      </span>
    )
  }
  if (grade === 'hasan') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-800/60 text-blue-700 dark:text-blue-300">
        ✓ Hasan{hadithRef ? ` · ${hadithRef}` : ''}
      </span>
    )
  }
  return null
}

export default function SurahPracticePage() {
  const params = useParams()
  const surahNumber = Number(params.number)

  const [allSurahs, setAllSurahs] = useState<Surah[]>([])
  const [allFacts, setAllFacts]   = useState<SurahFact[]>([])
  const [surah, setSurah]         = useState<Surah | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [phase, setPhase]         = useState<'loading' | 'playing' | 'answered' | 'finished' | 'error'>('loading')
  const [index, setIndex]         = useState(0)
  const [score, setScore]         = useState(0)
  const [selected, setSelected]   = useState<string | null>(null)

  const startPractice = useCallback((s: Surah, all: Surah[], facts: SurahFact[]) => {
    setQuestions(buildQuestions(s, all, facts))
    setIndex(0)
    setScore(0)
    setSelected(null)
    setPhase('playing')
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const withJuz = await getSupabase()
        .from('quran_surahs')
        .select('number, name_arabic, name_english, name_meaning, revelation_type, verse_count, juz_start, juz_end')
        .order('number', { ascending: true })

      const { data, error } = withJuz.error
        ? await getSupabase()
            .from('quran_surahs')
            .select('number, name_arabic, name_english, name_meaning, revelation_type, verse_count')
            .order('number', { ascending: true })
        : withJuz

      if (cancelled) return
      if (error || !data) { setPhase('error'); return }

      const all    = data as Surah[]
      const target = all.find((s) => s.number === surahNumber)
      if (!target) { setPhase('error'); return }

      // Fetch all facts (small table) for distractor pool
      const { data: factsData } = await getSupabase()
        .from('surah_facts')
        .select('id, surah_number, fact_type, title, description, ayah_ref, hadith_grade, hadith_ref')

      if (cancelled) return
      const facts = (factsData ?? []) as SurahFact[]

      setAllSurahs(all)
      setSurah(target)
      setAllFacts(facts)
      startPractice(target, all, facts)
    }
    load()
    return () => { cancelled = true }
  }, [surahNumber, startPractice])

  function handleAnswer(choice: string) {
    if (selected !== null) return
    setSelected(choice)
    if (choice === questions[index].correct) setScore((s) => s + 1)
    setPhase('answered')
  }

  function handleNext() {
    if (index + 1 >= questions.length) { setPhase('finished'); return }
    setIndex((i) => i + 1)
    setSelected(null)
    setPhase('playing')
  }

  /* ── Loading ── */
  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    )
  }

  /* ── Error ── */
  if (phase === 'error' || !surah) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-red-500 text-lg font-medium">Surah not found.</p>
        <Link href="/quiz/quran/learn" className="text-emerald-600 dark:text-emerald-400 underline mt-2">
          ← Back to Learn
        </Link>
      </div>
    )
  }

  /* ── Finished ── */
  if (phase === 'finished') {
    const pct = score / questions.length
    const scoreColor = pct >= 0.7 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 0.4 ? 'text-amber-500' : 'text-red-500'
    const msg = pct === 1 ? 'Perfect! Mashallah!' : pct >= 0.7 ? 'Great job!' : 'Keep practising!'
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center gap-6 py-12 text-center">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-1">Surah {surah.number}</p>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{surah.name_english}</p>
        </div>

        <div className={`text-6xl font-black ${scoreColor}`}>{score} / {questions.length}</div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{msg}</p>

        <div className="flex gap-3 mt-2 w-full max-w-xs">
          <button
            onClick={() => startPractice(surah, allSurahs, allFacts)}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-white font-semibold active:scale-95 transition-all"
          >
            Try Again
          </button>
          <Link
            href={`/quiz/quran/learn?surah=${surah.number}`}
            className="flex-1 rounded-xl border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 px-6 py-3 font-semibold text-center hover:bg-emerald-50 dark:hover:bg-emerald-900/30 active:scale-95 transition-all"
          >
            ← Learn
          </Link>
        </div>
      </div>
    )
  }

  /* ── Playing / Answered ── */
  const q = questions[index]

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/quiz/quran/learn?surah=${surah.number}`} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm">
          ← Back
        </Link>
      </div>

      <ProgressBar current={index + 1} total={questions.length} />

      {/* Question card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6 leading-snug">
          {q.question}
        </p>

        {/* Choices */}
        <div className={`grid gap-3 ${q.choices.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {q.choices.map((choice) => (
            <button
              key={choice}
              onClick={() => handleAnswer(choice)}
              disabled={selected !== null}
              className={choiceStyle(choice, selected, q.correct)}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback + Surah fact card + Next */}
      {phase === 'answered' && (
        <div className="mt-4 space-y-3">
          <p className={`text-sm font-semibold text-center ${selected === q.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {selected === q.correct ? '✓ Correct!' : `✗ Answer: ${q.correct}`}
          </p>

          {/* Surah fact card */}
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 px-4 py-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Did you know?</p>

            {/* Name + meaning */}
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
              Surah #{q.factSurah.number} is {q.factSurah.name_english}
              {q.factSurah.name_meaning && (
                <span className="font-normal text-gray-500 dark:text-gray-400"> — meaning &ldquo;{q.factSurah.name_meaning}&rdquo;</span>
              )}
            </p>

            {/* Fact grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800 px-3 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Revealed</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {q.factSurah.revelation_type === 'Meccan' ? 'Mecca 🕋' : 'Madina 🕌'}
                </p>
              </div>
              <div className="rounded-lg bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800 px-3 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Verses</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{q.factSurah.verse_count ?? '—'}</p>
              </div>
              <div className="rounded-lg bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800 px-3 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Juz</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {q.factSurah.juz_start
                    ? q.factSurah.juz_end && q.factSurah.juz_end !== q.factSurah.juz_start
                      ? `${q.factSurah.juz_start}–${q.factSurah.juz_end}`
                      : String(q.factSurah.juz_start)
                    : '—'}
                </p>
              </div>
            </div>

            {/* Facts strip */}
            {q.facts.length > 0 && (
              <div className="border-t border-emerald-200 dark:border-emerald-700 pt-3 space-y-2">
                {q.facts.slice(0, 2).map((fact) => (
                  <div key={fact.id} className="rounded-lg bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800 px-3 py-2.5 space-y-1">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{fact.title}</p>
                    {fact.description && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{fact.description}</p>
                    )}
                    <HadithBadge grade={fact.hadith_grade} ref={fact.hadith_ref} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={handleNext}
              className="rounded-xl bg-emerald-600 px-8 py-3 text-white font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
            >
              {index + 1 < questions.length ? 'Next →' : 'See Results'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
