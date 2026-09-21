# Hindi typing engine — side-by-side QA matrix

Run every case on **each** site below and record the result. Automated tests cover our own engine; the competitor
columns can only be filled in by a person with a real browser and keyboard.

Sites: **FastTypingLab (v1)**, **FastTypingLab (v2 beta)**, IndiaTyping (Inscript exam), TypingWale (Mangal Inscript),
10FastFingers (Hindi).

Legend: ✅ works · ⚠️ works with a problem (note it) · ❌ fails · — not applicable / not offered.

## Setup for each run
1. Note OS, browser and version, and the **active keyboard layout** (Windows: Win+Space; shows `HIN` = Hindi INSCRIPT or `ENG`).
2. Use a passage of ordinary Hindi text. Type it correctly and slowly. Any red/wrong mark on a correct key is a failure.

## Cases
| # | Case | How to test | FTL v1 | FTL v2 | IndiaTyping | TypingWale | 10FastFingers |
|---|------|-------------|:--:|:--:|:--:|:--:|:--:|
| 1 | Plain letters and matras | Type `कमल`, `किताब`, `मेला` correctly | | | | | |
| 2 | Ligature key | Type `क्ष` with the single ligature key (number-row Shift key on InScript) | | | | | |
| 3 | Same conjunct, key by key | Type `क` + `्` + `ष` | | | | | |
| 4 | Half-letter word | Type `स्पोर्ट`, `प्रतिक्रिया`, `श्रीमान्` | | | | | |
| 5 | Nukta letters | Type `ज़रूर`, `फ़ोन` (base + nukta key) | | | | | |
| 6 | Digits | Passage has `2026`; type it (Hindi layout number row types `२०२६`) | | | | | |
| 7 | Punctuation | `।` `,` `-` `"` `'` `₹` in the passage | | | | | |
| 8 | Line break in passage | Passage with a paragraph break: can you continue typing past it? | | | | | |
| 9 | Backspace | Full / within-word / disabled modes each behave as labelled | | | | | |
| 10 | Paste | Ctrl+V a copy of the passage: must be rejected | | | | | |
| 11 | Hindi phonetic IME | Microsoft Hindi Phonetic or Google Input Tools: type `namaste` → `नमस्ते` | | | | | |
| 12 | English layout, no Hindi keyboard | Keyboard set to ENG, type the INSCRIPT keys for `कमल` | | | | | |
| 13 | Android Gboard (Hindi) | Chrome on Android, Hindi keyboard, type a sentence incl. autocorrect suggestion | | | | | |
| 14 | iOS Hindi keyboard | Safari on iPhone, type a sentence | | | | | |

## Also record
- Does the displayed passage render conjuncts (`क्ष`, `त्रि`, `स्पो`) as intact glyphs while typing, or does colouring split them?
- How is a word with one wrong letter marked (whole word vs letter)?
- What are the final numbers for the same run: net WPM, accuracy, errors? (Compare the formula, not just the number.)

## Known baseline for FTL v1 (from code review; confirm in the matrix)
- Cases 2, 12: fixed in the first Mangal fix (ligature keys, English-layout mapping) — on the main test page only.
- Case 11, 13, 14: IME/phone keyboards are not supported by the key-event engine (IME shows a warning; mobile assumes append-only edits).
- Case 6: Devanagari digit vs ASCII digit accepted on the main test page since the first fix.
- Rendering: per-character spans on the Jungle, lesson, exam and results screens split conjuncts.

## Acceptance for the v2 engine
All 14 cases ✅ for FTL v2 on Chrome (Windows) and Chrome (Android), and no case where v2 is worse than any competitor.
