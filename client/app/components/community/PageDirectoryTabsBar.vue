<template>
  <section class="rounded-[28px] border border-[#dbe3f2] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,35,110,0.06)] sm:px-5">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-wrap items-center gap-1 sm:gap-2">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.value"
          :to="tab.to"
          class="inline-flex h-12 items-center border-b-2 px-3 text-[14px] font-bold transition sm:text-[15px]"
          :class="activeTab === tab.value
            ? 'border-[#0000ff] text-[#243b63]'
            : 'border-transparent text-slate-500 hover:text-[#243b63]'"
        >
          {{ $t(tab.label) }}
        </NuxtLink>
      </div>

      <NuxtLink
        :to="createTo"
        class="inline-flex h-12 shrink-0 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
          {{ createLabelText }}
        </NuxtLink>
      </div>
    </section>
</template>

<script setup lang="ts">
import type { CommunityPageTab } from "../../../types/community"

const props = withDefaults(defineProps<{
  tabs: Array<{ label: string; value: CommunityPageTab; to: string }>
  activeTab: CommunityPageTab
  createTo: string
  createLabel?: string
}>(), {
  createLabel: "",
})

const { t } = useI18n()

const createLabelText = computed(() =>
  props.createLabel || t("community.pagesDirectory.createAction"),
)
</script>
