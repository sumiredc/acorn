---
doc: spec
status: approved
---

# Acorn — Technical Spec

## How This Works, In Plain Language

Acorn is made of two parts.

- **App (Expo / React Native)**: the screens and all of the game rules. It handles weekly setup, clearing, undo, redeeming, the weekly reset, and the demo time controls. All data (budget, rewards, missions, clear records) is saved on the device (localStorage on the web). The same code runs on the web and natively, so the PoC is shown in a browser and can move straight on to a native app.
- **API server (Python / FastAPI, started with Docker)**: an endpoint that only asks Jev and converts its answers into pt. Only this server holds the TypeSafe API key; it is never given to the app. It stores no data.

Example flow: when the learner registers the mission "20 push-ups" and finishes setup, the app sends the API server "score these 3 missions with a budget of $500". The server asks Jev "how hard is each one" on a 5-level scale, multiplies the most probable level by its multiplier, and calculates the pt. It then returns the pt and the probability distribution to the app. The app saves them and shows them on the status screen.

Jev is weak at arithmetic and at estimating exact numbers (official jaggedness page). So Jev only **picks a category**, and **all calculation is done in code**.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`

1. **First open** → the app reads saved data → no budget → budget step of the setup flow → the app saves the entered budget.
2. **Register a reward** → the app sends `POST /judge/reward` (reward name + budget) → the server asks Jev for the price band and period with Choice → code calculates the pt → the app saves the reward (with pt and distribution) and shows it in the shop.
3. **Decide this week's missions** → handled entirely inside the app (count limit checks, carrying over last week's missions).
4. **Register** (button on the missions screen; cannot be pressed while sending) → the app sends `POST /judge/missions` (all missions + budget) → the server asks Jev a Score question per mission, bundled into one request → calculates pt with the per-level multiplier → the app saves it and sets the week to "active". On failure the week stays in setup and an error is shown in a toast. Pressing the button again retries.
5. **Clear** → the app saves a clear record (date, pt, time) → the balance is recalculated from the records. It can be undone within 30 minutes if the balance is sufficient.
6. **Redeem** → the app checks the balance and marks the reward "redeemed" → the balance goes down.
7. **Next week** → on launch and after time controls, the app compares "the Monday of the current app time" with the saved week's Monday → if they differ, it creates a new week and returns to the setup flow (the balance is kept).

## Stack

| Part | Choice | Reason |
|---|---|---|
| App | **Expo SDK 58** (React Native 0.88, React 19.3) + Expo Router, TypeScript | Learner's decision: React Native was chosen to lead straight into native app development. With Expo the same code also runs on the web (the agent proposed it and the learner agreed) |
| Storage | `@react-native-async-storage/async-storage` | Learner's decision: localStorage. AsyncStorage uses localStorage on the web and saves on the device natively |
| API server | **Python + uv + FastAPI** | Learner's decision. The official TypeSafe Python SDK can be used |
| Calling Jev | `typesafe-sdk` (Python), `AsyncTypeSafeClient` | Learner's decision: call the TypeSafe API directly |
| Model | `jev-1.13.0` (pinned) | Latest stable version. `jev-latest` currently points to it too, but the version is pinned so it does not change unexpectedly |
| Runtime | Docker (API server) | Learner's decision |
| Localization | `expo-localization` (device language) + our own typed dictionary (`src/i18n/`) | Learner's decision: chosen on the first screen (the device language is the default). The dictionary is constrained by types, so tsc fails if a key is missing in English or Japanese |
| Tests | Unit tests only. App: Jest (`jest-expo`) + tsc, API: pytest | Learner's decision: E2E is not needed for now. Split into units that are easy to unit test (`Testability`) |
| Static analysis | API: ruff (format + lint), mypy. App: Prettier, ESLint (`eslint-config-expo`), tsc | Learner's decision: put the formatter and linter in CI |
| CI | GitHub Actions, GitHub-hosted runner (`ubuntu-latest`) | Learner's decision. During development a self-hosted runner on the home k8s was used, but once public, code from external pull requests would run on that runner, so it was moved before going public |

Documentation:
- Expo: https://docs.expo.dev/ / SDK 58: https://expo.dev/changelog/sdk-58
- Expo Router: https://docs.expo.dev/router/introduction/
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/
- FastAPI: https://fastapi.tiangolo.com/
- uv: https://docs.astral.sh/uv/
- TypeSafe Python SDK: https://docs.typesafe.ai/sdk/python
- TypeSafe API: https://docs.typesafe.ai/api / Models: https://docs.typesafe.ai/models
- Jev 1.13 jaggedness: https://docs.typesafe.ai/model-jaggedness/jev-1.13

**Not yet confirmed (check at the start of the build)**
- The name of the argument that specifies the model in `typesafe-sdk` ("Choose a System One model" on the Usage page), and the minimum required Python version.
- Whether Jev can judge Japanese mission and reward names reasonably.
- The exact version of each library (pinned at the time of `create-expo-app` and `uv add`).
- Whether `@expo-google-fonts/dotgothic16` exists (`Look and Feel`).

## Where It Runs and How Someone Tries It

- Requirements: Docker, Node.js (a version supported by Expo SDK 58), a TypeSafe API key (issued in the console at https://docs.typesafe.ai).
- Start:
  ```sh
  cp .env.example .env        # put in TYPESAFE_API_KEY (do not commit)
  docker compose up --build   # API server → http://localhost:8000
  cd mobile && npm install
  npx expo start --web        # app → http://localhost:8081
  ```
- If port 8081 is used by another app: run on a different port with `ACORN_CORS_ORIGINS=http://localhost:8082 docker compose up -d` and `npx expo start --web --port 8082`.
- Demo video: https://youtube.com/shorts/ydS4rhTu7JY (English, about 55 seconds). Recorded by driving the screen at phone width (390×844) with Playwright. The mission scoring and reward pricing are real Jev results during recording, and the Monday–Saturday clear records are data prepared for the recording. The learner wrote the narration and subtitles; the voice is macOS `say` (Samantha), and the BGM is a self-made 8-bit style track.
- What the submission needs is a short demo video and a public GitHub repository. Deployment is optional.
- Public repository: https://github.com/sumiredc/acorn
- Devpost submission: https://devpost.com/software/acorn-142kr8
- Optional deployment: only if others are to use it, place it on the home server's k8s (learner's decision). The setup that keeps the API key on the server side can be used as is. Not done for the PoC.

