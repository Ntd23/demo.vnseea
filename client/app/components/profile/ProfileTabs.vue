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

const { t } = useI18n()

const tabs = computed(() => [
  { key: 'timeline', label: t('pages.profilePage.tabs.timeline') },
  { key: 'about', label: t('pages.profilePage.tabs.about') },
  { key: 'friends', label: t('pages.profilePage.tabs.friends') },
  { key: 'photos', label: t('pages.profilePage.tabs.photos') },
  { key: 'videos', label: t('pages.profilePage.tabs.videos') },
  { key: 'albums', label: t('pages.profilePage.tabs.albums') },
])
</script>
