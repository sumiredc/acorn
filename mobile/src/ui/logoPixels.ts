// Acorn logo as pixel art. One character per pixel; '.' is transparent.
// scripts/make-icons.py reads this file to draw the app icons, so keep the format.
export const LOGO_PIXELS = [
  '.....KK.....',
  '....KSK.....',
  '..KKKKKKKK..',
  '.KCcCcCcCCK.',
  'KCcCcCcCcCCK',
  'KKKKKKKKKKKK',
  '.KBhBBBBBBK.',
  '.KBhBBBBBBK.',
  '.KBBBBBBBBK.',
  '..KBBBBBBK..',
  '...KBBBBK...',
  '....KKKK....',
];

export const LOGO_COLORS: Record<string, string> = {
  K: '#2b2620',
  S: '#5b3b1f',
  C: '#7a4a22',
  c: '#9a6436',
  B: '#c98a4b',
  h: '#ecc28c',
};
