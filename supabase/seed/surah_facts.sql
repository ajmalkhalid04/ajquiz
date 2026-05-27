-- AJQuiz Seed — surah_facts
-- Run AFTER add_surah_facts.sql migration
-- Only sahih hadith and Quranic/structural facts (null grade) are included.

insert into surah_facts (surah_number, fact_type, title, description, ayah_ref, hadith_grade, hadith_ref) values

-- ── Al-Fatihah (1) ─────────────────────────────────────────────────────────
(1, 'alt_name', 'Umm al-Kitab',
  'Meaning "Mother of the Book". Called this because it contains the essence of the entire Quran — praise of Allah, His attributes, guidance, and the straight path.',
  null, 'sahih', 'Bukhari 756'),

(1, 'alt_name', 'As-Sab'' al-Mathani',
  'Meaning "The Seven Oft-Repeated Verses". Named so because its 7 verses are recited in every rak''ah of Salah.',
  null, 'sahih', 'Bukhari 4704'),

(1, 'distinction', 'Obligatory in every rak''ah of Salah',
  'The Prophet ﷺ said: "There is no prayer for one who does not recite the Opening of the Book (Al-Fatihah)."',
  null, 'sahih', 'Bukhari 756'),

-- ── Al-Baqarah (2) ─────────────────────────────────────────────────────────
(2, 'distinction', 'Longest surah in the Quran',
  'Al-Baqarah has 286 verses — the most of any surah in the Quran. It was revealed progressively throughout the entire Medinan period.',
  null, null, null),

(2, 'famous_ayah', 'Ayat al-Kursi',
  'Known as the greatest verse in the Quran. The Prophet ﷺ said whoever recites it after every obligatory prayer, nothing will prevent them from entering Paradise except death.',
  '2:255', 'sahih', 'Bukhari 2311'),

(2, 'famous_ayah', 'Ayat ad-Dayn — longest single verse',
  'The longest verse in the Quran. It deals with the recording of debt and financial contracts, emphasising justice and documentation.',
  '2:282', null, null),

(2, 'famous_ayah', 'Last two verses suffice for the night',
  'The Prophet ﷺ said: "Whoever recites the last two verses of Al-Baqarah at night, they will suffice him."',
  '2:285-286', 'sahih', 'Bukhari 5009'),

(2, 'linguistic', 'Begins with Huruf Muqatta''at: Alif Lam Meem',
  'Al-Baqarah opens with three disconnected letters — Alif (ا), Lam (ل), Meem (م). The exact meaning of these letters is known only to Allah.',
  null, null, null),

-- ── Al-Ma''idah (5) ────────────────────────────────────────────────────────
(5, 'famous_ayah', 'Verse of Perfection of Religion',
  '"This day I have perfected your religion for you, completed my favour upon you, and have chosen for you Islam as your religion." Revealed on the Day of Arafah.',
  '5:3', 'sahih', 'Bukhari 45'),

-- ── At-Tawbah (9) ──────────────────────────────────────────────────────────
(9, 'linguistic', 'Only surah without Bismillah',
  'At-Tawbah is the only surah in the Quran that does not begin with Bismillah (In the name of Allah, the Most Gracious, the Most Merciful). Scholars give various explanations, the most common being that it was a surah of disavowal and warning.',
  null, null, null),

-- ── Maryam (19) ────────────────────────────────────────────────────────────
(19, 'linguistic', 'Begins with Huruf Muqatta''at: Kaf Ha Ya Ain Sad',
  'Maryam opens with five disconnected letters — the longest sequence of Huruf Muqatta''at in the Quran. Their precise meaning is known only to Allah.',
  null, null, null),

-- ── Ta-Ha (20) ─────────────────────────────────────────────────────────────
(20, 'linguistic', 'Begins with Huruf Muqatta''at: Ta Ha',
  'Ta-Ha opens with two disconnected letters. It is also the name of the surah. The surah recounts the story of Musa (Moses) and the burning bush.',
  null, null, null),

