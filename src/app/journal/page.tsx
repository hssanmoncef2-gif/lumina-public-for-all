'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Bold, Italic,
  Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, List, Quote, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/ui/BottomNav';
import AtmosphericBg from '@/components/ui/AtmosphericBg';

const DAYS   = ['S','M','T','W','T','F','S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MOODS  = ['😌','😊','😔','😤','😴','🥰','😰'];

const ACCENTS = [
  { label:'Violet', text:'#c084fc', bg:'rgba(192,132,252,0.14)', border:'rgba(192,132,252,0.28)' },
  { label:'Teal',   text:'#2dd4bf', bg:'rgba(45,212,191,0.12)',  border:'rgba(45,212,191,0.28)'  },
  { label:'Rose',   text:'#fb7185', bg:'rgba(251,113,133,0.12)', border:'rgba(251,113,133,0.28)' },
  { label:'Amber',  text:'#fbbf24', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.28)'  },
  { label:'Sky',    text:'#38bdf8', bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.28)'  },
];
type Accent = typeof ACCENTS[0];
type Entry  = { id:string; date:string; title:string; html:string; mood:string; accent:Accent };


export default function JournalPage() {
  const today    = new Date();
  const todayKey = today.toISOString().split('T')[0];

  const [viewDate, setViewDate]   = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected]   = useState(todayKey);
  const [entries,  setEntries]    = useState<Entry[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('lumina-journal') ?? '[]'); } catch { return []; }
  });
  const [writing,  setWriting]    = useState(false);
  const [title,    setTitle]      = useState('');
  const [mood,     setMood]       = useState(MOODS[0]);
  const [accent,   setAccent]     = useState(ACCENTS[0]);
  const editorRef = useRef<HTMLDivElement>(null);

  // Persist to localStorage whenever entries change
  useEffect(() => {
    try { localStorage.setItem('lumina-journal', JSON.stringify(entries)); } catch {}
  }, [entries]);

  const year       = viewDate.getFullYear();
  const month      = viewDate.getMonth();
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMo   = new Date(year, month+1, 0).getDate();
  const cells      = [...Array(firstDay).fill(null), ...Array.from({length:daysInMo},(_,i)=>i+1)] as (number|null)[];

  const dateKey  = (d:number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const hasEntry = (d:number) => entries.some(e => e.date === dateKey(d));
  const dayEntries = entries.filter(e => e.date === selected);

  const openEditor = () => {
    setTitle(''); setMood(MOODS[0]); setAccent(ACCENTS[0]); setWriting(true);
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = ''; }, 60);
  };

  const exec = useCallback((cmd:string, val?:string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  }, []);

  const save = () => {
    const html = editorRef.current?.innerHTML?.trim() ?? '';
    if (!html || html === '<br>') return;
    setEntries(prev => [{ id:Date.now().toString(), date:selected, title:title||'Untitled', html, mood, accent }, ...prev]);
    setWriting(false);
  };

  return (
    <div className="relative min-h-screen bg-[#09091a] text-white overflow-hidden flex flex-col select-none">

      {/* Atmosphere */}
      <AtmosphericBg />

      {/* ─── Main scroll area ─── */}
      <div className="relative z-10 flex flex-col flex-1 px-4 pt-10 pb-28 max-w-lg mx-auto w-full">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/25 mb-1">Your Journal</p>
          <h1 className="text-2xl font-light tracking-wide text-white/90">Reflections</h1>
        </div>

        {/* Calendar card */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 mb-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <button onClick={()=>setViewDate(new Date(year,month-1,1))}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ChevronLeft size={13} className="text-white/40" />
            </button>
            <span className="text-sm tracking-widest">
              <span className="text-white/85 font-medium">{MONTHS[month]}</span>{' '}
              <span className="text-white/35">{year}</span>
            </span>
            <button onClick={()=>setViewDate(new Date(year,month+1,1))}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ChevronRight size={13} className="text-white/40" />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d,i)=>(
              <div key={i} className="text-center text-[10px] text-white/20 font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day,i)=>{
              if (!day) return <div key={`e-${i}`}/>;
              const k=dateKey(day), isSel=k===selected, isToday=k===todayKey;
              return (
                <button key={k} onClick={()=>setSelected(k)}
                  className="relative flex items-center justify-center aspect-square rounded-lg transition-all duration-150"
                  style={{background:isSel?'rgba(20,180,160,0.22)':isToday?'rgba(255,255,255,0.06)':'transparent'}}>
                  <span className="text-[11px] font-medium"
                    style={{color:isSel?'#2dd4bf':isToday?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.4)'}}>{day}</span>
                  {hasEntry(day)&&<span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-400/60"/>}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Date + new entry */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-white/35 tracking-wide">
            {new Date(selected+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
          </p>
          <button onClick={openEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-400/20 text-teal-300 text-xs hover:bg-teal-500/30 transition-all">
            <Plus size={12}/> New Entry
          </button>
        </div>

        {/* Entry cards */}
        <div className="space-y-3">
          <AnimatePresence>
            {dayEntries.length===0&&(
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-14">
                <p className="text-3xl mb-3 opacity-20">✦</p>
                <p className="text-white/20 text-sm">No entries for this day</p>
                <p className="text-white/12 text-xs mt-1">Tap "New Entry" to begin</p>
              </motion.div>
            )}
            {dayEntries.map(entry=>(
              <motion.div key={entry.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                className="rounded-2xl p-4 border relative overflow-hidden"
                style={{background:entry.accent.bg, borderColor:entry.accent.border}}>
                {/* top colour bind */}
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                  style={{background:`linear-gradient(90deg,${entry.accent.text},transparent)`}}/>
                <div className="flex items-center gap-2 mb-2 mt-1">
                  <span className="text-lg">{entry.mood}</span>
                  <span className="text-sm font-semibold" style={{color:entry.accent.text}}>{entry.title}</span>
                </div>
                <div className="text-xs text-white/55 leading-relaxed
                  [&_b]:font-bold [&_i]:italic [&_u]:underline [&_s]:line-through
                  [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-white/35
                  [&_ul]:list-disc [&_ul]:ml-4"
                  dangerouslySetInnerHTML={{__html:entry.html}}/>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          FULL-SCREEN EDITOR
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {writing&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex flex-col"
            style={{background:'rgba(6,6,20,0.97)',backdropFilter:'blur(20px)'}}>

            <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}}
              transition={{type:'spring',damping:26,stiffness:280}}
              className="flex flex-col h-full max-w-2xl mx-auto w-full">

              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-8 pb-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0">{mood}</span>
                  <input
                    className="bg-transparent text-white/80 text-lg font-light placeholder-white/20 outline-none border-none min-w-0 flex-1"
                    placeholder="Entry title…"
                    value={title}
                    onChange={e=>setTitle(e.target.value)}
                  />
                </div>
                <button onClick={()=>setWriting(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0 ml-2">
                  <X size={18} className="text-white/40"/>
                </button>
              </div>

              {/* Accent + mood strip */}
              <div className="flex items-center gap-2 px-5 pb-3 shrink-0">
                {ACCENTS.map(ac=>(
                  <button key={ac.label} onClick={()=>setAccent(ac)}
                    className="w-4 h-4 rounded-full border-[2px] transition-all"
                    style={{
                      background:ac.text,
                      borderColor:accent.label===ac.label?'white':'transparent',
                      transform:accent.label===ac.label?'scale(1.25)':'scale(1)',
                    }}/>
                ))}
                <div className="w-px h-4 bg-white/10 mx-2"/>
                {MOODS.map(m=>(
                  <button key={m} onClick={()=>setMood(m)}
                    className={`text-base transition-all ${mood===m?'opacity-100 scale-115':'opacity-30 hover:opacity-60'}`}>
                    {m}
                  </button>
                ))}
              </div>

              {/* Gradient bind line (top) */}
              <div className="h-[1.5px] mx-5 mb-3 rounded-full shrink-0"
                style={{background:`linear-gradient(90deg,${accent.text},${ACCENTS[1].text},transparent)`}}/>

              {/* Formatting toolbar */}
              <div className="flex items-center gap-0.5 px-4 pb-3 shrink-0 overflow-x-auto">
                {/* Text style */}
                {([
                  {Icon:Bold,         cmd:'bold',          tip:'Bold (Ctrl+B)'},
                  {Icon:Italic,       cmd:'italic',        tip:'Italic (Ctrl+I)'},
                  {Icon:Underline,    cmd:'underline',     tip:'Underline (Ctrl+U)'},
                  {Icon:Strikethrough,cmd:'strikeThrough', tip:'Strikethrough'},
                ] as {Icon:React.ElementType,cmd:string,tip:string}[]).map(({Icon,cmd,tip})=>(
                  <button key={cmd}
                    onMouseDown={e=>{e.preventDefault();exec(cmd);}}
                    title={tip}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/45 hover:text-white/90 transition-all">
                    <Icon size={15}/>
                  </button>
                ))}

                <div className="w-px h-5 bg-white/10 mx-1 shrink-0"/>

                {/* Alignment */}
                {([
                  {Icon:AlignLeft,  cmd:'justifyLeft'},
                  {Icon:AlignCenter,cmd:'justifyCenter'},
                  {Icon:AlignRight, cmd:'justifyRight'},
                ] as {Icon:React.ElementType,cmd:string}[]).map(({Icon,cmd})=>(
                  <button key={cmd}
                    onMouseDown={e=>{e.preventDefault();exec(cmd);}}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/45 hover:text-white/90 transition-all">
                    <Icon size={15}/>
                  </button>
                ))}

                <div className="w-px h-5 bg-white/10 mx-1 shrink-0"/>

                {/* List & Quote */}
                <button onMouseDown={e=>{e.preventDefault();exec('insertUnorderedList');}}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/45 hover:text-white/90 transition-all">
                  <List size={15}/>
                </button>
                <button onMouseDown={e=>{e.preventDefault();exec('formatBlock','blockquote');}}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/45 hover:text-white/90 transition-all">
                  <Quote size={15}/>
                </button>

                <div className="w-px h-5 bg-white/10 mx-1 shrink-0"/>

                {/* Colour swatches */}
                <div className="flex gap-1 items-center">
                  {ACCENTS.map(ac=>(
                    <button key={ac.label}
                      onMouseDown={e=>{e.preventDefault();exec('foreColor',ac.text);}}
                      title={`${ac.label} text`}
                      className="w-4 h-4 rounded-sm transition-transform hover:scale-125 border border-white/10"
                      style={{background:ac.text}}/>
                  ))}
                </div>
              </div>

              {/* ── Editable writing area ── */}
              <div className="flex-1 overflow-y-auto px-5 min-h-0">
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Pour your thoughts here…"
                  className="min-h-full outline-none text-white/75 text-[14px] leading-8 font-light
                    [&_b]:font-bold [&_strong]:font-bold
                    [&_i]:italic [&_em]:italic
                    [&_u]:underline
                    [&_s]:line-through [&_del]:line-through
                    [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4
                    [&_blockquote]:italic [&_blockquote]:text-white/40 [&_blockquote]:my-2
                    [&_ul]:list-disc [&_ul]:ml-5 [&_li]:mb-1
                    empty:before:content-[attr(data-placeholder)] empty:before:text-white/20 empty:before:pointer-events-none empty:before:block"
                  style={{caretColor:accent.text}}
                />
              </div>

              {/* ── Save button area ── */}
              <div className="shrink-0 px-5 pt-4 pb-10">
                {/* Bottom bind line */}
                <div className="h-px mb-5 rounded-full"
                  style={{background:`linear-gradient(90deg,transparent,${accent.text},transparent)`,opacity:0.4}}/>

                <button
                  onClick={save}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all active:scale-[0.98] cursor-pointer"
                  style={{
                    background:`linear-gradient(135deg,${accent.bg.replace(/[\d.]+\)$/,'0.38)')},rgba(20,180,160,0.22))`,
                    border:`1.5px solid ${accent.border}`,
                    color:accent.text,
                    boxShadow:`0 0 32px ${accent.text}28, inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }}>
                  <Check size={16} strokeWidth={2.5}/>
                  Save Entry
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