## Look and Feel
`prd.md > Look and Feel` put into an implementable form.

- **Mood**: an old RPG (like the original Pokémon Red/Green/Blue). Soft and cute, but not too cute. No assets or characters from any specific game are used.
- **Font**: the Japanese-capable pixel-style font **DotGothic16** (Google Fonts, `@expo-google-fonts/dotgothic16`) for headings, buttons, and numbers. Longer body text uses the system font.
- **Colors** (kept as tokens in `mobile/src/ui/theme.ts`):
  - Background: cream `#f3efe2`, window: `#fffcf2`, text and borders: dark brown `#2b2620`
  - Acorn (primary color, buttons): `#a5642e`, leaf (clear, success): `#4f8a5b`, sky (Jev, probabilities): `#3f6fa6`, berry (errors): `#b8435a`
  - Not monochrome
- **Window**: a box with a thick border (3px) and rounded corners (8px), like an RPG message window. Screen elements generally go inside these windows.
- **Status screen**: Jev's judgement lists the top 3 candidates as "category name, %, horizontal bar" and highlights the chosen one. Confidence is shown small alongside.
- **Buttons**: put "▶" in front of anything pressable. Disabled states are clearly faded. The main actions of a screen ("Next", "Register", etc.) are placed outside the windows at full width.
- **Wording**: short and game-like. Japanese uses ordinary mixed kanji and kana (e.g. "ミッションクリア！" ("Mission clear!"), "pt が足りません" ("Not enough pt")). The name "Jev" is not shown on screen.
- **Acorns (currency)**: pt is shown on screen with `AcornAmount` (the logo image + a number). Internal data names and the API keep `pt`.
- **Logo**: a 12×12 pixel-art acorn (`mobile/src/ui/logoPixels.ts`). On screen `Logo.tsx` draws it as a grid of Views, and the app icon is made into PNG from the same data by `mobile/scripts/make-icons.py`. No emoji are used.
- **Layout**: mobile width (up to about 430px). Centered on the web.

