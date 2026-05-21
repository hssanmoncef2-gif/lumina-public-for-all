'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

declare global { interface Window { pdfjsLib: any } }

const PDFJS_CDN    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
const PAGE_SIZE    = 1800

async function fetchGutenbergText(id: number): Promise<string> {
  const res = await fetch(`/library/gutenberg?id=${id}`)
  if (!res.ok) throw new Error(`Server returned ${res.status}`)
  const text = await res.text()
  if (text.length < 500 || text.trim().startsWith('<') || text.trim().startsWith('{'))
    throw new Error('Invalid response from server')
  let body = text
  const startMarkers = ['*** START OF', '***START OF']
  const endMarkers   = ['*** END OF',   '***END OF', 'End of the Project Gutenberg']
  for (const m of startMarkers) {
    const i = body.indexOf(m)
    if (i !== -1) { body = body.slice(body.indexOf('\n', i) + 1); break }
  }
  for (const m of endMarkers) {
    const i = body.indexOf(m)
    if (i !== -1) { body = body.slice(0, i); break }
  }
  return body.trim()
}

function paginateText(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/)
  const pages: string[] = []
  let current = ''
  for (const para of paragraphs) {
    const candidate = current ? current + '\n\n' + para : para
    if (candidate.length > PAGE_SIZE && current) {
      pages.push(current.trim())
      current = para
    } else {
      current = candidate
    }
  }
  if (current.trim()) pages.push(current.trim())
  return pages
}

