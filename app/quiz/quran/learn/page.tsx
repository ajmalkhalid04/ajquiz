'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Surah, SurahFact } from '@/types/quiz'
import SurahCard from '@/components/quran/SurahCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

/**
 * Phonetic normalizer for Arabic transliteration variants.
 * Strips the definite article (al/an/ar…), collapses q→k,
 * and unifies long-vowel spellings so that, e.g.,
 * "yaseen" / "yasin" / "yas"  →  "yasin"  ✓  Ya-Sin
 * "alan" / "boot"              →  "an"/"but" ✓  Al-Ankabut
 * "kasas" / "qasas"           →  "kasas"   ✓  Al-Qasas
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[-'''\s]/g, '') // strip hyphens, apostrophes, spaces
    .replace(/ph/g, 'f')                // ph → f
    .replace(/kh/g, 'x')               // kh → x (distinct from plain k)
    .replace(/sh/g, 'c')               // sh → c (distinct from s)
    .replace(/th/g, 'd')               // th → d
    .replace(/q/g, 'k')                // q ↔ k  (qaf)
    .replace(/ee|iy|ei/g, 'i')         // long-i variants
    .replace(/aa/g, 'a')               // long-a
    .replace(/oo|ou|uw|ue/g, 'u')      // long-u variants
    .replace(/^(al|an|ar|as|at|az|ad)/, '') // strip Arabic definite article
}

function DotIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <div className={`rounded-full transition-all duration-200 w-1.5 h-1.5 ${
        current > 0 ? 'bg-gray-300 dark:bg-gray-600' : 'bg-transparent'
      }`} />
      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 transition-all duration-200" />
      <div className={`rounded-full transition-all duration-200 w-1.5 h-1.5 ${
        current < total - 1 ? 'bg-gray-300 dark:bg-gray-600' : 'bg-transparent'
      }`} />
    </div>
  )
}

export default function PracticePage() {
  const [surahs, setSurahs]         = useState<Surah[]>([])
  const [allFacts, setAllFacts]     = useState<SurahFact[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [index, setIndex]           = useState(0)
  const [containerW, setContainerW] = useState(0)

  // search
  const [query, setQuery]           = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX  = useRef<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => setContainerW(e.contentRect.width))
    ro.observe(containerRef.current)
    setContainerW(containerRef.current.offsetWidth)
    return () => ro.disconnect()
  }, [loading])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
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
        if (error || !data) { setError(true); setLoading(false); return }

        const { data: factsData } = await getSupabase()
          .from('surah_facts')
          .select('id, surah_number, fact_type, title, description, ayah_ref, hadith_grade, hadith_ref')

        if (cancelled) return
        setSurahs(data as Surah[])
        setAllFacts((factsData ?? []) as SurahFact[])
        setLoading(false)
      } catch {
        if (!cancelled) { setError(true); setLoading(false) }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Restore carousel position when returning from surah practice (?surah=N)
  useEffect(() => {
    if (surahs.length === 0) return
    const params = new URLSearchParams(window.location.search)
    const surahNum = Number(params.get('surah'))
    if (surahNum > 0) {
      const idx = surahs.findIndex((s) => s.number === surahNum)
      if (idx !== -1) setIndex(idx)
    }
  }, [surahs])

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex((i) => Math.min(surahs.length - 1, i + 1)), [surahs.length])

  // Keyboard arrow navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [prev, next])

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  // Client-side search filtering (exact + phonetic-normalized)
  const q = query.trim().toLowerCase()
  const nq = normalize(q)
  const searchResults = q.length === 0 ? [] : surahs
    .filter((s) => {
      if (String(s.number).includes(q)) return true
      const nameL = s.name_english.toLowerCase()
      if (nameL.includes(q) || normalize(nameL).includes(nq)) return true
      if (s.name_arabic.includes(query.trim())) return true
      const meaning = (s.name_meaning ?? '').toLowerCase()
      if (meaning.includes(q) || normalize(meaning).includes(nq)) return true
      return false
    })
    .slice(0, 8)

  function selectSurah(s: Surah) {
    setIndex(surahs.findIndex((x) => x.number === s.number))
    setQuery('')
    setShowResults(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">Loading surahs…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-red-500 text-lg font-medium">Failed to load surah data.</p>
        <Link href="/quiz/quran" className="text-emerald-600 dark:text-emerald-400 underline mt-2">← Back</Link>
      </div>
    )
  }

  const currentFacts = surahs.length > 0
    ? allFacts.filter((f) => f.surah_number === surahs[index].number)
    : []

  const currSurah = surahs[index]
  const prevSurah = index > 0               ? surahs[index - 1] : null
  const nextSurah = index < surahs.length - 1 ? surahs[index + 1] : null

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/quiz/quran" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm">← Back</Link>
          <h1 className="text-base font-bold text-gray-700 dark:text-gray-200">Learn</h1>
        </div>
        <span className="text-sm text-gray-400 dark:text-gray-500">{index + 1} / {surahs.length}</span>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Search by name, meaning or number…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true) }}
            onFocus={() => setShowResults(true)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setShowResults(false) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
            {searchResults.map((s) => (
              <li key={s.number}>
                <button
                  onClick={() => selectSurah(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 w-6 shrink-0">#{s.number}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{s.name_english}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto shrink-0">{s.name_meaning}</span>
                  <span className="text-base shrink-0" style={{ fontFamily: "'Amiri', serif" }} dir="rtl">
                    {s.name_arabic}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {showResults && q.length > 0 && searchResults.length === 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
            No surahs found.
          </div>
        )}
      </div>

      {/* Carousel — full-width, no peek cards */}
      <div className="rounded-[2rem] bg-gradient-to-b from-emerald-100/40 via-white to-white">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-3xl bg-white"
          style={{ height: 420 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {containerW > 0 && (
            <div
              key={index}
              className="absolute top-0 bottom-0"
              style={{ left: 0, width: containerW }}
            >
              <SurahCard
                surah={currSurah}
                prevSurah={prevSurah}
                nextSurah={nextSurah}
                facts={currentFacts}
                active
              />
            </div>
          )}
        </div>
      </div>

      {/* Dot indicator */}
      <DotIndicator current={index} total={surahs.length} />

      {/* Practice button */}
      <Link
        href={`/quiz/quran/surah/${currSurah.number}`}
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-white font-semibold active:scale-95 transition-all mb-4"
      >
        Practice this surah →
      </Link>
    </div>
  )
}