## Components

### Store (Saving and the Entry Point for Rules)
`mobile/src/storage/store.ts`. Reads and writes all data as JSON under one AsyncStorage key (`acorn:v1`). Screens use it as a React hook (`useAcorn()`). Every change goes through the pure functions in `src/domain/`.
PRD ref: `prd.md > States and Boundaries` (what persists)

### Domain (Game Rules as Pure Functions)
`mobile/src/domain/`. A set of easily testable functions that depend on neither the screens nor storage.
- `clock.ts`: app current time = real time + `clockOffsetMs`. Calculates the week's Monday (local time) and date keys.
  PRD ref: `prd.md > Demo Time Controls`, `prd.md > Weekly Reset`
- `week.ts`: deciding when the week switches and creating a new week (`ensureWeek`: if the saved week's Monday differs from the current Monday, move this week's missions, in their pre-scoring state, into `previousMissions`; after a week with no missions, keep the earlier ones), mission count checks (daily ≤3, weekly ≤1, total ≥1), missions that can be carried over (ones not already in this week), and the time until next Monday ("Next week").
  `ensureWeek` is run at the start of every operation and on the time after moving it with "Next day" or "Next week". Home sends a `tick` every minute.
  PRD ref: `prd.md > Missions and Their pt`, `prd.md > Weekly Reset`
- `progress.ts`: deciding whether a mission with a target of 1 is just a checkbox, progress steps (percent progress 10%; for count and time, target ≤20 → 1, ≤50 → 5, above that → 10), snapping a bar position to the nearest step, clamping to 0–target, and progress keys (per day for daily, per week for weekly).
  PRD ref: `prd.md > Clearing and Undo`
- `timeline.ts`: for each day Monday–Sunday, the number of dailies cleared and the total number of dailies, today's position (the timeline display data), and whether a clear completes today's puzzle. The puzzle images are in `mobile/src/ui/puzzlePixels.ts` (12×12 pixel art with 1–3 pieces).
  PRD ref: `prd.md > Home Timeline`
- `clears.ts`: whether a mission can be cleared (scored; daily not yet cleared that day; weekly not yet cleared that week), clearing, and whether a clear can be undone (within 30 minutes and balance ≥ its pt).
  PRD ref: `prd.md > Clearing and Undo`
- `rewards.ts`: rewards waiting to be redeemed (excluding redeemed ones), whether one can be added (up to 5 waiting), and whether one can be redeemed (waiting, and balance ≥ price).
  PRD ref: `prd.md > Rewards and Their Prices (Shop)`
- `balance.ts`: balance = sum of pt in clear records − sum of pt of redeemed rewards. Whether a reward can be redeemed. The balance is shown at the top right of home and the shop.
  PRD ref: `prd.md > Rewards and Their Prices (Shop)`
- `setup.ts`: decides the next step of the setup flow (language not chosen → language, no name → name, no budget → budget, week in setup and 0 unredeemed rewards → rewards, week in setup → missions). The rewards step only appears while the week is in setup, so redeeming the last reward mid-week does not send the user back to the setup flow. Even after adding the first reward, the flow stays on the rewards step until "Next" is pressed (held in screen state).
  PRD ref: `prd.md > Screens and Layout` (weekly setup flow), `prd.md > Budget`

### Store Updates (Reducer)
`mobile/src/storage/reducer.ts`. A pure function `reduce(data, action, now) → data` that expresses every change (setting the budget, registering missions, applying scoring results, clearing, undo, redeeming, time controls, switching weeks, changing the language). `store.ts` only loads, calls `reduce`, and saves. This is so screen logic can be verified with unit tests.
PRD ref: all of `prd.md > Features and Behavior`

