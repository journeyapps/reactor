---
'@journeyapps/reactor-mod': minor
---

Unify required-field and nested-form checks under isValid(). Required text and selection fields reject blank values, required collections reject empty values, and hidden fields do not block validation. Preserve false and zero as supplied values.

Validate initial text values and validator updates, avoid invoking text validators on missing values, and validate supplied optional numbers against numeric bounds. Notify form consumers when visibility or nested validation changes.

Display plain muted, italic text instead of a button when no select options exist. Show Select a value when options are available but no value is selected.

Keep form.errors() consistent with visible nested validity, refresh validation after collection membership changes, synchronize existing keyed entries including falsy values, and display validation messages for collection rows.

Use a readable coral failure color in the Reactor theme for required-field messages and other error indicators.
