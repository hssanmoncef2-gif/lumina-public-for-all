import { NextRequest, NextResponse } from 'next/server'

// Proxy Gutenberg cover images server-side to avoid CORS / hotlink blocks.
// Usage: /api/library/cover?gutenbergId=1342
//        /api/library/cover?title=Pride+and+Prejudice&author=Jane+Austen  (Open Library fallback)

export async function GET(req: NextRequest) {
  const gutenbergId = req.nextUrl.searchParams.get('gutenbergId')
  const title       = req.nextUrl.searchParams.get('title') ?? ''
  const author      = req.nextUrl.searchParams.get('author') ?? ''

  // ── 1. Try Gutenberg cover ──────────────────────────────────
  if (gutenbergId) {
    const gutUrl = `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg`
    try {
      const res = await fetch(gutUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Lumina/1.0)' },
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const buf = await res.arrayBuffer()
        return new NextResponse(buf, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=604800, immutable',
          },
        })
      }
    } catch {}
  }

  // ── 2. Fallback: Open Library cover by title+author ────────
  if (title) {
    try {
      const q = encodeURIComponent(`${title} ${author}`.trim())
      const searchRes = await fetch(
        `https://openlibrary.org/search.json?q=${q}&limit=1&fields=cover_i`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (searchRes.ok) {
        const data = await searchRes.json()
        const coverId = data.docs?.[0]?.cover_i
        if (coverId) {
          const olRes = await fetch(
            `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`,
            { signal: AbortSignal.timeout(5000) }
          )
          if (olRes.ok) {
            const buf = await olRes.arrayBuffer()
            return new NextResponse(buf, {
              headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=604800, immutable',
              },
            })
          }
        }
      }
    } catch {}
  }

  // ── 3. Nothing found ────────────────────────────────────────
  return new NextResponse(null, { status: 404 })
}