-- ── An-Naml (27) ───────────────────────────────────────────────────────────
(27, 'linguistic', 'Contains two Bismillahs',
  'An-Naml is the only surah with two occurrences of Bismillah — once at the opening (27:1) and once within verse 30, in the letter of Sulayman (Solomon) sent to the Queen of Sheba.',
  '27:30', null, null),

-- ── Al-Kahf (18) ───────────────────────────────────────────────────────────
(18, 'distinction', 'Recited on Fridays for protection from Dajjal',
  'The Prophet ﷺ said: "Whoever recites Surah Al-Kahf on Friday, a light will shine for him between the two Fridays." Memorising its first or last ten verses protects from the Dajjal.',
  null, 'sahih', 'Muslim 809'),

(18, 'famous_ayah', 'Story of Dhul-Qarnayn',
  'Contains the account of Dhul-Qarnayn, a righteous king who travelled the earth and built a barrier (the Sadd) to protect a people from Gog and Magog (Yajuj and Majuj).',
  '18:83-98', null, null),

-- ── Ya-Sin (36) ────────────────────────────────────────────────────────────
(36, 'linguistic', 'Begins with Huruf Muqatta''at: Ya Seen',
  'Ya-Sin opens with two disconnected letters, which are also the surah''s name. The exact meaning is known only to Allah.',
  null, null, null),

-- ── Qaf (50) ───────────────────────────────────────────────────────────────
(50, 'linguistic', 'Begins with Huruf Muqatta''at: Qaf',
  'Surah Qaf opens with the single letter Qaf (ق). The Prophet ﷺ would often recite this surah in the Friday Khutbah.',
  null, null, null),

-- ── Al-Mulk (67) ───────────────────────────────────────────────────────────
(67, 'alt_name', 'Al-Mani''ah (The Protector)',
  'Also called Al-Mani''ah — The Protector — because it protects its reciter from the punishment of the grave.',
  null, null, null),

(67, 'distinction', 'Intercedes for its reciter until forgiven',
  'The Prophet ﷺ said: "There is a surah in the Quran, consisting of thirty verses, which interceded for its companion (the one who recited it) until he was forgiven."',
  null, 'sahih', 'Abu Dawud 1400'),

-- ── Al-Qalam (68) ──────────────────────────────────────────────────────────
(68, 'linguistic', 'Begins with Huruf Muqatta''at: Nun',
  'Al-Qalam opens with the single letter Nun (ن). It is also among the earliest surahs revealed in Mecca.',
  null, null, null),

-- ── Al-Kawthar (108) ───────────────────────────────────────────────────────
(108, 'linguistic', 'Shortest surah in the Quran',
  'Al-Kawthar has only 3 verses, 10 words, and 42 letters — the shortest surah in the Quran. Despite its brevity, it carries immense meaning about the blessings Allah granted the Prophet ﷺ.',
  null, null, null),

-- ── Al-Ikhlas (112) ────────────────────────────────────────────────────────
(112, 'distinction', 'Equal in reward to one-third of the Quran',
  'The Prophet ﷺ said: "Say: He is Allah, One — is equal to one-third of the Quran." This is because it describes the pure attributes of Allah (tawhid al-asma'' wa''l-sifat), which is one of the three fundamental themes of the Quran.',
  null, 'sahih', 'Bukhari 5015'),

-- ── Al-Falaq (113) ─────────────────────────────────────────────────────────
(113, 'distinction', 'Part of Al-Mu''awwidhatain — The Two Refuges',
  'Al-Falaq and An-Nas together are called Al-Mu''awwidhatain (the Two that give Refuge). The Prophet ﷺ used them regularly for protection and ruqyah (spiritual healing). They were also revealed together.',
  null, 'sahih', 'Abu Dawud 1463'),

-- ── An-Nas (114) ───────────────────────────────────────────────────────────
(114, 'distinction', 'Part of Al-Mu''awwidhatain — The Two Refuges',
  'An-Nas and Al-Falaq together are called Al-Mu''awwidhatain (the Two that give Refuge). The Prophet ﷺ said: "Recite the Mu''awwidhatain; nothing can compare to them for seeking protection."',
  null, 'sahih', 'Abu Dawud 1463')

on conflict (surah_number, fact_type, title) do nothing;
