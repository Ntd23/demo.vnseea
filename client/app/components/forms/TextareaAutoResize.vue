<template>
  <label class="block space-y-2">
    <span v-if="label" class="text-sm font-semibold text-slate-600">{{ label }}</span>
    <textarea
      ref="textarea"
      v-model="model"
      :placeholder="placeholder"
      rows="1"
      class="min-h-28 w-full resize-none rounded-[24px] border border-[#0000ff]/20 bg-white px-4 py-4 text-base leading-7 text-slate-900 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
      @input="syncHeight"
    />
  </label>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: "" })
const textarea = ref<HTMLTextAreaElement>()

withDefaults(defineProps<{
  label?: string
  placeholder?: string
}>(), {
  placeholder: "",
})

const syncHeight = () => {
  if (!textarea.value) return
  textarea.value.style.height = "auto"
  textarea.value.style.height = `${textarea.value.scrollHeight}px`
}

onMounted(syncHeight)
watch(model, () => nextTick(syncHeight))
</script>