### I18n
`mobile/src/i18n/`. Dictionaries of the same shape are kept in `en.ts` and `ja.ts`, and `ja.ts` is matched to the type of `en.ts` (tsc fails if a key is missing). Strings are looked up with `t(key, params)`. The language is determined from `data.locale` (`"en" | "ja" | null`; null means not chosen, and in the meantime the device setting is used for display) and `expo-localization`. Jev's categories are received as language-independent keys (`Judgement Keys` below) and turned into category names via the dictionary when displayed.
PRD ref: `prd.md > Language`

### API Client
`mobile/src/api/client.ts`. Calls the API server's two endpoints. The target is `EXPO_PUBLIC_API_URL` (default `http://localhost:8000`). `fetch` can be swapped via an argument so it can be verified in unit tests. On failure it returns the error kind (`jev_failed` / `network`), and the screen turns it into wording via the dictionary.

### Screens
Expo Router files.
- `mobile/app/setup.tsx`: the weekly setup flow. Language → name → budget → rewards → missions (with carry-over checkboxes; "Register" puts it into sending, and failures show a toast). PRD ref: `prd.md > Budget`, `prd.md > Missions and Their pt`
- `mobile/app/index.tsx`: home. Timeline, this week's missions, and clear / undo buttons. If setup is not finished, it moves to `setup`. PRD ref: `prd.md > Home Timeline`, `prd.md > Clearing and Undo`
- `mobile/app/shop.tsx`: shop. The reward list (price, distribution, redeem / redeemed) and adding rewards (up to 5; redeemed ones are not counted). PRD ref: `prd.md > Rewards and Their Prices (Shop)`
- `mobile/app/settings.tsx`: settings. Changing the name (`setUserName` on "Save") and switching the language (`setLocale` the moment it is chosen). The language list is `ui/languages.ts`, shared with the setup flow. PRD ref: `prd.md > Settings`
- `mobile/app/_layout.tsx`: font loading, the bottom tabs (`NavBar`; switches between home, shop, and settings with `router.replace`, hidden in the setup flow), and toasts. The demo time controls are placed at the bottom of home.

### UI Parts
`mobile/src/ui/`: `Window.tsx` (RPG window), `StatusDistribution.tsx` (probability distribution), `Timeline.tsx` (Monday–Sunday), `Toast.tsx`, `DemoClock.tsx` ("Next day", "Next week"), `theme.ts`.

### API Server
`api/src/acorn_api/`
- `main.py`: the FastAPI app. Allows `http://localhost:8081` via CORS. Endpoints are `GET /health`, `POST /judge/missions`, `POST /judge/reward`.
- `jev.py`: calls Jev with `AsyncTypeSafeClient`. The call is wrapped in a single function so it can be swapped in tests.
- `pricing.py`: pure functions that convert categories to pt (see `Pricing Rules`).
- `schemas.py`: request and response types (Pydantic).
PRD ref: `prd.md > Rewards and Their Prices (Shop)`, `prd.md > Missions and Their pt`

## Testability
Learner's decision: split things into units where the rules can be verified with unit tests alone. No E2E for now.
- **App**: rules live in pure functions in `domain/` and `storage/reducer.ts`. Screens (`app/*.tsx`) only display data and call `dispatch`. Time is passed in as `now`; `Date.now()` is not called directly. The API Client lets `fetch` be swapped. The dictionaries are checked by types.
- **API**: `pricing.py` is pure functions. `jev.py` has a type (Protocol) for "a function that takes questions and returns answers", swapped via FastAPI dependency injection. Endpoint tests plug in a fake Jev and verify with `TestClient`.
- Jest and pytest run with the same commands locally and in CI.

## Static Analysis and CI
`.github/workflows/ci.yml`. On every push and pull request, two jobs run on `runs-on: ubuntu-latest`. Node and uv are set up in each job, and caching is left to the setup actions.
- **api** (run in `api/`): `astral-sh/setup-uv` (cache enabled, Python 3.12 from `api/.python-version`) → `uv sync --frozen` → `uv run ruff format --check .` → `uv run ruff check .` → `uv run mypy src` → `uv run pytest`
- **mobile** (run in `mobile/`): `actions/setup-node` (node-version: 24, npm cache) → `npm ci` → `npx prettier --check .` → `npx expo lint` → `npx tsc --noEmit` → `npx jest --ci`
- CI does not use the API key (tests run with a fake Jev).

