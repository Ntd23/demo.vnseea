<template>
  <div class="surface-card rounded-[28px] border-dashed p-8 text-center">
    <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
      <Icon :name="icon" class="h-7 w-7" />
    </div>
    <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
    <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description: string
  icon?: string
}>(), {
  icon: "i-lucide-inbox",
})
</script>
