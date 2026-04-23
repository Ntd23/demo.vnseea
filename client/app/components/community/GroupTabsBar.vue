<template>
  <div class="surface-card p-2 ring-1 ring-secondary-100 shadow-xl overflow-hidden relative">
    <!-- Visual Decor -->
    <div class="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

    <div class="relative z-10 flex flex-wrap items-center gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="h-11 flex items-center justify-center rounded-2xl px-6 transition-all duration-300 font-black text-[11px] uppercase tracking-[0.15em] border border-transparent"
        :class="modelValue === tab.key
          ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm'
          : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900 group'"
        type="button"
        @click="$emit('update:modelValue', tab.key)"
      >
        <Icon 
          :name="tab.icon.replace('-bold', '-duotone')" 
          class="mr-2.5 h-4 w-4 transition-transform group-hover:scale-110" 
          :class="modelValue === tab.key ? 'text-primary-600' : 'text-secondary-400 group-hover:text-primary-500'"
        />
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{ modelValue: "posts" | "about" }>()
defineEmits<{ "update:modelValue": [value: "posts" | "about"] }>()

const tabs = computed(() => [
  { key: "posts", label: t("pages.groupDetailPage.tabPosts"), icon: "i-ph-newspaper-clipping-bold" },
  { key: "about", label: t("pages.groupDetailPage.tabAbout"), icon: "i-ph-info-bold" },
] as const)
</script>
