<template>
  <div class="flex flex-wrap gap-2 lg:gap-3">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="flex items-center gap-3 rounded-xl px-7 py-3 text-[14px] font-extrabold transition-all duration-200 whitespace-nowrap"
      :style="modelValue === tab.id ? 'background-color: #0a58ca !important; color: white !important; min-width: 140px; justify-content: center;' : 'min-width: 140px; justify-content: center;'"
      :class="modelValue !== tab.id ? 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-transparent hover:border-[var(--border-default)]' : 'shadow-md'"
      @click="$emit('update:modelValue', tab.id)"
    >
      <Icon :name="tab.icon" class="h-5 w-5 shrink-0" :style="modelValue === tab.id ? 'color: white !important;' : ''" />
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export type MovieTabId = "new" | "recommended" | "watched"

interface Tab {
  id: MovieTabId
  label: string
  icon: string
}

defineProps<{
  modelValue: MovieTabId
  tabs: Tab[]
}>()

defineEmits<{
  "update:modelValue": [value: MovieTabId]
}>()
</script>
