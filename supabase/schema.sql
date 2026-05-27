-- ============================================================
-- AjQuiz Schema — Phase 1
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Quiz Categories
create table if not exists quiz_categories (
  id          serial primary key,
  slug        text unique not null,
  label       text not null,
  description text,
  icon        text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

insert into quiz_categories (slug, label, description, icon) values
  ('sudoku',  'Sudoku',        'Classic number puzzle',              '🔢'),
  ('wordle',  'Wordle',        'Guess the hidden word',              '🟩'),
  ('animals', 'Animal Quiz',   'Identify the animal from the image', '🐾'),
  ('flags',   'Flag Quiz',     'Match the flag to the country',      '🚩'),
  ('quran',   'Quran Surahs',  'Memorize all 114 surah names',       '📖')
on conflict (slug) do nothing;

-- 2. Quran Surahs
create table if not exists quran_surahs (
  id              serial primary key,
  number          int unique not null,
  name_arabic     text not null,
  name_english    text not null,
  name_meaning    text,
  revelation_type text check (revelation_type in ('Meccan','Medinan')),
  verse_count     int,
  group_set       int generated always as (ceil(number::numeric / 10)) stored
);
