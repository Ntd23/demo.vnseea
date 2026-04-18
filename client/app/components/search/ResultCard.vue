<template>
  <NuxtLink
    :to="result.href"
    class="group flex h-full flex-col rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#c8d6f2] hover:shadow-[0_20px_40px_rgba(15,35,110,0.12)]"
  >
    <div class="flex items-start gap-4">
      <div
        class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] text-[15px] font-black text-white shadow-[0_14px_28px_rgba(15,35,110,0.18)]"
        :style="{ background: avatarBackground }"
      >
        <Icon
          v-if="result.kind === 'posts'"
          name="i-ph-newspaper-clipping-fill"
          class="h-6 w-6"
        />
        <span v-else>{{ result.initials }}</span>

        <span
          v-if="result.kind === 'users' && result.badge === 'Online'"
          class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#22c55e]"
        />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-[1.05rem] font-black tracking-[-0.03em] text-[#243b63]">
            {{ result.title }}
          </h3>

          <span
            v-if="result.badge"
            class="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]"
            :class="badgeClass"
          >
            {{ result.badge }}
          </span>
        </div>

        <p class="mt-1 text-[12px] font-bold uppercase tracking-[0.15em] text-[#0000ff]/60">
          {{ result.subtitle }}
        </p>
      </div>

      <Icon :name="sectionIcon" class="mt-1 h-5 w-5 shrink-0 text-[#0000ff]/40 transition group-hover:text-[#0000ff]" />
    </div>

    <p class="result-card__description mt-4 text-[14px] leading-6 text-slate-500">
      {{ result.description }}
    </p>

    <div class="mt-4 flex flex-wrap gap-2">
      <span class="inline-flex items-center rounded-full bg-[#eef3ff] px-3 py-1.5 text-[12px] font-semibold text-[#243b63]">
        {{ result.metricLabel }}
      </span>
      <span
        v-if="result.metaLabel"
        class="inline-flex items-center rounded-full border border-[#e2e8f0] px-3 py-1.5 text-[12px] font-semibold text-slate-500"
      >
        {{ result.metaLabel }}
      </span>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <span
        v-for="tag in result.tags.slice(0, 3)"
        :key="tag"
        class="inline-flex items-center rounded-full bg-[#f8faff] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7da5]"
      >
        #{{ tag }}
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { SearchResultItem } from "~/composables/useMockSearchData"

const props = defineProps<{
  result: SearchResultItem
}>()

const sectionIcon = computed(() => {
  if (props.result.kind === "users") return "i-ph-user-circle-fill"
  if (props.result.kind === "pages") return "i-ph-flag-fill"
  if (props.result.kind === "groups") return "i-ph-users-three-fill"
  return "i-ph-newspaper-clipping-fill"
})

const avatarBackground = computed(() =>
  `linear-gradient(135deg, ${props.result.accent} 0%, #0000ff 100%)`,
)

const badgeClass = computed(() => {
  if (props.result.badge === "Online") return "bg-[#e7f8ec] text-[#16803c]"
  if (props.result.kind === "posts") return "bg-[#f4eaff] text-[#6d28d9]"
  if (props.result.kind === "pages") return "bg-[#fff4dd] text-[#b45309]"
  if (props.result.kind === "groups") return "bg-[#ecfeff] text-[#0f766e]"
  return "bg-[#eef3ff] text-[#1d4ed8]"
})
</script>

<style scoped>
.result-card__description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>
