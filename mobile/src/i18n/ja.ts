import type { Dictionary } from './index';

export const ja: Dictionary = {
  'app.name': 'Acorn',
  'common.next': '次へ',

  'setup.title': 'はじめる準備',
  'setup.language.title': '言語',
  'setup.language.help': 'Acorn で使う言語を選んでください。',
  'setup.name.title': 'あなたの名前',
  'setup.name.help': 'ホーム画面のあいさつに使います。',
  'setup.name.placeholder': '例：たろう',
  'setup.budget.title': '月の予算',
  'setup.budget.help': '1 か月に自分へのごほうびに使える金額です。1pt ≒ $1。',
  'setup.budget.placeholder': '500',
  'setup.budget.invalid': '0 より大きい金額を入力してください。',
  'setup.missions.title': '今週のミッション',
  'setup.missions.help': 'デイリーは 3 件、ウィークリーは 1 件まで。合わせて 1 件以上。',
  'setup.missions.placeholder': '例：腕立て伏せ、5km 走る',
  'setup.missions.unit': '目標',
  'setup.missions.target': '目標の数',
  'setup.missions.add': '追加',
  'setup.missions.remove': '削除',
  'setup.missions.full': '{kind}ミッションはこれ以上追加できません。',
  'setup.missions.done': 'ポイントを決める',
  'setup.missions.sending': 'ポイントを決めています…',

  'kind.daily': 'デイリー',
  'kind.weekly': 'ウィークリー',
  'unit.none': 'なし',
  'unit.count': '回数',
  'unit.minutes': '時間',
  'goal.count': '{target}回',
  'goal.minutes': '{target}分',

  'home.title': 'ホーム',
  'home.greeting': '{name}さん、おかえりなさい！',
  'home.missions': '今週のミッション',
  'status.confidence': '確信度 {value}%',

  'error.jev_failed': 'ポイントを決められませんでした。もう一度お試しください。',
  'error.network': 'Acorn のサーバーに接続できません。もう一度お試しください。',

  level_0: 'とても簡単',
  level_1: '簡単',
  level_2: '普通',
  level_3: '難しい',
  level_4: 'とても難しい',
};
