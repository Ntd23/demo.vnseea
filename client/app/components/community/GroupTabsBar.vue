<template>
  <div class="rounded-[24px] border border-[#dbe3f2] bg-white p-2 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
    <div class="flex flex-wrap items-center gap-1.5">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="inline-flex h-11 items-center justify-center rounded-full px-4 text-[13px] font-bold transition"
        :class="modelValue === tab.key
          ? 'bg-[#0000ff] text-white shadow-[0_10px_22px_rgba(0,0,255,0.18)]'
          : 'text-slate-500 hover:bg-[#f6f8ff] hover:text-[#243b63]'"
        type="button"
        @click="$emit('update:modelValue', tab.key)"
      >
        <Icon :name="tab.icon" class="mr-2 h-4 w-4" />
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
