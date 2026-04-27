<template>
  <section class="rounded-[28px] border border-[#dbe3f2] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,35,110,0.06)] sm:px-5">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="flex flex-wrap items-center gap-2" role="tablist" :aria-label="$t('community.groups.hub')">
        <UButton
          v-for="tab in tabs"
          :key="tab.value"
          :to="tab.to"
          :color="activeTab === tab.value ? 'primary' : 'neutral'"
          :variant="activeTab === tab.value ? 'soft' : 'ghost'"
          size="lg"
          class="rounded-full px-4 text-[14px] font-bold"
          :aria-current="activeTab === tab.value ? 'page' : undefined"
        >
          {{ $t(tab.label) }}
          <UBadge color="neutral" variant="soft" class="ml-2 rounded-full px-2 py-0.5 text-[11px] font-black text-[#243b63]">
            {{ tab.count }}
          </UBadge>
        </UButton>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="w-full sm:w-[320px]">
          <UInput
            v-model="search"
            :placeholder="$t('community.groups.filter.search')"
            leading-icon="i-ph-magnifying-glass-bold"
            color="primary"
            size="xl"
            class="w-full"
            :ui="searchInputUi"
          />
        </div>

        <UButton
          v-if="search.trim()"
          type="button"
          color="neutral"
          variant="outline"
          size="xl"
          class="rounded-full"
          @click="search = ''"
        >
          {{ $t("community.groups.filter.clear") }}
        </UButton>

        <UButton
          :to="createTo"
          color="primary"
          variant="solid"
          size="xl"
          class="rounded-[16px] text-[14px] font-extrabold shadow-[0_12px_24px_rgba(0,0,255,0.24)]"
        >
          <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
          {{ $t("community.groups.filter.create") }}
        </UButton>
      </div>
    </div>

    <div class="mt-4 flex flex-col gap-3 border-t border-[#eef2f8] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-[13px] text-slate-500">
        {{ statusLabel }}
      </p>

      <UBadge color="primary" variant="subtle" class="self-start rounded-full px-3 py-1.5 text-[12px] font-semibold">
        {{ $t("community.groups.filter.searchLabel") }}
      </UBadge>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupTab } from "../../domain/types/community.types"

const search = defineModel<string>("search", { default: "" })

defineProps<{
  tabs: Array<{ label: string; value: CommunityGroupTab; count: number; to: string }>
  activeTab: CommunityGroupTab
  createTo: string
  statusLabel: string
}>()

const searchInputUi = {
  base: "h-12 rounded-full px-4 text-[14px]",
}
</script>
