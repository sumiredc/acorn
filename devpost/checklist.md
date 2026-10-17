---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [ ] **1. API サーバーに聞くと、Jev が日本語のミッションと報酬を判定して pt を返す**
  Becomes usable: `docker compose up` で API サーバーが起動する。`/judge/missions` と `/judge/reward` に実際の日本語の名前を送ると、実際の Jev の判定（確率分布つき）と換算した pt が返ってくる。
  Why now: いちばん大きな不確定要素（SDK でのモデルの指定方法、Jev の日本語での判定の質、レスポンスの形）を、画面を作る前に確かめるため。核心である「AI が値付けする」部分そのものでもある。ここが崩れると、後のすべてが変わる。
  PRD ref: `prd.md > ミッションとその pt`, `prd.md > 報酬とその価格（ショップ）`
  Spec ref: `spec.md > API Server`, `spec.md > Pricing Rules`, `spec.md > Judgement Keys`, `spec.md > Testability`, `spec.md > Static Analysis and CI`, `spec.md > External Services and Dependencies`
  Build: uv で `api/` を作り、FastAPI・`typesafe-sdk`・pytest を入れる。`pricing.py`（区分 → pt）、`jev.py`（`jev-1.13.0` で Score / Choice を呼ぶ）、`schemas.py`、`main.py`（`/health`・`/judge/missions`・`/judge/reward`、CORS、失敗時は 502 `jev_failed`）を書く。答えは `Judgement Keys` にそろえる。Jev は依存性注入で差し替えられるようにする。ruff・mypy の設定、`Dockerfile`、`compose.yaml`、`.env.example`、`.github/workflows/ci.yml`（api ジョブ）を置く。
  Verify (mechanical): `uv run ruff format --check .`・`uv run ruff check .`・`uv run mypy src`・`uv run pytest`（換算のテストと、偽の Jev を入れた窓口のテスト）がすべて通る。`docker compose up --build` のあと、`curl` で `/health` が 200 を返す。日本語と英語のミッション 3 件ずつと、報酬 2 件ずつ（値段のあるもの・値段のつけにくいもの）を送り、妥当な段階・区分と pt が返ることを確かめる。push して、self-hosted runner の CI（api ジョブ）が緑になることを確かめる。
  Learner check: 用意した `curl` のコマンドに、自分で考えたミッション名と報酬名（日本語・英語）を入れて実行する。返ってきた難しさや価格帯が、自分の感覚と合っているかを見る。
  Commit: `Add Jev-backed judge API for missions and rewards`

- [ ] **2. 予算とミッションを登録すると、Jev の採点がステータス画面に出る**
  Becomes usable: ブラウザで Acorn を開くと、準備フロー（予算 → ミッション → 採点）が出る。デイリー最大 3 件・ウィークリー最大 1 件を登録して採点すると、各ミッションの pt と確率分布が RPG 風のステータス画面に表示される。リロードしても残る。失敗したらエラーと再試行が出る。表示は英語・日本語で、端末の設定に従い、アプリ内でも切り替えられる。
  Why now: 核心（AI の採点）を画面で見られる最初の一歩。見た目の方向もここで決まるので、早めに触ってもらって、残りの作り方に反映させる。多言語は、あとから入れるとすべての画面を作り直すことになるため、画面の土台と同時に入れる。
  PRD ref: `prd.md > The Core Journey`（1, 3, 4）, `prd.md > 予算`, `prd.md > ミッションとその pt`, `prd.md > States and Boundaries`, `prd.md > Look and Feel`, `prd.md > 言語`
  Spec ref: `spec.md > Stack`, `spec.md > Store（保存とルールの入口）`, `spec.md > Store の更新（reducer）`, `spec.md > I18n`, `spec.md > Testability`, `spec.md > Static Analysis and CI`, `spec.md > Domain（ゲームのルール、純粋な関数）`, `spec.md > API Client`, `spec.md > Screens`, `spec.md > UI Parts`, `spec.md > Look and Feel`, `spec.md > Data Model`
  Build: `mobile/` に Expo SDK 57（Expo Router、TypeScript）を作り、AsyncStorage・DotGothic16・expo-localization・jest-expo・Prettier・ESLint を入れる。`theme.ts`・`Window`・`StatusDistribution`、`clock.ts`・`week.ts`（件数チェック）・`setup.ts`、`reducer.ts`・`store.ts`（`acorn:v1`）、`i18n/`（en・ja・言語の決定と切り替え）、`api/client.ts`、`setup.tsx`（予算・ミッション・採点・エラーと再試行）を書く。`index.tsx` は採点済みのミッションと pt を並べるだけの最小の形にし、言語の切り替えを置く。CI に mobile ジョブを足す。
  Verify (mechanical): `npx prettier --check .`・`npx expo lint`・`npx tsc --noEmit`・`npx jest`（件数チェック、準備フローの次のステップ、reducer の予算・ミッション・採点結果の反映・採点失敗、言語の決定、API Client の成功と失敗）が通る。`npx expo export -p web` が成功する。API サーバーと `npx expo start --web` を起動し、`curl` でページが 200 を返すことを確かめる。push して、CI の api と mobile のジョブが緑になることを確かめる。
  Learner check: ブラウザ（モバイル表示）で http://localhost:8081 を開き、予算と自分のミッションを入れて採点する。ステータス画面の見た目と、Jev の判定が「Acorn らしい」かを見る。言語を切り替えてみて、感想を伝える。API サーバーを止めて、エラーと再試行が出ることも見る。
  Commit: `Add setup flow with Jev mission scoring status screen`

