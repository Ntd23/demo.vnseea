<template>
  <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-xl p-2 lg:p-3">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <!-- Premium GoPro Style Tabs -->
      <div class="flex flex-wrap items-center gap-1.5 p-1" role="tablist" :aria-label="$t('community.pagesDirectory.title')">
        <UButton
          v-for="tab in tabs"
          :key="tab.value"
          :to="tab.to"
          variant="ghost"
          class="h-12 rounded-2xl px-6 font-black text-[13px] uppercase tracking-wider transition-all"
          :class="activeTab === tab.value ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-[#0f172a]'"
          :aria-current="activeTab === tab.value ? 'page' : undefined"
        >
          {{ $t(tab.label) }}
          <span
            class="ml-3 flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-white px-1.5 text-[10px] font-black shadow-sm ring-1 ring-slate-100"
            :class="activeTab === tab.value ? 'text-primary-600' : 'text-slate-400'"
          >
            {{ tab.count }}
          </span>
        </UButton>
      </div>

      <!-- Search & Create -->
      <div class="flex flex-col gap-3 p-1 sm:flex-row sm:items-center">
        <div class="relative w-full sm:w-[360px]">
          <UInput
            v-model="search"
            :placeholder="$t('community.pagesDirectory.search')"
            color="primary"
            size="xl"
            class="w-full"
            :ui="searchInputUi"
          >
            <template #leading>
              <Icon name="i-ph-magnifying-glass-bold" class="h-5 w-5 text-primary-500" />
            </template>
            <template #trailing>
              <button
                v-if="search.trim()"
                class="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                @click="search = ''"
              >
                <Icon name="i-ph-x-bold" class="h-3 w-3" />
              </button>
            </template>
          </UInput>
        </div>

        <UButton
          :to="createTo"
          size="xl"
          class="h-14 rounded-2xl bg-[#0f172a] px-8 font-black text-[13px] uppercase tracking-widest text-white shadow-2xl transition-all hover:-translate-y-1 active:scale-95"
        >
          <template #leading>
            <Icon name="i-ph-plus-bold" class="h-5 w-5" />
          </template>
          {{ createLabelText }}
        </UButton>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="mt-2 flex items-center justify-between border-t border-slate-50 px-5 py-3">
      <div class="flex items-center gap-3">
        <div class="h-1.5 w-1.5 rounded-full bg-primary-500" />
        <p class="text-[12px] font-bold text-slate-400">
          {{ statusLabel }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Icon name="i-ph-funnel-duotone" class="h-4 w-4 text-slate-300" />
        <span class="text-[11px] font-black uppercase tracking-widest text-slate-400">
          {{ $t("community.pagesDirectory.searchLabel") }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityPageTab } from "../../../types/community"

const search = defineModel<string>("search", { default: "" })

const props = withDefaults(defineProps<{
  tabs: Array<{ label: string; value: CommunityPageTab; count: number; to: string }>
  activeTab: CommunityPageTab
  createTo: string
  createLabel?: string
  statusLabel: string
}>(), {
  createLabel: "",
})

const { t } = useI18n()

const searchInputUi = {
  base: "h-14 rounded-2xl px-12 text-[14px] font-bold bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary-500 shadow-inner",
}

const createLabelText = computed(() =>
  props.createLabel || t("community.pagesDirectory.createAction"),
)
</script>
