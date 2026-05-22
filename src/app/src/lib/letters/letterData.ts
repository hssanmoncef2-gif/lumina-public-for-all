// ============================================================
// LUMINA — Letter Data
// 10 "Open When..." letters with full content
// ============================================================

import type { Letter, LetterTrigger } from '@/types'

export const LETTERS: Letter[] = [
  {
    id: 'letter-overwhelmed',
    trigger: 'overwhelmed',
    title: 'open when you feel overwhelmed',
    preview: 'You are not behind. You are not failing. You are a person carrying something heavy, and that takes...',
    emoji: '🌊',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    isRead: false,
    content: `You are not behind. You are not failing. You are a person carrying something heavy, and that takes more strength than most people will ever see.

Right now, everything probably feels like it's piling on top of you. Like there's a list that never ends, a weight that never lifts, and you're the only one holding it all together.

But here's the thing — you don't have to hold it all at once.

Think of the ocean. When a wave hits, you don't fight it. You let it wash over you, and then you're still standing. That's you, right now. Still standing. Still breathing.

Pick just one thing. The smallest, softest thing you can do in the next five minutes. Not the whole list. Not tomorrow. Just right now.

Maybe it's a glass of water. A single deep breath. Putting one thing away. Whatever it is — do that, and let everything else wait.

You have survived every hard day so far. Every single one. This one is no different.

I'm proud of you for still being here.

With so much warmth,
Lumina ✦`
  },
  {
    id: 'letter-tired',
    trigger: 'tired',
    title: 'open when you are exhausted',
    preview: 'There is a difference between being lazy and being depleted. What you are feeling right now is not weakness...',
    emoji: '🌙',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    isRead: false,
    content: `There is a difference between being lazy and being depleted. What you are feeling right now is not weakness. It is your body telling you the truth.

You have been giving so much. Maybe to other people, maybe to your work, maybe just to the constant effort of existing in a world that asks a lot from you.

And now you're tired. That's allowed.

Rest isn't something you earn after you've done enough. Rest is something you need because you're human. Because your nervous system runs on sleep and stillness and quiet, not just output and productivity.

You don't have to justify being tired. You don't have to explain it or apologize for it. You just get to be tired, and that's enough.

If you can sleep — sleep. If you can't, then just be still. Lie down. Let your body have somewhere soft to land.

Tomorrow is going to ask things of you too. But right now, this moment is yours. You can put everything down. Nothing will fall apart.

You are allowed to rest.

So gently,
Lumina ✦`
  },
  {
    id: 'letter-overthinking',
    trigger: 'overthinking',
    title: 'open when your mind won\'t quiet',
    preview: 'Your brain is doing what it was built to do — protect you. It is running simulations, preparing for...',
    emoji: '🌀',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)',
    isRead: false,
    content: `Your brain is doing what it was built to do — protect you. It is running simulations, preparing for every possible outcome, trying to solve something before it even happens.

That's not a flaw. That's a mind that cares deeply.

But right now, it's working too hard on something it can't actually solve from inside your head.

Here's something true: most of the things we lie awake worrying about never happen the way we imagine them. And the ones that do happen? We figure them out when we get there, with the information we have then, not now.

You cannot think your way to safety by thinking more. You can only be present in this moment.

Try this — name five things you can see right now. Five actual, physical things in the room with you. Let your mind touch something real.

You are here. The floor is beneath you. Your breath is yours. This moment is safe.

The thoughts will pass. They always do.

You are not your spiral.

So softly,
Lumina ✦`
  },
  {
    id: 'letter-lonely',
    trigger: 'lonely',
    title: 'open when you feel alone',
    preview: 'Loneliness is one of the most quietly painful things a person can carry. It doesn\'t always look like what people think...',
    emoji: '🕊️',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    isRead: false,
    content: `Loneliness is one of the most quietly painful things a person can carry. It doesn't always look like what people think. You can feel it in a crowded room, in the middle of a conversation, even when your life looks full from the outside.

Being lonely doesn't mean no one loves you. It means something in you is reaching out and hasn't found its match yet in this moment.

That reaching is beautiful. It means you're open. It means you haven't closed yourself off, even when it would be easier.

Right now, I want you to know — you are not invisible. Someone, somewhere, has thought of you today without telling you. Your presence matters in ways you can't always see.

And this feeling, as real as it is, won't last forever. Connection finds its way to open hearts. It always does.

For now: be gentle with yourself. Make yourself something warm. Reach out to someone, even just a small message, if you can. Or just let yourself feel it, because letting yourself feel it is also a kind of honesty.

You are not as alone as the feeling says.

With so much care,
Lumina ✦`
  },
  {
    id: 'letter-lost',
    trigger: 'lost',
    title: 'open when you feel lost',
    preview: 'Not knowing where you\'re going is not the same as going nowhere. Sometimes the path disappears because you\'ve...',
    emoji: '🧭',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    isRead: false,
    content: `Not knowing where you're going is not the same as going nowhere. Sometimes the path disappears because you've grown beyond the one you were on.

Being lost is often the beginning of something. The moment before a new direction becomes clear. It doesn't feel that way — it feels like failure, like drift, like everyone else knows something you don't.

But think about it: every time in your life you found your way, there was a moment right before it where you were uncertain. Lost is just the space before the turn.

You don't have to figure out your whole life right now. You don't even have to figure out next year. Just today. Just this breath.

What's one thing — no matter how small — that feels even slightly like you? A place you love, a thing you make, a person who makes you feel real? Follow that thread. Even a few steps.

Direction comes from motion, not from standing still waiting for certainty.

You are not lost forever. You are between chapters.

Keep going,
Lumina ✦`
  },
  {
    id: 'letter-anxious',
    trigger: 'anxious',
    title: 'open when anxiety has you',
    preview: 'Your nervous system is sounding an alarm right now. That alarm is not always right, but it is real, and you\'re...',
    emoji: '🫧',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    isRead: false,
    content: `Your nervous system is sounding an alarm right now. That alarm is not always right, but it is real, and you're feeling it in your body — the tightness, the racing heart, the sense that something bad is about to happen.

You are safe. Right now, in this moment, you are safe.

Let's slow down together.

Breathe in for four counts. Hold for two. Out for four. Do that once. And again.

Anxiety is your brain trying to protect you from a threat that usually isn't there. It doesn't mean you're broken or weak — it means your nervous system is working overtime, and it needs a signal that you're okay.

That signal is your breath. Your feet on the floor. Your hands, warm and real.

You've felt this before, and it has always passed. Every single time. This one will pass too.

You don't have to fix the feeling or push through it. You just have to be here with it, gently, until your body remembers it's safe.

I'm here with you.

Steady and slow,
Lumina ✦`
  },
  {
    id: 'letter-comparing',
    trigger: 'comparing-yourself',
    title: 'open when you\'re comparing yourself',
    preview: 'You are looking at someone else\'s highlight reel and comparing it to your behind-the-scenes. That\'s not a fair fight...',
    emoji: '🪞',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    isRead: false,
    content: `You are looking at someone else's highlight reel and comparing it to your behind-the-scenes. That's not a fair fight, and somewhere inside, you know that.

What you see of other people is their best moments, curated and shared. What you know of yourself is everything — the doubt, the mess, the work no one sees, the gap between who you are and who you want to be.

But that gap is where all the real living happens. That's where growth is. No one who has ever done something meaningful got there without living in that uncomfortable space.

You are not behind. You are on your own path, moving at your own pace, building something that is yours. That thing cannot be compared to anyone else's thing, because it doesn't exist anywhere else.

The version of you that you see in your worst moments of comparison — that's not who you are. That's just a feeling.

Who you actually are is someone who cares enough to want more, feels enough to notice others, and tries enough to feel the discomfort of falling short. That person is extraordinary.

Stay on your path.

In your corner,
Lumina ✦`
  },
  {
    id: 'letter-proud',
    trigger: 'proud-moment',
    title: 'open when something went right',
    preview: 'Let yourself have this. Really have it — don\'t explain it away or immediately think about what comes next...',
    emoji: '✨',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    isRead: false,
    content: `Let yourself have this. Really have it — don't explain it away or immediately think about what comes next or remind yourself of everything still undone.

Something good happened. You did something, or something happened to you, and it is worth sitting with.

This moment is yours. Not proof of anything. Not a promise of what comes next. Just a thing that happened, and it was good, and you are allowed to feel that fully.

Sometimes the kindest thing you can do for yourself is let joy land. To let the good thing be good, without immediately moving past it.

So take a breath. Let yourself smile if you want to. Tell someone if it would feel good to share it. Or just sit with it quietly, the way you might hold something you love.

You worked for this, in whatever way you did. You showed up, or tried, or hoped, or pushed through — and here you are on the other side of it.

I'm so happy for you.

With so much joy,
Lumina ✦`
  },
  {
    id: 'letter-cant-sleep',
    trigger: 'cant-sleep',
    title: 'open when sleep won\'t come',
    preview: 'The whole world is asleep and you are awake, and there is something quietly isolating about that. The night...',
    emoji: '🌌',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    isRead: false,
    content: `The whole world is asleep and you are awake, and there is something quietly isolating about that. The night feels longer when you're in it alone.

You're not doing anything wrong. Sleep doesn't always come when called — especially when your mind is full, or your body is holding tension, or something unsettled is living just beneath the surface.

Try to let go of trying. I know that sounds like a riddle, but the harder we chase sleep, the further it runs. Instead, just let yourself rest. Eyes closed, body still, nowhere to be.

You don't have to sleep. You just have to be here, quietly, without judgment.

Think of something soft. The weight of a blanket. The sound of rain somewhere distant. A place you've been where you felt completely safe. Let your mind wander there, gently, without forcing anything.

Tomorrow is going to come whether or not you sleep perfectly. And you will get through it, because you always do.

For now — you are warm. You are safe. The night is passing.

Quietly,
Lumina ✦`
  },
  {
    id: 'letter-courage',
    trigger: 'needing-courage',
    title: 'open when you need courage',
    preview: 'You are about to do something that scares you. Or maybe you\'re in the middle of it, or maybe you\'ve been...',
    emoji: '🔥',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #9f1239 100%)',
    isRead: false,
    content: `You are about to do something that scares you. Or maybe you're in the middle of it, or maybe you've been putting it off and the moment has finally come.

Either way — you can do this.

Courage isn't the absence of fear. It's the decision to go forward anyway, with the fear right there beside you. The fact that you're scared means it matters. The fact that you're still here, reading this, means you haven't given up.

Think about all the times you've done something hard. Not the big dramatic ones — the quiet ones. The morning you got up when everything in you said stay down. The time you said something honest when silence would have been easier. The way you've kept going, again and again, even when you weren't sure you could.

That's courage. And it's already yours.

You don't need to feel ready. You don't need to feel brave. You just need to take the next step. Just one. The one right in front of you.

And then the one after that.

I believe in you. More than you know.

With all the fire,
Lumina ✦`
  },
]

export const LETTER_BY_TRIGGER: Record<LetterTrigger, Letter> = Object.fromEntries(
  LETTERS.map(l => [l.trigger, l])
) as Record<LetterTrigger, Letter>
