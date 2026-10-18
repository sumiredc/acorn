---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. API サーバーに聞くと、Jev が日本語のミッションと報酬を判定して pt を返す**
  Becomes usable: `docker compose up` で API サーバーが起動する。`/judge/missions` と `/judge/reward` に実際の日本語の名前を送ると、実際の Jev の判定（確率分布つき）と換算した pt が返ってくる。
  Why now: いちばん大きな不確定要素（SDK でのモデルの指定方法、Jev の日本語での判定の質、レスポンスの形）を、画面を作る前に確かめるため。核心である「AI が値付けする」部分そのものでもある。ここが崩れると、後のすべてが変わる。
  PRD ref: `prd.md > ミッションとその pt`, `prd.md > 報酬とその価格（ショップ）`
  Spec ref: `spec.md > API Server`, `spec.md > Pricing Rules`, `spec.md > Judgement Keys`, `spec.md > Testability`, `spec.md > Static Analysis and CI`, `spec.md > External Services and Dependencies`
  Build: uv で `api/` を作り、FastAPI・`typesafe-sdk`・pytest を入れる。`pricing.py`（区分 → pt）、`jev.py`（`jev-1.13.0` で Score / Choice を呼ぶ）、`schemas.py`、`main.py`（`/health`・`/judge/missions`・`/judge/reward`、CORS、失敗時は 502 `jev_failed`）を書く。答えは `Judgement Keys` にそろえる。Jev は依存性注入で差し替えられるようにする。ruff・mypy の設定、`Dockerfile`、`compose.yaml`、`.env.example`、`.github/workflows/ci.yml`（api ジョブ）を置く。
  Verify (mechanical): `uv run ruff format --check .`・`uv run ruff check .`・`uv run mypy src`・`uv run pytest`（換算のテストと、偽の Jev を入れた窓口のテスト）がすべて通る。`docker compose up --build` のあと、`curl` で `/health` が 200 を返す。日本語と英語のミッション 3 件ずつと、報酬 2 件ずつ（値段のあるもの・値段のつけにくいもの）を送り、妥当な段階・区分と pt が返ることを確かめる。push して、self-hosted runner の CI（api ジョブ）が緑になることを確かめる。
  Learner check: 用意した `curl` のコマンドに、自分で考えたミッション名と報酬名（日本語・英語）を入れて実行する。返ってきた難しさや価格帯が、自分の感覚と合っているかを見る。
  Commit: `Add Jev-backed judge API for missions and rewards`

