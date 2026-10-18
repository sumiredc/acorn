---
doc: spec
status: approved
---

# Acorn — Technical Spec

## How This Works, In Plain Language

Acorn は 2 つの部品でできている。

- **アプリ（Expo / React Native）**：画面と、ゲームのルールのすべて。週の準備、クリア、取り消し、交換、週のリセット、デモ用の時間操作を受け持つ。データ（予算、報酬、ミッション、クリアの記録）はすべて端末の中（Web では localStorage）に保存する。同じコードが Web でもネイティブでも動くので、PoC はブラウザで見せて、そのままアプリに進める。
- **API サーバー（Python / FastAPI、Docker で起動）**：Jev に問い合わせて、その答えを pt に換算するだけの窓口。TypeSafe の API キーはこのサーバーだけが持ち、アプリには渡さない。データは保存しない。

流れの例：ミッション「腕立て 20 回」を登録して準備を終えると、アプリが API サーバーに「この 3 件を、予算 $500 で採点して」と送る。サーバーは Jev に「それぞれどれくらい難しいか」を 5 段階で聞き、一番確率の高い段階に倍率を掛けて pt を計算する。そして pt と確率分布をアプリに返す。アプリはそれを保存し、ステータス画面に表示する。

Jev は計算や正確な数値の見積もりが苦手（公式の jaggedness ページ）。そのため、Jev には**区分を選ばせる**だけにして、**計算はすべてコード**で行う。

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`

1. **初めて開く** → アプリが保存データを読む → 予算がない → 準備フローの予算ステップ → 入力した予算をアプリが保存する。
2. **報酬を登録する** → アプリが `POST /judge/reward`（報酬名 + 予算）を送る → サーバーが Jev に価格帯と期間を Choice で聞く → コードが pt を計算 → アプリが報酬（pt・分布つき）を保存し、ショップに表示する。
3. **今週のミッションを決める** → アプリの中だけで完結する（件数の制限チェック、先週分の引き継ぎ）。
4. **ポイントを決める**（ミッションの画面のボタン。送信中は押せない）→ アプリが `POST /judge/missions`（全ミッション + 予算）を送る → サーバーがミッションごとに Jev の Score の質問を 1 回のリクエストにまとめて聞く → 段階ごとの倍率で pt を計算 → アプリが保存し、週を「進行中」にする。失敗したら週は準備中のまま、トーストでエラーを出す。もう一度ボタンを押せば再試行になる。
5. **クリアする** → アプリがクリアの記録（日付・pt・時刻）を保存する → 残高は記録から計算し直す。30 分以内で、残高が足りれば取り消せる。
6. **交換する** → アプリが残高を確かめ、報酬を「交換済み」にする → 残高が減る。
7. **次の週** → 起動時や時間操作のあと、アプリが「今のアプリ時刻の月曜」と保存した週の月曜を比べる → 違えば新しい週を作り、準備フローへ戻る（残高はそのまま）。

## Stack

| 部品 | 選択 | 理由 |
|---|---|---|
| アプリ | **Expo SDK 58**（React Native 0.88、React 19.3）+ Expo Router、TypeScript | 学習者の判断：そのままネイティブアプリ開発につなげるため React Native を採用。Expo を使うと同じコードが Web でも動く（エージェントの提案に学習者が合意） |
| 保存 | `@react-native-async-storage/async-storage` | 学習者の判断：localStorage。AsyncStorage は Web では localStorage を使い、ネイティブでは端末内に保存する |
| API サーバー | **Python + uv + FastAPI** | 学習者の判断。TypeSafe 公式の Python SDK が使える |
| Jev の呼び出し | `typesafe-sdk`（Python）、`AsyncTypeSafeClient` | 学習者の判断：TypeSafe の API を直接呼ぶ |
| モデル | `jev-1.13.0`（固定） | 最新の安定版。`jev-latest` も現在はこれを指すが、勝手に変わらないようにバージョンを固定する |
| 実行 | Docker（API サーバー） | 学習者の判断 |
| 多言語 | `expo-localization`（端末の言語）+ 自前の型付き辞書（`src/i18n/`） | 学習者の判断：最初の画面で選ぶ（端末の言語が初期値）。辞書を型で縛り、英日でキーの漏れがあれば tsc で落とす |
| テスト | ユニットテストのみ。アプリ：Jest（`jest-expo`）+ tsc、API：pytest | 学習者の判断：E2E は今は不要。ユニットテストしやすい粒度に分ける（`Testability`） |
| 静的解析 | API：ruff（format + lint）、mypy。アプリ：Prettier、ESLint（`eslint-config-expo`）、tsc | 学習者の判断：formatter と linter を CI に入れる |
| CI | GitHub Actions、self-hosted runner（k8s 上の ARC、scale set `arc-runner-acorn`）。リポジトリは提出まで private | 学習者の判断。runner は aidd-infra が用意（sumiredc/aidd-infra#453） |

ドキュメント：
- Expo: https://docs.expo.dev/ / SDK 57: https://expo.dev/changelog/sdk-57
- Expo Router: https://docs.expo.dev/router/introduction/
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/
- FastAPI: https://fastapi.tiangolo.com/
- uv: https://docs.astral.sh/uv/
- TypeSafe Python SDK: https://docs.typesafe.ai/sdk/python
- TypeSafe API: https://docs.typesafe.ai/api / Models: https://docs.typesafe.ai/models
- Jev 1.13 jaggedness: https://docs.typesafe.ai/model-jaggedness/jev-1.13

**未確認のもの（ビルドの最初に確かめる）**
- `typesafe-sdk` でモデルを指定する引数の名前（Usage ページの「Choose a System One model」）と、最低限必要な Python のバージョン。
- Jev が日本語のミッション名や報酬名で、まともに判定できるか。
- 各ライブラリの正確なバージョン（`create-expo-app` と `uv add` の時点で固定する）。
- `@expo-google-fonts/dotgothic16` があるか（`Look and Feel`）。

## Where It Runs and How Someone Tries It

- 必要なもの：Docker、Node.js（Expo SDK 57 に対応するもの）、TypeSafe の API キー（https://docs.typesafe.ai の console で発行）。
- 起動：
  ```sh
  cp .env.example .env        # TYPESAFE_API_KEY を入れる（コミットしない）
  docker compose up --build   # API サーバー → http://localhost:8000
  cd mobile && npm install
  npx expo start --web        # アプリ → http://localhost:8081
  ```
- 8081 番が別のアプリに使われている場合：`ACORN_CORS_ORIGINS=http://localhost:8082 docker compose up -d` と `npx expo start --web --port 8082` で、別のポートで動かす。
- デモ収録：ブラウザの開発者ツールのモバイル表示（例：iPhone サイズ）で http://localhost:8081 を開いて録画する。
- 提出に必要なのは、短いデモ動画と公開 GitHub リポジトリ。デプロイは任意。
- 任意のデプロイ：他の人にも使ってもらう場合だけ、自宅サーバーの k8s に配置する（学習者の判断）。API キーをサーバー側に置く構成はそのまま使える。PoC では行わない。

