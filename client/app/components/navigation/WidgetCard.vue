<template>
  <div class="surface-card group p-5 sm:p-6 space-y-6 ring-1 ring-secondary-100 shadow-xl transition-all duration-500">
    <div class="flex items-center justify-between border-b border-secondary-50 pb-5">
      <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 pl-1">{{ title }}</h3>
      <UBadge
        variant="soft"
        class="rounded-lg font-black text-[9px] uppercase tracking-widest px-2.5 py-1 ring-1 ring-inset bg-primary-50 text-primary-600 ring-primary-100"
      >
        {{ $t("navigation.widgetCard.mockBadge") }}
      </UBadge>
    </div>

    <div class="space-y-3">
      <div v-for="item in items" :key="item.title" class="surface-card p-4 ring-1 ring-secondary-100 bg-secondary-50/10 group-hover:bg-white transition-all duration-300 hover:ring-primary-100">
        <p class="text-sm font-black text-secondary-900 group-hover:text-primary-700 transition-colors">{{ item.title }}</p>
        <p class="mt-2 text-[11px] font-medium leading-relaxed text-secondary-500">{{ item.subtitle }}</p>
      </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  items: { title: string; subtitle: string }[]
}>()
</script>
