// Updated colors to exactly match the reference image
export type FingerType = 
  | 'left-pinky' 
  | 'left-ring' 
  | 'left-middle' 
  | 'left-index' 
  | 'right-index' 
  | 'right-middle' 
  | 'right-ring' 
  | 'right-pinky' 
  | 'thumb';

export interface KeyConfig {
  code: string;
  label: string;
  finger: FingerType;
  width?: string;
  color: string;
}

export const FINGER_COLORS: Record<FingerType, string> = {
  'left-pinky':   '#5cb85c',
  'left-ring':    '#d9534f',
  'left-middle':  '#f0ad4e',
  'left-index':   '#5bc0de',
  'right-index':  '#5bc0de',
  'right-middle': '#e91e8c',
  'right-ring':   '#9b59b6',
  'right-pinky':  '#428bca',
  'thumb':        '#9b59b6',
};

// Key display colors — neutral gray palette
const KEY = '#d2d2ce'; // regular key
const MOD = '#888884'; // modifier / special key

export const KEYBOARD_ROWS: KeyConfig[][] = [
  // Row 1 - Number row
  [
    { code: 'Backquote',  label: '~',  finger: 'left-pinky',  color: KEY },
    { code: 'Digit1',    label: '1',  finger: 'left-pinky',  color: KEY },
    { code: 'Digit2',    label: '2',  finger: 'left-ring',   color: KEY },
    { code: 'Digit3',    label: '3',  finger: 'left-middle', color: KEY },
    { code: 'Digit4',    label: '4',  finger: 'left-index',  color: KEY },
    { code: 'Digit5',    label: '5',  finger: 'left-index',  color: KEY },
    { code: 'Digit6',    label: '6',  finger: 'right-index', color: KEY },
    { code: 'Digit7',    label: '7',  finger: 'right-index', color: KEY },
    { code: 'Digit8',    label: '8',  finger: 'right-middle',color: KEY },
    { code: 'Digit9',    label: '9',  finger: 'right-ring',  color: KEY },
    { code: 'Digit0',    label: '0',  finger: 'right-pinky', color: KEY },
    { code: 'Minus',     label: '-',  finger: 'right-pinky', color: KEY },
    { code: 'Equal',     label: '=',  finger: 'right-pinky', color: KEY },
    { code: 'Backspace', label: '←',  finger: 'right-pinky', color: MOD, width: '90px' },
  ],
  // Row 2 - QWERTY
  [
    { code: 'Tab',          label: 'Tab', finger: 'left-pinky',  color: MOD, width: '75px' },
    { code: 'KeyQ',         label: 'q',   finger: 'left-pinky',  color: KEY },
    { code: 'KeyW',         label: 'w',   finger: 'left-ring',   color: KEY },
    { code: 'KeyE',         label: 'e',   finger: 'left-middle', color: KEY },
    { code: 'KeyR',         label: 'r',   finger: 'left-index',  color: KEY },
    { code: 'KeyT',         label: 't',   finger: 'left-index',  color: KEY },
    { code: 'KeyY',         label: 'y',   finger: 'right-index', color: KEY },
    { code: 'KeyU',         label: 'u',   finger: 'right-index', color: KEY },
    { code: 'KeyI',         label: 'i',   finger: 'right-middle',color: KEY },
    { code: 'KeyO',         label: 'o',   finger: 'right-ring',  color: KEY },
    { code: 'KeyP',         label: 'p',   finger: 'right-pinky', color: KEY },
    { code: 'BracketLeft',  label: '[',   finger: 'right-pinky', color: KEY },
    { code: 'BracketRight', label: ']',   finger: 'right-pinky', color: KEY },
    { code: 'Backslash',    label: '\\',  finger: 'right-pinky', color: MOD, width: '65px' },
  ],
  // Row 3 - Home Row
  [
    { code: 'CapsLock', label: 'Caps',  finger: 'left-pinky',  color: MOD, width: '85px' },
    { code: 'KeyA',     label: 'a',     finger: 'left-pinky',  color: KEY },
    { code: 'KeyS',     label: 's',     finger: 'left-ring',   color: KEY },
    { code: 'KeyD',     label: 'd',     finger: 'left-middle', color: KEY },
    { code: 'KeyF',     label: 'f',     finger: 'left-index',  color: KEY },
    { code: 'KeyG',     label: 'g',     finger: 'left-index',  color: KEY },
    { code: 'KeyH',     label: 'h',     finger: 'right-index', color: KEY },
    { code: 'KeyJ',     label: 'j',     finger: 'right-index', color: KEY },
    { code: 'KeyK',     label: 'k',     finger: 'right-middle',color: KEY },
    { code: 'KeyL',     label: 'l',     finger: 'right-ring',  color: KEY },
    { code: 'Semicolon',label: ';',     finger: 'right-pinky', color: KEY },
    { code: 'Quote',    label: "'",     finger: 'right-pinky', color: KEY },
    { code: 'Enter',    label: 'Enter', finger: 'right-pinky', color: MOD, width: '100px' },
  ],
  // Row 4 - Bottom row
  [
    { code: 'ShiftLeft',  label: 'Shift', finger: 'left-pinky',  color: MOD, width: '115px' },
    { code: 'KeyZ',       label: 'z',     finger: 'left-pinky',  color: KEY },
    { code: 'KeyX',       label: 'x',     finger: 'left-ring',   color: KEY },
    { code: 'KeyC',       label: 'c',     finger: 'left-middle', color: KEY },
    { code: 'KeyV',       label: 'v',     finger: 'left-index',  color: KEY },
    { code: 'KeyB',       label: 'b',     finger: 'left-index',  color: KEY },
    { code: 'KeyN',       label: 'n',     finger: 'right-index', color: KEY },
    { code: 'KeyM',       label: 'm',     finger: 'right-index', color: KEY },
    { code: 'Comma',      label: ',',     finger: 'right-middle',color: KEY },
    { code: 'Period',     label: '.',     finger: 'right-ring',  color: KEY },
    { code: 'Slash',      label: '/',     finger: 'right-pinky', color: KEY },
    { code: 'ShiftRight', label: 'Shift', finger: 'right-pinky', color: MOD, width: '115px' },
  ],
  // Row 5 - Space row
  [
    { code: 'ControlLeft',  label: 'Ctrl',  finger: 'left-pinky',  color: MOD, width: '65px' },
    { code: 'MetaLeft',     label: 'Win',   finger: 'left-pinky',  color: MOD, width: '55px' },
    { code: 'AltLeft',      label: 'Alt',   finger: 'left-pinky',  color: MOD, width: '55px' },
    { code: 'Space',        label: 'Space', finger: 'thumb',       color: MOD, width: '290px' },
    { code: 'AltRight',     label: 'Alt',   finger: 'right-pinky', color: MOD, width: '55px' },
    { code: 'Fn',           label: 'Fn',    finger: 'right-pinky', color: MOD, width: '50px' },
    { code: 'ContextMenu',  label: 'Menu',  finger: 'right-pinky', color: MOD, width: '55px' },
    { code: 'ControlRight', label: 'Ctrl',  finger: 'right-pinky', color: MOD, width: '65px' },
  ],
];

export const getFingerForKey = (char: string): FingerType => {
  const c = char.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    const key = row.find(k => k.label.toLowerCase() === c || k.code.toLowerCase() === c || (k.code === 'Space' && c === ' '));
    if (key) return key.finger;
  }
  if (char === ' ') return 'thumb';
  return 'right-pinky'; // Fallback
};
