<template>
  <aside class="min-w-0 space-y-4">
    <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_32px_rgba(15,35,110,0.06)]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">{{ hashtagsEyebrow }}</p>
          <h2 class="mt-2 text-[1.35rem] font-black tracking-[-0.04em] text-[#243b63]">{{ hashtagsTitle }}</h2>
        </div>
        <Icon name="i-ph-hash-bold" class="h-5 w-5 text-[#0000ff]" />
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <NuxtLink
          v-for="item in hashtags"
          :key="item.to"
          :to="item.to"
          class="inline-flex items-center gap-2 rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-3 py-2 text-[12px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        >
          <span>{{ item.label }}</span>
          <span class="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500">{{ item.score }}</span>
        </NuxtLink>
      </div>
    </section>

    <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_32px_rgba(15,35,110,0.06)]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">{{ creatorsEyebrow }}</p>
          <h2 class="mt-2 text-[1.35rem] font-black tracking-[-0.04em] text-[#243b63]">{{ creatorsTitle }}</h2>
        </div>
        <Icon name="i-ph-fire-fill" class="h-5 w-5 text-[#0000ff]" />
      </div>

      <div class="mt-4 space-y-3">
        <article
          v-for="item in creators"
          :key="item.name"
          class="flex flex-col items-start gap-3 rounded-[22px] bg-[#f8fbff] px-3.5 py-3 sm:flex-row sm:items-center"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] text-[13px] font-black text-white"
            :style="{ background: item.accent }"
          >
            {{ item.initials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[13px] font-black text-[#243b63]">{{ item.name }}</p>
            <p class="mt-1 truncate text-[12px] font-semibold text-slate-500">{{ item.role }}</p>
          </div>
          <span class="shrink-0 self-start rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#0000ff] shadow-[0_8px_18px_rgba(15,35,110,0.06)] sm:self-auto">
            {{ item.score }}
          </span>
        </article>
      </div>
    </section>

    <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] shadow-[0_14px_32px_rgba(15,35,110,0.06)]">
      <div class="bg-[linear-gradient(135deg,#09144c_0%,#0000ff_56%,#60a5fa_100%)] p-4 text-white">
        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-white/72">{{ linksEyebrow }}</p>
        <h3 class="mt-2 text-[1.25rem] font-black leading-tight">{{ linksTitle }}</h3>

        <div class="mt-4 space-y-2.5">
          <NuxtLink
            v-for="item in quickLinks"
            :key="item.to"
            :to="item.to"
            class="block rounded-[20px] border border-white/14 bg-white/10 px-3.5 py-3 backdrop-blur transition hover:bg-white/14"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-[16px] text-white" :style="{ background: item.accent }">
                <Icon :name="item.icon" class="h-4 w-4" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-[13px] font-black">{{ item.title }}</p>
                <p class="mt-1 text-[12px] leading-5 text-white/74">{{ item.description }}</p>
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
