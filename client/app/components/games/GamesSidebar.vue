<template>
  <aside class="space-y-4">
    <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--text-tertiary)]">Leaderboard</p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">Bảng xếp hạng</h2>
      <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">{{ gameTitle }}</p>
      <div class="mt-4 space-y-2">
        <div v-for="(player, index) in leaderboard" :key="player.name" class="flex items-center justify-between rounded-[20px] bg-[var(--bg-surface-hover)] p-3">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[12px] font-black text-white">#{{ index + 1 }}</span>
            <p class="text-[13px] font-extrabold text-[var(--text-primary)]">{{ player.name }}</p>
          </div>
          <p class="text-[13px] font-black text-[var(--color-primary-600)]">{{ formatGameNumber(player.score) }}</p>
        </div>
      </div>
    </section>

    <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--text-tertiary)]">Achievements</p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">Thành tựu</h2>
      <div class="mt-4 space-y-3">
        <div v-for="item in achievements" :key="item.title" class="rounded-[20px] bg-[var(--bg-surface-hover)] p-3">
          <div class="flex items-center justify-between gap-3">
            <p class="text-[13px] font-extrabold text-[var(--text-primary)]">{{ item.title }}</p>
            <p class="text-[12px] font-black text-[var(--color-primary-600)]">{{ item.progress }}%</p>
          </div>
          <p class="mt-1 text-[12px] font-semibold leading-5 text-[var(--text-secondary)]">{{ item.description }}</p>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div class="h-full rounded-full bg-[var(--color-primary-500)]" :style="{ width: `${item.progress}%` }" />
          </div>
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { formatGameNumber } from "~/composables/useMockGamesData"

defineProps<{
  leaderboard: ReadonlyArray<{ name: string; score: number }>
  gameTitle: string
  achievements: ReadonlyArray<{ title: string; description: string; progress: number }>
}>()
</script>