- [x] **2. 予算とミッションを登録すると、Jev の採点がステータス画面に出る**
  Becomes usable: ブラウザで Acorn を開くと、準備フロー（予算 → ミッション → 採点）が出る。デイリー最大 3 件・ウィークリー最大 1 件を登録して採点すると、各ミッションの pt と確率分布が RPG 風のステータス画面に表示される。リロードしても残る。失敗したらエラーと再試行が出る。表示は英語・日本語で、端末の設定に従い、アプリ内でも切り替えられる。
  Why now: 核心（AI の採点）を画面で見られる最初の一歩。見た目の方向もここで決まるので、早めに触ってもらって、残りの作り方に反映させる。多言語は、あとから入れるとすべての画面を作り直すことになるため、画面の土台と同時に入れる。
  PRD ref: `prd.md > The Core Journey`（1, 3, 4）, `prd.md > 予算`, `prd.md > ミッションとその pt`, `prd.md > States and Boundaries`, `prd.md > Look and Feel`, `prd.md > 言語`
  Spec ref: `spec.md > Stack`, `spec.md > Store（保存とルールの入口）`, `spec.md > Store の更新（reducer）`, `spec.md > I18n`, `spec.md > Testability`, `spec.md > Static Analysis and CI`, `spec.md > Domain（ゲームのルール、純粋な関数）`, `spec.md > API Client`, `spec.md > Screens`, `spec.md > UI Parts`, `spec.md > Look and Feel`, `spec.md > Data Model`
  Build: `mobile/` に Expo SDK 57（Expo Router、TypeScript）を作り、AsyncStorage・DotGothic16・expo-localization・jest-expo・Prettier・ESLint を入れる。`theme.ts`・`Window`・`StatusDistribution`、`clock.ts`・`week.ts`（件数チェック）・`setup.ts`、`reducer.ts`・`store.ts`（`acorn:v1`）、`i18n/`（en・ja・言語の決定と切り替え）、`api/client.ts`、`setup.tsx`（予算・ミッション・採点・エラーと再試行）を書く。`index.tsx` は採点済みのミッションと pt を並べるだけの最小の形にし、言語の切り替えを置く。CI に mobile ジョブを足す。
  Verify (mechanical): `npx prettier --check .`・`npx expo lint`・`npx tsc --noEmit`・`npx jest`（件数チェック、準備フローの次のステップ、reducer の予算・ミッション・採点結果の反映・採点失敗、言語の決定、API Client の成功と失敗）が通る。`npx expo export -p web` が成功する。API サーバーと `npx expo start --web` を起動し、`curl` でページが 200 を返すことを確かめる。push して、CI の api と mobile のジョブが緑になることを確かめる。
  Learner check: ブラウザ（モバイル表示）で http://localhost:8081 を開き、予算と自分のミッションを入れて採点する。ステータス画面の見た目と、Jev の判定が「Acorn らしい」かを見る。言語を切り替えてみて、感想を伝える。API サーバーを止めて、エラーと再試行が出ることも見る。
  Commit: `Add setup flow with Jev mission scoring status screen`

