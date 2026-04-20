<template>
  <label class="block">
    <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ field.label }}</span>

    <textarea
      v-if="field.type === 'textarea'"
      v-model="value"
      class="setting-input mt-2 min-h-[120px] resize-y py-3"
      :placeholder="field.placeholder"
    />

    <select
      v-else-if="field.type === 'select'"
      v-model="value"
      class="setting-input mt-2"
    >
      <option v-for="option in field.options ?? []" :key="option" :value="option">{{ option }}</option>
    </select>

    <input
      v-else
      v-model="value"
      class="setting-input mt-2"
      :placeholder="field.placeholder"
      :type="field.type"
    >
  </label>
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