## Look and Feel
`prd.md > Look and Feel` を実装できる形にしたもの。

- **雰囲気**：昔の RPG（初代ポケモン 赤・緑・青のような）。やわらかく可愛いが、可愛すぎない。特定のゲームの素材やキャラクターは使わない。
- **フォント**：日本語に対応したドット風フォント **DotGothic16**（Google Fonts、`@expo-google-fonts/dotgothic16`）を見出し、ボタン、数値に使う。長めの本文はシステムフォント。
- **色**（`mobile/src/ui/theme.ts` にトークンとして置く）：
  - 背景：クリーム `#f3efe2`、ウィンドウ：`#fffcf2`、文字と枠：こげ茶 `#2b2620`
  - どんぐり（主色・ボタン）：`#a5642e`、葉（クリア・成功）：`#4f8a5b`、空（Jev・確率）：`#3f6fa6`、ベリー（エラー）：`#b8435a`
  - 単色にはしない
- **ウィンドウ**：RPG のメッセージ窓のような、太い枠線（3px）と角丸（8px）の箱。画面の要素は基本的にこの窓に入れる。
- **ステータス画面**：Jev の判定は、上位 3 つの候補を「区分名・%・横棒」で並べ、選ばれたものを強調する。confidence を小さく添える。
- **ボタン**：押せるものの前に「▶」を付ける。押せない状態ははっきり薄くする。画面の主な操作（「次へ」「ポイントを決める」など）は窓の外に置き、横幅いっぱいにする。
- **文言**：短くゲームっぽく。日本語は普通の漢字かな交じり（例：「ミッションクリア！」「pt が足りません」）。画面に「Jev」の名前は出さない。
- **ロゴ**：12×12 のドット絵のどんぐり（`mobile/src/ui/logoPixels.ts`）。画面では `Logo.tsx` が View の格子で描き、アプリのアイコンは `mobile/scripts/make-icons.py` が同じデータから PNG にする。絵文字は使わない。
- **レイアウト**：モバイル幅（最大 430px 程度）。Web では中央に寄せる。

