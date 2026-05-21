'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ============================================================
// HOW TO ADD YOUR OWN AUDIOBOOK
// ============================================================
// 1. Find the audiobook on YouTube (a full recording).
// 2. Copy the video ID from the URL. Example:
//    https://www.youtube.com/watch?v=H14bBuluwB8
//                                   ^^^^^^^^^^^^ ← this is the ytId
// 3. Add an entry to the AUDIOBOOKS array below following this format:
//    {
//      id: 'unique-id',          // any lowercase kebab-case string
//      title: 'Book Title',
//      author: 'Author Name',
//      duration: '4h 10m',       // estimated duration
//      emoji: '📖',              // pick any emoji
//      genre: 'fiction',         // choose from: fiction, selfhelp, philosophy, romance, mystery, biography
//      desc: 'Short description of the book.',
//      grad: 'linear-gradient(135deg,rgba(99,102,241,0.55) 0%,rgba(139,92,246,0.5) 100%)',
//      ytId: 'PASTE_YOUTUBE_ID_HERE',
//    },
// 4. Save the file and refresh — your book will appear in the grid!
// ============================================================

const GENRE_FILTERS = [
  { id: 'all',        label: 'All',        emoji: '✦' },
  { id: 'fiction',    label: 'Fiction',    emoji: '🌌' },
  { id: 'selfhelp',   label: 'Self-Help',  emoji: '🌱' },
  { id: 'philosophy', label: 'Philosophy', emoji: '🔮' },
  { id: 'romance',    label: 'Romance',    emoji: '🌸' },
  { id: 'mystery',    label: 'Mystery',    emoji: '🌙' },
  { id: 'biography',  label: 'Biography',  emoji: '🕊️' },
]

