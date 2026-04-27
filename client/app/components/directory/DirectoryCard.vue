<template>
  <NuxtLink
    :to="item.href"
    class="group block"
    :aria-label="t('pages.directoryPage.openItemAria', { title: item.title })"
  >
    <div class="relative overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-xl transition-all hover:-translate-y-1.5 hover:shadow-2xl">
      <!-- Action Banner -->
      <div class="relative h-[180px] p-6 text-white overflow-hidden" :style="{ background: item.accent }">
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        <div class="relative z-10 flex h-full flex-col justify-between">
          <div class="flex items-start justify-between">
            <div class="flex flex-wrap gap-2">
              <span class="rounded-xl bg-white/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/20">
                {{ item.categoryLabel }}
              </span>
              <span
                v-if="item.featured"
                class="rounded-xl bg-primary-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
              >
                PRO
              </span>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0f172a] shadow-2xl opacity-0 transition-all group-hover:opacity-100 group-hover:scale-110">
              <Icon name="i-ph-arrow-up-right-bold" class="h-5 w-5" />
            </div>
          </div>
          
          <div>
            <h3 class="text-[22px] font-black tracking-tight leading-none">{{ item.title }}</h3>
            <p class="mt-2 line-clamp-1 text-[13px] font-medium text-white/80">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Area -->
      <div class="p-6 space-y-6">
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {{ t("pages.directoryPage.metaLabel") }}
            </p>
            <p class="mt-1 truncate text-[14px] font-black text-[#0f172a]">
              {{ item.meta }}
            </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {{ t("pages.directoryPage.activityLabel") }}
            </p>
            <p class="mt-1 truncate text-[14px] font-black text-[#0f172a]">
              {{ item.count }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in item.tags.slice(0, 3)"
            :key="tag"
            class="text-[11px] font-black uppercase tracking-wider text-slate-400"
          >
            #{{ tag }}
          </span>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-50">
          <span class="text-[12px] font-black text-primary-600 uppercase tracking-widest">
            {{ item.categoryLabel }}
          </span>
          <div class="flex items-center gap-2 text-[13px] font-black text-[#0f172a]">
            {{ t("pages.directoryPage.openDirectory") }}
            <Icon name="i-ph-caret-right-bold" class="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { DirectoryItem } from "~/composables/useMockDirectoryData"

const { t } = useI18n()

defineProps<{ item: DirectoryItem }>()
</script>