## Components

### Store（保存とルールの入口）
`mobile/src/storage/store.ts`。AsyncStorage の 1 つのキー（`acorn:v1`）に、全データを JSON で読み書きする。画面からは React のフック（`useAcorn()`）として使う。変更はすべて `src/domain/` の純粋な関数を通す。
PRD ref: `prd.md > States and Boundaries`（ずっと残るもの）

### Domain（ゲームのルール、純粋な関数）
`mobile/src/domain/`。画面にも保存にも依存しない、テストしやすい関数の集まり。
- `clock.ts`：アプリの現在時刻 = 実時刻 + `clockOffsetMs`。週の月曜（ローカル時刻）と日付キーを計算する。
  PRD ref: `prd.md > デモ用の時間操作`, `prd.md > 週のリセット`
- `week.ts`：週の切り替えの判定と新しい週の作成、ミッションの件数チェック（デイリー ≤3、ウィークリー ≤1、合計 ≥1）、先週分の引き継ぎ（進捗なし）。
  PRD ref: `prd.md > ミッションとその pt`, `prd.md > 週のリセット`
- `clears.ts`：クリアできるかの判定（採点済み、デイリーはその日に未クリア、ウィークリーはその週に未クリア）、クリア、取り消しの判定（30 分以内、かつ残高 ≥ その pt）。
  PRD ref: `prd.md > クリアと取り消し`
- `balance.ts`：残高 = クリアの記録の pt の合計 − 交換済みの報酬の pt の合計。交換できるかの判定。
  PRD ref: `prd.md > 報酬とその価格（ショップ）`
- `setup.ts`：準備フローの次のステップを決める（言語が未選択 → 言語、名前がない → 名前、予算がない → 予算、交換前の報酬が 0 件 → 報酬、週が準備中 → ミッション）。
  PRD ref: `prd.md > Screens and Layout`（週の準備フロー）, `prd.md > 予算`

### Store の更新（reducer）
`mobile/src/storage/reducer.ts`。`reduce(data, action, now) → data` という純粋な関数で、すべての変更（予算の設定、ミッションの登録、採点結果の反映、クリア、取り消し、交換、時間操作、週の切り替え、言語の変更）を表す。`store.ts` は読み込み、`reduce` の呼び出し、保存だけを行う。画面のロジックをユニットテストで確かめるため。
PRD ref: `prd.md > Features and Behavior` 全体

### I18n
`mobile/src/i18n/`。`en.ts` と `ja.ts` に同じ形の辞書を置き、`ja.ts` は `en.ts` の型に合わせる（キーが欠けると tsc が落ちる）。`t(key, params)` で引く。言語は `data.locale`（`"en" | "ja" | null`、null は未選択で、そのあいだは端末の設定で表示する）と `expo-localization` から決める。Jev の区分は、言語によらないキー（下の `Judgement Keys`）で受け取り、表示するときに辞書で区分名にする。
PRD ref: `prd.md > 言語`

### API Client
`mobile/src/api/client.ts`。API サーバーの 2 つの窓口を呼ぶ。接続先は `EXPO_PUBLIC_API_URL`（既定は `http://localhost:8000`）。`fetch` を引数で差し替えられるようにして、ユニットテストで確かめる。失敗したら、エラーの種類（`jev_failed` / `network`）を返し、画面は辞書で文言にする。

