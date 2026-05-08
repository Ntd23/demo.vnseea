<!-- Description: Renders the poke route as a simple heading plus backend-backed poke request list aligned to the legacy PHP order. -->
<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
      <div class="space-y-1.5">
        <p class="text-label-secondary">
          {{ t("pages.pokePage.listEyebrow") }}
        </p>
        <h1 class="text-heading text-[var(--text-primary)]">
          {{ t("pages.pokePage.heroTitle") }}
        </h1>
      </div>
    </section>

    <UAlert
      v-if="errorMessage"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      class="rounded-[22px]"
      :description="errorMessage"
    />

    <section
      v-if="loading"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]"
    >
      <div class="flex items-center justify-center gap-3 text-sm font-bold text-[var(--text-secondary)]">
        <Icon name="i-lucide-loader-2" class="h-5 w-5 animate-spin" />
        <span>{{ t("pages.pokePage.heroTitle") }}</span>
      </div>
    </section>

    <section
      v-else-if="pokeRecords.length === 0"
      class="rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]"
    >
      <FoundationEmptyState
        icon="i-ph-hand-pointing-duotone"
        :title="t('pages.pokePage.listTitle', { count: 0 })"
        :description="t('pages.pokePage.listDescription')"
      />
    </section>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <PokeRequestCard
        v-for="item in pokeRecords"
        :key="item.id"
        :record="item"
        :poked-back="pokedBackIds.includes(item.id)"
        @poke="pokeBack"
        @remove="removePoke"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import PokeRequestCard from "../components/RequestCard.vue"
import { usePokePageVM } from "../../application/view-models/usePokePageVM"

const { t } = useI18n()
const {
  loading,
  errorMessage,
  pokeRecords,
  pokedBackIds,
  fetchPokes,
  pokeBack,
  removePoke,
} = usePokePageVM()

useSeoMeta({
  title: () => t("pages.pokePage.seoTitle"),
  description: () => t("pages.pokePage.seoDescription"),
})

await fetchPokes()
</script>
