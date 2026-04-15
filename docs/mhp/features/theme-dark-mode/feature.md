# Feature: Theme (light / dark)

## Purpose

Let signed-in users switch between the default light Material 3 / Stitch palette and a night palette with sufficient contrast, without affecting drag-and-drop behavior.

## Flows

1. User opens any screen wrapped by `AtelierAppShell`.
2. User taps the theme control in the top header (moon in light mode, sun in dark mode).
3. The `dark` class is toggled on `document.documentElement`; preference is stored in `localStorage` under `goodbye-bad-habits.theme`.
4. A blocking script in the root layout reads the same key before paint to limit flash of the wrong theme.

## Business rules

- Default when no stored value: light theme.
- Stored values are only `light` or `dark` (invalid entries are ignored by the bootstrap script; the toggle always writes valid values).

## Dependencies

- Tailwind CSS v4 class-based `dark` variant (`tailwind.config.js` + `@custom-variant` in `globals.css`).
- Design tokens: light values from Google Stitch export (`docs/design/stitch-telas-kanban/design-tokens.json`); dark values are app-maintained CSS variables on `html.dark` aligned to the same roles (surface hierarchy, primary, on-surface).

## Maintenance

Update this file when theme persistence keys, entry points, or contrast targets change.
