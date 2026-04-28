<template>
  <aside class="min-w-0 space-y-4">
    <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-label-secondary text-[var(--text-tertiary)]">{{ upcomingEyebrow }}</p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ upcomingTitle }}</h2>
        </div>
        <span class="rounded-full bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-black text-[var(--text-primary)]">
          {{ upcoming.length }}
        </span>
      </div>

      <div class="mt-4 space-y-3">
        <div v-for="item in upcoming" :key="item.title" class="rounded-[22px] bg-[var(--bg-surface-hover)] p-3.5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-[14px] font-black text-[var(--text-primary)]">{{ item.title }}</p>
              <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">{{ item.formatLabel }}</p>
            </div>
            <div class="w-fit rounded-[18px] bg-white px-3 py-2 text-left shadow-[0_8px_18px_rgba(15,23,42,0.04)] sm:text-right">
              <p class="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{{ item.dayLabel }}</p>
              <p class="mt-1 text-[13px] font-black text-[var(--text-primary)]">{{ item.timeLabel }}</p>
            </div>
          </div>
          <p class="mt-3 text-[12px] font-semibold leading-5 text-[var(--text-secondary)]">{{ item.note }}</p>
        </div>
      </div>
    </section>

    <section class="rounded-[28px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-label-secondary text-[var(--text-tertiary)]">{{ picksEyebrow }}</p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ picksTitle }}</h2>
        </div>
        <Icon name="i-ph-star-four-fill" class="h-5 w-5 text-[var(--text-primary)]" />
      </div>

      <div class="mt-4 space-y-2.5">
        <button
          v-for="movie in picks"
          :key="movie.id"
          class="flex w-full items-center gap-3 rounded-[20px] px-3 py-3 text-left transition"
          :class="movie.id === activeMovieId ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] hover:bg-[var(--color-primary-50)]'"
          type="button"
          @click="$emit('select', movie.id)"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] text-white" :style="{ background: movie.accent }">
            <Icon name="i-ph-popcorn-fill" class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[13px] font-black">{{ movie.title }}</p>
            <p class="mt-1 text-[12px] font-semibold opacity-70">{{ movie.director }}</p>
          </div>
          <span class="shrink-0 text-[12px] font-black">★ {{ movie.rating.toFixed(1) }}</span>
        </button>
      </div>
    </section>

    <section class="overflow-hidden rounded-[28px] border border-[var(--border-default)] shadow-[var(--shadow-md)]">
      <div class="bg-[linear-gradient(135deg,#09144c_0%,#0000ff_56%,#60a5fa_100%)] p-4 text-white">
        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-white/72">{{ $t("pages.moviesPage.sidebarRoutingEyebrow") }}</p>
        <h3 class="mt-2 text-[1.25rem] font-black leading-tight">{{ $t("pages.moviesPage.sidebarRoutingTitle") }}</h3>
        <p class="mt-2 text-[13px] font-semibold leading-6 text-white/76">
          {{ $t("pages.moviesPage.sidebarRoutingDescription") }}
        </p>

        <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <NuxtLink to="/watch" class="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-[12px] font-black text-[var(--text-primary)] sm:justify-start">
            <Icon name="i-ph-play-fill" class="h-4 w-4" />
            /watch
          </NuxtLink>
          <NuxtLink to="/live" class="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 text-[12px] font-black text-white backdrop-blur sm:justify-start">
            <Icon name="i-ph-broadcast-fill" class="h-4 w-4" />
            /live
          </NuxtLink>
          <NuxtLink to="/blogs" class="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 text-[12px] font-black text-white backdrop-blur sm:justify-start">
            <Icon name="i-ph-newspaper-fill" class="h-4 w-4" />
            /blogs
          </NuxtLink>
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { MockMovie, UpcomingMovie } from "../../application/composables/useMockMoviesData"

defineProps<{
  activeMovieId: string
  picks: ReadonlyArray<MockMovie>
  picksEyebrow: string
  picksTitle: string
  upcoming: ReadonlyArray<UpcomingMovie>
  upcomingEyebrow: string
  upcomingTitle: string
}>()

defineEmits<{ select: [id: string] }>()
</script>
