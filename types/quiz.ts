export type SurahFactType = 'alt_name' | 'famous_ayah' | 'distinction' | 'linguistic'
export type HadithGrade   = 'sahih' | 'hasan' | 'daif' | 'mawdu'

export interface SurahFact {
  id: number
  surah_number: number
  fact_type: SurahFactType
  title: string
  description: string | null
  ayah_ref: string | null
  hadith_grade: HadithGrade | null
  hadith_ref: string | null
}

export interface Surah {
  number: number
  name_arabic: string
  name_english: string
  name_meaning: string | null
  revelation_type: string
  verse_count: number | null
  juz_start?: number | null
  juz_end?: number | null
}

export interface QuizQuestion {
  question: string
  surah: Surah
  choices: string[]
  correctAnswer: string
}

export type QuizPhase = 'loading' | 'playing' | 'answered' | 'finished' | 'error'

export type PracticeMode =
  | 'browse'
  | 'number_to_name'
  | 'name_to_number'
  | 'name_to_juz'
  | 'name_to_verse_count'
