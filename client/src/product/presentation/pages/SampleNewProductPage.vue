<!-- English description: Renders a minimal product editor integration sample. -->
<template>
  <section class="space-y-4">
    <header>
      <p class="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
        Product Context Sample
      </p>
      <h1 class="text-3xl font-black text-[var(--text-primary)]">
        New Product Page
      </h1>
      <p class="text-sm text-[var(--text-secondary)]">
        Sample page under `src/product/presentation/pages`. Route file should only wrap this page.
      </p>
    </header>

    <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-5">
      <p class="text-sm text-[var(--text-secondary)]">
        Completion: {{ completionCount }}/7
      </p>
      <p class="mt-2 text-sm text-[var(--text-secondary)]">
        Status: {{ status }}
      </p>
      <p class="mt-2 text-sm text-[var(--text-secondary)]">
        Valid: {{ validation.valid ? "yes" : "no" }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useProductEditor } from "../../application/composables/useProductEditor"
import { createEmptyProductDraft } from "../../application/use-cases/create-product-draft"

const { completionCount, status, validation } = useProductEditor(
  "sample:product-editor",
  createEmptyProductDraft(),
)
</script>
