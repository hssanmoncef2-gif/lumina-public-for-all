'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, BookOpen, ChevronRight, Trash2, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import AtmosphericBg from '@/components/ui/AtmosphericBg';
import BottomNav from '@/components/ui/BottomNav';

const ACCENTS = [
  { label:'Violet', text:'#c084fc', bg:'rgba(192,132,252,0.14)', border:'rgba(192,132,252,0.28)' },
  { label:'Teal',   text:'#2dd4bf', bg:'rgba(45,212,191,0.12)',  border:'rgba(45,212,191,0.28)'  },
  { label:'Rose',   text:'#fb7185', bg:'rgba(251,113,133,0.12)', border:'rgba(251,113,133,0.28)' },
  { label:'Amber',  text:'#fbbf24', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.28)'  },
  { label:'Sky',    text:'#38bdf8', bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.28)'  },
];
type Accent = typeof ACCENTS[0];
type Entry  = { id: string; date: string; title: string; html: string; mood: string; accent: Accent };

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').slice(0, 120) + (html.length > 120 ? '…' : '');
}

// Group entries by month
function groupByMonth(entries: Entry[]) {
  const groups: Record<string, Entry[]> = {};
  entries.forEach(e => {
    const key = e.date.slice(0, 7); // YYYY-MM
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function monthLabel(key: string) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function YouPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lumina-journal');
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);

  function deleteEntry(id: string) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    try { localStorage.setItem('lumina-journal', JSON.stringify(updated)); } catch {}
    setConfirmDelete(null);
    if (selected?.id === id) setSelected(null);
  }

  const grouped = groupByMonth(entries);
  const totalWords = entries.reduce((acc, e) => acc + stripHtml(e.html).split(/\s+/).filter(Boolean).length, 0);

  return (
    <div className="relative min-h-screen bg-[#09091a] text-white overflow-hidden flex flex-col">
      <AtmosphericBg />

      <div className="relative z-10 flex flex-col flex-1 pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pt-10 pb-4 flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/25 mb-1">Your Space</p>
            <h1 className="text-2xl font-light tracking-wide text-white/90">
              {session?.user?.name || session?.user?.email?.split('@')[0] || 'You'}
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            <LogOut size={13} strokeWidth={1.8} />
            Sign out
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 px-5 mb-6"
        >
          {[
            { label: 'Entries', value: entries.length, emoji: '📖' },
            { label: 'This month', value: entries.filter(e => e.date.startsWith(new Date().toISOString().slice(0,7))).length, emoji: '🗓️' },
            { label: 'Words', value: totalWords.toLocaleString(), emoji: '✦' },
          ].map(stat => (
            <div key={stat.label}
              className="flex-1 rounded-2xl px-3 py-3 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-lg mb-0.5">{stat.emoji}</p>
              <p className="text-[16px] font-semibold text-white/80">{stat.value}</p>
              <p className="text-[9px] uppercase tracking-[0.07em] text-white/25">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Entries list */}
        <div className="px-4 flex flex-col gap-6">
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center pt-16 gap-3"
            >
              <BookOpen size={36} className="text-white/10" />
              <p className="text-white/30 text-sm">No journal entries yet.</p>
              <p className="text-white/15 text-xs">Head to the Journal tab to start writing.</p>
            </motion.div>
          ) : grouped.map(([monthKey, monthEntries], gi) => (
            <motion.div
              key={monthKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05 }}
            >
              {/* Month header */}
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 mb-2 px-1">
                {monthLabel(monthKey)}
              </p>

              <div className="flex flex-col gap-2">
                {monthEntries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(entry)}
                    className="relative rounded-2xl px-4 py-3.5 cursor-pointer overflow-hidden"
                    style={{
                      background: entry.accent.bg,
                      border: `0.5px solid ${entry.accent.border}`,
                    }}
                    whileTap={{ scale: 0.985 }}
                  >
                    {/* Top color line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                      style={{ background: `linear-gradient(90deg, ${entry.accent.text}, transparent)` }} />

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{entry.mood}</span>
                          <span className="text-[11px] font-semibold truncate"
                            style={{ color: entry.accent.text }}>
                            {entry.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">
                          {stripHtml(entry.html)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[9px] text-white/25 whitespace-nowrap">
                          {formatShortDate(entry.date)}
                        </span>
                        <ChevronRight size={13} className="text-white/20" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Entry detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'rgba(6,6,20,0.97)', backdropFilter: 'blur(20px)' }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="flex flex-col h-full max-w-2xl mx-auto w-full"
            >
              {/* Modal header */}
              <div className="flex items-start justify-between px-5 pt-10 pb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 mb-1">
                    {formatDate(selected.date)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selected.mood}</span>
                    <h2 className="text-xl font-medium" style={{ color: selected.accent.text }}>
                      {selected.title}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDelete(selected.id)}
                    className="p-2 rounded-xl transition-all"
                    style={{ background: 'rgba(255,80,80,0.08)', color: 'rgba(255,140,140,0.6)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-all"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Gradient divider */}
              <div className="h-[1.5px] mx-5 mb-5 rounded-full"
                style={{ background: `linear-gradient(90deg, ${selected.accent.text}, transparent)`, opacity: 0.4 }} />

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5">
                <div
                  className="text-[14px] text-white/70 leading-8 font-light
                    [&_b]:font-bold [&_strong]:font-bold
                    [&_i]:italic [&_em]:italic
                    [&_u]:underline [&_s]:line-through
                    [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/40
                    [&_ul]:list-disc [&_ul]:ml-5 [&_li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: selected.html }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null) }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-sm rounded-t-3xl p-6"
              style={{
                background: 'rgba(12,8,26,0.98)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
                paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
              }}
            >
              <p className="text-[15px] font-medium text-white/85 mb-1">Delete this entry?</p>
              <p className="text-[12px] text-white/30 mb-5">This can't be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 rounded-xl text-[13px]"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                  Cancel
                </button>
                <button onClick={() => deleteEntry(confirmDelete)}
                  className="flex-1 py-3 rounded-xl text-[13px] font-medium"
                  style={{ background: 'rgba(255,60,60,0.15)', border: '0.5px solid rgba(255,80,80,0.25)', color: 'rgba(255,140,140,0.9)' }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