- [ ] **3. ホームでミッションをクリアして pt が貯まり、日を進められる**
  Becomes usable: ホームに残高、月〜日のタイムライン、今週のミッションが並ぶ。クリアすると pt が残高に加わり、30 分以内なら取り消せる（残高が足りないときは取り消せない）。「日を進める」で次の日になり、デイリーがまたクリアできる。
  Why now: 稼ぐ側のループが閉じる。毎日のループが見えて、デモの前半が成り立つ。
  PRD ref: `prd.md > ホームのタイムライン`, `prd.md > クリアと取り消し`, `prd.md > デモ用の時間操作`
  Spec ref: `spec.md > Domain（ゲームのルール、純粋な関数）`, `spec.md > Screens`, `spec.md > UI Parts`, `spec.md > Data Model`
  Build: `clears.ts`・`balance.ts` と `clock.ts` の時間のずらしを書く。`index.tsx`（残高・タイムライン・クリア / 取り消し）、`Timeline`、`DemoClock`（「日を進める」）、`_layout.tsx` のナビとトーストを作る。
  Verify (mechanical): 静的解析（prettier・lint・tsc）と `npx jest`（デイリーは 1 日 1 回・ウィークリーは週 1 回、採点前はクリアできない、30 分の取り消し、残高不足では取り消せない、残高の計算、日を進めたあとの日付と取り消しの期限、タイムラインの表示データ）が通る。`npx expo export -p web` が成功する。CI が緑になる。
  Learner check: ホームでミッションをクリアし、取り消してみる。「日を進める」を何回か押して、タイムラインと残高の動きを見る。
  Commit: `Add home timeline with clears, undo, and day advance`

- [ ] **4. ショップで報酬を登録すると Jev が値付けし、pt で交換できる**
  Becomes usable: ショップで報酬名を入れると、Jev が価格（pt）と分布を出す。残高が足りれば交換でき、「交換済み」になる。足りなければ交換ボタンは押せない。準備フローの報酬ステップ（報酬が 0 件のとき、最大 5 件）も動く。
  Why now: 使う側のループを閉じて、核心の両輪（稼ぐ・使う）がそろう。登録 → 採点 → クリア → 交換、の 1 周がこれで成り立つ。
  PRD ref: `prd.md > 報酬とその価格（ショップ）`, `prd.md > The Core Journey`（2, 6）, `prd.md > States and Boundaries`（残高不足）
  Spec ref: `spec.md > Screens`, `spec.md > Domain（ゲームのルール、純粋な関数）`, `spec.md > Pricing Rules`, `spec.md > Important Failure Modes`
  Build: `shop.tsx`（一覧・価格・分布・交換・追加・最大 5 件、交換済みは数えない）、`setup.tsx` の報酬ステップ、保存直前の残高の再確認と「pt が たりない！」のトーストを作る。報酬の判定に失敗したときのエラーと再試行も付ける。
  Verify (mechanical): 静的解析と `npx jest`（交換できるかの判定、5 件の上限で交換済みを数えない、残高不足での交換の拒否、reducer の報酬の追加と交換、準備フローの報酬ステップ、区分名の辞書）が通る。`npx expo export -p web` が成功する。実際の API に `curl` で報酬を送り、アプリが受け取る形と一致することを確かめる。CI が緑になる。
  Learner check: 「ヘッドホン」のような値段のある報酬と、値段のつけにくい報酬を登録して、Jev の値付けが納得できるかを見る。1 つ交換してみる。
  Commit: `Add shop with Jev reward pricing and redemption`

- [ ] **5. 週を進めると週がリセットされ、ミッションを引き継いで採点し直せる**
  Becomes usable: 「週を進める」（または新しい週に初めて開いたとき）で週がリセットされ、準備フローが出る。先週のミッションを引き継げて、進捗は 0 から、Jev が採点し直す。残高はそのまま。
  Why now: 毎週の「為替」の動きと、デモ用の時間操作がそろい、PRD の 1 周（7 番目のステップ）が完成する。前の各スライスに依存するので最後に置く。
  PRD ref: `prd.md > 週のリセット`, `prd.md > デモ用の時間操作`, `prd.md > The Core Journey`（7）
  Spec ref: `spec.md > Domain（ゲームのルール、純粋な関数）`, `spec.md > Data Model`, `spec.md > Store（保存とルールの入口）`
  Build: `week.ts` の週の切り替え（`previousMissions` への移動）、起動時と時間操作のあとの判定、`setup.tsx` の引き継ぎの選択、`DemoClock` の「週を進める」を作る。
  Verify (mechanical): 静的解析と `npx jest`（月曜の境界、数週飛んだ場合、引き継いでも進捗はリセット、残高は残る、週を進める操作、起動時の週の判定）が通る。`npx expo export -p web` が成功する。CI が緑になる。
  Learner check: 「週を進める」を押して、ミッションを引き継ぎ、採点し直された pt を先週と比べる。残高が残っていることを確かめる。
  Commit: `Add weekly reset with mission carry-over and week advance`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — スライス 2 のあと（ステータス画面の見た目と、Jev の採点の感触）
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions
- 英語・日本語の多言語対応を追加（スライス 2 から辞書を通す）— 計画の承認時に、学習者が追加を決めた。
- 機械的な確認から Playwright（E2E）を外し、静的解析とユニットテストに置き換えた。ルールを reducer と domain の純粋な関数に寄せた — 学習者の判断：E2E は今は不要で、ユニットテストしやすい粒度に分ける。
- self-hosted runner の CI（formatter・linter・型検査・ユニットテスト）を追加し、スライスごとに push して緑を確かめる。runner は実装の前に aidd-infra が用意する（ARC の `arc-runner-acorn`。Node と uv はジョブ内で setup する。Docker は使えない）— 学習者の判断。