const AUDIOBOOKS = [
  {
  id: 'all-tomorrows',
  title: 'All Tomorrows',
  author: 'Nemo Ramjet',
  duration: '',
  emoji: '🌌',
  genre: 'scifi',
  desc: 'A haunting journey through the far future of humanity.',
  grad: 'linear-gradient(135deg,rgba(99,102,241,0.5) 0%,rgba(16,185,129,0.4) 100%)',
  ytId: 'YbuulUQzHRU',
 },
  {
    id: 'alchemist',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    duration: '4h 10m',
    emoji: '🌅',
    genre: 'fiction',
    desc: 'A journey of following your personal legend.',
    grad: 'linear-gradient(135deg,rgba(245,158,11,0.55) 0%,rgba(234,88,12,0.5) 100%)',
    ytId: 'H14bBuluwB8',
  },
  {
    id: 'littleprince',
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    duration: '1h 38m',
    emoji: '🌟',
    genre: 'fiction',
    desc: 'A timeless story about love, loss and what matters.',
    grad: 'linear-gradient(135deg,rgba(99,102,241,0.55) 0%,rgba(139,92,246,0.5) 100%)',
    ytId: 'xC_EFBo2Psw',
  },
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    duration: '5h 58m',
    emoji: '🔮',
    genre: 'philosophy',
    desc: 'Private notes of a Roman emperor on stoic philosophy.',
    grad: 'linear-gradient(135deg,rgba(79,70,229,0.6) 0%,rgba(30,27,75,0.75) 100%)',
    ytId: 'WRZVbsH9OV0',
  },
  {
    id: 'power-now',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    duration: '7h 37m',
    emoji: '🌿',
    genre: 'selfhelp',
    desc: 'A guide to spiritual enlightenment and presence.',
    grad: 'linear-gradient(135deg,rgba(34,197,94,0.5) 0%,rgba(6,182,212,0.45) 100%)',
    ytId: 'XG3EqKNjgDU',
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    duration: '5h 35m',
    emoji: '⚡',
    genre: 'selfhelp',
    desc: 'Tiny changes, remarkable results.',
    grad: 'linear-gradient(135deg,rgba(234,179,8,0.55) 0%,rgba(249,115,22,0.5) 100%)',
    ytId: 'ytZpg9e17r4',
  },
  {
    id: 'pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    duration: '11h 35m',
    emoji: '🌸',
    genre: 'romance',
    desc: 'The timeless love story of Elizabeth Bennet.',
    grad: 'linear-gradient(135deg,rgba(236,72,153,0.5) 0%,rgba(196,181,253,0.5) 100%)',
    ytId: 'eVHu5-n69qQ',
  },
  {
    id: 'sherlock',
    title: 'Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    duration: '7h 4m',
    emoji: '🔍',
    genre: 'mystery',
    desc: "The complete adventures of the world's greatest detective.",
    grad: 'linear-gradient(135deg,rgba(55,65,81,0.7) 0%,rgba(17,24,39,0.8) 100%)',
    ytId: 'wp_6Jg5pLYc',
  },
  {
    id: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    duration: '15h 17m',
    emoji: '🌍',
    genre: 'biography',
    desc: 'A brief history of humankind.',
    grad: 'linear-gradient(135deg,rgba(14,165,233,0.5) 0%,rgba(99,102,241,0.5) 100%)',
    ytId: 'UkbQ4eEcppw',
  },
  {
    id: 'dune',
    title: 'Dune',
    author: 'Frank Herbert',
    duration: '21h 2m',
    emoji: '🏜️',
    genre: 'fiction',
    desc: 'An epic tale of desert politics, prophecy, and survival.',
    grad: 'linear-gradient(135deg,rgba(217,119,6,0.55) 0%,rgba(180,83,9,0.6) 100%)',
    ytId: '2Wp9RUljO5k',
  },
  {
    id: 'tao-te-ching',
    title: 'Tao Te Ching',
    author: 'Lao Tzu',
    duration: '1h 15m',
    emoji: '☯️',
    genre: 'philosophy',
    desc: 'Ancient wisdom on the nature of existence and living simply.',
    grad: 'linear-gradient(135deg,rgba(20,184,166,0.5) 0%,rgba(79,70,229,0.5) 100%)',
    ytId: 'bhzP0WFA8Wk',
  },
  {
    id: 'gone-girl',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    duration: '19h 11m',
    emoji: '🌑',
    genre: 'mystery',
    desc: 'A gripping psychological thriller about marriage and deception.',
    grad: 'linear-gradient(135deg,rgba(30,27,75,0.75) 0%,rgba(88,28,135,0.6) 100%)',
    ytId: 'va-1RIw-2Gg',
  },
  {
    id: 'notebook',
    title: 'The Notebook',
    author: 'Nicholas Sparks',
    duration: '4h 55m',
    emoji: '💌',
    genre: 'romance',
    desc: 'A tender story of love that endures across time.',
    grad: 'linear-gradient(135deg,rgba(244,114,182,0.5) 0%,rgba(251,191,36,0.4) 100%)',
    ytId: 'MNFnyambtsE',
  },
]

// localStorage key for progress
const PROGRESS_KEY = 'lumina_audiobook_progress'

function loadProgress(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') } catch { return {} }
}
function saveProgress(map: Record<string, number>) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(map)) } catch {}
}

const SKIP_SECONDS = 30

