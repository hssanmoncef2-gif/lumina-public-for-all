'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import BottomNav from '@/components/ui/BottomNav'
import AtmosphericBackground from '@/components/layout/AtmosphericBackground'

// ============================================================
// Types
// ============================================================
interface Book {
  id: string
  title: string
  author: string
  coverUrl: string
  source: 'supabase' | 'openlibrary' | 'gutenberg'
  description?: string
  genre?: string
  // For Supabase (your own PDFs)
  fileUrl?: string
  // For Gutenberg
  gutenbergId?: number
  // For Open Library
  olKey?: string
}

interface ReadingProgress {
  bookId: string
  pageNumber: number
  totalPages: number
  updatedAt: string
}

// ============================================================
// Mood → genre map
// ============================================================
const MOOD_GENRES: Record<string, string[]> = {
  calm:    ['philosophy', 'poetry', 'nature'],
  healing: ['self-help', 'memoir', 'psychology'],
  joyful:  ['comedy', 'romance', 'adventure'],
  drifting:['mystery', 'fantasy', 'science fiction'],
  anxious: ['mindfulness', 'self-help', 'stoicism'],
  heavy:   ['drama', 'literary fiction'],
  alive:   ['biography', 'motivation', 'adventure'],
  soft:    ['poetry', 'romance', 'art'],
}

const GENRE_FILTERS = [
  { id: 'all',        label: 'All',        emoji: '✦' },
  { id: 'mine',       label: 'My Books',   emoji: '🗂️' },
  { id: 'fiction',    label: 'Fiction',    emoji: '🌌' },
  { id: 'self-help',  label: 'Self-Help',  emoji: '🌱' },
  { id: 'philosophy', label: 'Philosophy', emoji: '🔮' },
  { id: 'poetry',     label: 'Poetry',     emoji: '🕊️' },
  { id: 'mystery',    label: 'Mystery',    emoji: '🌙' },
  { id: 'romance',    label: 'Romance',    emoji: '🌸' },
]

