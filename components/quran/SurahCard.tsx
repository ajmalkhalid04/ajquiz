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

/* ── Peek (inactive) card ── */
function PeekCard({ surah }: { surah: Surah }) {
  return (
    <div className="h-full rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col opacity-55 hover:opacity-80 transition-opacity duration-200">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-5 py-4 grid grid-cols-2 gap-3">
        <div>
          <p className={`${LABEL_CLS} text-emerald-300`}>Surah</p>
          <p className={`${VALUE_CLS} text-white text-2xl`}>{surah.number}</p>
        </div>
        <div className="flex flex-col justify-center">
          <p className={`${LABEL_CLS} text-emerald-300`}>Origin</p>
          <p className="text-lg leading-none">
            {surah.revelation_type === 'Meccan' ? '🕋' : '🕌'}
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 bg-white dark:bg-gray-800 text-center">
        <p dir="rtl" className="text-3xl font-bold text-gray-800 dark:text-gray-100 leading-snug"
          style={{ fontFamily: "'Amiri', serif" }}>
          {surah.name_arabic}
        </p>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{surah.name_english}</p>
      </div>
    </div>
  )
}

/* ── Active (center) card ── */
function ActiveCard({ surah, prevSurah, nextSurah, facts }: Omit<SurahCardProps, 'active'>) {
  const isMeccan = surah.revelation_type === 'Meccan'
  const visibleFacts = (facts ?? []).slice(0, 3)

  return (
    <div className="h-full rounded-3xl overflow-hidden flex flex-col shadow-2xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800">

      {/* ── Row 1: 2-box header (Surah # | Revelation origin) ── */}
      <div className="grid grid-cols-2 bg-gradient-to-br from-emerald-600 to-emerald-800">

        {/* Box A — Surah number */}
        <div className="px-5 py-5 border-r border-white/10">
          <p className={`${LABEL_CLS} text-emerald-300`}>Surah</p>
          <p className="text-4xl font-black text-white leading-none">{surah.number}</p>
        </div>

        {/* Box B — Revelation city */}
        <div className="px-5 py-5 flex flex-col justify-center">
          <p className={`${LABEL_CLS} text-emerald-300`}>Revealed in</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl leading-none" role="img" aria-label={surah.revelation_type}>
              {isMeccan ? '🕋' : '🕌'}
            </span>
            <span className={`${VALUE_CLS} text-white`}>
              {isMeccan ? 'Mecca' : 'Madina'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 2: Arabic + English + Meaning (hero section) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-5 text-center gap-2 bg-white dark:bg-gray-800">
        <p
          dir="rtl"
          className="text-5xl font-bold text-gray-900 dark:text-gray-100 leading-snug"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {surah.name_arabic}
        </p>
        <p className="text-lg font-bold text-gray-700 dark:text-gray-200 mt-1">
          {surah.name_english}
        </p>
        {surah.name_meaning && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            &ldquo;{surah.name_meaning}&rdquo;
          </p>
        )}
      </div>

      {/* ── Row 3: 2-box info strip (Juz | Verses) ── */}
      <div className="grid grid-cols-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">

        {/* Box C — Juz */}
        <div className="px-5 py-4 border-r border-gray-100 dark:border-gray-600 text-center">
          <p className={`${LABEL_CLS} text-gray-400 dark:text-gray-400`}>Juz</p>
          <p className={`${VALUE_CLS} text-gray-800 dark:text-gray-100`}>{juzLabel(surah)}</p>
        </div>

        {/* Box D — Verses */}
        <div className="px-5 py-4 text-center">
          <p className={`${LABEL_CLS} text-gray-400 dark:text-gray-400`}>Verses</p>
          <p className={`${VALUE_CLS} text-gray-800 dark:text-gray-100`}>{surah.verse_count ?? '—'}</p>
        </div>
      </div>

      {/* ── Row 3.5: Facts badge strip (only when facts exist) ── */}
      {visibleFacts.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-800 px-4 py-3 flex flex-wrap gap-1.5">
          {visibleFacts.map((fact) => (
            <span
              key={fact.id}
              className={`rounded-full text-[10px] px-2.5 py-1 font-semibold ${factBadgeClass(fact.hadith_grade)}`}
            >
              {fact.title}
            </span>
          ))}
        </div>
      )}

      {/* ── Row 4: Neighbouring surahs footer ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[45%]">
          {prevSurah ? `← ${prevSurah.name_english}` : ''}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[45%] text-right">
          {nextSurah ? `${nextSurah.name_english} →` : ''}
        </span>
      </div>

    </div>
  )
}

export default function SurahCard({ surah, prevSurah, nextSurah, active, facts }: SurahCardProps) {
  if (!active) return <PeekCard surah={surah} />
  return <ActiveCard surah={surah} prevSurah={prevSurah} nextSurah={nextSurah} facts={facts} />
}
