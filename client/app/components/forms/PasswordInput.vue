<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span v-if="label" class="text-sm font-semibold text-slate-600">{{ label }}</span>
      <slot name="meta" />
    </div>
    <label class="relative block">
      <input
        v-model="model"
        :type="show ? 'text' : 'password'"
        :placeholder="placeholder"
        class="h-13 w-full rounded-[22px] border border-slate-200 bg-white px-4 pr-12 text-base text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
      >
      <button
        class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        type="button"
        @click="show = !show"
      >
        <Icon :name="show ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="h-5 w-5" />
      </button>
    </label>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: "" })
const show = ref(false)

withDefaults(defineProps<{
  label?: string
  placeholder?: string
}>(), {
  placeholder: "",
})
</script>
