<template>
  <article
    class="overflow-hidden rounded-[30px] border bg-white shadow-[var(--shadow-md)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
    :class="selected ? 'border-[var(--border-strong)] ring-4 ring-[var(--color-primary-50)]' : 'border-[var(--border-default)]'"
    @click="$emit('select', game)"
  >
    <div class="relative h-52 overflow-hidden">
      <img :alt="game.title" class="h-full w-full object-cover" :src="game.cover">
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06),rgba(15,23,42,0.68))]" />
      <div class="absolute left-4 top-4 flex flex-wrap gap-2">
        <span class="rounded-[var(--radius-full)] bg-white/90 px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">{{ game.categoryLabel }}</span>
        <span v-if="game.isNew" class="rounded-[var(--radius-full)] bg-[var(--color-accent-500)] px-3 py-1.5 text-[12px] font-extrabold text-white">{{ $t('community.games.card.isNew') }}</span>
      </div>
      <div class="absolute bottom-4 left-4 right-4">
        <h3 class="text-2xl font-black leading-tight text-white">{{ game.title }}</h3>
        <p class="mt-1 line-clamp-2 text-[13px] font-semibold leading-5 text-white/78">{{ game.description }}</p>
      </div>
    </div>

    <div class="p-4">
      <div class="grid grid-cols-3 gap-2">
        <div class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
          <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">{{ $t('community.games.card.plays') }}</p>
          <p class="mt-1 text-[15px] font-black text-[var(--text-primary)]">{{ formatGameNumber(game.plays) }}</p>
        </div>
        <div class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
          <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">{{ $t('community.games.card.rating') }}</p>
          <p class="mt-1 text-[15px] font-black text-[var(--text-primary)]">{{ game.rating }}</p>
        </div>
        <div class="rounded-[18px] bg-[var(--bg-surface-hover)] p-3">
          <p class="text-[11px] font-bold uppercase text-[var(--text-tertiary)]">{{ $t('community.games.card.best') }}</p>
          <p class="mt-1 text-[15px] font-black text-[var(--text-primary)]">{{ formatGameNumber(bestScore) }}</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <span v-for="tag in game.tags" :key="tag" class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">{{ tag }}</span>
      </div>

      <div class="mt-5 flex gap-2">
        <button
          class="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-4 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)]"
          type="button"
          @click.stop="$emit('play', game)"
        >
          <Icon name="i-ph-play-fill" class="h-4 w-4" />
          {{ $t('community.games.card.playBtn') }}
        </button>
        <button
          class="inline-flex h-11 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-4 text-[13px] font-extrabold text-[var(--color-primary-600)]"
          type="button"
          @click.stop="$emit('toggleSave', game.id)"
        >
          <Icon :name="saved ? 'i-ph-bookmark-simple-fill' : 'i-ph-bookmark-simple-bold'" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MockGame } from "~/composables/useMockGamesData"
import { formatGameNumber } from "~/composables/useMockGamesData"

defineProps<{
  game: MockGame
  saved: boolean
  bestScore: number
  selected: boolean
}>()

defineEmits<{
  play: [game: MockGame]
  select: [game: MockGame]
  toggleSave: [id: string]
}>()
</script>