## Pricing Rules
Implemented in `api/src/acorn_api/pricing.py` and verified with pytest. PRD ref: `prd.md > Rewards and Their Prices (Shop)`, `prd.md > Missions and Their pt`, `prd.md > Product Decisions`.

### Mission pt (Slot Method)
- Question to Jev: Score, 5 levels `["very easy", "easy", "normal", "hard", "very hard"]`. state = `{ "mission": name, "kind": "daily" | "weekly" }`.
- Level used: the **most probable level** in `probabilities`. Do not interpolate a number from the expected-value `score` (jaggedness caution).
- Multipliers: `[0.5, 0.75, 1, 1.5, 2]`
- Base amount (slot method: the value per mission is fixed regardless of count):
  - Daily, 1 mission/day = budget × 0.75 ÷ 3 ÷ 30
  - Weekly, 1 mission/week = budget × 0.25 × 7 ÷ 30
- pt = max(1, round(base amount × multiplier))
- Example (budget $500, normal): daily ≈ 4pt, weekly ≈ 29pt. Filling every slot with normal and clearing everything for a month gives about $500.

### Judgement Keys
The API server returns Jev's answers normalized to language-independent keys. The app turns them into category names via the dictionary.
- Mission difficulty: `level_0`–`level_4` (very easy to very hard)
- Price band: `usd_10`, `usd_30`, `usd_100`, `usd_300`, `usd_1000`, `usd_3000`, `usd_10000`, `usd_30000`, `usd_100000`, `no_price`
- Period: `d1`, `d3`, `w1`, `w2`, `m1`, `m3`, `m6`, `y1`
- The category descriptions (criteria) sent to Jev are written in English. Mission and reward names are sent in the language they were entered in.

### Reward pt
Two Choice questions are asked in one request. state = `{ "reward": name }`.
- **Price band**: `~$10, ~$30, ~$100, ~$300, ~$1,000, ~$3,000, ~$10,000, ~$30,000, ~$100,000, Hard to price` → for categories with a price, that value × `REWARD_MARKUP` (1.3) is the pt (a markup on 1pt ≈ $1).
- **Period**: `1 day, 3 days, 1 week, 2 weeks, 1 month, 3 months, 6 months, 1 year` → months `[1/30, 3/30, 7/30, 14/30, 1, 3, 6, 12]`. Used only when "Hard to price" was the most probable price band answer. pt = round(months × budget × 1.3).
- Distribution shown: the distribution of whichever question was used.
- Choice has a weakness of tending to pick the first option, so "Hard to price" is placed last in the price bands.

## Data Model
One JSON value of the following shape is saved under the AsyncStorage key `acorn:v1`.

```ts
type AcornData = {
  version: 1;
  userName: string | null;           // name used in the home greeting
  budgetUsd: number | null;          // budget; null if not set
  clockOffsetMs: number;             // amount advanced by the demo time controls
  rewards: Reward[];
  week: Week | null;                 // this week
  previousMissions: Mission[];       // last week's missions (for carry-over)
  clears: Clear[];                   // clear records for all time
  locale: "en" | "ja" | null;        // display language; null means not chosen (display uses the device setting)
};
type Judgement = { choice: string; probabilities: Record<string, number>; confidence: number };
type Reward = { id: string; name: string; pt: number; mode: "price" | "period";
  judgement: Judgement; status: "available" | "redeemed"; createdAt: number; redeemedAt?: number };
type Mission = { id: string; name: string; kind: "daily" | "weekly";
  unit: "percent" | "count" | "minutes"; target: number;   // 100 when percent
  pt: number | null; judgement: Judgement | null };   // null before scoring
type Week = { weekStart: string;     // Monday's date "YYYY-MM-DD"
  status: "setup" | "active"; missions: Mission[];
  progress: Record<string, number> };  // "missionID/date" (daily) or "missionID/week's Monday" (weekly) → progress
type Clear = { id: string; missionId: string; weekStart: string; date: string;
  pt: number; clearedAt: number;     // clearedAt is app time
  progressBefore: number };          // progress just before the clear was recorded; restored on undo
```

