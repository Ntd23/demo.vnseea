<template>
  <div class="flex flex-col gap-2">
    <UFormGroup
      :label="field.label"
      :help="field.description"
      class="w-full"
    >
      <UTextarea
        v-if="field.type === 'textarea'"
        v-model="value"
        :placeholder="field.placeholder"
        size="lg"
        variant="outline"
        class="font-semibold"
        :rows="4"
      />

      <USelectMenu
        v-else-if="field.type === 'select'"
        v-model="value"
        :options="field.options ?? []"
        size="lg"
        variant="outline"
        class="font-semibold"
      />

      <UInput
        v-else
        v-model="value"
        :type="field.type"
        :placeholder="field.placeholder"
        size="lg"
        variant="outline"
        class="font-semibold"
      />
    </UFormGroup>
  </div>
</template>

<script setup lang="ts">
import type { SettingField } from "~/composables/useMockSettingsData"

const props = defineProps<{ field: SettingField }>()
const value = ref(props.field.value)

// Update internal value when the translated prop value changes
watch(() => props.field.value, (newVal) => {
  value.value = newVal
})
</script>

<style scoped>
.setting-input {
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-hover);
  padding-left: 14px;
  padding-right: 14px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  outline: none;
}
</style>
