// ============================================================
// LUMINA — Playlist Data (Phase 10 — Real Songs)
// Real tracks from user's library, mapped to moods
// src: YouTube link (placeholder until local files added)
// ============================================================

import type { Playlist, Track, MusicCategory } from '@/types'

function mk(
  id: string,
  title: string,
  artist: string,
  category: MusicCategory,
  duration: number,
  mood: string[],
  bpm: number,
): Track {
  return { id, title, artist, category, duration, src: '', mood: mood as any, bpm }
}

// ---- ARABIC POP: Alive / Joyful / High Energy ----
const ARABIC_FIRE: Track[] = [
  mk('ap-01', "Am Bemzah Ma'ak (عم بمزح معك)", 'Najwa Karam',    'confidence', 225, ['alive', 'joyful'],  108),
  mk('ap-02', 'Degou El Toboul (دقوا الطبول)',  'Myriam Fares',   'confidence', 210, ['alive', 'joyful'],  115),
  mk('ap-03', 'Haklek Rahtak (حقلق راحتك)',     'Myriam Fares',   'confidence', 198, ['alive', 'joyful'],  112),
  mk('ap-04', 'Maalesh',                         'Myriam Fares',   'confidence', 204, ['alive', 'joyful'],  110),
  mk('ap-05', 'Atlah',                            'Myriam Fares',   'confidence', 217, ['alive', 'joyful'],  118),
  mk('ap-06', 'Boom Boom',                        'Hind Ziadi',     'confidence', 190, ['alive', 'joyful'],  120),
  mk('ap-07', 'Mesaytara (مسيطرة)',              'Lamis Kan',      'confidence', 208, ['alive', 'joyful'],  114),
  mk('ap-08', 'Motamakkina (متمكنه)',             'Lamis Kan',      'confidence', 215, ['alive', 'joyful'],  112),
  mk('ap-09', "Enta Bet'oul Eih",                'Myriam Fares',   'confidence', 222, ['alive', 'joyful'],  108),
  mk('ap-10', 'Badna Nwalee El Jaw',             'Nancy Ajram',    'confidence', 200, ['alive', 'joyful'],  116),
]

// ---- ARABIC POP: Soft / Comfort ----
const ARABIC_SOFT: Track[] = [
  mk('as-01', 'Sho Baddo (شو بدو)',              'Yara',           'comfort', 228, ['soft', 'healing'],   78),
  mk('as-02', 'Ma Yhimmak',                       'Yara',           'comfort', 215, ['soft', 'calm'],      75),
  mk('as-03', 'Shey Ghareeb (شي غريب)',           'Nour Helou',     'comfort', 232, ['soft', 'drifting'],  72),
  mk('as-04', 'Ma Tegi Hena',                     'Nancy Ajram',    'comfort', 218, ['soft', 'calm'],      76),
  mk("as-05", "Tla'ayna",                         'Maritta Hallani','comfort', 225, ['soft', 'healing'],   74),
  mk('as-06', "Esma'ny",                          'Carole Samaha',  'comfort', 242, ['soft', 'healing'],   70),
  mk('as-07', 'Ettala Fia',                       'Carole Samaha',  'comfort', 236, ['soft', 'calm'],      73),
  mk('as-08', 'Eh Eh',                            'Sherine',        'comfort', 210, ['soft', 'joyful'],    80),
  mk('as-09', 'Howa Da',                          'Sherine',        'comfort', 220, ['soft', 'healing'],   76),
  mk('as-10', 'Lawn Ouyounak',                    'Nancy Ajram',    'comfort', 235, ['soft', 'calm'],      72),
]

