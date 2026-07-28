<!-- English description: Renders product image upload controls and selection progress. -->
<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-[1.02rem] font-black text-[var(--text-primary)]">
        {{ $t("product.createMediaField.title") }}
      </p>
      <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5">
        {{ imageButtonLabel }}
      </UBadge>
    </div>

    <UFileUpload
      v-model="filesModel"
      multiple
      accept="image/*"
      layout="grid"
      highlight
      :label="uploadLabel || $t('product.createMediaField.uploadLabel')"
      :description="$t('product.createMediaField.uploadDescription')"
      class="w-full"
    />

    <UProgress
      :model-value="Math.min((filesModel.length / fileLimit) * 100, 100)"
      color="primary"
      size="sm"
    />

    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-ph-images-fill"
      :description="$t('product.createMediaField.selectedStatus', { current: filesModel.length, limit: fileLimit })"
      class="rounded-[20px]"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  imageButtonLabel: string
  fileLimit?: number
  uploadLabel?: string
}>(), {
  fileLimit: 10,
  uploadLabel: undefined,
})

const filesModel = defineModel<File[]>("files", {
  required: true,
  default: () => [],
})
</script>
