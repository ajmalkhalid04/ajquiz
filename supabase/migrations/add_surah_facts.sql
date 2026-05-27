-- AJQuiz Migration — surah_facts table
-- Run AFTER add_juz_columns.sql in the Supabase SQL Editor

create table if not exists surah_facts (
  id             serial primary key,
  surah_number   int  not null references quran_surahs(number) on delete cascade,
  fact_type      text not null check (fact_type in ('alt_name', 'famous_ayah', 'distinction', 'linguistic')),
  title          text not null,
  description    text,
  ayah_ref       text,
  hadith_grade   text check (hadith_grade in ('sahih', 'hasan', 'daif', 'mawdu')),
  hadith_ref     text,
  constraint surah_facts_unique unique (surah_number, fact_type, title)
);

create index on surah_facts(surah_number);

alter table surah_facts enable row level security;
create policy "Public read surah_facts" on surah_facts for select using (true);
