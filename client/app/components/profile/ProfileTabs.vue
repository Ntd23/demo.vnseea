<template>
  <div class="surface-card rounded-[24px] border border-[#0000ff]/10 p-2 shadow-[0_2px_14px_rgba(0,0,255,0.05)]">
    <div class="scrollbar-hide flex items-center gap-1 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="relative shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition"
        :class="modelValue === tab.key
          ? 'bg-[#0000ff] text-white shadow-[0_8px_24px_rgba(0,0,255,0.18)]'
          : 'text-slate-500 hover:bg-[#0000ff]/5 hover:text-[#0000ff]'"
        type="button"
        @click="$emit('update:modelValue', tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()

const tabs = [
  { key: 'timeline', label: 'Dòng thời gian' },
  { key: 'about', label: 'Giới thiệu' },
  { key: 'friends', label: 'Bạn bè' },
  { key: 'photos', label: 'Ảnh' },
  { key: 'videos', label: 'Video' },
  { key: 'albums', label: 'Albums' },
]
</script>
