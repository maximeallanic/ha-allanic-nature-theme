# v0.3.0

## Fixes
- **Dedupe `label-badge-text-color`** — previously declared twice in both `allanic_nature_dark` and `allanic_nature_light` (TEXTE + BADGE sections). Kept the canonical declaration in the BADGE section.

## Features
- **Mushroom / HA RGB token overrides** — force every card relying on `rgb-teal`, `rgb-state-light-active`, `rgb-state-vacuum-cleaning`, `mush-rgb-teal/primary`, `rgb-primary-color`, `rgb-accent-color` to use the Allanic Nature palette (`#00B2C6` cyan / `#0D5D6D` dark teal) instead of the Material default `rgb(0, 150, 136)`.
- Light variant uses dark teal (`#0D5D6D`) for active states to preserve contrast on light backgrounds.
