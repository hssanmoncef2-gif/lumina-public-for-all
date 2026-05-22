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

export function useJournalEntries() {
  const [entries, setEntries]   = useState<JournalEntry[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEntries()
      setEntries(data)
    } catch (e) {
      setError('Could not load entries.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const remove = useCallback(async (id: string) => {
    try {
      await deleteEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch {
      setError('Could not delete entry.')
    }
  }, [])

  const toggleFav = useCallback(async (id: string, value: boolean) => {
    try {
      await toggleFavorite(id, value)
      setEntries(prev =>
        prev.map(e => e.id === id ? { ...e, isFavorite: value } : e)
      )
    } catch {
      setError('Could not update favorite.')
    }
  }, [])

  return { entries, isLoading, error, reload: load, remove, toggleFav }
}

// ---- Single-entry hook ----

export function useJournalEntry(id?: string) {
  const [entry, setEntry]       = useState<JournalEntry | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getEntry(id)
      .then(data => { setEntry(data); setLoading(false) })
      .catch(() => { setError('Could not load entry.'); setLoading(false) })
  }, [id])

  const save = useCallback(async (input: UpdateEntryInput) => {
    if (!id || !entry) return
    setIsSaving(true)
    try {
      const updated = await updateEntry(id, input)
      setEntry(updated)
    } catch {
      setError('Could not save entry.')
    } finally {
      setIsSaving(false)
    }
  }, [id, entry])

  return { entry, isLoading, isSaving, error, save }
}

// ---- Create hook ----

export function useCreateEntry() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const create = useCallback(async (input: CreateEntryInput): Promise<JournalEntry | null> => {
    setIsSaving(true)
    setError(null)
    try {
      const entry = await createEntry(input)
      return entry
    } catch {
      setError('Could not save your entry.')
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  return { create, isSaving, error }
}
