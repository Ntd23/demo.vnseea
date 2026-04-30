# Repo Rules

This repository contains:

- a PHP application at the repo root
- a Nuxt frontend in `client/`

## Scope

- Treat `client/` as the active frontend application.
- Treat the PHP app as the backend source of truth unless the user explicitly asks to change backend behavior.
- Keep frontend architecture and workflow rules in `client/AGENTS.md`.

## Frontend Hand-off

When a task touches anything under `client/`, read and follow:

- [client/AGENTS.md](client/AGENTS.md)

That file is the canonical rule set for frontend UI, UX, SEO, routing, API usage, and Nuxt structure in this project.