export default function ReaderPage() {
  const router  = useRouter()
  const params  = useParams()
  const search  = useSearchParams()
  const { data: session } = useSession()
  const userId  = (session?.user as any)?.id ?? session?.user?.email ?? ''

  const bookId   = decodeURIComponent(params.bookId as string)
  const title    = search.get('title')       ?? 'Book'
  const author   = search.get('author')      ?? ''
  const source   = search.get('source')      as 'supabase' | 'gutenberg' | 'openlibrary'
  const fileUrl  = search.get('fileUrl')     ?? ''
  const gutId    = search.get('gutenbergId') ? Number(search.get('gutenbergId')) : null
  const coverUrl = search.get('coverUrl')    ?? ''
  const isText   = source === 'gutenberg'

  const [page, setPage]         = useState(1)
  const [totalPages, setTotal]  = useState(0)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [saveStatus, setSave]   = useState<'idle'|'saving'|'saved'>('idle')
  const [pages, setPages]       = useState<string[]>([])
  const [uiVisible, setUiVis]   = useState(true)
  const [direction, setDir]     = useState<'left'|'right'|null>(null)

  const pdfRef      = useRef<any>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const renderRef   = useRef<any>(null)
  const rendering   = useRef(false)
  const uiTimer     = useRef<any>(null)
  const touchStart  = useRef<{x:number,y:number}|null>(null)
  const autoSaveCnt = useRef(0)

  const bumpUI = useCallback(() => {
    setUiVis(true)
    clearTimeout(uiTimer.current)
    uiTimer.current = setTimeout(() => setUiVis(false), 4500)
  }, [])

  useEffect(() => { bumpUI() }, [])

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['ArrowRight','ArrowDown',' '].includes(e.key)) { e.preventDefault(); goNext() }
      if (['ArrowLeft', 'ArrowUp'      ].includes(e.key)) { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  // touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext(); else goPrev()
    } else bumpUI()
    touchStart.current = null
  }

  function goNext() {
    setPage(p => {
      if (p >= totalPages) return p
      setDir('left'); bumpUI(); return p + 1
    })
  }
  function goPrev() {
    setPage(p => {
      if (p <= 1) return p
      setDir('right'); bumpUI(); return p - 1
    })
  }

  useEffect(() => {
    if (direction) { const t = setTimeout(() => setDir(null), 250); return () => clearTimeout(t) }
  }, [direction])

  // tap zones
  const handleTap = (e: React.MouseEvent) => {
    const x = e.clientX / window.innerWidth
    if (x < 0.28) goPrev()
    else if (x > 0.72) goNext()
    else bumpUI()
  }

  // init
  useEffect(() => {
    if (userId) {
      fetch(`/api/library/progress?userId=${userId}`)
        .then(r => r.json())
        .then((data: any[]) => {
          if (Array.isArray(data)) {
            const found = data.find((p: any) => p.bookId === bookId)
            if (found) setPage(found.pageNumber)
          }
        }).catch(() => {})
    }
    if (isText && gutId) loadText(gutId)
    else if (source === 'supabase' && fileUrl) loadPdfJs().then(() => loadPDF(fileUrl))
    else { setError('No readable source found.'); setLoading(false) }
  }, [])

  async function loadText(id: number) {
    setLoading(true)
    try {
      const raw = await fetchGutenbergText(id)
      const pgs = paginateText(raw)
      setPages(pgs)
      setTotal(pgs.length)
    } catch (e: any) { setError(e.message ?? 'Could not load book.') }
    setLoading(false)
  }

  function loadPdfJs(): Promise<void> {
    return new Promise(resolve => {
      if (window.pdfjsLib) { resolve(); return }
      const s = document.createElement('script')
      s.src = PDFJS_CDN
      s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER; resolve() }
      document.head.appendChild(s)
    })
  }

  async function loadPDF(url: string) {
    setLoading(true)
    try {
      const pdf = await window.pdfjsLib.getDocument({ url }).promise
      pdfRef.current = pdf
      setTotal(pdf.numPages)
    } catch { setError('Could not load PDF. Make sure the file is public in Supabase.') }
    setLoading(false)
  }

  const renderPDF = useCallback(async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current || isText || rendering.current) return
    if (renderRef.current) { try { renderRef.current.cancel() } catch {} }
    rendering.current = true
    try {
      const pg  = await pdfRef.current.getPage(pageNum)
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')!
      const dpr = window.devicePixelRatio || 1
      const vp0 = pg.getViewport({ scale: 1 })
      const scale = (Math.min(window.innerWidth, 720) / vp0.width) * dpr
      const vp  = pg.getViewport({ scale })
      canvas.width  = vp.width
      canvas.height = vp.height
      canvas.style.width  = `${vp.width  / dpr}px`
      canvas.style.height = `${vp.height / dpr}px`
      renderRef.current = pg.render({ canvasContext: ctx, viewport: vp })
      await renderRef.current.promise
    } catch {}
    rendering.current = false
  }, [isText])

  useEffect(() => {
    if (!loading && !isText) renderPDF(page)
  }, [page, loading, isText, renderPDF])

  async function saveProgress() {
    if (!userId) return
    setSave('saving')
    try {
      await fetch('/api/library/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bookId, source, pageNumber: page, totalPages, title, coverUrl }),
      })
      setSave('saved')
    } catch {}
    setTimeout(() => setSave('idle'), 2000)
  }

  // auto-save text books every 5 page turns
  useEffect(() => {
    if (!isText || !userId || loading) return
    autoSaveCnt.current++
    if (autoSaveCnt.current % 5 === 0) saveProgress()
  }, [page])

  const pct = totalPages ? Math.round((page / totalPages) * 100) : 0

  // Text page rendering
  const renderTextPage = () => {
    const text = pages[page - 1] ?? ''
    const lines = text.split('\n')
    const firstLine = lines[0].trim()
    const isHeading = firstLine.length < 70 && (
      /^(chapter|part|book|prologue|epilogue|introduction|preface)/i.test(firstLine) ||
      /^[IVXLCDM]+\.?\s/i.test(firstLine) ||
      /^\d+\.?\s/.test(firstLine) ||
      (firstLine === firstLine.toUpperCase() && firstLine.length > 2)
    )
    const body = (isHeading ? lines.slice(1) : lines).join('\n').trim()
    return (
      <div
        className="w-full max-w-xl rounded-2xl px-7 py-8 mx-auto"
        style={{
          background: 'linear-gradient(160deg,#fdf6e3 0%,#f5e6c3 100%)',
          boxShadow: '0 12px 60px rgba(0,0,0,0.6), 4px 4px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.7)',
          minHeight: '70vh',
          position: 'relative',
        }}
      >
        {/* Book spine shadow */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'6px', background:'linear-gradient(to right,rgba(0,0,0,0.12),transparent)', borderRadius:'8px 0 0 8px' }} />
        {isHeading && (
          <p style={{ fontFamily:'Georgia,serif', fontSize:'14px', color:'#5c3a1e', textAlign:'center', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid rgba(139,90,43,0.25)' }}>
            {firstLine}
          </p>
        )}
        <p style={{ fontFamily:'Georgia,"Times New Roman",serif', fontSize:'16px', lineHeight:'1.9', color:'#2c1a0e', whiteSpace:'pre-wrap', textAlign:'justify', hyphens:'auto' as any }}>
          {body}
        </p>
        {/* Page number at bottom */}
        <p style={{ position:'absolute', bottom:'16px', left:0, right:0, textAlign:'center', fontFamily:'Georgia,serif', fontSize:'11px', color:'rgba(92,58,30,0.4)', letterSpacing:'0.05em' }}>
          — {page} —
        </p>
      </div>
    )
  }

  return (
    <main
      className="relative w-full min-h-dvh flex flex-col"
      style={{ background: isText ? '#2c1e0a' : '#06040f', userSelect:'none' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={handleTap}
    >
      {/* Top bar */}
      <div
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
        style={{ opacity: uiVisible ? 1 : 0, pointerEvents: uiVisible ? 'auto' : 'none', background:'linear-gradient(to bottom,rgba(4,2,10,0.97) 0%,transparent 100%)', padding:'14px 16px 36px' }}
      >
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            onClick={e => { e.stopPropagation(); router.push('/library') }}
            className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 text-white/60 hover:text-white transition-colors"
            style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)' }}
          >←</button>
          <div className="flex-1 min-w-0">
            <p className="text-white/90 text-sm font-medium truncate" style={{ fontFamily:'var(--font-sora)' }}>{title}</p>
            <p className="text-white/35 text-[10px] truncate">{author}</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); saveProgress() }}
            disabled={saveStatus === 'saving' || !userId}
            className="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all disabled:opacity-30"
            style={{ fontFamily:'var(--font-sora)', background: saveStatus==='saved' ? 'rgba(34,197,94,0.25)' : 'rgba(139,92,246,0.25)', border:`1px solid ${saveStatus==='saved'?'rgba(34,197,94,0.4)':'rgba(139,92,246,0.4)'}`, color: saveStatus==='saved'?'rgba(134,239,172,0.9)':'rgba(196,181,253,0.9)' }}
          >{saveStatus==='saving'?'…':saveStatus==='saved'?'✓ Saved':'🔖 Save'}</button>
        </div>
        {totalPages > 0 && (
          <div className="mt-3 max-w-2xl mx-auto px-1">
            <div className="h-[2px] bg-white/8 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background: isText ? 'rgba(251,191,36,0.8)' : 'rgba(139,92,246,0.8)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor:'rgba(139,92,246,0.2)', borderTopColor:'rgba(139,92,246,0.8)' }} />
          <p className="text-white/40 text-sm" style={{ fontFamily:'var(--font-sora)' }}>{isText ? 'Fetching book…' : 'Rendering PDF…'}</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-4xl">😔</p>
          <p className="text-white/60 text-sm leading-relaxed">{error}</p>
          <button onClick={() => router.push('/library')} className="text-purple-300/60 text-xs underline mt-2">Back to Library</button>
        </div>
      )}

      {/* PDF */}
      {!loading && !error && !isText && (
        <div
          className="flex-1 flex items-start justify-center pt-16 pb-24"
          style={{ transform: direction==='left'?'translateX(-10px)':direction==='right'?'translateX(10px)':'none', opacity: direction?0.85:1, transition: direction?'all 0.18s ease-out':'none' }}
        >
          <canvas ref={canvasRef} style={{ display:'block', width:'100%', maxWidth:'720px', background:'#fff', boxShadow:'0 8px 40px rgba(0,0,0,0.6)' }} />
        </div>
      )}

      {/* Text / Gutenberg */}
      {!loading && !error && isText && pages.length > 0 && (
        <div
          className="flex-1 flex flex-col justify-start pt-20 pb-28 px-4"
          style={{ transform: direction==='left'?'translateX(-14px)':direction==='right'?'translateX(14px)':'none', opacity: direction?0.75:1, transition: direction?'all 0.2s ease-out':'none' }}
        >
          {renderTextPage()}
        </div>
      )}

      {/* Bottom controls */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-500"
        style={{ opacity: uiVisible?1:0, pointerEvents: uiVisible?'auto':'none', background:'linear-gradient(to top,rgba(4,2,10,0.97) 0%,transparent 100%)', padding:'28px 24px 44px' }}
      >
        <div className="flex items-center justify-between max-w-xs mx-auto">
          <button
            onClick={e => { e.stopPropagation(); goPrev() }}
            disabled={page <= 1}
            className="flex items-center justify-center w-13 h-13 rounded-full text-2xl transition-all disabled:opacity-20 active:scale-90"
            style={{ width:'52px', height:'52px', background:'rgba(255,255,255,0.09)', border:'1px solid rgba(255,255,255,0.13)' }}
          >‹</button>

          <div className="flex flex-col items-center gap-1">
            <p className="text-white/55 text-xs tabular-nums" style={{ fontFamily:'var(--font-sora)' }}>
              {page} <span className="text-white/25">/</span> {totalPages || '…'}
            </p>
            <p className="text-white/25 text-[10px]">{pct}%</p>
          </div>

          <button
            onClick={e => { e.stopPropagation(); goNext() }}
            disabled={page >= totalPages}
            className="flex items-center justify-center rounded-full text-2xl transition-all disabled:opacity-20 active:scale-90"
            style={{ width:'52px', height:'52px', background:'rgba(255,255,255,0.09)', border:'1px solid rgba(255,255,255,0.13)' }}
          >›</button>
        </div>
        <p className="text-center text-white/12 text-[10px] mt-3" style={{ fontFamily:'var(--font-sora)' }}>tap edges · swipe · ← → keys</p>
      </div>
    </main>
  )
}
