<template>
  <div class="flex flex-col gap-3 rounded-[28px] border border-[#0000ff]/10 bg-white/80 p-4 md:flex-row md:items-center md:justify-between">
    <UAlert
      color="primary"
      variant="subtle"
      icon="i-ph-floppy-disk-back-fill"
      :description="hint"
      class="flex-1 rounded-[20px]"
    />
    <div class="flex items-center gap-3">
      <UButton color="neutral" variant="outline" class="rounded-full" @click="$emit('save')">
        Lưu nháp
      </UButton>
      <UButton color="primary" variant="solid" class="rounded-full" @click="$emit('submit')">
        {{ cta }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  hint?: string
  cta?: string
}>(), {
  hint: "Mock state: form này chưa submit thật.",
  cta: "Tiếp tục",
})

defineEmits<{
  (e: "save"): void
  (e: "submit"): void
}>()
</script>