- **Where it lives**: all on the device. The API server stores nothing.
- **How it changes**: screen action → `dispatch(action)` → `reducer.ts` builds new data with the `domain/` functions → the Store saves it.
- **When closed and reopened**: the Store loads, and `week.ts` checks whether the week has changed. If so, it creates a new week (`status: "setup"`) and moves this week's missions into `previousMissions`.
- **The balance** is not saved; it is calculated from `clears` and `rewards` every time. This keeps the number from drifting through undo and redeeming.
- The 30 minutes for undo are counted in app time. Pressing "Next day" passes 30 minutes, so undo is no longer possible.

## File Structure

```
bwai/
├── mobile/                         # Expo app (run and shown on the web)
│   ├── app/                        # Expo Router screens
│   │   ├── _layout.tsx             # fonts, nav, demo time controls, toasts
│   │   ├── index.tsx               # home (timeline, missions, clear)
│   │   ├── shop.tsx                # shop (rewards, redeem, add)
│   │   ├── settings.tsx            # settings (name, language)
│   │   └── setup.tsx               # weekly setup flow
│   ├── src/
│   │   ├── domain/                 # game rules (pure functions)
│   │   │   ├── clock.ts
│   │   │   ├── week.ts
│   │   │   ├── clears.ts
│   │   │   ├── balance.ts
│   │   │   ├── setup.ts
│   │   │   └── __tests__/          # Jest tests
│   │   ├── storage/
│   │   │   ├── reducer.ts          # pure function expressing every change
│   │   │   ├── store.ts            # AsyncStorage + useAcorn()
│   │   │   └── __tests__/
│   │   ├── i18n/                   # en.ts, ja.ts (typed dictionaries), index.ts (t and language selection)
│   │   ├── api/client.ts           # calls the API server (fetch is swappable)
│   │   └── ui/                     # Window, StatusDistribution, Timeline, Toast, DemoClock, theme
│   ├── app.json
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── package.json
│   └── .env.example                # EXPO_PUBLIC_API_URL=http://localhost:8000
├── api/                            # FastAPI (the endpoint for Jev)
│   ├── src/acorn_api/
│   │   ├── main.py
│   │   ├── jev.py
│   │   ├── pricing.py
│   │   └── schemas.py
│   ├── tests/
│   │   ├── test_pricing.py         # conversion tests
│   │   └── test_judge.py           # endpoint tests with Jev swapped out
│   ├── pyproject.toml              # ruff, mypy, and pytest settings also live here
│   ├── .python-version             # 3.12
│   ├── uv.lock
│   └── Dockerfile
├── .github/workflows/ci.yml        # static analysis and unit tests on a GitHub-hosted runner
├── compose.yaml                    # starts the API server
├── .env.example                    # TYPESAFE_API_KEY=
├── .gitignore                      # excludes .env and devpost/learner-profile.md
├── README.md
└── devpost/                        # planning documents
```

## External Services and Dependencies

### TypeSafe API (Jev)
- Call: `POST https://api.typesafe.ai/v1/systemone`. Header is `Authorization: Bearer $TYPESAFE_API_KEY`. Called through `system_one` in the Python SDK `typesafe-sdk`.
- Request: `{ model: "jev-1.13.0", state, questions: { <id>: { type: "score" | "choice", instructions, criteria } } }`
  - Score `criteria` is an array from low to high (2–10 levels). Choice `criteria` is `{ option: description | null }` (up to 255).
- Response: `answers.<id>` is `{ type, probabilities: { level or option: probability }, confidence, legend? (score), score? (score), choice? (choice) }`. `model` and `usage` at the top level.
- Errors: 400 / 401 / 422 / 429 / 529. The SDK retries 429 and 529 automatically.
- Pricing: $0.042 per 1M input tokens; output is free.
- Limits: 64k tokens per request, 32k tokens per question.
- Documentation: https://docs.typesafe.ai/api , https://docs.typesafe.ai/primitives/score , https://docs.typesafe.ai/primitives/choice

