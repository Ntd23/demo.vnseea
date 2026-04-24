<template>
  <UCard
    class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-[linear-gradient(135deg,#0369a1_0%,#1e3a8a_38%,#1447e6_100%)] text-white shadow-[var(--shadow-xl)]"
    :ui="{ body: 'relative p-5 sm:p-7 lg:p-8' }"
  >
    <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25" />
    <div class="pointer-events-none absolute right-[-10%] top-[-20%] h-[260px] w-[260px] rounded-full bg-white/12 blur-3xl" />
    <div class="pointer-events-none absolute bottom-[-24%] left-[-6%] h-[220px] w-[220px] rounded-full bg-[#38bdf8]/20 blur-3xl" />

    <div class="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div class="max-w-[760px]">
        <UBadge color="neutral" variant="soft" class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
          {{ t("pages.fundingPage.heroEyebrow") }}
        </UBadge>

        <h1 class="mt-4 text-display text-[2.25rem] leading-[0.95] text-white sm:text-[3rem]">
          {{ t("pages.fundingPage.heroTitle") }}
        </h1>
        <p class="mt-4 max-w-[640px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
          {{ t("pages.fundingPage.heroDescription") }}
        </p>

        <div class="mt-5 flex flex-wrap gap-2">
          <UBadge color="neutral" variant="soft" class="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white">
            {{ t("pages.fundingPage.campaignCount", { count: campaignCount }) }}
          </UBadge>
          <UBadge
            v-if="activeCategoryLabel"
            color="neutral"
            variant="soft"
            class="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white"
          >
            {{ activeCategoryLabel }}
          </UBadge>
          <UBadge
            v-if="activeStatusLabel"
            color="neutral"
            variant="soft"
            class="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white"
          >
            {{ activeStatusLabel }}
          </UBadge>
          <UBadge
            v-if="searchTerm"
            color="neutral"
            variant="soft"
            class="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white"
          >
            {{ t("pages.fundingPage.queryBadge", { query: searchTerm }) }}
          </UBadge>
        </div>

        <div class="mt-7 flex flex-wrap gap-3">
          <UButton
            to="/create_funding"
            color="neutral"
            variant="solid"
            size="xl"
            class="rounded-full bg-white text-[var(--text-primary)]"
          >
            <Icon name="i-ph-plus-circle-fill" class="mr-2 h-4 w-4" />
            {{ t("pages.fundingPage.createCampaign") }}
          </UButton>

          <UButton
            v-if="hasActiveFilters"
            type="button"
            color="neutral"
            variant="outline"
            size="xl"
            class="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
            @click="emit('reset')"
          >
            {{ t("pages.fundingPage.reset") }}
          </UButton>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-3 xl:w-[460px] xl:grid-cols-1">
        <UCard
          v-for="item in stats"
          :key="item.label"
          class="rounded-[24px] border border-white/15 bg-white/10 backdrop-blur-[6px]"
          :ui="{ body: 'p-4' }"
        >
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-white/62">
            {{ item.label }}
          </p>
          <p class="mt-2 text-[1.6rem] font-black leading-none text-white">
            {{ item.value }}
          </p>
          <p class="mt-1 text-[13px] leading-5 text-white/74">
            {{ item.description }}
          </p>
        </UCard>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  campaignCount: number
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
  searchTerm?: string
  activeCategoryLabel?: string
  activeStatusLabel?: string
  hasActiveFilters?: boolean
}>()

const emit = defineEmits<{
  reset: []
}>()
</script>
