import { NextResponse } from 'next/server'

const BUCKET = 'books'

export async function GET() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json(
      { error: 'Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_KEY to your .env.local' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({ prefix: '', limit: 200, offset: 0, sortBy: { column: 'name', order: 'asc' } }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Supabase list error:', res.status, err)
      return NextResponse.json({ error: `Supabase error: ${res.status}`, detail: err }, { status: res.status })
    }

    const files = await res.json()

    if (!Array.isArray(files)) {
      return NextResponse.json({ books: [], debug: files })
    }

    const books = files
      .filter((f: any) => f.name && /\.(pdf|epub)$/i.test(f.name))
      .map((f: any) => {
        const rawName = f.name.replace(/\.(pdf|epub)$/i, '')
        const title = rawName
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
          .trim()
        const isPdf = f.name.toLowerCase().endsWith('.pdf')
        return {
          id: `sb-${f.name}`,
          title,
          author: 'Your Library',
          coverUrl: '',
          source: 'supabase',
          fileUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(f.name)}`,
          genre: 'mine',
          description: 'From your personal collection.',
          fileType: isPdf ? 'pdf' : 'epub',
        }
      })

    return NextResponse.json({ books })
  } catch (err: any) {
    console.error('books API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
