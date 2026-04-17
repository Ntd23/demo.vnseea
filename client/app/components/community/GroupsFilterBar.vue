<template>
  <section class="rounded-[28px] border border-[#dbe3f2] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,35,110,0.06)] sm:px-5">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="inline-flex h-12 items-center justify-center rounded-full px-4 text-[14px] font-bold transition"
          :class="activeTab === tab.value
            ? 'bg-[#eef2ff] text-[#0000ff] shadow-[0_10px_22px_rgba(0,0,255,0.08)]'
            : 'text-slate-500 hover:bg-[#f8fbff] hover:text-[#243b63]'"
          type="button"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span class="ml-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-black text-[#243b63]">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="w-full sm:w-[280px]">
          <FormsSearchInput v-model="search" placeholder="Tìm nhóm, chủ đề hoặc URL..." />
        </div>

        <NuxtLink
          :to="createTo"
          class="inline-flex h-12 shrink-0 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
          Tạo ra
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupTab } from "../../../types/community"

const activeTab = defineModel<CommunityGroupTab>("activeTab", { required: true })
const search = defineModel<string>("search", { default: "" })

defineProps<{
  tabs: Array<{ label: string; value: CommunityGroupTab; count: number }>
  createTo: string
}>()
</script>
