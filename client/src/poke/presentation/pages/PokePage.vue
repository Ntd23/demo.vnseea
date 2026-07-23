<!-- Description: Renders the backend-backed incoming poke route with MVVM-driven state. -->
<template>
  <main class="poke-page mt-2">
    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-ph-warning-octagon-fill"
      class="rounded-2xl border-none font-semibold"
      :description="errorMessage"
    />

    <section class="poke-page__content mt-2">
      <div v-if="loading" class="poke-page__loading">
        <USkeleton v-for="i in 4" :key="i" class="h-[86px] rounded-2xl" />
      </div>

      <div v-else-if="pokeRecords.length === 0" class="poke-page__empty">
        <Icon name="i-ph-hand-pointing-duotone" class="h-14 w-14" />
        <h2>{{ t("pages.pokePage.listTitle", { count: 0 }) }}</h2>
        <p>{{ t("pages.pokePage.listDescription") }}</p>
      </div>

      <div v-else class="poke-page__list">
        <PokeRequestCard
          v-for="item in pokeRecords"
          :key="item.id"
          :record="item"
          :poked-back="pokedBackIds.includes(item.id)"
          :responding="isResponding(item.id)"
          @poke="pokeBack"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PokeRequestCard from "../components/RequestCard.vue"
import { usePokePageVM } from "../../application/view-models/usePokePageVM"

const { t } = useI18n()
const {
  loading,
  errorMessage,
  pokeRecords,
  pokedBackIds,
  respondedCount,
  isResponding,
  fetchPokes,
  pokeBack,
} = usePokePageVM()

useSeoMeta({
  title: () => t("pages.pokePage.seoTitle"),
  description: () => t("pages.pokePage.seoDescription"),
})

await fetchPokes()
</script>

<style scoped>
.poke-page {
  display: grid;
  width: min(100%, 980px);
  gap: 18px;
  margin: 0 auto;
  /* padding: 24px 14px 48px; */
}

.poke-page__header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: space-between;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: var(--bg-surface);
  padding: 18px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.poke-page__title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.poke-page__icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 16px;
  background: #eef2ff;
  color: var(--bg-brand);
}

.poke-page__eyebrow {
  margin: 0 0 4px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.poke-page__title h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.1;
}

.poke-page__refresh {
  width: 44px;
  height: 44px;
  justify-content: center;
  border-radius: 14px;
}

.poke-page__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.poke-page__stats div {
  display: grid;
  gap: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: var(--bg-surface);
  padding: 14px;
}

.poke-page__stats span {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poke-page__stats strong {
  color: var(--text-primary);
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}

.poke-page__content {
  display: grid;
  gap: 14px;
}

.poke-page__content-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
}

.poke-page__content-head p {
  margin: 0 0 4px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.poke-page__content-head h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 900;
}

.poke-page__loading,
.poke-page__list {
  display: grid;
  gap: 10px;
}

.poke-page__empty {
  display: grid;
  min-height: 260px;
  place-items: center;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  background: var(--bg-surface);
  padding: 28px;
  text-align: center;
  color: var(--text-tertiary);
}

.poke-page__empty h2 {
  margin: 10px 0 4px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 900;
}

.poke-page__empty p {
  max-width: 440px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

@media (min-width: 640px) {
  /* .poke-page {
    padding: 32px 20px 56px;
  } */

  .poke-page__header {
    flex-direction: row;
    align-items: center;
    padding: 20px;
  }

  .poke-page__stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