// ---- ARABIC POP: Drifting / Late Night ----
const ARABIC_NIGHTS: Track[] = [
  mk('an-01', 'Khalini Shoufak (خليني شوفك)',    'Najwa Karam',    'dreamy-nights', 258, ['drifting', 'soft'],   68),
  mk('an-02', 'Allah Yeshghelo Balo (الله يشغلو بالو)', 'Najwa Karam', 'dreamy-nights', 245, ['drifting', 'heavy'], 65),
  mk('an-03', 'Ma Fi Noum (ما في نوم)',           'Najwa Karam',    'dreamy-nights', 262, ['drifting', 'heavy'],  66),
  mk('an-04', 'Eidak (ايدك)',                     'Najwa Karam',    'dreamy-nights', 248, ['drifting', 'soft'],   70),
  mk("an-05", "Ta'a Khabyak (تعا خبيك)",         'Najwa Karam',    'dreamy-nights', 255, ['drifting', 'heavy'],  64),
  mk('an-06', 'Fakerne',                          'Haifa Wehbe',    'dreamy-nights', 240, ['drifting', 'heavy'],  67),
  mk('an-07', 'Enta Tani',                        'Haifa Wehbe',    'dreamy-nights', 235, ['drifting', 'soft'],   69),
  mk('an-08', 'El Wawa (الواوا)',                 'Haifa Wehbe',    'dreamy-nights', 228, ['drifting', 'joyful'], 78),
  mk('an-09', 'Rajab',                            'Haifa Wehbe',    'dreamy-nights', 232, ['drifting', 'alive'],  82),
  mk('an-10', 'Talqa (طلقه)',                     'Ahlam',          'dreamy-nights', 250, ['drifting', 'heavy'],  65),
  mk('an-11', 'Alf W Meya',                       'Nawal Al Zoghbi','dreamy-nights', 252, ['drifting', 'healing'],68),
]

// ---- ARABIC POP: Healing / Emotional ----
const ARABIC_HEALING: Track[] = [
  mk('ah-01', 'Namet Nenna',                      'Ruby',           'healing', 230, ['healing', 'soft'],     72),
  mk('ah-02', 'Alby Plastic',                     'Ruby',           'healing', 215, ['healing', 'alive'],    88),
  mk('ah-03', "3 Sa'at Metwasla",                 'Ruby',           'healing', 240, ['healing', 'drifting'], 70),
  mk('ah-04', 'Hetta Tanya',                      'Ruby',           'healing', 225, ['healing', 'soft'],     74),
  mk('ah-05', 'Ya Tabtab Wa Dallaa',              'Nancy Ajram',    'healing', 245, ['healing', 'joyful'],   76),
  mk('ah-06', 'Ah W Noss',                        'Nancy Ajram',    'healing', 220, ['healing', 'soft'],     73),
  mk('ah-07', 'Aktar Shewaya',                    'Maya Diab',      'healing', 218, ['healing', 'soft'],     76),
  mk('ah-08', 'Khalani',                          'Myriam Fares',   'healing', 208, ['healing', 'alive'],    86),
]

// ---- BRITNEY SPEARS: Energy ----
const BRITNEY_ENERGY: Track[] = [
  mk('bp-01', '...Baby One More Time',            'Britney Spears', 'motivation', 211, ['alive', 'joyful'],  96),
  mk('bp-02', "Oops!... I Did It Again",          'Britney Spears', 'motivation', 204, ['alive', 'joyful'],  95),
  mk('bp-03', 'Toxic',                            'Britney Spears', 'motivation', 198, ['alive'],            143),
  mk('bp-04', 'Gimme More',                       'Britney Spears', 'motivation', 240, ['alive'],            120),
  mk('bp-05', 'Womanizer',                        'Britney Spears', 'motivation', 216, ['alive', 'joyful'],  130),
  mk('bp-06', 'Hold It Against Me',               'Britney Spears', 'motivation', 228, ['alive'],            128),
  mk('bp-07', 'Till the World Ends',              'Britney Spears', 'motivation', 234, ['alive', 'joyful'],  130),
  mk('bp-08', 'Work Bitch',                       'Britney Spears', 'motivation', 222, ['alive'],            135),
  mk('bp-09', 'Criminal',                         'Britney Spears', 'motivation', 225, ['drifting', 'soft'], 80),
  mk('bp-10', 'Everytime',                        'Britney Spears', 'motivation', 238, ['heavy', 'soft'],    70),
]

// ---- BRUNO MARS: Joyful / Groovy ----
const BRUNO_GROOVES: Track[] = [
  mk('bm-01', "That's What I Like",               'Bruno Mars',     'lo-fi-morning', 206, ['joyful', 'alive'],  113),
  mk('bm-02', 'Treasure',                          'Bruno Mars',     'lo-fi-morning', 173, ['joyful', 'alive'],  108),
  mk('bm-03', 'Uptown Funk',                       'Bruno Mars',     'lo-fi-morning', 270, ['joyful', 'alive'],  115),
  mk('bm-04', 'Grenade',                           'Bruno Mars',     'lo-fi-morning', 222, ['heavy', 'healing'], 92),
  mk('bm-05', 'Just the Way You Are',              'Bruno Mars',     'lo-fi-morning', 220, ['soft', 'joyful'],   109),
  mk('bm-06', 'Count On Me',                       'Bruno Mars',     'lo-fi-morning', 193, ['soft', 'healing'],  96),
  mk('bm-07', 'Locked Out of Heaven',              'Bruno Mars',     'lo-fi-morning', 233, ['joyful', 'alive'],  144),
  mk('bm-08', 'Versace on the Floor',              'Bruno Mars',     'lo-fi-morning', 274, ['soft', 'drifting'],  80),
]

