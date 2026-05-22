'use client'

// ============================================================
// LUMINA — useJournal Hook
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import type { JournalEntry } from '@/types'
import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  toggleFavorite,
  type CreateEntryInput,
  type UpdateEntryInput,
} from '@/lib/journal/journalService'

// ---- List hook ----

export function useJournalEntries(userId?: string) {
  const [entries, setEntries]   = useState<JournalEntry[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getEntries(userId)
      setEntries(data)
    } catch (e) {
      setError('Could not load entries.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const remove = useCallback(async (id: string) => {
    if (!userId) return
    try {
      await deleteEntry(id, userId)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch {
      setError('Could not delete entry.')
    }
  }, [userId])

  const toggleFav = useCallback(async (id: string, value: boolean) => {
    if (!userId) return
    try {
      await toggleFavorite(id, userId, value)
      setEntries(prev =>
        prev.map(e => e.id === id ? { ...e, isFavorite: value } : e)
      )
    } catch {
      setError('Could not update favorite.')
    }
  }, [userId])

  return { entries, isLoading, error, reload: load, remove, toggleFav }
}

// ---- Single-entry hook ----

export function useJournalEntry(id?: string, userId?: string) {
  const [entry, setEntry]       = useState<JournalEntry | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (!id || !userId) return
    setLoading(true)
    getEntry(id, userId)
      .then(data => { setEntry(data); setLoading(false) })
      .catch(() => { setError('Could not load entry.'); setLoading(false) })
  }, [id, userId])

  const save = useCallback(async (input: UpdateEntryInput) => {
    if (!id || !userId || !entry) return
    setIsSaving(true)
    try {
      const updated = await updateEntry(id, userId, input)
      setEntry(updated)
    } catch {
      setError('Could not save entry.')
    } finally {
      setIsSaving(false)
    }
  }, [id, userId, entry])

  return { entry, isLoading, isSaving, error, save }
}

// ---- Create hook ----

export function useCreateEntry(userId?: string) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const create = useCallback(async (input: CreateEntryInput): Promise<JournalEntry | null> => {
    if (!userId) return null
    setIsSaving(true)
    setError(null)
    try {
      const entry = await createEntry(userId, input)
      return entry
    } catch {
      setError('Could not save your entry.')
      return null
    } finally {
      setIsSaving(false)
    }
  }, [userId])

  return { create, isSaving, error }
}
