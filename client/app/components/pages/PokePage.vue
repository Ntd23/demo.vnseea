<template>
  <div class="mx-auto max-w-[1280px] space-y-10 pb-20 px-4 sm:px-6 pt-4">
    <!-- Hero Section -->
    <section class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950 text-white shadow-2xl group/hero">
      <!-- Premium Decorations -->
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--color-primary-500-rgb),0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.2),transparent_40%)]" />
      <div class="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none transition-transform duration-1000 group-hover/hero:scale-110" />

      <div class="relative z-10 px-8 py-14 sm:px-12 lg:px-16">
        <div class="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl space-y-6">
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 pl-1">
              {{ t("pages.pokePage.heroEyebrow") }}
            </p>
            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight text-white italic">
              {{ t("pages.pokePage.heroTitle") }}
            </h1>
            <p class="text-base font-medium leading-relaxed text-secondary-300 sm:text-lg pl-0.5 max-w-2xl italic">
              "{{ t("pages.pokePage.heroDescription") }}"
            </p>
          </div>

          <div class="flex flex-wrap gap-4">
            <UButton
              to="/messages"
              size="xl"
              class="h-14 rounded-2xl bg-white/5 text-white font-black text-[11px] uppercase tracking-widest ring-1 ring-white/20 hover:bg-white/10 backdrop-blur-xl transition-all active:scale-95 px-8"
            >
              <template #leading>
                <Icon name="i-ph-chat-circle-dots-duotone" class="h-5 w-5" />
              </template>
              {{ t("pages.pokePage.openMessages") }}
            </UButton>

            <UButton
              v-if="pokedBackCount > 0"
              size="xl"
              class="h-14 rounded-2xl bg-primary-600 text-white hover:bg-primary-700 font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary-600/20 transition-all active:scale-95 px-10"
              @click="resetPokedBack"
            >
              <template #leading>
                <Icon name="i-ph-arrow-counter-clockwise-bold" class="h-5 w-5" />
              </template>
              {{ t("pages.pokePage.resetStatus") }}
            </UButton>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="mt-16 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="item in summaryCards"
            :key="item.label"
            class="group/stat surface-card rounded-[2rem] border border-white/5 bg-white/5 p-8 backdrop-blur-3xl ring-1 ring-white/10 transition-all duration-500 hover:bg-white/10 hover:ring-primary-400/30"
          >
            <div class="flex items-center justify-between">
              <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 group-hover/stat:text-primary-300 transition-colors">
                {{ item.label }}
              </p>
              <Icon :name="item.icon" class="h-4 w-4 text-white/20 group-hover/stat:text-primary-400 group-hover/stat:rotate-12 transition-all" />
            </div>
            
            <div class="mt-8 flex items-baseline gap-4">
              <p class="text-5xl font-black text-white leading-none tracking-tighter">
                {{ item.value }}
              </p>
              <div class="h-1 w-1 rounded-full bg-primary-500 animate-pulse" />
            </div>
            <p class="mt-4 text-[10px] font-bold text-white/30 group-hover/stat:text-white/50 italic">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main List Section -->
    <section class="surface-card ring-1 ring-secondary-200/50 shadow-2xl p-8 sm:p-12 space-y-12 bg-white group/list relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none opacity-0 group-hover/list:opacity-100 transition-opacity duration-1000" />
      
      <div class="relative z-10 flex flex-col gap-8 border-b border-secondary-100/50 pb-12 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-4">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-secondary-900 pl-1">
            {{ t("pages.pokePage.listEyebrow") }}
          </p>
          <h2 class="text-4xl font-black tracking-tight text-secondary-900 leading-none">
            {{ t("pages.pokePage.listTitle", { count: pokeRecords.length }) }}
          </h2>
          <p class="text-base font-medium leading-relaxed text-secondary-500 italic max-w-2xl px-0.5 opacity-70">
            {{ t("pages.pokePage.listDescription") }}
          </p>
        </div>
        
        <div class="flex items-center gap-3 bg-secondary-50 p-2 rounded-2xl ring-1 ring-secondary-100/50">
          <div class="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-secondary-900 shadow-sm">
            <Icon name="i-ph-hand-pointing-duotone" class="h-5 w-5" />
          </div>
          <div class="pr-4">
            <p class="text-[10px] font-black uppercase tracking-widest text-secondary-400 leading-none mb-1">{{ t("pages.pokePage.pendingLabel") }}</p>
            <p class="text-lg font-black text-secondary-900 leading-none">{{ formatCount(pendingPokeCount) }}</p>
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