### Screens
Expo Router のファイル。
- `mobile/app/setup.tsx`：週の準備フロー。言語 → 名前 → 予算 → 報酬 → ミッション（引き継ぎのチェックボックス付き。「ポイントを決める」で送信中になり、失敗はトースト）。PRD ref: `prd.md > 予算`, `prd.md > ミッションとその pt`
- `mobile/app/index.tsx`：ホーム。残高、タイムライン、今週のミッションとクリア / 取り消しボタン。準備が終わっていなければ `setup` へ移る。PRD ref: `prd.md > ホームのタイムライン`, `prd.md > クリアと取り消し`
- `mobile/app/shop.tsx`：ショップ。報酬の一覧（価格・分布・交換 / 交換済み）と、報酬の追加（最大 5 件、交換済みは数えない）。PRD ref: `prd.md > 報酬とその価格（ショップ）`
- `mobile/app/_layout.tsx`：フォントの読み込み、ホームとショップの切り替え、画面下のデモ用の時間操作、トースト。

### UI Parts
`mobile/src/ui/`：`Window.tsx`（RPG の窓）、`StatusDistribution.tsx`（確率分布）、`Timeline.tsx`（月〜日）、`Toast.tsx`、`DemoClock.tsx`（「日を進める」「週を進める」）、`theme.ts`。

### API Server
`api/src/acorn_api/`
- `main.py`：FastAPI のアプリ。CORS で `http://localhost:8081` を許可する。窓口は `GET /health`、`POST /judge/missions`、`POST /judge/reward`。
- `jev.py`：`AsyncTypeSafeClient` で Jev を呼ぶ。テストで差し替えられるように、呼び出しを 1 つの関数にまとめる。
- `pricing.py`：区分を pt に換算する純粋な関数（`Pricing Rules` を参照）。
- `schemas.py`：リクエストとレスポンスの型（Pydantic）。
PRD ref: `prd.md > 報酬とその価格（ショップ）`, `prd.md > ミッションとその pt`

## Testability
学習者の判断：ユニットテストだけで、ルールを確かめられる粒度に分ける。E2E は今は作らない。
- **アプリ**：ルールは `domain/` と `storage/reducer.ts` の純粋な関数に置く。画面（`app/*.tsx`）は、データの表示と `dispatch` の呼び出しだけにする。時刻は `now` を引数で渡し、`Date.now()` を直接呼ばない。API Client は `fetch` を差し替えられる。辞書は型で確かめる。
- **API**：`pricing.py` は純粋な関数。`jev.py` は「質問を受けて答えを返す」関数の型（Protocol）を持ち、FastAPI の依存性注入で差し替える。窓口のテストでは、偽の Jev を入れて `TestClient` で確かめる。
- Jest と pytest はローカルでも CI でも同じコマンドで動かす。

## Static Analysis and CI
`.github/workflows/ci.yml`。push と pull request のたびに、`runs-on: arc-runner-acorn` で 2 つのジョブを走らせる。runner のイメージには Node も uv も入っていないため、各ジョブで用意する。Docker は使えない。pod はジョブごとに作り直されるので、キャッシュは setup 系の action に任せる。
- **api**（`api/` で実行）：`astral-sh/setup-uv`（キャッシュ有効、Python は `api/.python-version` の 3.12）→ `uv sync --frozen` → `uv run ruff format --check .` → `uv run ruff check .` → `uv run mypy src` → `uv run pytest`
- **mobile**（`mobile/` で実行）：`actions/setup-node`（node-version: 24、npm キャッシュ）→ `npm ci` → `npx prettier --check .` → `npx expo lint` → `npx tsc --noEmit` → `npx jest --ci`
- CI では API キーを使わない（テストは偽の Jev で動く）。
- runner は実装の前に用意する（学習者の判断）。aidd-infra が PR（sumiredc/aidd-infra#453）を出した。ユーザーがマージして適用すると使えるようになる。ARC では独自のラベルを付けられないため、scale set 名で指定する。

## Pricing Rules
`api/src/acorn_api/pricing.py` に実装し、pytest で確かめる。PRD ref: `prd.md > 報酬とその価格（ショップ）`, `prd.md > ミッションとその pt`, `prd.md > Product Decisions`。

