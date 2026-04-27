<template>
  <aside class="w-full shrink-0 xl:w-80">
    <nav class="surface-card flex flex-col gap-1 p-3 shadow-xl ring-1 ring-secondary-100">
      <NuxtLink
        v-for="page in pages"
        :key="page.slug"
        :to="`/settings/${page.slug}`"
        class="group flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-300 active:scale-[0.98]"
        :class="activeSlug === page.slug 
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
          : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900'"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors" :class="activeSlug === page.slug ? 'bg-white/20' : 'bg-secondary-100 group-hover:bg-primary-50 text-secondary-400 group-hover:text-primary-600'">
            <Icon :name="page.icon" class="h-6 w-6" />
          </div>
          <span class="text-sm font-black">{{ page.label }}</span>
        </div>
        <Icon v-if="activeSlug === page.slug" name="i-ph-caret-right-bold" class="h-4 w-4" />
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import type { SettingPage } from "../../domain/types/settings.types"

defineProps<{
  pages: SettingPage[]
  activeSlug: string
}>()
</script>
