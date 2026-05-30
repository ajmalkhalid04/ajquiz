import { useState } from 'react'
import type { Surah, SurahFact } from '@/types/quiz'

interface SurahCardProps {
  surah: Surah
  prevSurah: Surah | null
  nextSurah: Surah | null
  active: boolean
  facts?: SurahFact[]
}

function juzLabel(s: Surah): string {
  if (!s.juz_start) return '—'
  if (s.juz_end && s.juz_end !== s.juz_start) return `${s.juz_start} – ${s.juz_end}`
  return String(s.juz_start)
}

const LABEL_CLS = 'text-[11px] font-bold uppercase tracking-[0.25em] mb-1'
const VALUE_CLS = 'text-2xl font-black leading-tight'

function factBadgeClass(grade: string | null): string {
  if (grade === 'daif' || grade === 'mawdu') {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
  }
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300'
}

/* ── Active (center) card ── */
function ActiveCard({ surah, prevSurah, nextSurah, facts }: Omit<SurahCardProps, 'active'>) {
  const isMeccan = surah.revelation_type === 'Meccan'
  const allFacts = facts ?? []
  const [tab, setTab] = useState<'info' | 'facts'>('info')

  return (
    <div className="h-full rounded-3xl overflow-hidden flex flex-col shadow-2xl bg-white dark:bg-gray-800 ring-1 ring-emerald-100 dark:ring-emerald-800">

      {/* ── Row 1: 2-box header (Surah # | Revelation origin) ── */}
      <div className="grid grid-cols-2 bg-gradient-to-br from-emerald-600 to-emerald-800">

        {/* Box A — Surah number */}
        <div className="px-4 py-4 border-r border-white/10">
          <p className={`${LABEL_CLS} text-emerald-300`}>Surah</p>
          <p className="text-4xl font-black text-white leading-none">{surah.number}</p>
        </div>

        {/* Box B — Revelation city */}
        <div className="px-4 py-4 flex flex-col justify-center">
          <p className={`${LABEL_CLS} text-emerald-300`}>Revealed in</p>
          <p className="text-2xl leading-none mt-1" role="img" aria-label={surah.revelation_type}>
            {isMeccan ? '🕋' : '🕌'}
          </p>
          <p className="text-sm font-black text-white leading-tight mt-0.5">
            {isMeccan ? 'Mecca' : 'Madina'}
          </p>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={() => setTab('info')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            tab === 'info'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setTab('facts')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            tab === 'facts'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          Facts{allFacts.length > 0 ? ` (${allFacts.length})` : ''}
        </button>
      </div>

      {/* ── Info tab ── */}
      {tab === 'info' && (
        <>
          {/* Row 2: Arabic + English + Meaning */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 text-center gap-1.5 bg-white dark:bg-gray-800">
            <p
              dir="rtl"
              className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-snug"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {surah.name_arabic}
            </p>
            <p className="text-base font-bold text-gray-700 dark:text-gray-200 mt-1">
              {surah.name_english}
            </p>
            {surah.name_meaning && (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                &ldquo;{surah.name_meaning}&rdquo;
              </p>
            )}
          </div>

          {/* Row 3: Juz | Verses */}
          <div className="grid grid-cols-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
            <div className="px-4 py-3 border-r border-gray-100 dark:border-gray-600 text-center">
              <p className={`${LABEL_CLS} text-gray-400 dark:text-gray-400`}>Juz</p>
              <p className="text-xl font-black leading-tight text-gray-800 dark:text-gray-100 whitespace-nowrap">{juzLabel(surah)}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className={`${LABEL_CLS} text-gray-400 dark:text-gray-400`}>Verses</p>
              <p className={`${VALUE_CLS} text-gray-800 dark:text-gray-100`}>{surah.verse_count ?? '—'}</p>
            </div>
          </div>

          {/* Row 4: Neighbouring surahs footer */}
          <div className="flex items-center justify-between px-4 py-2 bg-emerald-600 text-white border-t border-emerald-400/40 rounded-b-3xl overflow-hidden">
            <span className="text-xs truncate max-w-[45%] text-white">
              {prevSurah ? `← ${prevSurah.name_english}` : ''}
            </span>
            <span className="text-xs truncate max-w-[45%] text-right text-white">
              {nextSurah ? `${nextSurah.name_english} →` : ''}
            </span>
          </div>
        </>
      )}

      {/* ── Facts tab ── */}
      {tab === 'facts' && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-white dark:bg-gray-800 rounded-b-3xl overflow-hidden">
          {allFacts.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center pt-6">No facts yet.</p>
          ) : allFacts.map((fact) => (
            <div
              key={fact.id}
              className="rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 px-3 py-2.5 space-y-1"
            >
              <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{fact.title}</p>
              {fact.description && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{fact.description}</p>
              )}
              {fact.hadith_grade && (
                <span className={`inline-block rounded-full text-[10px] px-2 py-0.5 font-semibold ${factBadgeClass(fact.hadith_grade)}`}>
                  {fact.hadith_grade}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default function SurahCard({ surah, prevSurah, nextSurah, active, facts }: SurahCardProps) {
  if (!active) return null
  return <ActiveCard surah={surah} prevSurah={prevSurah} nextSurah={nextSurah} facts={facts} />
}