### ミッションの pt（枠方式）
- Jev への質問：Score、5 段階 `["とても簡単", "簡単", "普通", "難しい", "とても難しい"]`。state = `{ "mission": 名前, "kind": "daily" | "weekly" }`。
- 使う段階：`probabilities` で**一番確率の高い段階**。期待値の `score` から数値を補間しない（jaggedness の注意）。
- 倍率：`[0.5, 0.75, 1, 1.5, 2]`
- 基準額（枠方式：件数に関係なく 1 件あたりの値が決まる）：
  - デイリー 1 件/日 = 予算 × 0.75 ÷ 3 ÷ 30
  - ウィークリー 1 件/週 = 予算 × 0.25 × 7 ÷ 30
- pt = max(1, round(基準額 × 倍率))
- 例（予算 $500、普通）：デイリー ≒ 4pt、ウィークリー ≒ 29pt。全枠を普通で埋め、1 か月すべてクリアすると約 $500。

### Judgement Keys
API サーバーは、Jev の答えを言語によらないキーにそろえて返す。アプリは辞書で区分名にする。
- ミッションの難しさ：`level_0`〜`level_4`（とても簡単〜とても難しい）
- 価格帯：`usd_10`, `usd_30`, `usd_100`, `usd_300`, `usd_1000`, `usd_3000`, `usd_10000`, `usd_30000`, `usd_100000`, `no_price`
- 期間：`d1`, `d3`, `w1`, `w2`, `m1`, `m3`, `m6`, `y1`
- Jev に送る区分の説明（criteria）は英語で書く。ミッション名や報酬名は、入力された言語のまま送る。

### 報酬の pt
1 回のリクエストで 2 つの Choice を聞く。state = `{ "reward": 名前 }`。
- **価格帯**：`~$10, ~$30, ~$100, ~$300, ~$1,000, ~$3,000, ~$10,000, ~$30,000, ~$100,000, 値段がつけにくい` → 値段のある区分は、その値がそのまま pt（1pt ≒ $1）。
- **期間**：`1日, 3日, 1週間, 2週間, 1か月, 3か月, 6か月, 1年` → 月数 `[1/30, 3/30, 7/30, 14/30, 1, 3, 6, 12]`。価格帯で「値段がつけにくい」が一番確率の高い答えだったときだけ使う。pt = round(月数 × 予算)。
- 表示する分布：使った方の質問の分布。
- Choice は最初の選択肢を選びがちという弱点があるため、「値段がつけにくい」は価格帯の最後に置く。

## Data Model
AsyncStorage のキー `acorn:v1` に、次の形の JSON を 1 つ保存する。

```ts
type AcornData = {
  version: 1;
  userName: string | null;           // ホームのあいさつに使う名前
  budgetUsd: number | null;          // 予算。未設定なら null
  clockOffsetMs: number;             // デモ用の時間操作で進めた分
  rewards: Reward[];
  week: Week | null;                 // 今週
  previousMissions: Mission[];       // 先週のミッション（引き継ぎ用）
  clears: Clear[];                   // 全期間のクリアの記録
  locale: "en" | "ja" | null;        // 表示言語。null は未選択（端末の設定で表示）
};
type Judgement = { choice: string; probabilities: Record<string, number>; confidence: number };
type Reward = { id: string; name: string; pt: number; mode: "price" | "period";
  judgement: Judgement; status: "available" | "redeemed"; createdAt: number; redeemedAt?: number };
type Mission = { id: string; name: string; kind: "daily" | "weekly";
  pt: number | null; judgement: Judgement | null };   // 採点前は null
type Week = { weekStart: string;     // 月曜の日付 "YYYY-MM-DD"
  status: "setup" | "active"; missions: Mission[] };
type Clear = { id: string; missionId: string; weekStart: string; date: string;
  pt: number; clearedAt: number };   // clearedAt はアプリ時刻
```

- **どこに置くか**：すべて端末の中。API サーバーは何も保存しない。
- **どう変わるか**：画面の操作 → `dispatch(action)` → `reducer.ts` が `domain/` の関数で新しいデータを作る → Store が保存する。
- **閉じて開き直したとき**：Store が読み込み、`week.ts` で週が変わったかを確かめる。変わっていれば新しい週（`status: "setup"`）を作り、今週のミッションを `previousMissions` に移す。
- **残高**は保存せず、`clears` と `rewards` から毎回計算する。取り消しや交換で数値がずれないようにするため。
- 取り消しの 30 分はアプリ時刻で数える。「日を進める」を押すと 30 分を過ぎるので、取り消しはできなくなる。

