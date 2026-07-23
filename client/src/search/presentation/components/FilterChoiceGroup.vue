<template>
  <div class="filter-choice">
    <p class="filter-choice__title">
      {{ label }}
    </p>

    <div class="filter-choice__pills">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="pillClass(modelValue === option.value)"
        @click="emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchOption } from "../../domain/types/search.types"

defineProps<{
  label: string
  modelValue: string
  options: SearchOption<string>[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const pillClass = (active: boolean) => [
  "filter-choice__pill",
  active ? "filter-choice__pill--active" : "",
]
</script>

<style scoped>
.filter-choice {
  display: grid;
  gap: 10px;
}

.filter-choice__title {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.filter-choice__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-choice__pill {
  min-height: 32px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: #f1f5f9;
  color: var(--text-primary);
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.filter-choice__pill--active {
  border-color: var(--bg-brand);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--bg-brand) 12%, transparent);
}

.filter-choice__pill:hover {
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
  color: var(--bg-brand);
}

.filter-choice__pill--active:hover {
  background: color-mix(in srgb, var(--bg-brand) 8%, transparent);
}

@media (max-width: 640px) {
  .filter-choice__title {
    font-size: 13px;
  }

  .filter-choice__pill {
    min-height: 30px;
    padding-inline: 12px;
    font-size: 12px;
  }
}
</style>
