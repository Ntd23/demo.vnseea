<template>
  <section class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]">
    <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div class="p-5 sm:p-7 lg:p-8">
        <p class="text-label-secondary text-[var(--color-primary-600)]">P-41 · Games</p>
        <h1 class="mt-2 text-display text-[2.15rem] leading-tight text-[var(--text-primary)] sm:text-[3rem]">
          Trung tâm trò chơi
        </h1>
        <p class="mt-3 max-w-2xl text-[15px] font-semibold leading-7 text-[var(--text-secondary)]">
          Chọn game của bạn, khám phá game mới, xem game phổ biến và bắt đầu lượt chơi mock ngay trong trang.
        </p>
        <div class="mt-6 flex flex-wrap gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="inline-flex h-11 items-center gap-2 rounded-[var(--radius-full)] px-4 text-[13px] font-extrabold transition"
            :class="activeTab === tab.value ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'bg-[var(--bg-surface-hover)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)]'"
            type="button"
            @click="$emit('update:activeTab', tab.value)"
          >
            <Icon :name="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="border-t border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-5 lg:border-l lg:border-t-0">
        <div class="grid gap-3">
          <div v-for="item in stats" :key="item.label" class="rounded-[22px] bg-white p-4 shadow-[var(--shadow-sm)]">
            <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{{ item.label }}</p>
            <p class="mt-2 text-[1.55rem] font-black leading-none text-[var(--text-primary)]">{{ item.value }}</p>
            <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { GameTab, GameTabKey } from "~/composables/useMockGamesData"

defineProps<{
  tabs: ReadonlyArray<GameTab>
  activeTab: GameTabKey
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
}>()

defineEmits<{ "update:activeTab": [value: GameTabKey] }>()
</script>
