# Two-Stage Production Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate deployment to `vnseea.vn` on a successful v2 build and smoke test while preserving per-domain configuration.

**Architecture:** Add a tested server-side deployment script and reduce the GitHub Actions workflow to checkout/reset plus an invocation of that script. The script builds v2, performs strict health checks, promotes the same commit through a clean staging directory, rebuilds the primary domain, and rolls back Nuxt output on failure.

**Tech Stack:** GitHub Actions, Bash, Git, rsync, pnpm, PM2, Nginx, PHP contract tests.

## Global Constraints

- `v2.vnseea.vn` must pass Nuxt, API, and Socket.IO smoke tests before promotion.
- Preserve domain-specific `.env`, `config.php`, `nodejs/config.json`, uploads, caches, and logs.
- Build Nuxt separately for each domain.
- Keep exactly one mobile Socket.IO service on port `3016`.
- Do not deploy or modify the server while validating this patch locally.

---

### Task 1: Deployment Contract

**Files:**
- Create: `tests/deploy-production-workflow-contract.php`
- Modify: `.github/workflows/deploy-production.yml`
- Create: `scripts/deploy-production.sh`

**Interfaces:**
- Consumes: GitHub trigger SHA, v2 checkout, domain-local runtime files.
- Produces: a strict two-stage deployment with rollback and smoke checks.

- [x] **Step 1: Write the failing source-contract test**
- [x] **Step 2: Run the test and confirm it fails because two-stage deployment is absent**
- [x] **Step 3: Implement the deployment script and workflow invocation**
- [x] **Step 4: Run the contract test, Bash syntax check, YAML parse, and `git diff --check`**
- [x] **Step 5: Review the diff for protected runtime data and process-name isolation**
