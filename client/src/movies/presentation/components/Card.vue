<template>
  <div class="group relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-white p-2.5 transition-all duration-200 hover:shadow-md">
    <div class="relative aspect-[2/3] overflow-hidden rounded-lg bg-[var(--bg-surface-hover)]">
      <NuxtLink :to="movie.to" class="block h-full w-full">
        <img
          :alt="movie.title"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          :src="movie.cover"
        >
        <!-- Rating Badge -->
        <div class="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[11px] font-bold text-[#fbc02d] backdrop-blur-sm">
          <Icon name="i-ph-star-fill" class="h-3 w-3" />
          {{ movie.rating.toFixed(1) }}
        </div>
      </NuxtLink>
    </div>

    <div class="mt-3 space-y-1">
      <NuxtLink :to="movie.to">
        <h3 class="line-clamp-1 text-[15px] font-extrabold text-[var(--text-primary)] transition hover:text-[var(--color-primary-600)]" :title="movie.title">
          {{ movie.title }}
        </h3>
      </NuxtLink>
      
      <div class="flex items-center gap-2 text-[12px] font-semibold">
        <span class="text-[var(--color-primary-600)]">{{ categoryLabel }}</span>
        <span class="text-[var(--text-quaternary)]">•</span>
        <span class="text-[var(--text-tertiary)]">{{ movie.year }}</span>
        <span class="text-[var(--text-quaternary)]">•</span>
        <span class="text-[var(--text-tertiary)]">{{ movie.runtime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MockMovie } from "../../application/composables/useMockMoviesData"

defineProps<{
  categoryLabel: string
  movie: MockMovie
}>()
</script>

