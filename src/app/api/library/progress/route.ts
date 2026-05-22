import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { ReadingProgress } from '@/lib/models/ReadingProgress'

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const userId = (session.user as any).id ?? (session.user as any).email;

  await connectDB()
  const progress = await ReadingProgress.find({ userId }).sort({ updatedAt: -1 }).lean()
  return NextResponse.json(progress)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const userId = (session.user as any).id ?? (session.user as any).email;
  const { bookId, source, pageNumber, totalPages, title, coverUrl } = body;
  if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 });

  await connectDB()

  const progress = await ReadingProgress.findOneAndUpdate(
    {  bookId },
    {  bookId, source, pageNumber, totalPages, title, coverUrl, updatedAt: new Date() },
    { upsert: true, new: true }
  )

  return NextResponse.json(progress)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const userId = (session.user as any).id ?? (session.user as any).email;
  const bookId  = req.nextUrl.searchParams.get('bookId');
  if (!bookId) return NextResponse.json({ error: 'missing params' }, { status: 400 });

  await connectDB();
  await ReadingProgress.deleteOne({  bookId });
  return NextResponse.json({ ok: true });
}
