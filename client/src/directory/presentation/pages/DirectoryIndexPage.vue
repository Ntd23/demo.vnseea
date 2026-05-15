<!-- English description: Backend-backed directory landing page aligned to the WoWonder directory phtml structure. -->
<template>
  <main class="mx-auto w-full max-w-6xl space-y-5 px-3 py-4 sm:px-5">
    <section class="surface-card p-4 sm:p-5">
      <div class="flex items-center gap-3">
        <span class="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface-active)] text-[var(--text-brand)]">
          <Icon name="i-ph-squares-four-duotone" class="h-6 w-6" />
        </span>
        <div>
          <p class="text-label-secondary">Directory</p>
          <h1 class="text-heading">{{ title || t("pages.directoryPage.heroTitle") }}</h1>
          <p class="text-body-secondary mt-1">{{ description }}</p>
        </div>
      </div>
    </section>

    <section v-if="pending" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="index in 9" :key="index" class="h-36 rounded-[var(--radius-xl)]" />
    </section>

    <UAlert v-else-if="error" color="error" variant="soft" :title="String(error.message || error)" />

    <section v-else-if="items.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="item in items"
        :key="item.key"
        :to="item.href"
        class="surface-card-hover block p-4"
      >
        <div class="flex items-start gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface-active)] text-[var(--text-brand)]">
            <Icon :name="item.icon" class="h-6 w-6" />
          </span>
          <div class="min-w-0">
            <h2 class="text-title-primary">{{ item.label }}</h2>
            <p class="text-body-secondary mt-1 line-clamp-2">{{ item.description }}</p>
          </div>
        </div>
      </NuxtLink>
    </section>

    <UCard v-else class="surface-card text-center" :ui="{ body: 'p-8' }">
      <Icon name="i-ph-squares-four-duotone" class="mx-auto h-10 w-10 text-[var(--text-tertiary)]" />
      <h2 class="text-heading mt-3">{{ t("pages.directoryPage.emptyTitle") }}</h2>
      <p class="text-body-secondary mt-2">{{ t("pages.directoryPage.emptyDescription") }}</p>
    </UCard>
  </main>
</template>

<script setup lang="ts">
import { useDirectoryPageVM } from "../../application/view-models/useDirectoryPageVM"

const { t } = useI18n()
const {
  title,
  description,
  items,
  pending,
  error,
} = useDirectoryPageVM()
</script>