## File Structure

```
bwai/
├── mobile/                         # Expo アプリ（Web で動かして見せる）
│   ├── app/                        # Expo Router の画面
│   │   ├── _layout.tsx             # フォント、ナビ、デモ用の時間操作、トースト
│   │   ├── index.tsx               # ホーム（タイムライン・ミッション・クリア）
│   │   ├── shop.tsx                # ショップ（報酬・交換・追加）
│   │   └── setup.tsx               # 週の準備フロー
│   ├── src/
│   │   ├── domain/                 # ゲームのルール（純粋な関数）
│   │   │   ├── clock.ts
│   │   │   ├── week.ts
│   │   │   ├── clears.ts
│   │   │   ├── balance.ts
│   │   │   ├── setup.ts
│   │   │   └── __tests__/          # Jest のテスト
│   │   ├── storage/
│   │   │   ├── reducer.ts          # すべての変更を表す純粋な関数
│   │   │   ├── store.ts            # AsyncStorage + useAcorn()
│   │   │   └── __tests__/
│   │   ├── i18n/                   # en.ts, ja.ts（型付きの辞書）, index.ts（t と言語の決定）
│   │   ├── api/client.ts           # API サーバーを呼ぶ（fetch を差し替え可能）
│   │   └── ui/                     # Window, StatusDistribution, Timeline, Toast, DemoClock, theme
│   ├── app.json
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── package.json
│   └── .env.example                # EXPO_PUBLIC_API_URL=http://localhost:8000
├── api/                            # FastAPI（Jev の窓口）
│   ├── src/acorn_api/
│   │   ├── main.py
│   │   ├── jev.py
│   │   ├── pricing.py
│   │   └── schemas.py
│   ├── tests/
│   │   ├── test_pricing.py         # 換算のテスト
│   │   └── test_judge.py           # Jev を差し替えた窓口のテスト
│   ├── pyproject.toml              # ruff・mypy・pytest の設定もここ
│   ├── .python-version             # 3.12
│   ├── uv.lock
│   └── Dockerfile
├── .github/workflows/ci.yml        # self-hosted runner で静的解析とユニットテスト
├── compose.yaml                    # API サーバーを起動
├── .env.example                    # TYPESAFE_API_KEY=
├── .gitignore                      # .env と devpost/learner-profile.md を除外
├── README.md
└── devpost/                        # 計画の文書
```

## External Services and Dependencies

### TypeSafe API（Jev）
- 呼び出し：`POST https://api.typesafe.ai/v1/systemone`。ヘッダーは `Authorization: Bearer $TYPESAFE_API_KEY`。Python SDK `typesafe-sdk` の `system_one` 経由で呼ぶ。
- リクエスト：`{ model: "jev-1.13.0", state, questions: { <id>: { type: "score" | "choice", instructions, criteria } } }`
  - Score の `criteria` は低い順の配列（2〜10 段階）。Choice の `criteria` は `{ 選択肢: 説明 | null }`（最大 255 個）。
- レスポンス：`answers.<id>` が `{ type, probabilities: { 段階 or 選択肢: 確率 }, confidence, legend? (score), score? (score), choice? (choice) }`。トップレベルに `model` と `usage`。
- エラー：400 / 401 / 422 / 429 / 529。429 と 529 は SDK が自動で再試行する。
- 料金：入力 100 万トークンあたり $0.042、出力は無料。
- 制限：1 リクエスト 64k トークン、1 質問 32k トークン。
- ドキュメント：https://docs.typesafe.ai/api 、https://docs.typesafe.ai/primitives/score 、https://docs.typesafe.ai/primitives/choice

### API サーバーの窓口（アプリ ↔ API サーバー）
- `POST /judge/missions`
  - 送る：`{ budgetUsd: number, missions: [{ id, name, kind }] }`
  - 返す：`{ missions: [{ id, pt, judgement: { choice, probabilities, confidence } }] }`。`choice` と `probabilities` のキーは `Judgement Keys`。
