---
doc: scope
status: approved
---

# Real-life Quest Log

An app that brings the game mission loop into real life: you clear daily/weekly missions you set yourself, collect points, and exchange them for real-life rewards on your wishlist.

## The Unique Kernel
The difficulty of a mission (= the points it earns) is scored by an AI (Jev), not by you, and reward prices are calculated from your "monthly spending money." Taking pricing out of your own hands creates an "economy" that is neither too lenient nor too strict on yourself.

## Who It's For
Myself. People who want to use the kind of motivation that game daily/weekly missions give for real-life habits and "rewards." When you set your own goals and rewards, the pricing ends up too lenient or too strict, and it does not last.

## The Core Loop
1. At the start of the week (Monday, or the first launch that week), Jev re-scores the mission points and that week's rate is set.
2. Open the app every day, clear dailies (self-reported), and earn points. Also clear the weekly within the week.
3. Exchange the saved points for rewards on the wishlist.

Reason to come back: seeing the points pile up with each day's clears and getting closer to what you want. The "exchange rate"-like change, where the rate moves every week.

## Inspiration & Identity
- Game daily/weekly missions
- Show Jev's probability distribution like a game status screen (e.g. a scoring breakdown such as "120pt 62% / 80pt 30%")
- The PoC is web with a mobile layout (production is expected to be a native mobile app)

## Why This Matters to the Learner
I want to bring the motivation loop that works in games into my own real life. If I do the pricing myself, the economy breaks, so I want to leave that to AI.

## What "Working" Looks Like
In a web mock, the minimum features work end to end:
- Register missions (daily/weekly) and rewards
- Clear a mission and earn points
- Use points to exchange for a reward

The "wow" moment: when you register a mission, Jev scores its points and the probability distribution appears like a status screen. A mock-only "advance the week" control triggers re-scoring, and the rate and reward prices move.

## The POC Boundary
- Missions: up to 3 dailies and up to 1 weekly. At registration you only specify daily or weekly. Adding, changing, and deleting are possible only at the start of the week.
- Scoring: Jev judges only mission points. It re-scores every time the week switches (one week is Monday to Sunday; on Monday, or on the first launch within the week).
- Rewards: you enter the reward name and amount (yen) on the wishlist yourself. The price (pt) is worked back from the "monthly spending money" and the total points that can be earned that month, and is reviewed every week.
- Set the "spending money per month" in the profile.
- Show Jev's probability distribution like a status screen.
- Completion is self-reported (no anti-cheating measures).
- Mock-only time controls (advance the week).
- Web, mobile layout.

## Later
- Native mobile app
- Manual adjustment when you do not agree with a price (e.g. ±1 step). Undecided whether to adopt.

## Explicitly Cut
- Text generation by AI (mission suggestions, review comments): the AI's role is limited to pricing.
- Social features: this is an economy for yourself; other people are not involved.
- Anti-cheating measures: unnecessary, since this is a system for being honest with yourself.

## Open Questions for Later Phases
- Where and how Jev (jev-1.13) can be called (Vercel AI Gateway / OpenRouter are placeholders the AI put in and are unconfirmed). Check in `4-spec`, including whether typed answers (Choice / Score, etc.) and probability distributions are available.
- The exact calculation of "the total points that can be earned that month," and how the point balance is handled across weeks and months, are decided in `3-prd`.
