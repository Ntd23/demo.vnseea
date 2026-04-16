<template>
  <label class="relative block">
    <Icon name="i-lucide-search" class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8090d8]" />
    <input
      v-model="model"
      :placeholder="placeholder"
      class="h-10 w-full rounded-full border border-[#c7d1ff] bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-[#90a0d5] focus:border-[#0000ff] focus:ring-4 focus:ring-[#dfe3ff]"
      type="search"
    >
  </label>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: "" })

withDefaults(defineProps<{ placeholder?: string }>(), {
  placeholder: "Tim nguoi, bai dang, chu de...",
})
</script>
