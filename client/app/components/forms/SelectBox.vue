<template>
  <div class="space-y-2">
    <label v-if="label" :for="inputId" class="block text-sm font-semibold text-slate-700">
      {{ label }}
    </label>

    <p v-if="description" class="text-sm text-slate-500">
      {{ description }}
    </p>

    <USelect
      :id="inputId"
      v-model="model"
      :items="options"
      value-key="value"
      label-key="label"
      :placeholder="placeholder"
      :disabled="disabled"
      color="primary"
      size="xl"
      class="w-full"
      :ui="selectUi"
      v-bind="attrs"
    />

    <p v-if="error" class="text-sm font-medium text-rose-600">
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-sm text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAttrs, useId } from "vue"

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: "" })
const attrs = useAttrs()
const generatedId = useId()

const props = withDefaults(defineProps<{
  label?: string
  description?: string
  hint?: string
  error?: string
  id?: string
  placeholder?: string
  disabled?: boolean
  options: { label: string; value: string }[]
}>(), {
  label: "",
  description: "",
  hint: "",
  error: "",
  id: "",
  placeholder: "",
  disabled: false,
})

const inputId = computed(() => props.id || generatedId)

const selectUi = {
  base: "h-[3.25rem] rounded-[1.1rem] px-4 text-[0.98rem]",
}
</script>
