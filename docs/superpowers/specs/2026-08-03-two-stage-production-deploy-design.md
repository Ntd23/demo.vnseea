# Two-Stage Production Deploy Design

## Goal

Deploy every `main` commit to `v2.vnseea.vn` first, promote the same source to
`vnseea.vn` only after strict smoke tests pass, and preserve each domain's
runtime configuration.

## Architecture

GitHub Actions keeps one concurrency lock and one SSH session. The v2 checkout
is the release source of truth. It is reset to the triggering commit, built with
the v2 environment, restarted, and smoke-tested. Only then is a clean archive of
that exact commit synchronized into `/home/vnseea/main`, excluding server-local
configuration and mutable data. The primary Nuxt client is built again with its
own environment and restarted under its own PM2 process names.

The existing mobile Socket.IO process on port `3016` remains shared. Neither
deployment stage starts a second process on that port.

## Protected Runtime Data

Promotion must preserve at least:

- `config.php`
- `client/.env` and other environment files
- `nodejs/config.json`
- `upload/`, `cache/`, and runtime logs
- `client/.output`, `.nuxt`, and dependency directories until the target build
  replaces them

Nuxt output is never copied from v2 because public domain values are resolved at
build time.

## Failure Behavior

- A failed v2 checkout, install, build, restart, or smoke test stops promotion.
- A failed primary build restores its previous `.output` and restarts the old
  process.
- Smoke tests cover Nuxt, PHP API, and Socket.IO v4 for each domain.
- Nginx is not reloaded because this workflow does not deploy Nginx config.

## Verification

A source-contract test validates stage ordering, strict smoke tests, protected
paths, separate PM2 names, and the absence of mobile socket restarts. Shell and
YAML syntax are checked locally before the workflow is committed.