- `POST /judge/reward`
  - 送る：`{ budgetUsd: number, name: string }`
  - 返す：`{ pt, mode: "price" | "period", judgement: { choice, probabilities, confidence } }`
- 失敗：Jev の呼び出しに失敗したら `502 { detail: "jev_failed" }`。文言はアプリの辞書で出す。

## Important Failure Modes
- **Jev の呼び出しの失敗、または API サーバーが起動していない** → ミッションや報酬の画面で、トーストでエラーを出す。ボタンをもう一度押せば再試行になる。週は準備中のままで、クリアできない（`prd.md > States and Boundaries`）。
- **Jev が日本語の名前を苦手としている**（未確認） → ビルドの最初に実際の名前で試す。判定がおかしければ、state に kind や短い英語の説明を添えるなど、質問の書き方を調整する。
- **残高不足での交換がすり抜けた**（二重タップなど） → 保存の直前にもう一度 `balance.ts` で確かめ、足りなければトースト「pt が たりない！」を出して何も変えない。

## What Was Simplified and Why
- **データはすべて端末の中**（サーバーの DB を使わない）。一人で使うので、アカウントも同期もいらない。本格的にするなら、DB と認証を足すことになる。
- **時間はアプリ時刻（実時刻 + ずらし）**。デモで日や週を進めるため。本番では、ずらしを 0 に固定すればよい。
- **週のリセットは起動時と時間操作の直後に判定する**。バックグラウンドの処理を持たない。
- **デプロイしない**。ローカルで動かして録画する。共有したくなったら自宅の k8s に置く。
- **通貨は $ だけ**（`prd.md > Deferred From the POC`）。

## Decisions and Open Issues

### 決まったこと
- 学習者：TypeScript + React Native。アプリ開発にそのままつなげるため。
- 学習者：API サーバーは Python + uv + FastAPI を Docker で起動する。最初は Go + Echo を挙げたが、公式 SDK が JS / Python だけだと知って Python に変えた。
- 学習者：TypeSafe の API を直接呼ぶ。
- 学習者：データは localStorage。AsyncStorage の Web 版として実現する。
- 学習者：共有するなら自宅の k8s。PoC ではデプロイしない。
- 学習者：報酬の価格帯と期間の区分は叩き台どおり。
- 学習者：ミッションの pt は枠方式。配分（デイリー 75% / ウィークリー 25%）と難しさの倍率（0.5 / 0.75 / 1 / 1.5 / 2）は、叩き台のままで承認した（spec のレビューで「ok」）。
- エージェントの提案に学習者が合意：Expo を使って Web で見せる。Jev には区分を選ばせ、計算はコードで行う。
- 実装の詳細（エージェントが導いたもの）：残高は保存せず計算する、アプリ時刻、`jev-1.13.0` に固定、一番確率の高い段階を使う、「値段がつけにくい」は最後に置く。

- 学習者（`5-build` の計画時に追加）：英語・日本語の多言語対応。端末の設定とアプリ内の切り替え。
- 学習者（`5-build` の計画時に追加）：formatter と linter を CI に入れる。テストはユニットテストだけで、E2E は今は不要。ユニットテストしやすい粒度に分ける。CI の環境は実装の前に用意する。リポジトリは提出まで private で、runner は self-hosted（aidd-infra に依頼）。

### 理解を深めた点
- **Jev に数値を直接出させない理由**：最初の案では「Jev が金額を見積もる」ことになっていた。公式の jaggedness に「計算機ではない」「score から数値を補間しない」とあったので、区分を選ばせてコードで換算する形に変えた。
- **「少ない週は稼ぎも少ない」の意味**：学習者からの質問。予算 $500 の例で、枠方式（デイリー 1 件だけなら月に約 125pt）と山分け方式（1 件でも約 500pt、件数を減らすと楽に稼げる抜け道がある）を比べ、学習者が枠方式を選んだ。

### 未解決
- **[ビルドの最初に確かめる]** `typesafe-sdk` でモデルを指定する方法と、必要な Python のバージョン。Jev の日本語と英語での判定の質。DotGothic16 のパッケージ。