### API Server Endpoints (App ↔ API Server)
- `POST /judge/missions`
  - Sends: `{ budgetUsd: number, missions: [{ id, name, kind }] }`
  - Returns: `{ missions: [{ id, pt, judgement: { choice, probabilities, confidence } }] }`. The keys of `choice` and `probabilities` are `Judgement Keys`.
- `POST /judge/reward`
  - Sends: `{ budgetUsd: number, name: string }`
  - Returns: `{ pt, mode: "price" | "period", judgement: { choice, probabilities, confidence } }`
- Failure: if the Jev call fails, `502 { detail: "jev_failed" }`. The wording comes from the app's dictionary.

## Important Failure Modes
- **The Jev call fails, or the API server is not running** → on the missions or rewards screen, an error is shown in a toast. Pressing the button again retries. The week stays in setup and nothing can be cleared (`prd.md > States and Boundaries`).
- **Jev is weak with Japanese names** (not yet confirmed) → try real names at the start of the build. If the judgements are off, adjust how the questions are written, e.g. by adding kind or a short English description to state.
- **A redeem slips through with an insufficient balance** (double tap, etc.) → check again with `canRedeem` in `rewards.ts` right before saving; if the balance is short, show the toast "Not enough acorns!" and change nothing. The reducer rejects it with the same check.

## What Was Simplified and Why
- **All data is on the device** (no server DB). It is used by one person, so no accounts or sync are needed. A full version would add a DB and authentication.
- **Time is app time (real time + offset)**, so days and weeks can be advanced in the demo. In production, fix the offset at 0.
- **The weekly reset is checked on launch and right after time controls.** There is no background processing.
- **No deployment.** It runs locally and is recorded. If sharing becomes desirable, put it on the home k8s.
- **Currency is $ only** (`prd.md > Deferred From the POC`).

## Decisions and Open Issues

### Decided
- Learner: TypeScript + React Native, to lead straight into app development.
- Learner: the API server is Python + uv + FastAPI, started with Docker. Go + Echo was named at first, but after learning the official SDKs are only JS / Python, it was changed to Python.
- Learner: call the TypeSafe API directly.
- Learner: data in localStorage, realized as the web version of AsyncStorage.
- Learner: if shared, the home k8s. No deployment for the PoC.
- Learner: the reward price band and period categories as in the draft.
- Learner: mission pt uses the slot method. The split (daily 75% / weekly 25%) and the difficulty multipliers (0.5 / 0.75 / 1 / 1.5 / 2) were approved as in the draft ("ok" in the spec review).
- The agent proposed and the learner agreed: use Expo and show it on the web. Have Jev pick categories and do the calculation in code.
- Implementation details (derived by the agent): calculate the balance instead of saving it, app time, pin to `jev-1.13.0`, use the most probable level, place "Hard to price" last.

- Learner (added when planning `5-build`): English and Japanese localization. Device setting and in-app switching.
- Learner (added when planning `5-build`): put the formatter and linter in CI. Tests are unit tests only; E2E is not needed for now. Split into units that are easy to unit test. Prepare the CI environment before implementation. The repository stays private until submission, and the runner is self-hosted (requested from aidd-infra).

### Understanding Gained
- **Why Jev is not asked for numbers directly**: the first draft had "Jev estimates the amount". The official jaggedness page says "not a calculator" and "do not interpolate numbers from score", so it was changed to have Jev pick a category and convert it in code.
- **What "fewer missions in a week earn less" means**: a question from the learner. Using the $500 budget example, the slot method (about 125pt a month with only 1 daily) was compared with the split method (about 500pt even with 1 mission, which leaves a loophole of earning easily by reducing the count), and the learner chose the slot method.

### Unresolved
- **[Check at the start of the build]** How to specify the model in `typesafe-sdk`, and the required Python version. The quality of Jev's judgements in Japanese and English. The DotGothic16 package.
