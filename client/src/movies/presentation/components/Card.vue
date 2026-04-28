<template>
  <article
    class="overflow-hidden rounded-[28px] border bg-white shadow-[var(--shadow-md)] transition duration-200"
    :class="selected ? 'border-[var(--border-strong)] shadow-[0_18px_36px_rgba(0,0,255,0.12)]' : 'border-[var(--border-default)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]'"
  >
    <button class="block w-full text-left" type="button" @click="$emit('select', movie.id)">
      <div class="relative aspect-[4/4.7] overflow-hidden">
        <img :alt="movie.title" class="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" :src="movie.cover">
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.72))]" />
        <div class="absolute left-3 top-3 flex flex-wrap gap-2">
          <span v-if="movie.isPremiere" class="rounded-full bg-[#fffbeb]/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#b45309]">
            {{ $t("pages.moviesPage.badgePremiere") }}
          </span>
          <span v-if="movie.isEditorsPick" class="rounded-full bg-white/88 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-primary)]">
            {{ $t("pages.moviesPage.badgeEditorsPick") }}
          </span>
        </div>
        <div class="absolute inset-x-0 bottom-0 p-4">
          <div class="flex items-center justify-between gap-3 text-white">
            <span class="rounded-full bg-black/36 px-3 py-1.5 text-[11px] font-black backdrop-blur">
              {{ categoryLabel }}
            </span>
            <span class="rounded-full bg-black/36 px-3 py-1.5 text-[11px] font-black backdrop-blur">
              ★ {{ movie.rating.toFixed(1) }}
            </span>
          </div>
        </div>
      </div>
    </button>

    <div class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-[1.1rem] font-black leading-tight text-[var(--text-primary)] sm:text-[1.2rem]">{{ movie.title }}</h3>
          <p class="mt-1 text-[12px] font-semibold text-[var(--text-tertiary)]">
            {{ movie.year }} · {{ movie.runtime }}
          </p>
        </div>
        <div class="shrink-0 rounded-[18px] px-2.5 py-2 text-center text-white" :style="{ background: movie.accent }">
          <p class="text-[10px] font-black uppercase tracking-[0.12em] opacity-80">IMDB</p>
          <p class="mt-0.5 text-[13px] font-black leading-none">{{ movie.rating.toFixed(1) }}</p>
        </div>
      </div>

      <p class="mt-3 line-clamp-3 text-[14px] font-semibold leading-6 text-[var(--text-secondary)]">
        {{ movie.summary }}
      </p>

      <div class="mt-3 flex flex-wrap gap-2">
        <span v-for="tag in movie.tags" :key="tag" class="rounded-full bg-[var(--color-primary-50)] px-3 py-1.5 text-[11px] font-black text-[var(--text-primary)]">
          {{ tag }}
        </span>
      </div>

      <div class="mt-4 flex items-center justify-between gap-3 rounded-[20px] bg-[var(--bg-surface-hover)] px-3.5 py-3">
        <div class="min-w-0">
          <p class="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{{ directorLabel }}</p>
          <p class="truncate text-[13px] font-extrabold text-[var(--text-primary)]">{{ movie.director }}</p>
        </div>
        <Icon name="i-ph-clapperboard-fill" class="h-5 w-5 shrink-0 text-[var(--text-primary)]" />
      </div>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row">
        <NuxtLink
          :to="movie.to"
          class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary-500)] px-4 text-[12px] font-black text-white shadow-[var(--shadow-brand)] sm:flex-1"
        >
          <Icon name="i-ph-play-fill" class="h-4 w-4" />
          {{ primaryLabel }}
        </NuxtLink>
        <NuxtLink
          :to="movie.companionTo"
          class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--border-default)] bg-white px-4 text-[12px] font-black text-[var(--text-primary)] sm:flex-1"
        >
          <Icon name="i-ph-newspaper-fill" class="h-4 w-4" />
          {{ secondaryLabel }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MockMovie } from "../../application/composables/useMockMoviesData"

defineProps<{
  categoryLabel: string
  directorLabel: string
  movie: MockMovie
  primaryLabel: string
  secondaryLabel: string
  selected: boolean
}>()

defineEmits<{ select: [id: string] }>()
</script>
