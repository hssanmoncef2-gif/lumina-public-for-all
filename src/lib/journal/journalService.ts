// ============================================================
// LUMINA — Journal Service (MongoDB via API routes)
// ============================================================

import type { JournalEntry, MoodId } from '@/types'

export interface CreateEntryInput {
  title?: string
  content: string
  mood?: MoodId
  moodIntensity?: number
  tags?: string[]
  isFavorite?: boolean
}

export interface UpdateEntryInput extends Partial<CreateEntryInput> {
  aiSummary?: string
}

function mapEntry(row: any): JournalEntry {
  return {
    id:            row._id ?? row.id,
    userId:        row.userId,
    title:         row.title,
    content:       row.content,
    mood:          row.mood as MoodId | undefined,
    moodIntensity: row.moodIntensity,
    tags:          row.tags ?? [],
    isFavorite:    Boolean(row.isFavorite),
    aiSummary:     row.aiSummary,
    createdAt:     new Date(row.createdAt),
    updatedAt:     new Date(row.updatedAt),
  }
}

export async function getEntries(userId: string): Promise<JournalEntry[]> {
  const res = await fetch(`/api/journal?userId=${userId}`)
  if (!res.ok) throw new Error('Failed to load entries')
  return (await res.json()).map(mapEntry)
}

export async function getEntry(id: string, userId: string): Promise<JournalEntry | null> {
  const res = await fetch(`/api/journal/${id}?userId=${userId}`)
  if (!res.ok) return null
  return mapEntry(await res.json())
}

export async function createEntry(userId: string, input: CreateEntryInput): Promise<JournalEntry> {
  const res = await fetch('/api/journal', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...input }),
  })
  if (!res.ok) throw new Error('Failed to create entry')
  return mapEntry(await res.json())
}

export async function updateEntry(id: string, userId: string, input: UpdateEntryInput): Promise<JournalEntry> {
  const res = await fetch(`/api/journal/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...input }),
  })
  if (!res.ok) throw new Error('Failed to update entry')
  return mapEntry(await res.json())
}

export async function deleteEntry(id: string, userId: string): Promise<void> {
  await fetch(`/api/journal/${id}`, {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
}

export async function toggleFavorite(id: string, userId: string, isFavorite: boolean): Promise<void> {
  await fetch(`/api/journal/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, isFavorite }),
  })
}