- [x] **3. ホームでミッションをクリアして pt が貯まり、日を進められる**
  Becomes usable: ホームに残高、月〜日のタイムライン、今週のミッションが並ぶ。クリアすると pt が残高に加わり、30 分以内なら取り消せる（残高が足りないときは取り消せない）。「日を進める」で次の日になり、デイリーがまたクリアできる。
  Why now: 稼ぐ側のループが閉じる。毎日のループが見えて、デモの前半が成り立つ。
  PRD ref: `prd.md > ホームのタイムライン`, `prd.md > クリアと取り消し`, `prd.md > デモ用の時間操作`
  Spec ref: `spec.md > Domain（ゲームのルール、純粋な関数）`, `spec.md > Screens`, `spec.md > UI Parts`, `spec.md > Data Model`
  Build: 回数・時間のミッションの進み具合の記録（目標に届いたらクリア）、`clears.ts`・`balance.ts` と `clock.ts` の時間のずらしを書く。`index.tsx`（残高・タイムライン・クリア / 取り消し）、`Timeline`、`DemoClock`（「日を進める」）、`_layout.tsx` のナビとトーストを作る。
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
- Expo を SDK 57 から 58（React Native 0.88、React 19.3）に変更 — `create-expo-app` の最新テンプレートが SDK 58 だった。学習者が選んだ Expo / React Native はそのまま。
- 画面のファイルを `mobile/app/` ではなく `mobile/src/app/` に置き、Store は JSX を含むため `store.tsx` にした — SDK 58 のテンプレートと Expo Router の慣例に合わせた。spec の File Structure の `mobile/app/...` は `mobile/src/app/...` と読み替える。
- `compose.yaml` の CORS の許可元を `ACORN_CORS_ORIGINS` で上書きできるようにした — この Mac では 8081 番が別のプロジェクトの開発サーバーに使われていたため、8082 番でも動かせるようにした。
- スライス 2 のあとの確認で、学習者が次を決めた：日本語はひらがな表記をやめて普通の漢字かな交じりに。画面に「Jev」の名前を出さず「ポイントを決める」と言う。言語はアプリ内で切り替えず、最初の画面で選ぶ（端末の言語が初期値）。採点は別の画面に移らず、ボタンが送信中になり、失敗はトーストで出す（週の状態から「採点中」をなくした）。最初に名前を入れ、ホームであいさつする。🌰 の絵文字をやめ、ドット絵のどんぐりのロゴとアプリのアイコンを作る。prd.md と spec.md を合わせて更新した。
- 同じ確認で、選ぶ操作（言語、デイリー / ウィークリー、単位）を「▶」付きのボタンから、選択肢の並び（Choice）に変えた。「▶」は前に進む操作（横幅いっぱいのボタン）だけに付ける。主な操作は窓の外に置く — 学習者の指摘：進むボタンかどうか分かりづらい。
- ミッションに目標の単位（なし・回数・時間）を追加した。API の `/judge/missions` も unit と target を受け取り、Jev に目標を渡す。進み具合とクリアはスライス 3 で作る — 学習者が追加を決めた。単位を増やすと複雑になるため 3 種類に絞り、距離などは名前に含める。
- 同じ確認で：名前と予算の説明文（あいさつに使う、1pt ≒ $1）を削った。単位の「なし」は「目標なし」に見えるため「進捗率」に変え（目標は 100%）、見出しを「記録のしかた」にした。件数の説明文をやめて空きスロット（デイリー 3、ウィークリー 1）で見せ、登録はモーダルで確定する形にした — 学習者の指摘：追加を押さずに次へ進んでしまいそう。
- スライス 3 の実装中に、学習者が進み具合の入れ方を決めた：ボタン・バー・数値を入力中に切り替えられる。刻みは進捗率 10%、回数・時間は目標 ≤20 → 1、≤50 → 5、それ以上 → 10。すべての記録のしかたに「すべて完了」を置く。誤タップでクリアにならないよう、入力は記録の窓で下書きして「記録」で確定する形にした（AI の判断）。取り消すと進み具合はクリア直前の値に戻すため、`Clear` に `progressBefore` を、`Week` に `progress` を足した。prd.md と spec.md を合わせて更新した。
- 「日を進める」はスライス 4 でナビを作るまで、ホームの下に置いた（spec では `_layout.tsx`）。週の切り替えはスライス 5 なので、それまでは日曜から「日を進める」と今週のタイムラインから今日が外れる。
- スライス 3 のあとの確認で、学習者が次を決めた：記録の窓の入れ方の切り替えは、上の大きな選択肢から、下の小さなアイコンに変えた。窓の中の読み取り専用のバーは外し、数値入力は中央寄せ。「すべて完了」はアイコンにし、押すと値が目標になるだけで、保存は「記録」で行う。ホームのミッションから難しさの分布と「[デイリー]」の文字を外し、アイコンで示す。期限までの残り時間（1 時間未満は分、それ以上は時間）を小さく出す。タイムラインはデイリーのクリア数だけを GitHub の草のような濃さで示し、ウィークリーの★は外した。prd.md と spec.md を合わせて更新した。
- 続く確認で、学習者が次を決めた：記録の窓のボタン・バー・数値入力を同じ高さにし（切り替えても配置が動かない）、「すべて完了」を入力欄の右に移した。ホームから残高を外した（「残高」という言葉も避ける。ショップでの見せ方はスライス 4 で決める）。タイムラインは色の濃さをやめ、デイリーの数のピースに分けたドット絵のパズルを埋める形にした。prd.md と spec.md を合わせて更新した。
- 続く確認で：取り消せなくなった時点で取り消しボタンを消すようにした（学習者の指摘で、ボタンが 30 分を過ぎても残ることがわかった）。原因は React Compiler（`app.json` の `reactCompiler`）で、描画の中で現在時刻を読んでも描画結果が使い回されていた。ホームは現在時刻を state で持ち、1 分ごとと取り消しの期限ちょうどに更新する。パズルの境界線は外した。残高はショップ（購入画面）でだけ見せる — 学習者の判断。マイページは PoC の範囲外のため作らない。
