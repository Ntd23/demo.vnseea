<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-3 pb-20 sm:px-5 lg:px-6">
    <!-- Hero Section -->
    <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]">
      <div class="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-stretch">
        <div class="flex min-w-0 flex-col justify-between gap-8 rounded-[24px] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] p-5 ring-1 ring-[#dbe3f2] sm:p-7">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex h-8 items-center rounded-full bg-white px-3 text-[12px] font-extrabold text-primary-700 ring-1 ring-primary-100">
                {{ t("pages.pokePage.heroEyebrow") }}
              </span>
              <span class="inline-flex h-8 items-center rounded-full bg-primary-600 px-3 text-[12px] font-extrabold text-white">
                {{ heroMainStat.value }} {{ heroMainStat.label }}
              </span>
            </div>

            <div class="space-y-3">
              <h1 class="max-w-[760px] text-[34px] font-black leading-tight text-[var(--text-primary)] sm:text-[48px]">
                {{ t("pages.pokePage.heroTitle") }}
              </h1>
              <p class="max-w-xl text-[15px] font-medium leading-7 text-slate-600">
                {{ t("pages.pokePage.heroDescription") }}
              </p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-[auto_auto_1fr] sm:items-center">
            <NuxtLink
              to="/messages"
              class="inline-flex h-12 items-center justify-center rounded-[16px] border border-secondary-200 bg-white px-5 text-[14px] font-black text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:scale-95"
            >
              <Icon name="i-ph-chat-circle-dots-duotone" class="mr-2 h-5 w-5 shrink-0" />
              {{ t("pages.pokePage.openMessages") }}
            </NuxtLink>

            <button
              v-if="pokedBackCount > 0"
              type="button"
              class="inline-flex h-12 items-center justify-center rounded-[16px] bg-primary-600 px-5 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(37,99,235,0.2)] transition hover:bg-primary-700 active:scale-95"
              @click="resetPokedBack"
            >
              <Icon name="i-ph-arrow-counter-clockwise-bold" class="mr-2 h-5 w-5 shrink-0" />
              {{ t("pages.pokePage.resetStatus") }}
            </button>
          </div>
        </div>

        <div class="grid gap-3">
          <div class="rounded-[24px] border border-[#dbe3f2] bg-[#0f172a] p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-extrabold uppercase text-white/52">
                  {{ heroMainStat.label }}
                </p>
                <p class="mt-2 text-[34px] font-black leading-none">
                  {{ heroMainStat.value }}
                </p>
                <p class="mt-3 max-w-[320px] text-[13px] font-semibold leading-6 text-white/68">
                  {{ heroMainStat.description }}
                </p>
              </div>

              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white text-[#0f172a]">
                <Icon :name="heroMainStat.icon" class="h-7 w-7" />
              </div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <article
              v-for="item in heroSecondaryStats"
              :key="item.label"
              class="rounded-[20px] border border-[#dbe3f2] bg-white p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[10px] font-extrabold uppercase text-slate-500">
                    {{ item.label }}
                  </p>
                  <p class="mt-2 text-[26px] font-black leading-none text-[var(--text-primary)]">
                    {{ item.value }}
                  </p>
                </div>
                <Icon :name="item.icon" class="h-4 w-4 shrink-0 text-primary-600" />
              </div>
              <p class="mt-2 text-[12px] font-semibold leading-5 text-slate-500">
                {{ item.description }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Main List Section -->
    <section class="surface-card ring-1 ring-secondary-200/50 shadow-2xl p-8 sm:p-12 space-y-12 bg-white group/list relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none opacity-0 group-hover/list:opacity-100 transition-opacity duration-1000" />
      
      <div class="relative z-10 flex flex-col gap-8 border-b border-secondary-100/50 pb-12 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-4">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] pl-1">
            {{ t("pages.pokePage.listEyebrow") }}
          </p>
          <h2 class="text-4xl font-black tracking-tight text-[var(--text-primary)] leading-none">
            {{ t("pages.pokePage.listTitle", { count: pokeRecords.length }) }}
          </h2>
          <p class="text-base font-medium leading-relaxed text-[var(--text-primary)] italic max-w-2xl px-0.5 opacity-70">
            {{ t("pages.pokePage.listDescription") }}
          </p>
        </div>
        
        <div class="flex items-center gap-3 bg-secondary-50 p-2 rounded-2xl ring-1 ring-secondary-100/50">
          <div class="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-[var(--text-primary)] shadow-sm">
            <Icon name="i-ph-hand-pointing-duotone" class="h-5 w-5" />
          </div>
          <div class="pr-4">
            <p class="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] leading-none mb-1">{{ t("pages.pokePage.pendingLabel") }}</p>
            <p class="text-lg font-black text-[var(--text-primary)] leading-none">{{ formatCount(pendingPokeCount) }}</p>
          </div>
        </div>
      </div>

      <div class="relative z-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <PokeRequestCard
          v-for="item in pokeRecords"
          :key="item.id"
          :record="item"
          :poked-back="pokedBackIds.includes(item.id)"
          @poke="pokeBack"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import PokeRequestCard from "../components/RequestCard.vue"
import { useMockPokeData } from "../../infrastructure/mocks/pokeCatalog"

const { pokeRecords } = useMockPokeData()
const { t, locale } = useI18n()

const pokedBackIds = ref<string[]>([])

const pokedBackCount = computed(() => pokedBackIds.value.length)
const pendingPokeCount = computed(() => pokeRecords.value.length - pokedBackCount.value)
const formatCount = (value: number) =>
  value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US")

const summaryCards = computed(() => [
  {
    label: t("pages.pokePage.statNewPokes"),
    value: formatCount(pokeRecords.value.length),
    icon: "i-ph-hand-pointing-duotone",
    description: t("pages.pokePage.statNewPokesDescription"),
  },
  {
    label: t("pages.pokePage.statPokedBack"),
    value: formatCount(pokedBackCount.value),
    icon: "i-ph-check-circle-duotone",
    description: t("pages.pokePage.statPokedBackDescription"),
  },
  {
    label: t("pages.pokePage.statOnline"),
    value: formatCount(pokeRecords.value.filter(item => item.online).length),
    icon: "i-ph-broadcast-duotone",
    description: t("pages.pokePage.statOnlineDescription"),
  },
  {
    label: t("pages.pokePage.statPending"),
    value: formatCount(pendingPokeCount.value),
    icon: "i-ph-clock-countdown-duotone",
    description: t("pages.pokePage.statPendingDescription"),
  },
])

const heroMainStat = computed(() => summaryCards.value[0])
const heroSecondaryStats = computed(() => summaryCards.value.slice(1))

function pokeBack(id: string) {
  if (pokedBackIds.value.includes(id)) return
  pokedBackIds.value = [...pokedBackIds.value, id]
}

function resetPokedBack() {
  pokedBackIds.value = []
}

useSeoMeta({
  title: () => t("pages.pokePage.seoTitle"),
  description: () => t("pages.pokePage.seoDescription"),
})
</script>
