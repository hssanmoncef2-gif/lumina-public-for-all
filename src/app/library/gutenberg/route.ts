import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const urls = [
    `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
    `https://www.gutenberg.org/files/${id}/${id}-8.txt`,
    `https://www.gutenberg.org/files/${id}/${id}.txt`,
    `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Lumina/1.0)' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const text = await res.text()
      // Make sure it's actual book text not an HTML error page
      if (text.length > 500 && !text.trim().startsWith('<!')) {
        return new NextResponse(text, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      }
    } catch {}
  }

  return NextResponse.json({ error: 'Could not fetch book' }, { status: 404 })
}