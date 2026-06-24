-- Adds a column to store the pre-conversion Unicode Devanagari text for
-- Kruti Dev tests, so the player can show a "what this should look like"
-- preview alongside the raw keystroke passage — matching the pattern
-- already used by the static Kruti Dev course lessons (displayHindi).

ALTER TABLE typing_test
  ADD COLUMN IF NOT EXISTS display_content TEXT;

COMMENT ON COLUMN typing_test.display_content IS
  'Pre-conversion Unicode Devanagari text, only set for keyboard_layout=kruti_dev rows — content holds the raw keystroke sequence to type, this holds what it should look like once typed into a Kruti Dev font.';
