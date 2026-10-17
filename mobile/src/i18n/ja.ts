import type { Dictionary } from './index';

export const ja: Dictionary = {
  'app.name': 'Acorn',
  'locale.switch': 'English',

  'setup.title': 'こんしゅうの じゅんび',
  'setup.budget.title': 'つきの よさん',
  'setup.budget.help': '1 か月に じぶんへの ごほうびに つかえる がくです。1pt ≒ $1。',
  'setup.budget.placeholder': '500',
  'setup.budget.invalid': '0 より おおきい がくを いれてください。',
  'setup.budget.next': 'つぎへ',
  'setup.missions.title': 'こんしゅうの ミッション',
  'setup.missions.help': 'デイリーは 3 けん、ウィークリーは 1 けんまで。あわせて 1 けん いじょう。',
  'setup.missions.placeholder': 'れい：うでたて 20 かい',
  'setup.missions.add': 'ついか',
  'setup.missions.remove': 'けす',
  'setup.missions.full': '{kind} ミッションは もう ついかできません。',
  'setup.missions.done': 'Jev に さいてんしてもらう',
  'setup.scoring.title': 'Jev が さいてんちゅう…',
  'setup.scoring.retry': 'もういちど',

  'kind.daily': 'デイリー',
  'kind.weekly': 'ウィークリー',

  'home.title': 'ホーム',
  'home.missions': 'こんしゅうの ミッション',
  'status.confidence': 'かくしんど {value}%',

  'error.jev_failed': 'Jev が はんていできませんでした。もういちど ためしてください。',
  'error.network': 'Acorn の サーバーに つながりません。もういちど ためしてください。',

  level_0: 'とても かんたん',
  level_1: 'かんたん',
  level_2: 'ふつう',
  level_3: 'むずかしい',
  level_4: 'とても むずかしい',
};