// ---- DYSTINCT: Arabic Trap ----
const DYSTINCT_TRACKS: Track[] = [
  mk('dy-01', 'BABABA WORLD',                      'DYSTINCT',       'confidence', 188, ['alive', 'joyful'],   128),
  mk('dy-02', 'Business (feat. Naza)',              'DYSTINCT',       'confidence', 195, ['alive'],             122),
  mk('dy-03', 'LAYALI',                             'DYSTINCT',       'confidence', 202, ['drifting', 'alive'],  98),
  mk('dy-04', 'Tek Tek (feat. MHD)',                'DYSTINCT',       'confidence', 191, ['alive', 'joyful'],   126),
  mk('dy-05', 'YAMA',                               'DYSTINCT',       'confidence', 198, ['alive', 'soft'],     105),
]

// ---- FRENCH / INTERNATIONAL: Soft / Atmospheric ----
const FRENCH_VIBES: Track[] = [
  mk('fr-01', 'Petite Maison',                      'bba',            'rainy-tokyo', 210, ['soft', 'drifting'],  72),
  mk('fr-02', "J'avoue",                            'Linh',           'rainy-tokyo', 225, ['soft', 'calm'],      75),
  mk('fr-03', 'Les Mots',                           'Lolo Zouaï & Dinos', 'rainy-tokyo', 238, ['drifting', 'soft'], 78),
  mk('fr-04', 'Conduire',                           'Louane',         'rainy-tokyo', 220, ['soft', 'healing'],   70),
  mk('fr-05', 'ça pik un peu quand même',           'miki',           'rainy-tokyo', 195, ['soft', 'drifting'],  82),
  mk('fr-06', 'coeur maladroit',                    'Marine',         'rainy-tokyo', 215, ['heavy', 'soft'],     68),
  mk('fr-07', 'la boss',                            'marguerite',     'rainy-tokyo', 200, ['joyful', 'alive'],   92),
  mk('fr-08', 'Pour en parler',                     'Lynda & Franglish', 'rainy-tokyo', 228, ['soft', 'healing'], 76),
  mk('fr-09', 'Viens on essaie',                    'Vitaa & Julien Doré', 'rainy-tokyo', 242, ['soft', 'calm'], 73),
  mk('fr-10', 'Verano',                             'Ridsa',          'rainy-tokyo', 210, ['joyful', 'alive'],   96),
  mk('fr-11', 'TKN',                                'ROSALÍA & Travis Scott', 'rainy-tokyo', 178, ['alive', 'joyful'], 138),
]

// ---- QUEEN / CLASSICS: Cathartic / Epic ----
const QUEEN_CATHARSIS: Track[] = [
  mk('cl-01', 'Bohemian Rhapsody',                  'Queen',          'emotional-release', 354, ['heavy', 'healing', 'alive'], 72),
  mk('cl-02', "Don't Stop Me Now",                  'Queen',          'emotional-release', 209, ['alive', 'joyful'],  156),
  mk('cl-03', 'We Will Rock You',                   'Queen',          'emotional-release', 121, ['alive'],            82),
  mk('cl-04', 'We Are the Champions',               'Queen',          'emotional-release', 179, ['alive', 'healing'], 60),
  mk('cl-05', 'Under Pressure',                     'Queen',          'emotional-release', 248, ['heavy', 'healing'], 116),
  mk('cl-06', 'Somebody to Love',                   'Queen',          'emotional-release', 276, ['heavy', 'healing'], 76),
  mk('cl-07', 'Radio Ga Ga',                        'Queen',          'emotional-release', 344, ['alive', 'drifting'], 118),
  mk('cl-08', 'I Want to Break Free',               'Queen',          'emotional-release', 259, ['alive', 'joyful'],  120),
  mk('cl-09', 'The Show Must Go On',                'Queen',          'emotional-release', 262, ['heavy', 'alive'],   63),
]

// ============================================================
// PLAYLISTS
// ============================================================

