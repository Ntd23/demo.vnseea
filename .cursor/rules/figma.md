---
description: Figma workflow guidance for frontend UI work
alwaysApply: false
---

# Figma workflow

Use this rule when translating or syncing UI from Figma into the Nuxt frontend.

## When to use
- Implementing or updating screens from a Figma design
- Matching spacing, typography, colors, states, and component structure to design specs
- Reviewing a page against a Figma mockup before shipping

## Guidance
- Prefer the shared UI system and existing bounded-context structure under `client/src/*`.
- Reuse existing components before introducing one-off styling.
- Keep route pages thin; place UI and state logic in the appropriate presentation/application layers.
- Match Figma tokens and variants to the nearest shared design tokens when possible.
- Verify responsive behavior, loading states, empty states, and interaction states against the design.
- If the design requires a new reusable component, implement it in the relevant bounded context rather than directly in a page.

## Good checks
- Layout and hierarchy match the design
- Text styles, spacing, and colors are consistent
- Buttons, inputs, badges, and cards follow existing shared patterns
- Mobile and desktop states are both covered
