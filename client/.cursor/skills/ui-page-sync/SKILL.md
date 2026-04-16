---
name: ui-page-sync
description: Keep Nuxt/Vue auth and page UIs aligned with the project design system, preserving responsive behavior and minimizing repeated rewrites. Use when updating or creating pages such as welcome, register, forgot-password, profile, or other Vue pages that must match an existing visual style.
---

# UI Page Sync

## Purpose

Use this skill when editing or creating pages so they match the project’s existing UI style instead of drifting into one-off layouts.

## Workflow

1. **Check page status first**
   - Read `client/doc/page_status.md` before starting a page sync task.
   - Do not redo pages that are already marked as done unless the user explicitly asks for a revisit.
   - If a page is marked `[~]`, inspect it before changing it again and only continue the unfinished parts.

2. **Choose the next page intentionally**
   - Prefer the next unchecked page in `page_status.md` unless the user names a specific target.
   - If several pages are possible, pick the one with the clearest reference implementation and least ambiguity.
   - For the `reels` flow, treat it as a distinct page and keep the short-video/full-screen pattern intact.

3. **Inspect the reference page first**
   - Prefer the closest existing page/component that already matches the desired style.
   - Compare spacing, typography, borders, shadows, colors, and button treatments.
   - Check `client/doc/design_system.md` when the UI pattern is unclear.

4. **Preserve the visual system**
   - Reuse the same heading scale, label style, input radius, button radius, and color tokens.
   - Keep panel widths and vertical rhythm consistent with nearby pages.
   - Align with the project’s existing auth/feed/message layouts instead of inventing a new visual language.

5. **Make it responsive by default**
   - Start mobile-first.
   - Ensure stacks collapse cleanly on small screens.
   - Use grid/flex breakpoints only where they improve readability.
   - Avoid fixed widths/heights that break scrolling on desktop or squeeze content on mobile.
   - Never introduce `overflow: hidden` or fixed viewport heights on long, content-heavy pages unless there is a strong reason.

6. **Prefer small structural changes**
   - Adjust class names and layout blocks before introducing new components.
   - Do not rewrite the whole page unless the structure is truly wrong.
   - Keep copy and form fields intact unless the user asked otherwise.
   - For a new page, match the nearest existing page before designing a new pattern.

7. **Validate after edits**
   - Check the edited Vue files for lint issues.
   - If the page is likely to overflow, verify that container height and scrolling still work.
   - Mark the page as done in `client/doc/page_status.md` only after the UI is actually complete.

## Style Rules

- Match the existing page’s typography hierarchy.
- Use consistent rounded corners for inputs, cards, and buttons.
- Keep primary actions visually dominant.
- Use subtle borders and soft shadows for form surfaces.
- Keep form labels readable and close to their fields.
- Keep spacing generous but compact enough to fit on shorter screens.

## Responsive Rules

- Single-column layout on mobile unless there is a strong reason not to.
- Use `sm:` / `md:` breakpoints to expand into multi-column layouts.
- Inputs and buttons should remain at least comfortable tap targets.
- Avoid layout lockups such as `height: 100svh` + `overflow: hidden` on content-heavy auth pages.

## Practical Editing Pattern

When updating a page:

1. Find the closest styled page or shared wrapper.
2. Copy its spacing, heading, and control styles.
3. Keep the existing data flow and field names when possible.
4. Re-check the page on mobile and desktop after the change.
5. Only make a second pass if the first pass leaves visible mismatch.

## Good Defaults

- Prefer shared layout wrappers already used by the auth pages.
- Keep buttons and inputs visually consistent across `welcome`, `register`, and `forgot-password`.
- If adding a new page, align it with the nearest existing page before inventing a new pattern.

## Avoid

- Creating a unique style for each new page.
- Changing field structure without user intent.
- Hard-coding sizes that prevent scrolling.
- Mixing multiple visual systems in the same flow.
- Repeating large rewrites when a class-level adjustment is enough.