export const PLAYLISTS: Playlist[] = [
  {
    id: 'pl-arabic-fire',
    category: 'confidence',
    title: 'Arabic Fire 🔥',
    description: 'High-energy Arabic pop to ignite your night. Myriam, Nancy, the legends.',
    emoji: '🔥',
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.45) 0%, rgba(245,158,11,0.4) 100%)',
    tracks: ARABIC_FIRE,
  },
  {
    id: 'pl-arabic-soft',
    category: 'comfort',
    title: 'Arabic Soft 🌸',
    description: 'Tender voices and warm melodies. Let yourself be held by sound.',
    emoji: '🌸',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.35) 0%, rgba(196,181,253,0.35) 100%)',
    tracks: ARABIC_SOFT,
  },
  {
    id: 'pl-arabic-nights',
    category: 'dreamy-nights',
    title: 'Arabic Nights 🌙',
    description: 'Late nights and longing hearts. Najwa, Haifa, Ahlam.',
    emoji: '🌙',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.45) 0%, rgba(30,27,75,0.6) 100%)',
    tracks: ARABIC_NIGHTS,
  },
  {
    id: 'pl-arabic-healing',
    category: 'healing',
    title: 'Arabic Healing 🌿',
    description: 'Ruby, Nancy, and friends — songs that understand your heart.',
    emoji: '🌿',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.35) 0%, rgba(6,182,212,0.35) 100%)',
    tracks: ARABIC_HEALING,
  },
  {
    id: 'pl-britney',
    category: 'motivation',
    title: 'Britney Era ⚡',
    description: 'Early 2000s pop energy. Iconic, unapologetic, electric.',
    emoji: '⚡',
    gradient: 'linear-gradient(135deg, rgba(234,179,8,0.45) 0%, rgba(249,115,22,0.4) 100%)',
    tracks: BRITNEY_ENERGY,
  },
  {
    id: 'pl-bruno',
    category: 'lo-fi-morning',
    title: 'Bruno Vibes 🌟',
    description: 'Smooth, feel-good grooves for when life deserves a soundtrack.',
    emoji: '🌟',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.35) 0%, rgba(234,179,8,0.3) 100%)',
    tracks: BRUNO_GROOVES,
  },
  {
    id: 'pl-dystinct',
    category: 'confidence',
    title: 'DYSTINCT Mode 👑',
    description: 'Arabic trap swagger. Walk tall, feel unstoppable.',
    emoji: '👑',
    gradient: 'linear-gradient(135deg, rgba(79,70,229,0.5) 0%, rgba(139,92,246,0.45) 100%)',
    tracks: DYSTINCT_TRACKS,
  },
  {
    id: 'pl-french-drift',
    category: 'rainy-tokyo',
    title: 'French Drift 🌧️',
    description: 'French & international sounds for rainy evenings and wandering thoughts.',
    emoji: '🌧️',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.45) 0%, rgba(59,130,246,0.35) 100%)',
    tracks: FRENCH_VIBES,
  },
  {
    id: 'pl-queen',
    category: 'emotional-release',
    title: 'Queen Catharsis 🎸',
    description: "For when you need to feel it all. Freddie holds nothing back — and neither should you.",
    emoji: '🎸',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.45) 100%)',
    tracks: QUEEN_CATHARSIS,
  },
]

// ============================================================
// Mood → Playlist recommendation order
// ============================================================
export const MOOD_PLAYLIST_MAP: Record<string, string[]> = {
  alive:    ['pl-arabic-fire', 'pl-britney', 'pl-dystinct', 'pl-bruno'],
  joyful:   ['pl-bruno', 'pl-arabic-fire', 'pl-britney'],
  calm:     ['pl-french-drift', 'pl-arabic-soft'],
  soft:     ['pl-arabic-soft', 'pl-french-drift', 'pl-arabic-healing'],
  drifting: ['pl-arabic-nights', 'pl-french-drift'],
  heavy:    ['pl-queen', 'pl-arabic-nights', 'pl-arabic-healing'],
  anxious:  ['pl-arabic-soft', 'pl-french-drift'],
  healing:  ['pl-arabic-healing', 'pl-queen', 'pl-arabic-soft'],
}

// ---- Helpers ----

export function getPlaylistByCategory(category: string): Playlist | undefined {
  return PLAYLISTS.find(p => p.category === category)
}

export function getPlaylistsForMood(moodId: string): Playlist[] {
  const ids = MOOD_PLAYLIST_MAP[moodId] ?? []
  return ids
    .map(id => PLAYLISTS.find(p => p.id === id))
    .filter(Boolean) as Playlist[]
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