export default function AudiobooksPage() {
  const router = useRouter()
  const [genre, setGenre] = useState('all')
  const [activeBook, setActiveBook] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.8)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [showGuide, setShowGuide] = useState(false)
  const ytRefs = useRef<Record<string, HTMLIFrameElement | null>>({})
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load saved progress on mount
  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  // Auto-save progress every 5 seconds while playing
  useEffect(() => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    if (isPlaying && activeBook) {
      progressTimerRef.current = setInterval(() => {
        setProgress(prev => {
          const next = { ...prev, [activeBook]: (prev[activeBook] || 0) + 5 }
          saveProgress(next)
          return next
        })
      }, 5000)
    }
    return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current) }
  }, [isPlaying, activeBook])

  const filtered = genre === 'all' ? AUDIOBOOKS : AUDIOBOOKS.filter(b => b.genre === genre)

  const postToYT = (id: string, cmd: object) => {
    const iframe = ytRefs.current[id]
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify(cmd), '*')
    }
  }

  const handlePlay = useCallback((id: string) => {
    if (activeBook === id) {
      if (isPlaying) {
        postToYT(id, { event: 'command', func: 'pauseVideo', args: [] })
        setIsPlaying(false)
      } else {
        postToYT(id, { event: 'command', func: 'playVideo', args: [] })
        setIsPlaying(true)
      }
      return
    }
    if (activeBook) {
      postToYT(activeBook, { event: 'command', func: 'pauseVideo', args: [] })
    }
    setActiveBook(id)
    setIsPlaying(true)
    setTimeout(() => {
      postToYT(id, { event: 'command', func: 'playVideo', args: [] })
      postToYT(id, { event: 'command', func: 'setVolume', args: [Math.round(volume * 100)] })
      // Seek to saved progress if any
      const saved = loadProgress()[id] || 0
      if (saved > 0) {
        postToYT(id, { event: 'command', func: 'seekTo', args: [saved, true] })
      }
    }, 400)
  }, [activeBook, isPlaying, volume])

  const handleSkip = useCallback((direction: 'forward' | 'backward') => {
    if (!activeBook) return
    const saved = progress[activeBook] || 0
    const newTime = direction === 'forward' ? saved + SKIP_SECONDS : Math.max(0, saved - SKIP_SECONDS)
    postToYT(activeBook, { event: 'command', func: 'seekTo', args: [newTime, true] })
    setProgress(prev => {
      const next = { ...prev, [activeBook]: newTime }
      saveProgress(next)
      return next
    })
  }, [activeBook, progress])

  const handleVolume = useCallback((v: number) => {
    setVolume(v)
    if (activeBook) {
      postToYT(activeBook, { event: 'command', func: 'setVolume', args: [Math.round(v * 100)] })
    }
  }, [activeBook])

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = Math.floor(secs % 60)
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  const activeBookData = AUDIOBOOKS.find(b => b.id === activeBook)

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{background:#080612;color:rgba(255,255,255,.92);font-family:'DM Sans',system-ui,sans-serif;min-height:100vh}
        .pg{padding:0 0 110px;max-width:500px;margin:0 auto;position:relative}

        .hdr{padding:52px 20px 20px}
        .hdr-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:rgba(167,139,250,.6);margin-bottom:8px}
        .hdr-top{display:flex;align-items:flex-start;justify-content:space-between}
        .hdr-h1{font-size:26px;font-weight:700;letter-spacing:-.02em;line-height:1.2;margin-bottom:6px;background:linear-gradient(135deg,#fff 0%,#a78bfa 60%,#f9a8d4 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hdr-sub{font-size:13px;color:rgba(255,255,255,.35);font-weight:300}
        .guide-btn{flex-shrink:0;margin-top:4px;background:rgba(139,92,246,.15);border:.5px solid rgba(139,92,246,.4);border-radius:12px;padding:6px 10px;font-size:10px;color:rgba(196,181,253,.8);cursor:pointer;font-family:inherit;white-space:nowrap;transition:background .2s}
        .guide-btn:hover{background:rgba(139,92,246,.25)}

        /* Guide panel */
        .guide{margin:0 16px 16px;padding:16px;border-radius:18px;background:rgba(139,92,246,.08);border:.5px solid rgba(139,92,246,.25)}
        .guide-h{font-size:12px;font-weight:600;color:rgba(196,181,253,.9);margin-bottom:10px;display:flex;align-items:center;gap:6px}
        .guide-step{display:flex;gap:10px;margin-bottom:10px;align-items:flex-start}
        .guide-num{width:20px;height:20px;border-radius:50%;background:rgba(139,92,246,.3);border:.5px solid rgba(167,139,250,.4);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:rgba(196,181,253,.9);flex-shrink:0;margin-top:1px}
        .guide-text{font-size:11px;color:rgba(255,255,255,.55);line-height:1.6}
        .guide-code{display:inline-block;background:rgba(0,0,0,.3);border:.5px solid rgba(255,255,255,.1);border-radius:4px;padding:1px 5px;font-family:monospace;font-size:10px;color:rgba(196,181,253,.8);margin:0 2px}
        .guide-close{margin-top:10px;background:none;border:.5px solid rgba(255,255,255,.1);border-radius:10px;padding:6px 14px;font-size:11px;color:rgba(255,255,255,.4);cursor:pointer;font-family:inherit}

        /* Now playing bar */
        .now-bar{margin:0 16px 14px;padding:14px 16px;border-radius:20px;background:rgba(139,92,246,.12);border:.5px solid rgba(139,92,246,.3)}
        .now-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
        .now-ico{font-size:24px;flex-shrink:0}
        .now-info{flex:1;min-width:0}
        .now-title{font-size:13px;font-weight:600;color:rgba(255,255,255,.95);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .now-author{font-size:11px;color:rgba(255,255,255,.4);margin-top:2px}
        .now-saved{font-size:9px;color:rgba(167,139,250,.6);margin-top:3px;display:flex;align-items:center;gap:3px}

        /* Controls row */
        .ctrl-row{display:flex;align-items:center;justify-content:center;gap:16px}
        .ctrl-btn{background:rgba(255,255,255,.07);border:.5px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 14px;cursor:pointer;font-size:11px;color:rgba(255,255,255,.6);font-family:inherit;display:flex;align-items:center;gap:5px;transition:all .2s;-webkit-tap-highlight-color:transparent}
        .ctrl-btn:hover{background:rgba(255,255,255,.12);color:rgba(255,255,255,.9)}
        .ctrl-btn:active{transform:scale(.95)}
        .ctrl-play{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#ec4899);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:opacity .2s,transform .2s;-webkit-tap-highlight-color:transparent;box-shadow:0 4px 16px rgba(124,58,237,.4)}
        .ctrl-play:active{transform:scale(.92);opacity:.85}
        .bars{display:flex;gap:2px;align-items:flex-end;height:12px}
        .bar{width:2px;border-radius:2px;background:rgba(196,181,253,.8)}
        @keyframes bd{0%,100%{height:2px}50%{height:12px}}
        .bar.on{animation:bd .8s ease-in-out infinite}

        /* Volume */
        .vol-row{display:flex;align-items:center;gap:8px;padding:0 16px;margin-bottom:16px}
        .vol-lbl{font-size:11px;color:rgba(255,255,255,.25)}
        input[type=range]{flex:1;accent-color:#8b5cf6;height:3px;cursor:pointer}

        /* Genre filters */
        .filters{padding:0 16px;margin-bottom:16px;overflow-x:auto;scrollbar-width:none}
        .filters::-webkit-scrollbar{display:none}
        .f-row{display:flex;gap:8px;width:max-content;padding-bottom:4px}
        .f-btn{display:flex;align-items:center;gap:5px;padding:7px 13px;border-radius:20px;border:.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap;transition:all .2s;font-family:inherit;-webkit-tap-highlight-color:transparent}
        .f-btn.on{background:rgba(139,92,246,.2);border-color:rgba(139,92,246,.5);color:rgba(255,255,255,.95)}

        .s-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.25);padding:0 20px;margin-bottom:12px}

        /* Book grid */
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px}

        .bk{border-radius:20px;padding:18px 14px 14px;cursor:pointer;position:relative;transition:transform .2s,box-shadow .2s;-webkit-tap-highlight-color:transparent;border:.5px solid rgba(255,255,255,.08)}
        .bk:active{transform:scale(.97)}
        .bk.on{box-shadow:0 0 0 1.5px rgba(167,139,250,.6),0 8px 32px rgba(139,92,246,.25)}
        .bk-ico{font-size:28px;margin-bottom:10px;display:block}
        .bk-title{font-size:12px;font-weight:600;color:rgba(255,255,255,.95);line-height:1.3;margin-bottom:3px}
        .bk-author{font-size:10px;color:rgba(255,255,255,.45);margin-bottom:6px}
        .bk-desc{font-size:10px;color:rgba(255,255,255,.35);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:10px}
        .bk-foot{display:flex;align-items:center;justify-content:space-between}
        .bk-dur{font-size:9px;color:rgba(255,255,255,.4);display:flex;align-items:center;gap:4px}
        .bk-play{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.12);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;transition:background .2s;-webkit-tap-highlight-color:transparent}
        .bk.on .bk-play{background:rgba(139,92,246,.5)}
        .badge{position:absolute;top:10px;right:10px;background:rgba(139,92,246,.3);border:.5px solid rgba(167,139,250,.5);border-radius:6px;padding:2px 7px;font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:rgba(196,181,253,.9)}
        .prog-bar{margin-top:8px;height:2px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden}
        .prog-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#a78bfa,#f9a8d4);transition:width .4s}

        .nav{position:fixed;bottom:0;left:0;right:0;z-index:30;background:rgba(8,6,18,.9);border-top:.5px solid rgba(255,255,255,.07);backdrop-filter:blur(20px);display:flex;justify-content:space-around;padding:10px 8px calc(12px + env(safe-area-inset-bottom,0px))}
        .nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;padding:4px 12px;border-radius:14px;transition:background .2s;font-family:inherit;-webkit-tap-highlight-color:transparent}
        .nav-btn.on{background:rgba(139,92,246,.12)}
        .nav-ico{font-size:18px}
        .nav-lbl{font-size:8px;text-transform:uppercase;letter-spacing:.08em}
      `}</style>

      {/* Hidden YouTube iframes */}
      <div style={{position:'absolute',width:0,height:0,overflow:'hidden',pointerEvents:'none',opacity:0}}>
        {AUDIOBOOKS.map(b => (
          <iframe
            key={b.id}
            ref={el => { ytRefs.current[b.id] = el }}
            src={`https://www.youtube.com/embed/${b.ytId}?enablejsapi=1&loop=1&playlist=${b.ytId}&autoplay=0&controls=0&mute=0`}
            allow="autoplay"
            title={b.title}
          />
        ))}
      </div>

      <div className="pg">

        <div className="hdr">
          <p className="hdr-lbl">Lumina Library</p>
          <div className="hdr-top">
            <div>
              <h1 className="hdr-h1">Audiobooks 🎧</h1>
              <p className="hdr-sub">Listen wherever you are. Just tap and go.</p>
            </div>
            <button className="guide-btn" onClick={() => setShowGuide(g => !g)}>
              {showGuide ? '✕ Close' : '+ Add Book'}
            </button>
          </div>
        </div>

        {/* How to add your own book guide */}
        {showGuide && (
          <div className="guide">
            <p className="guide-h">📖 How to add your own audiobook</p>
            <div className="guide-step">
              <span className="guide-num">1</span>
              <p className="guide-text">Find the audiobook on <strong style={{color:'rgba(255,255,255,.7)'}}>YouTube</strong> (search for "[Book Title] full audiobook")</p>
            </div>
            <div className="guide-step">
              <span className="guide-num">2</span>
              <p className="guide-text">Copy the video ID from the URL — it's the part after <span className="guide-code">?v=</span><br/>Example: youtube.com/watch?v=<strong style={{color:'rgba(196,181,253,.9)'}}>H14bBuluwB8</strong></p>
            </div>
            <div className="guide-step">
              <span className="guide-num">3</span>
              <p className="guide-text">Open <span className="guide-code">src/app/audiobooks/page.tsx</span> and add a new entry to the <span className="guide-code">AUDIOBOOKS</span> array at the top of the file. Copy the format of any existing entry and paste in your YouTube ID.</p>
            </div>
            <div className="guide-step">
              <span className="guide-num">4</span>
              <p className="guide-text">Save the file — your book appears instantly in the grid! Change the <span className="guide-code">genre</span> field to match one of the filter tabs above.</p>
            </div>
            <button className="guide-close" onClick={() => setShowGuide(false)}>Got it ✓</button>
          </div>
        )}

        {/* Now playing bar */}
        {activeBook && activeBookData && (
          <div className="now-bar">
            <div className="now-top">
              <span className="now-ico">{activeBookData.emoji}</span>
              <div className="now-info">
                <p className="now-title">{activeBookData.title}</p>
                <p className="now-author">{activeBookData.author}</p>
                {(progress[activeBook] || 0) > 0 && (
                  <p className="now-saved">
                    💾 Progress saved · {formatTime(progress[activeBook] || 0)} listened
                  </p>
                )}
              </div>
              {isPlaying && (
                <div className="bars">
                  {[0,1,2,3].map(j => <div key={j} className="bar on" style={{animationDelay:`${j*.15}s`}}/>)}
                </div>
              )}
            </div>

            {/* Playback controls */}
            <div className="ctrl-row">
              <button className="ctrl-btn" onClick={() => handleSkip('backward')} title="Back 30s">
                ⏮ 30s
              </button>
              <button className="ctrl-play" onClick={() => handlePlay(activeBook)}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className="ctrl-btn" onClick={() => handleSkip('forward')} title="Skip 30s">
                30s ⏭
              </button>
            </div>
          </div>
        )}

        {/* Volume */}
        {activeBook && (
          <div className="vol-row">
            <span className="vol-lbl">🔉</span>
            <input type="range" min={0} max={1} step={0.02} value={volume}
              onChange={e => handleVolume(parseFloat(e.target.value))} />
            <span className="vol-lbl">🔊</span>
          </div>
        )}

        {/* Genre filters */}
        <div className="filters">
          <div className="f-row">
            {GENRE_FILTERS.map(f => (
              <button key={f.id} className={`f-btn${genre === f.id ? ' on' : ''}`}
                onClick={() => setGenre(f.id)}>
                <span>{f.emoji}</span><span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="s-lbl">{filtered.length} book{filtered.length !== 1 ? 's' : ''} · tap to listen</p>

        <div className="grid">
          {filtered.map(b => {
            const on = activeBook === b.id
            const savedSecs = progress[b.id] || 0
            // Estimate rough % progress (approximate book duration in seconds)
            const durationMatch = b.duration.match(/(\d+)h\s*(\d+)m/)
            const totalSecs = durationMatch
              ? parseInt(durationMatch[1]) * 3600 + parseInt(durationMatch[2]) * 60
              : 3600
            const pct = Math.min(100, (savedSecs / totalSecs) * 100)

            return (
              <div key={b.id} className={`bk${on ? ' on' : ''}`}
                style={{background: b.grad}}
                onClick={() => handlePlay(b.id)}>
                {on && <div className="badge">{isPlaying ? 'Playing' : 'Paused'}</div>}
                {!on && savedSecs > 60 && <div className="badge" style={{background:'rgba(34,197,94,.2)',borderColor:'rgba(74,222,128,.4)',color:'rgba(134,239,172,.9)'}}>Saved</div>}
                <span className="bk-ico">{b.emoji}</span>
                <p className="bk-title">{b.title}</p>
                <p className="bk-author">{b.author}</p>
                <p className="bk-desc">{b.desc}</p>
                <div className="bk-foot">
                  <span className="bk-dur">🎧 {b.duration}</span>
                  <button className="bk-play" onClick={e => { e.stopPropagation(); handlePlay(b.id) }}>
                    {on && isPlaying ? '⏸' : '▶'}
                  </button>
                </div>
                {pct > 1 && (
                  <div className="prog-bar">
                    <div className="prog-fill" style={{width:`${pct}%`}} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>

      <nav className="nav">
        {[
          {icon:'🏠', label:'Home',    href:'/home'},
          {icon:'🎵', label:'Music',   href:'/music'},
          {icon:'✦',  label:'Lumina',  href:'/lumina'},
          {icon:'📚', label:'Library', href:'/library'},
          {icon:'🎧', label:'Audio',   href:'/audiobooks'},
          {icon:'📖', label:'Journal', href:'/journal'},
        ].map(t => (
          <button key={t.href} className={`nav-btn${t.href === '/audiobooks' ? ' on' : ''}`}
            onClick={() => router.push(t.href as any)}>
            <span className="nav-ico">{t.icon}</span>
            <span className="nav-lbl" style={{color: t.href === '/audiobooks' ? 'rgba(196,181,253,.8)' : 'rgba(255,255,255,.3)'}}>
              {t.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  )
}
