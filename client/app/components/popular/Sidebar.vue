<template>
  <aside class="min-w-0 space-y-6">
    <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl group/hashtags">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">{{ hashtagsEyebrow }}</p>
          <h2 class="text-xl font-black tracking-tight text-secondary-900">{{ hashtagsTitle }}</h2>
        </div>
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 transition-transform group-hover/hashtags:rotate-12">
          <Icon name="i-ph-hash-duotone" class="h-5 w-5" />
        </div>
      </div>

      <div class="mt-8 flex flex-wrap gap-2.5">
        <NuxtLink
          v-for="item in hashtags"
          :key="item.to"
          :to="item.to"
          class="inline-flex items-center gap-2.5 rounded-xl border border-secondary-100 bg-secondary-50/50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-secondary-500 transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100 hover:-translate-y-0.5"
        >
          <span>{{ item.label }}</span>
          <span class="rounded-lg bg-secondary-100/50 px-2 py-0.5 text-[9px] font-black text-secondary-400 group-hover:bg-primary-100 group-hover:text-primary-500">{{ item.score }}</span>
        </NuxtLink>
      </div>
    </section>

    <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl group/creators">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">{{ creatorsEyebrow }}</p>
          <h2 class="text-xl font-black tracking-tight text-secondary-900">{{ creatorsTitle }}</h2>
        </div>
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100 transition-transform group-hover/creators:scale-110">
          <Icon name="i-ph-fire-duotone" class="h-5 w-5" />
        </div>
      </div>

      <div class="mt-8 space-y-4">
        <article
          v-for="item in creators"
          :key="item.name"
          class="flex flex-col items-start gap-4 rounded-2xl bg-secondary-50/50 px-4 py-4 ring-1 ring-secondary-100/50 transition-all hover:bg-white hover:ring-primary-100/50 group/item sm:flex-row sm:items-center"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[13px] font-black text-white shadow-lg transition-transform group-hover/item:scale-105 group-hover/item:rotate-3 shadow-primary-500/20"
            :style="{ background: item.accent }"
          >
            {{ item.initials }}
          </div>
          <div class="min-w-0 flex-1 space-y-0.5">
            <p class="truncate text-[13px] font-black uppercase tracking-widest text-secondary-900 group-hover/item:text-primary-600 transition-colors">{{ item.name }}</p>
            <p class="truncate text-[10px] font-bold uppercase tracking-widest text-secondary-400">{{ item.role }}</p>
          </div>
          <span class="shrink-0 self-start rounded-xl bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-600 ring-1 ring-secondary-100 shadow-sm sm:self-auto">
            {{ item.score }}
          </span>
        </article>
      </div>
    </section>

    <section class="surface-card overflow-hidden ring-1 ring-secondary-100 shadow-xl group/links">
      <div class="bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950 p-6 text-white space-y-6">
        <div class="space-y-1.5">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-400/80 pl-1">{{ linksEyebrow }}</p>
          <h3 class="text-xl font-black leading-tight tracking-tight">{{ linksTitle }}</h3>
        </div>

        <div class="space-y-3">
          <NuxtLink
            v-for="item in quickLinks"
            :key="item.to"
            :to="item.to"
            class="block rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20 group/link"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-11 w-11 items-center justify-center rounded-[14px] text-white shadow-xl transition-transform group-hover/link:scale-110 group-hover/link:-rotate-6" :style="{ background: item.accent }">
                <Icon :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-bold', '-duotone').replace('-fill', '-duotone')" class="h-5 w-5" />
              </div>
              <div class="min-w-0 space-y-0.5">
                <p class="truncate text-[13px] font-black uppercase tracking-widest group-hover/link:text-primary-400 transition-colors">{{ item.title }}</p>
                <p class="line-clamp-1 text-[11px] font-medium text-white/50">{{ item.description }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { PopularQuickLink } from "~/composables/useMockPopularData"

defineProps<{
  hashtags: ReadonlyArray<{ label: string; score: string; to: string }>
  hashtagsEyebrow: string
  hashtagsTitle: string
  creators: ReadonlyArray<{ name: string; initials: string; role: string; score: string; accent: string }>
  creatorsEyebrow: string
  creatorsTitle: string
  quickLinks: ReadonlyArray<PopularQuickLink>
  linksEyebrow: string
  linksTitle: string
}>()
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
