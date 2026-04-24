<template>
  <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)] sm:rounded-[32px]">
    <div class="relative overflow-hidden">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_28%)]" />

      <div class="relative grid gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
        <div class="min-w-0">
          <p class="text-[11px] font-black uppercase tracking-[0.22em] text-[#0000ff]/60">
            {{ eyebrow }}
          </p>
          <h1 class="mt-2 text-[1.8rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[2.65rem]">
            {{ title }}
          </h1>
          <p class="mt-3 max-w-[680px] text-[13px] leading-6 text-slate-500 sm:text-[14px] sm:leading-7">
            {{ description }}
          </p>

          <div class="mt-4 flex flex-wrap gap-2">
            <span class="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[11px] font-black text-[#0000ff]">
              {{ photo.albumTitle }}
            </span>
            <span class="rounded-full bg-[#f8fbff] px-3 py-1.5 text-[11px] font-black text-[#243b63]">
              {{ photo.location }}
            </span>
            <span class="rounded-full bg-[#f8fbff] px-3 py-1.5 text-[11px] font-black text-[#243b63]">
              {{ photo.timeLabel }}
            </span>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="tag in photo.tags"
              :key="tag"
              class="rounded-full border border-[#dbe3f2] bg-white px-3 py-1.5 text-[11px] font-black text-slate-500"
            >
              {{ tag }}
            </span>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0000ff] px-5 text-[13px] font-black text-white shadow-[0_14px_28px_rgba(0,0,255,0.22)] transition hover:-translate-y-0.5 sm:w-auto"
              type="button"
              @click="$emit('open')"
            >
              <Icon name="i-ph-arrows-out-simple-bold" class="h-4 w-4" />
              {{ primaryLabel }}
            </button>

            <NuxtLink
              :to="photo.companionTo"
              class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-5 text-[13px] font-black text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff] sm:w-auto"
            >
              <Icon name="i-ph-arrow-up-right-bold" class="h-4 w-4" />
              {{ secondaryLabel }}
            </NuxtLink>
          </div>
        </div>

        <button
          class="group relative block overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-slate-100 text-left shadow-[0_18px_36px_rgba(15,35,110,0.1)]"
          type="button"
          @click="$emit('open')"
        >
          <img
            :alt="photo.title"
            :src="photo.image"
            class="h-[260px] w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:h-[320px]"
          >
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06),rgba(15,23,42,0.82))]" />
          <div class="absolute inset-x-0 bottom-0 p-4 text-white">
            <p class="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">{{ photo.photographerRole }}</p>
            <h2 class="mt-2 text-[1.2rem] font-black leading-tight sm:text-[1.35rem]">{{ photo.title }}</h2>
            <p class="mt-2 text-[12px] font-semibold text-white/78">
              {{ photo.photographer }} · {{ photo.location }}
            </p>
          </div>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3 border-t border-[#edf2fb] px-4 py-4 sm:px-6 xl:grid-cols-4">
        <article
          v-for="item in stats"
          :key="item.label"
          class="rounded-[22px] border border-[#edf2fb] bg-[#fbfcff] px-3.5 py-3.5 sm:px-4 sm:py-4"
        >
          <p class="text-[10px] font-black uppercase tracking-[0.16em] text-[#0000ff]/60">
            {{ item.label }}
          </p>
          <p class="mt-2 text-[1.35rem] font-black tracking-[-0.04em] text-[#243b63] sm:text-[1.55rem]">
            {{ item.value }}
          </p>
          <p class="mt-1 text-[12px] leading-5 text-slate-500">
            {{ item.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MockPhoto } from "~/composables/useMockPhotosData"

defineProps<{
  eyebrow: string
  title: string
  description: string
  photo: MockPhoto
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
  primaryLabel: string
  secondaryLabel: string
}>()

defineEmits<{ open: [] }>()
</script>