// ============================================================
// Gutenberg curated picks — 50 classics across all genres
// ============================================================
const GUTENBERG_PICKS: Book[] = [
  // Romance
  { id: 'g-1342',  title: 'Pride and Prejudice',              author: 'Jane Austen',           coverUrl: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1342,  genre: 'romance',    description: 'Love, class, and misunderstanding.' },
  { id: 'g-25344', title: 'The Enchanted April',              author: 'Elizabeth von Arnim',   coverUrl: 'https://www.gutenberg.org/cache/epub/25344/pg25344.cover.medium.jpg', source: 'gutenberg', gutenbergId: 25344, genre: 'romance',    description: 'Four women, an Italian castle, renewal.' },
  { id: 'g-105',   title: 'Persuasion',                       author: 'Jane Austen',           coverUrl: 'https://www.gutenberg.org/cache/epub/105/pg105.cover.medium.jpg',     source: 'gutenberg', gutenbergId: 105,   genre: 'romance',    description: 'Second chances and quiet devotion.' },
  { id: 'g-158',   title: 'Emma',                             author: 'Jane Austen',           coverUrl: 'https://www.gutenberg.org/cache/epub/158/pg158.cover.medium.jpg',     source: 'gutenberg', gutenbergId: 158,   genre: 'romance',    description: 'A matchmaker who needs matching.' },
  { id: 'g-768',   title: 'Wuthering Heights',                author: 'Emily Brontë',          coverUrl: 'https://www.gutenberg.org/cache/epub/768/pg768.cover.medium.jpg',     source: 'gutenberg', gutenbergId: 768,   genre: 'romance',    description: 'Wild love on the Yorkshire moors.' },
  { id: 'g-1260',  title: 'Jane Eyre',                        author: 'Charlotte Brontë',      coverUrl: 'https://www.gutenberg.org/cache/epub/1260/pg1260.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1260,  genre: 'romance',    description: 'A governess with an iron soul.' },
  // Fiction
  { id: 'g-11',    title: "Alice in Wonderland",              author: 'Lewis Carroll',         coverUrl: 'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg',       source: 'gutenberg', gutenbergId: 11,    genre: 'fiction',    description: 'Fall down the rabbit hole.' },
  { id: 'g-2701',  title: 'Moby Dick',                        author: 'Herman Melville',       coverUrl: 'https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 2701,  genre: 'fiction',    description: 'An obsessive hunt across the sea.' },
  { id: 'g-84',    title: 'Frankenstein',                     author: 'Mary Shelley',          coverUrl: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',       source: 'gutenberg', gutenbergId: 84,    genre: 'fiction',    description: 'Creation, ambition, consequence.' },
  { id: 'g-5200',  title: 'Metamorphosis',                    author: 'Franz Kafka',           coverUrl: 'https://www.gutenberg.org/cache/epub/5200/pg5200.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 5200,  genre: 'fiction',    description: 'Wake up as something else.' },
  { id: 'g-174',   title: 'The Picture of Dorian Gray',       author: 'Oscar Wilde',           coverUrl: 'https://www.gutenberg.org/cache/epub/174/pg174.cover.medium.jpg',     source: 'gutenberg', gutenbergId: 174,   genre: 'fiction',    description: 'Beauty, corruption, a haunted portrait.' },
  { id: 'g-16',    title: 'Peter Pan',                        author: 'J.M. Barrie',           coverUrl: 'https://www.gutenberg.org/cache/epub/16/pg16.cover.medium.jpg',       source: 'gutenberg', gutenbergId: 16,    genre: 'fiction',    description: 'The boy who never grew up.' },
  { id: 'g-98',    title: 'A Tale of Two Cities',             author: 'Charles Dickens',       coverUrl: 'https://www.gutenberg.org/cache/epub/98/pg98.cover.medium.jpg',       source: 'gutenberg', gutenbergId: 98,    genre: 'fiction',    description: 'Revolution, sacrifice, redemption.' },
  { id: 'g-1400',  title: 'Great Expectations',               author: 'Charles Dickens',       coverUrl: 'https://www.gutenberg.org/cache/epub/1400/pg1400.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1400,  genre: 'fiction',    description: 'A boy who dreams of becoming a gentleman.' },
  { id: 'g-76',    title: 'Adventures of Huckleberry Finn',   author: 'Mark Twain',            coverUrl: 'https://www.gutenberg.org/cache/epub/76/pg76.cover.medium.jpg',       source: 'gutenberg', gutenbergId: 76,    genre: 'fiction',    description: 'Freedom on the Mississippi.' },
  { id: 'g-74',    title: 'The Adventures of Tom Sawyer',     author: 'Mark Twain',            coverUrl: 'https://www.gutenberg.org/cache/epub/74/pg74.cover.medium.jpg',       source: 'gutenberg', gutenbergId: 74,    genre: 'fiction',    description: 'Boyhood mischief and big dreams.' },
  { id: 'g-1232',  title: 'The Prince',                       author: 'Niccolò Machiavelli',   coverUrl: 'https://www.gutenberg.org/cache/epub/1232/pg1232.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1232,  genre: 'philosophy', description: 'The original guide to power.' },
  { id: 'g-2554',  title: 'Crime and Punishment',             author: 'Fyodor Dostoevsky',     coverUrl: 'https://www.gutenberg.org/cache/epub/2554/pg2554.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 2554,  genre: 'fiction',    description: 'Guilt, redemption, and the human soul.' },
  { id: 'g-2600',  title: 'War and Peace',                    author: 'Leo Tolstoy',           coverUrl: 'https://www.gutenberg.org/cache/epub/2600/pg2600.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 2600,  genre: 'fiction',    description: 'Love and war in Napoleonic Russia.' },
  { id: 'g-1998',  title: 'Thus Spoke Zarathustra',           author: 'Friedrich Nietzsche',   coverUrl: 'https://www.gutenberg.org/cache/epub/1998/pg1998.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1998,  genre: 'philosophy', description: 'Beyond good and evil.' },
  // Mystery
  { id: 'g-1661',  title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle',  coverUrl: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1661,  genre: 'mystery',    description: 'Elementary, my dear reader.' },
  { id: 'g-345',   title: 'Dracula',                           author: 'Bram Stoker',          coverUrl: 'https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg',     source: 'gutenberg', gutenbergId: 345,   genre: 'mystery',    description: 'The original vampire tale.' },
  { id: 'g-2852',  title: 'The Hound of the Baskervilles',    author: 'Arthur Conan Doyle',   coverUrl: 'https://www.gutenberg.org/cache/epub/2852/pg2852.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 2852,  genre: 'mystery',    description: 'Holmes on his greatest case.' },
  { id: 'g-863',   title: 'The Mystery of the Yellow Room',   author: 'Gaston Leroux',        coverUrl: 'https://www.gutenberg.org/cache/epub/863/pg863.cover.medium.jpg',     source: 'gutenberg', gutenbergId: 863,   genre: 'mystery',    description: 'A locked room, an impossible crime.' },
  // Philosophy / Self-Help
  { id: 'g-4705',  title: 'Meditations',                      author: 'Marcus Aurelius',       coverUrl: 'https://www.gutenberg.org/cache/epub/4705/pg4705.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 4705,  genre: 'philosophy', description: 'Stoic wisdom from a Roman emperor.' },
  { id: 'g-3600',  title: 'Enchiridion',                      author: 'Epictetus',             coverUrl: 'https://www.gutenberg.org/cache/epub/3600/pg3600.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 3600,  genre: 'philosophy', description: 'Control what you can. Let go of the rest.' },
  { id: 'g-45631', title: 'The Art of War',                   author: 'Sun Tzu',               coverUrl: 'https://www.gutenberg.org/cache/epub/45631/pg45631.cover.medium.jpg', source: 'gutenberg', gutenbergId: 45631, genre: 'philosophy', description: 'Ancient strategy for modern life.' },
  { id: 'g-1497',  title: 'The Republic',                     author: 'Plato',                 coverUrl: 'https://www.gutenberg.org/cache/epub/1497/pg1497.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1497,  genre: 'philosophy', description: 'Justice, society, and the ideal state.' },
  { id: 'g-2680',  title: 'Beyond Good and Evil',             author: 'Friedrich Nietzsche',   coverUrl: 'https://www.gutenberg.org/cache/epub/2680/pg2680.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 2680,  genre: 'philosophy', description: 'Challenge every moral assumption.' },
  // Poetry
  { id: 'g-1063',  title: 'The Raven and Other Poems',        author: 'Edgar Allan Poe',       coverUrl: 'https://www.gutenberg.org/cache/epub/1063/pg1063.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1063,  genre: 'poetry',     description: 'Darkness, beauty, and haunting verse.' },
  { id: 'g-1065',  title: 'The Waste Land',                   author: 'T.S. Eliot',            coverUrl: 'https://www.gutenberg.org/cache/epub/1065/pg1065.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1065,  genre: 'poetry',     description: 'The defining poem of the 20th century.' },
  { id: 'g-1934',  title: 'Songs of Innocence and Experience', author: 'William Blake',        coverUrl: 'https://www.gutenberg.org/cache/epub/1934/pg1934.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1934,  genre: 'poetry',     description: 'Two states of the human soul.' },
  { id: 'g-1268',  title: 'Leaves of Grass',                  author: 'Walt Whitman',          coverUrl: 'https://www.gutenberg.org/cache/epub/1268/pg1268.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1268,  genre: 'poetry',     description: 'Song of the open road.' },
  // Self-Help / Memoir
  { id: 'g-16328', title: 'Narrative of Frederick Douglass',  author: 'Frederick Douglass',   coverUrl: 'https://www.gutenberg.org/cache/epub/16328/pg16328.cover.medium.jpg',  source: 'gutenberg', gutenbergId: 16328, genre: 'self-help',  description: 'A life reclaimed through literacy and courage.' },
  { id: 'g-522',   title: 'The Autobiography of Benjamin Franklin', author: 'Benjamin Franklin', coverUrl: 'https://www.gutenberg.org/cache/epub/522/pg522.cover.medium.jpg', source: 'gutenberg', gutenbergId: 522,   genre: 'self-help',  description: 'How to build a life and a nation.' },
  { id: 'g-3207',  title: 'Meditations on First Philosophy',  author: 'René Descartes',        coverUrl: 'https://www.gutenberg.org/cache/epub/3207/pg3207.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 3207,  genre: 'philosophy', description: 'I think, therefore I am.' },
  // More fiction
  { id: 'g-1080',  title: 'A Modest Proposal',                author: 'Jonathan Swift',        coverUrl: 'https://www.gutenberg.org/cache/epub/1080/pg1080.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1080,  genre: 'fiction',    description: 'Sharp satire from 1729.' },
  { id: 'g-219',   title: 'Heart of Darkness',                author: 'Joseph Conrad',         coverUrl: 'https://www.gutenberg.org/cache/epub/219/pg219.cover.medium.jpg',     source: 'gutenberg', gutenbergId: 219,   genre: 'fiction',    description: 'A journey into the dark heart of empire.' },
  { id: 'g-244',   title: 'A Study in Scarlet',               author: 'Arthur Conan Doyle',   coverUrl: 'https://www.gutenberg.org/cache/epub/244/pg244.cover.medium.jpg',     source: 'gutenberg', gutenbergId: 244,   genre: 'mystery',    description: 'Where it all began for Holmes.' },
  { id: 'g-120',   title: 'Treasure Island',                  author: 'Robert Louis Stevenson', coverUrl: 'https://www.gutenberg.org/cache/epub/120/pg120.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 120,   genre: 'fiction',    description: 'Pirates, treasure, and the open sea.' },
  { id: 'g-35',    title: 'The Time Machine',                 author: 'H.G. Wells',            coverUrl: 'https://www.gutenberg.org/cache/epub/35/pg35.cover.medium.jpg',       source: 'gutenberg', gutenbergId: 35,    genre: 'fiction',    description: 'Travel to the end of time.' },
  { id: 'g-36',    title: 'The War of the Worlds',            author: 'H.G. Wells',            coverUrl: 'https://www.gutenberg.org/cache/epub/36/pg36.cover.medium.jpg',       source: 'gutenberg', gutenbergId: 36,    genre: 'fiction',    description: 'Earth invaded from Mars.' },
  { id: 'g-5740',  title: 'Scaramouche',                      author: 'Rafael Sabatini',       coverUrl: 'https://www.gutenberg.org/cache/epub/5740/pg5740.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 5740,  genre: 'fiction',    description: 'Adventure and revolution in France.' },
  { id: 'g-514',   title: 'Little Women',                     author: 'Louisa May Alcott',     coverUrl: 'https://www.gutenberg.org/cache/epub/514/pg514.cover.medium.jpg',     source: 'gutenberg', gutenbergId: 514,   genre: 'fiction',    description: 'Four sisters growing up during wartime.' },
  { id: 'g-28054', title: 'The Brothers Karamazov',           author: 'Fyodor Dostoevsky',     coverUrl: 'https://www.gutenberg.org/cache/epub/28054/pg28054.cover.medium.jpg', source: 'gutenberg', gutenbergId: 28054, genre: 'fiction',    description: 'Faith, doubt, murder, and love.' },
  { id: 'g-2097',  title: 'Don Quixote',                      author: 'Miguel de Cervantes',   coverUrl: 'https://www.gutenberg.org/cache/epub/2097/pg2097.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 2097,  genre: 'fiction',    description: 'The original dreamer tilting at windmills.' },
  { id: 'g-43',    title: 'The Strange Case of Dr Jekyll and Mr Hyde', author: 'R.L. Stevenson', coverUrl: 'https://www.gutenberg.org/cache/epub/43/pg43.cover.medium.jpg', source: 'gutenberg', gutenbergId: 43,    genre: 'mystery',    description: 'One man, two souls.' },
  { id: 'g-1184',  title: 'The Count of Monte Cristo',        author: 'Alexandre Dumas',       coverUrl: 'https://www.gutenberg.org/cache/epub/1184/pg1184.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 1184,  genre: 'fiction',    description: 'The greatest revenge story ever told.' },
  { id: 'g-135',   title: 'Les Misérables',                   author: 'Victor Hugo',           coverUrl: 'https://www.gutenberg.org/cache/epub/135/pg135.cover.medium.jpg',     source: 'gutenberg', gutenbergId: 135,   genre: 'fiction',    description: 'Justice, love, and the human spirit.' },
  { id: 'g-2413',  title: 'The Importance of Being Earnest',  author: 'Oscar Wilde',           coverUrl: 'https://www.gutenberg.org/cache/epub/2413/pg2413.cover.medium.jpg',   source: 'gutenberg', gutenbergId: 2413,  genre: 'fiction',    description: 'Wit, identity, and cucumber sandwiches.' },
]

// ============================================================
// Component
// ============================================================
// ── Proxy-backed cover image ─────────────────────────────────
function coverSrc(book: Book): string {
  if (book.source === 'gutenberg' && book.gutenbergId) {
    return `/api/library/cover?gutenbergId=${book.gutenbergId}&title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}`
  }
  if (book.coverUrl) return book.coverUrl
  return ''
}

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#4f46e5 0%,#1e1b4b 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#1e1b4b 100%)',
  'linear-gradient(135deg,#0e7490 0%,#0f172a 100%)',
  'linear-gradient(135deg,#065f46 0%,#0f172a 100%)',
  'linear-gradient(135deg,#9f1239 0%,#1e1b4b 100%)',
  'linear-gradient(135deg,#92400e 0%,#0f172a 100%)',
]

function hashGradient(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff
  return COVER_GRADIENTS[Math.abs(h) % COVER_GRADIENTS.length]
}

interface BookCoverProps { book: Book; className?: string }
function BookCover({ book, className }: BookCoverProps) {
  const src = coverSrc(book)
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={book.title}
        className={className}
        onError={() => setFailed(true)}
      />
    )
  }

  // Fallback: beautiful gradient card with title
  return (
    <div
      className={`${className} flex flex-col items-center justify-center gap-2 p-2`}
      style={{ background: hashGradient(book.id) }}
    >
      <span className="text-2xl">{book.source === 'supabase' ? '📄' : '📖'}</span>
      <p className="text-white/80 text-[8px] font-medium text-center leading-tight line-clamp-4 px-1">{book.title}</p>
      <p className="text-white/40 text-[7px] text-center truncate w-full px-1">{book.author}</p>
    </div>
  )
}

export default function LibraryPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id ?? session?.user?.email ?? ''

  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [myBooks, setMyBooks] = useState<Book[]>([])
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({})
  const [isLoadingMine, setIsLoadingMine] = useState(false)
  const [myBooksError, setMyBooksError] = useState('')
  // ── Fetch user's Supabase PDFs via API route ──────────────
  useEffect(() => {
    fetchMyBooks()
    if (userId) fetchProgress()
  }, [userId])

  async function fetchMyBooks() {
    setIsLoadingMine(true)
    setMyBooksError('')
    try {
      const res = await fetch('/api/library/books')
      if (!res.ok) {
        const data = await res.json()
        setMyBooksError(data.error ?? `Error ${res.status}`)
        return
      }
      const data = await res.json()
      setMyBooks(data.books ?? [])
    } catch (err: any) {
      setMyBooksError(err?.message ?? 'Unknown error')
    }
    setIsLoadingMine(false)
  }

  async function fetchProgress() {
    try {
      const res = await fetch(`/api/library/progress?userId=${userId}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        const map: Record<string, ReadingProgress> = {}
        data.forEach((p: any) => { map[p.bookId] = p })
        setProgress(map)
      }
    } catch {}
  }

  // ── Search Open Library + filter local picks ───────────────
  const searchOpenLibrary = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return }
    setIsSearching(true)
    try {
      // Also filter local Gutenberg picks by query
      const qLow = q.toLowerCase()
      const localHits = GUTENBERG_PICKS.filter(b =>
        b.title.toLowerCase().includes(qLow) || b.author.toLowerCase().includes(qLow)
      )

      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20&fields=key,title,author_name,cover_i,first_sentence,subject`
      )
      const data = await res.json()
      const olBooks: Book[] = (data.docs ?? []).map((d: any) => ({
        id: `ol-${d.key?.replace('/works/', '') ?? Math.random()}`,
        title: d.title ?? 'Unknown',
        author: d.author_name?.[0] ?? 'Unknown',
        coverUrl: d.cover_i
          ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
          : '',
        source: 'openlibrary' as const,
        olKey: d.key,
        description: d.first_sentence?.value ?? '',
        genre: d.subject?.[0]?.toLowerCase() ?? 'fiction',
      }))
      setSearchResults([...localHits, ...olBooks])
    } catch {}
    setIsSearching(false)
  }, [])

  // debounce
  useEffect(() => {
    const t = setTimeout(() => searchOpenLibrary(searchQuery), 500)
    return () => clearTimeout(t)
  }, [searchQuery, searchOpenLibrary])

  // ── Compute displayed books ─────────────────────────────────
  const allStaticBooks: Book[] = [...myBooks, ...GUTENBERG_PICKS]

  const displayBooks: Book[] = searchQuery.trim()
    ? searchResults
    : activeFilter === 'mine'
      ? myBooks
      : activeFilter === 'all'
        ? allStaticBooks
        : allStaticBooks.filter(b => b.genre === activeFilter)

  // ── Open book ───────────────────────────────────────────────
  function openBook(book: Book) {
    const params = new URLSearchParams({
      title:  book.title,
      author: book.author,
      source: book.source,
      ...(book.fileUrl     && { fileUrl: book.fileUrl }),
      ...(book.gutenbergId && { gutenbergId: String(book.gutenbergId) }),
      ...(book.olKey       && { olKey: book.olKey }),
      ...(book.coverUrl    && { coverUrl: book.coverUrl }),
    })
    router.push(`/library/read/${encodeURIComponent(book.id)}?${params}`)
  }

  const progressPct = (bookId: string) => {
    const p = progress[bookId]
    if (!p || !p.totalPages) return 0
    return Math.round((p.pageNumber / p.totalPages) * 100)
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-lumina-void">
      <AtmosphericBackground mood="calm" />

      <div className="relative z-10 flex flex-col min-h-dvh pb-24">
        {/* ── Header ── */}
        <div className="safe-top" />
        <div className="px-5 pt-6 pb-2">
          <h1 className="text-2xl font-semibold text-white/90" style={{ fontFamily: 'var(--font-sora)' }}>
            Library 📚
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Your books. Your pace.</p>
        </div>

        {/* ── Search bar ── */}
        <div className="px-5 mt-3">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="text-white/30 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search millions of books…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white/80 text-sm placeholder-white/25 outline-none"
              style={{ fontFamily: 'var(--font-sora)' }}
            />
            {isSearching && (
              <div className="w-4 h-4 border border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
            )}
          </div>
        </div>

        {/* ── Genre filters ── */}
        {!searchQuery && (
          <div className="mt-4 flex gap-2 px-5 overflow-x-auto scrollbar-none">
            {GENRE_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light transition-all"
                style={{
                  fontFamily: 'var(--font-sora)',
                  background: activeFilter === f.id
                    ? 'rgba(139,92,246,0.3)'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeFilter === f.id ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: activeFilter === f.id ? 'rgba(196,181,253,0.95)' : 'rgba(255,255,255,0.45)',
                }}
              >
                <span>{f.emoji}</span>
                <span>{f.label}</span>

              </button>
            ))}
          </div>
        )}

        {/* ── Continue reading ── */}
        {!searchQuery && Object.keys(progress).length > 0 && (
          <div className="px-5 mt-5">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Continue Reading</p>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
              {Object.values(progress).slice(0, 5).map(p => {
                const book = [...myBooks, ...GUTENBERG_PICKS].find(b => b.id === p.bookId)
                if (!book) return null
                return (
                  <button
                    key={p.bookId}
                    onClick={() => openBook(book)}
                    className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden w-28 text-left"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <BookCover book={book} className="w-full h-36 object-cover" />
                    <div className="p-2">
                      <p className="text-white/80 text-[10px] font-medium leading-tight truncate">{book.title}</p>
                      <div className="mt-1.5 h-0.5 w-full rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${progressPct(p.bookId)}%`, background: 'rgba(139,92,246,0.7)' }}
                        />
                      </div>
                      <p className="text-white/30 text-[9px] mt-1">p.{p.pageNumber} · {progressPct(p.bookId)}%</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Book grid ── */}
        <div className="px-5 mt-5">
          {searchQuery && (
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3">
              {isSearching ? 'Searching…' : `${searchResults.length} results`}
            </p>
          )}

          {!searchQuery && !isLoadingMine && activeFilter === 'mine' && myBooks.length === 0 && (
            <div className="flex flex-col items-center text-center py-12 gap-4">
              <p className="text-5xl">📚</p>
              <div>
                <p className="text-white/60 text-sm font-medium">No books found</p>
                <p className="text-white/30 text-xs mt-1">Upload PDFs or EPUBs to your Supabase "books" bucket</p>
              </div>
              {myBooksError && (
                <p className="text-red-400/60 text-[11px] px-6 leading-relaxed">⚠️ {myBooksError}</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
            {displayBooks.map(book => (
              <button
                key={book.id}
                onClick={() => openBook(book)}
                className="flex flex-col rounded-2xl overflow-hidden text-left transition-all active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Cover */}
                <div className="relative w-full aspect-[2/2.5]">
                  <BookCover book={book} className="w-full h-full object-cover" />
                  {/* Source badge */}
                  <div
                    className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[8px]"
                    style={{
                      background: book.source === 'supabase'
                        ? 'rgba(139,92,246,0.7)'
                        : book.source === 'gutenberg'
                          ? 'rgba(34,197,94,0.6)'
                          : 'rgba(56,189,248,0.6)',
                      color: 'white',
                    }}
                  >
                    {book.source === 'supabase' ? 'Mine' : book.source === 'gutenberg' ? 'Classic' : 'Search'}
                  </div>
                  {/* Progress overlay */}
                  {progress[book.id] && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: 'rgba(139,92,246,0.4)' }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${progressPct(book.id)}%`,
                          background: 'rgba(139,92,246,0.9)',
                        }}
                      />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-1.5">
                  <p
                    className="text-white/85 text-xs font-medium leading-tight line-clamp-2"
                    style={{ fontFamily: 'var(--font-sora)' }}
                  >
                    {book.title}
                  </p>
                  <p className="text-white/35 text-[10px] mt-0.5 truncate">{book.author}</p>
                  {progress[book.id] && (
                    <p className="text-purple-300/60 text-[9px] mt-1">
                      p.{progress[book.id].pageNumber} · {progressPct(book.id)}%
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}