---
doc: prd
status: approved
---

# Acorn — Product Requirements

An app for yourself: clear daily/weekly missions you set yourself, collect points, and exchange them for real-life rewards in the shop. An AI (Jev) judges both what missions earn and what rewards cost.
Origin of the name: a squirrel busily gathers acorns, stores them, and eats them later. That is exactly how the app works: "earn with missions, save, and spend on rewards."
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`

## The Core Journey

1. **First open**: choose a language, enter a name, and set the monthly budget ($) (each only when not yet set).
2. **Register rewards** (only when there are none): at least 1, at most 5. Jev judges a price (pt) for each reward and shows the probability distribution.
3. **Decide this week's missions**: dailies (up to 3) and a weekly (up to 1), at least 1 in total. If there are last week's missions, they can be carried over (progress is reset).
4. **Register**: pressing the "Register" button puts it into the sending state, and Jev judges the pt of each mission. The missions' probability distribution is not shown on screen (learner's decision). On failure, an error toast appears and you can retry from the same screen.
5. **Every day**: on Home, see the week's timeline and missions. Clear dailies (self-reported) to earn pt. Also clear the weekly within the week.
6. **Exchange in the shop**: exchange the saved pt for rewards on the wishlist. An exchanged reward becomes "Redeemed."
7. **Next week**: on Monday (or, if the app is not opened on Monday, the first open that week) the week resets and you go back to steps 3–4. The point balance stays as is.

Success: being able to go around once from register → scoring → clear → earn pt → exchange. In the demo, the "Next day" and "Next week" controls show this in 1 minute. (`scope.md > What "Working" Looks Like`)

## Screens and Layout

Web with a mobile layout (`scope.md > The POC Boundary`).

- **Weekly setup flow**: go through only the needed steps, in the order language → name → budget → rewards → missions (register). Shown on the first launch of the week.
- **Home greeting**: "Welcome back, {name}!"
- **Home**: a one-week timeline (Mon–Sun), and this week's missions and their clear status. At the top right of Home, show the acorns on hand (the balance; it decreases when you exchange) with just an acorn and a number (the same number as at the top right of the Rewards screen). The screen name "Home" and the logo at the top left are not shown.
- **Shop**: lay out the wishlist like a shop screen, with a price (pt) and a redeem button.
- **Demo time controls**: "Next day" and "Next week". Used only in the mock.

## Look and Feel
- Old-school RPG style. The reference is the atmosphere of the original Pokémon (Red, Green, Blue).
- A soft, cute impression. But avoid being too cute.
- Colors do not have to be a single color (not limited to the Game Boy's monochrome green).
- Show Jev's probability distribution like a game status screen (`scope.md > Inspiration & Identity`).
- Make the shop like a game shop screen.
- Do not use assets or characters from any specific game; only reference the atmosphere.
- The logo is a pixel-art acorn (no emoji). The app icon uses the same image.
- Japanese uses normal kanji-kana mixed text (not hiragana-only writing for children).
- Do not show the name "Jev" on screen (people who do not know it would not understand). Confirming missions is called "Register."

## Features and Behavior

- On screen, pt is shown as "acorns": a pixel-art acorn (the same image as the logo) next to a number, and in text it is counted like "3 acorns." Do not use a text unit like "1 AC" (it is confusing with the app name and overlaps with Armor Class in RPGs). Names in data and the API stay `pt`.

### Budget
- Set the monthly budget in $. The only currency the PoC handles is $.
- Treat "1pt ≒ $1." Points are real money converted into in-game money.
- [ ] Only when the budget is not set, the budget input appears at the start of the setup flow.
- [ ] If it is set, the budget step does not appear from the next week on.

### Rewards and Their Prices (Shop)
- When you enter a reward name, Jev judges its price (pt). The price represents "how long it should take to reach this reward."
  - Things with a price (e.g. headphones): Jev estimates the amount and turns it into pt ($1 ≒ 1pt, then × 1.3).
  - Things that are hard to price (concept-like rewards): Jev judges "how long it should take to reach it," and converts it to pt as period × monthly budget.
  - As a result, for the same reward, the bigger the budget, the sooner you reach it (e.g. with a budget of $50,000/month, you reach an ordinary car in about 1 month).
- The price is set at registration and is not reviewed later.
- There is no quantity setting. 1 item = 1 exchange.
- Up to 5 rewards (redeemed ones do not count). You can add them from the shop at any time.
- On screen, rewards and the shop are called "Rewards" (both the screen name and the tab are "Rewards"). At the top right, show the acorns on hand (balance) with just an acorn and a number. Show a confirmation dialog before exchanging. The tabs at the bottom of the screen switch between Home, Rewards, and Settings (not shown in the setup flow).
- The price is 1.3 times the value derived from the amount or the period (learner's decision: "about 1.2 to 1.5 times," so that you cannot reach it without a bit of effort).
- [ ] When you add a reward, the price Jev judged (the number of acorns) is shown. The actual amount (price range) and the probability distribution are not shown.
- [ ] The redeem button of a reward whose price the balance does not cover cannot be pressed.
- [ ] When you exchange, the price in pt is subtracted from the balance and the reward becomes "Redeemed."
- [ ] If an exchange that should not be possible goes through and the balance is short, the error toast "Not enough acorns!" appears and the balance does not change.

### Missions and Their pt
- At registration you specify the name, daily or weekly, and the tracking method (progress %, count, time). For count and time, also enter a target number (time is entered in minutes). Things like distance go in the name (e.g. "Run 10 km") and are tracked by progress %.
- This week's missions are shown as empty slots (3 daily slots, 1 weekly slot). Pressing an empty slot opens a modal, where you confirm the registration (so you do not move on with a half-filled input). The target is also input to Jev's judgment. Up to 3 dailies and up to 1 weekly, at least 1 in total.
- Missions can be added, changed, and deleted only inside the weekly setup flow. Deleting uses a trash can icon, and pressing it shows a confirmation dialog.
- The target is not shown next to the mission name on Home (it would overlap with the progress display).
- Last week's missions can be carried over. Progress is reset even when carried over.
- Jev judges the difficulty of each mission and combines it with the monthly budget to decide the pt. The harder it is, the more pt; the bigger the budget, the more pt. The guideline is roughly "clearing a normal-difficulty mission every day for a whole month gets you to about the monthly budget."
- Missions are re-scored every week (including carried-over ones). The re-scored pt does not change during that week.
- [ ] After scoring, each mission shows its pt (the number of acorns). The missions' probability distribution is not shown.
- [ ] Count and time missions show their target (e.g. "20 times", "300 min"), and the bigger the target, the harder it is judged.
- [ ] Trying to register beyond the limit (a 4th daily, a 2nd weekly) cannot add it.
- [ ] You cannot finish setup with 0 missions.

### Clearing and Undo
- A daily can be cleared once a day, and a weekly once a week. Completion is self-reported.
- A mission records progress (%, count, minutes) according to its tracking method, and when the target is fully reached it becomes cleared and the pt is added (0pt if only partway). Dailies start from 0 each day; weeklies accumulate over the week (like Duolingo's missions).
- The mission controls on Home (record, undo, done) are pixel-art icon buttons (an outlined pencil, a back arrow, a checkbox).
- Progress is entered in the dialog opened by "Record" on Home and confirmed with the record icon (✓) (so that a mistaken tap does not clear it). The dialog has no cancel button; it closes by tapping outside it or the × at the top right (the same for the dialog for adding a mission). The input method can be switched among "Buttons (+/−)", "Bar (tap/drag)", and "Number" with icons at the bottom of the dialog. All three have the same height, and the dialog layout does not move when switching. The step for the buttons and the bar is 10% for progress %, and for count and time it is 1 if the target is 20 or less, 5 if 50 or less, and 10 if larger. Every tracking method has an "All done" icon to the right of the input field; pressing it sets the value to the target (it is saved when the record icon is pressed).
- Missions on Home show daily / weekly as an icon, and show the time left until the deadline in small text ("○ min left" under 1 hour, "○ h left" under 1 day, "○ d ○ h left" otherwise). The difficulty distribution is not shown on Home.
- A mission with a target of 1 (1 time, 1 minute) shows neither the progress bar nor the record dialog, and is cleared with a single "Done" check button.
- Undo happens after showing a confirmation dialog. Undoing returns the progress to the value just before clearing.
- When cleared, that mission's pt is added to the balance. At the moment of clearing, the card bounces once and glows pale green, and pixel sparks scatter from the pt. "+4pt" flies with a trail of light from the card to the acorns on hand at the top right, along an arc that first swells to the left and then curves right; when it arrives, sparks also scatter around the acorns on hand and the number counts up (not too flashy). No clear toast is shown (the animation conveys it well enough; learner's decision).
- A clear can be undone within 30 minutes. Undoing also returns the pt.
- However, if undoing would make the balance negative (e.g. clear → exchange for a reward → undo, and the balance is less than that mission's pt), it cannot be undone even within 30 minutes.
- If a day or week ends with a mission not cleared, nothing happens (no penalty).
- [ ] When cleared, the mission on Home and today's cell in the timeline become cleared, and the balance increases.
- [ ] Within 30 minutes it can be undone and the balance returns to what it was. Once 30 minutes have passed, the undo button disappears.
- [ ] Even within 30 minutes, it cannot be undone when the balance is less than that mission's pt (the balance does not go negative).

### Home Timeline
- Lay out the 7 days from Mon to Sun, show each day as a pixel-art puzzle divided into as many pieces as there are dailies, and fill a piece with each clear (complete when all are cleared). No border lines are drawn between pieces; the pieces are visible from the shape of the filled parts. Today's column stands out with a different background and weekday color. The weekly is not shown here.
- The list of this week's missions and the clear status of each. Missions not yet cleared are at the top, cleared missions at the bottom (a cleared card moves down after the animation ends).
- [ ] The previous days' clear status stays visible on the timeline.

### Language
- The app display supports English and Japanese.
- Choose the language on the first screen. It is shown with the device language setting preselected (Japanese if Japanese, English otherwise).
- The chosen language is saved and used the next time the app opens. It can be switched later on the Settings screen (it switches the moment you choose).
- The screen text and the category names on the status screen (difficulty levels, price ranges, periods) switch. Mission names and reward names you entered yourself are not translated.
- [ ] On the first screen, Japanese is selected if the device is Japanese, English otherwise.
- [ ] In the chosen language, all screen text and category names are shown, and this persists after reopening.
- [ ] Jev can judge English mission names and reward names too.

### Settings
- Opened from the third tab at the bottom of the screen, "Settings" (gear icon). Not shown in the setup flow.
- The name can be changed: enter it and press "Save" (it cannot be pressed when empty or the same name). Saving shows "Name changed," and the Home greeting changes too.
- The language can be changed: pressing English / 日本語 switches the display of all screens immediately.
- [ ] When the name is changed, the Home greeting uses the new name, and this persists after reopening.
- [ ] When the language is switched, all screens immediately switch to that language, and this persists after reopening.

### Weekly Reset
- A week is Mon–Sun. Reset on Monday, or on the first open within the week, and show the setup flow.
- The point balance is not reset (it does not disappear even across years).
- In the new week's setup, last week's missions are listed as "Last week's missions," and "Carry over" puts them into this week (target unchanged, progress 0, number of acorns re-scored). If the app was not opened for several weeks, the missions of the last week used are listed.
- Even when Monday arrives while the app is open, it switches to the new week's setup within 1 minute.
- [ ] Opening for the first time in a new week shows the setup flow, and the balance stays at the previous week's value.

### Demo Time Controls
- "Next day": it becomes the next day, and dailies can be cleared again.
- "Next week": it becomes Monday of the next week, and the weekly reset happens.
- [ ] "Next day" moves today's position on the timeline forward by 1 day.
- [ ] "Next week" shows the setup flow.

## States and Boundaries
- **First launch**: starts from the setup flow of language → name → budget → rewards → missions.
- **Sending / before scoring**: while sending, buttons cannot be pressed and missions cannot be edited. Missions cannot be cleared until their pt is set.
- **Jev judgment fails**: an error is shown as a toast and you can retry from the same screen. If the start-of-week scoring fails, that week's missions cannot be cleared until scoring finishes. If the reward price judgment fails, an error is also shown and you can retry.
- **Insufficient balance**: the redeem button cannot be pressed. If it slips through, an error toast.
- **What always persists**: the budget, rewards (including whether redeemed), missions, point balance, and past clear status. They remain after closing and reopening.

## Product Decisions
- The name is Acorn. It expresses "earn, save, and spend on rewards" with a squirrel and acorns.
- Points are a conversion of real money (1pt ≒ $1). How long it takes to reach a reward should be determined by what the reward is; converting uniformly by the monthly amount would be wrong, for example letting you reach a car in 1 month.
- Jev also judges reward prices. Pricing them yourself breaks the economy (`scope.md > The Unique Kernel`).
- Reward prices are not reviewed. Only the mission pt changes every week.
- Quantity settings were dropped.
- Points carry over and are not reset.
- The PoC currency is $ only.
- Undo is within 30 minutes, for when you press by mistake. An undo that would make the balance negative is not allowed.
- Rewards can be added at any time. Redeemed ones do not count toward the maximum of 5.
- Missions cannot be cleared until scoring finishes, because a mission without a set pt has no set earnings.
- Multilingual support for English and Japanese (added when planning `5-build`). Chosen on the first screen (the device language is the default). In-app switching was removed by the learner in the review after slice 2, but was put back in the Settings screen in the final review.
- Name entry and the Home greeting (added in the review after slice 2).
- A Settings screen for changing the name and language (added by the learner in the final review).

## What We're Building
- The weekly setup flow (budget, rewards, missions, scoring)
- Jev's judgment of mission pt and reward prices. Both show the probability distribution like a status screen
- Home (timeline, missions, clearing, undo within 30 minutes)
- Shop (wishlist, exchange, redeemed)
- Weekly reset, and carrying over the point balance
- The demo "Next day" and "Next week"
- Failure display and retry, and preventing insufficient balance
- An old-school RPG look with a mobile layout
- English and Japanese display (chosen on the first screen)
- Name entry and the Home greeting
- Settings screen (changing the name and language)

## Deferred From the POC
- Currencies other than $: exchange rates would be needed, increasing dependence on external data.
- Native mobile app: the PoC can be shown well enough on the web.
- Manual price adjustment (e.g. ±1 step): undecided whether to adopt.
- Changing the budget later: not handled this time.

## Possible Later Enhancements
- Support multiple currencies, converting with exchange rates.
- Make it possible to see exchange history and how points change over time.

## Non-Goals
- Text generation by AI (mission suggestions, review comments): the AI's role is limited to pricing.
- Social features: because it is an economy for yourself.
- Anti-cheating measures: because it is self-reported, a system for being honest with yourself.
- Reward quantity settings: dropped.
- Translating entered mission names and reward names: they are shown in the words you wrote yourself.

## Open Questions
- **[Decide in 4-spec]** The exact calculation that turns Jev's judgment into pt (how to set the difficulty levels, how to combine with the budget, the period candidates). The conditions the product must keep: "the harder and the bigger the budget, the more pt," "clearing everything at normal difficulty for 1 month gets you to about the budget," and "for rewards with a price, $1 ≒ 1pt."
- **[Confirm in 4-spec]** Whether Jev can return this judgment typed and give a probability distribution (`scope.md > Open Questions for Later Phases`).
