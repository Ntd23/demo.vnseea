<template>
  <div class="space-y-3">
    <p v-if="label" class="text-sm font-semibold text-[var(--text-primary)]">
      {{ label }}
    </p>

    <p v-if="description" class="text-sm text-[var(--text-secondary)]">
      {{ description }}
    </p>

    <URadioGroup
      v-model="model"
      :items="options"
      value-key="value"
      label-key="label"
      color="primary"
      variant="card"
      indicator="end"
      size="lg"
      :disabled="disabled"
      :ui="radioGroupUi"
    />

    <p v-if="error" class="text-sm font-medium text-rose-600">
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-sm text-[var(--text-secondary)]">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: "" })

withDefaults(defineProps<{
  label?: string
  description?: string
  hint?: string
  error?: string
  disabled?: boolean
  options: { label: string; value: string }[]
}>(), {
  label: "",
  description: "",
  hint: "",
  error: "",
  disabled: false,
})

const radioGroupUi = {
  fieldset: "grid grid-cols-1 gap-3 md:grid-cols-2",
  item: "min-h-[4.4rem] items-center rounded-[1.15rem] border px-4 py-4 transition hover:border-[#c8d9ef]",
  container: "h-full",
  wrapper: "flex-1",
  label: "text-[0.98rem] font-semibold text-[var(--text-primary)]",
  base: "size-5 ring-[#cbd9ea] bg-white data-[state=checked]:ring-[var(--bg-brand)]",
}
</script>
