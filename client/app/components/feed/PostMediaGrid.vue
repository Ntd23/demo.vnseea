<template>
  <div class="grid gap-3" :class="variant === 'double' ? 'md:grid-cols-2' : ''">
    <button
      v-for="index in count"
      :key="index"
      class="mock-image flex min-h-56 items-end rounded-[28px] border border-white/60 p-5 text-left"
      type="button"
      @click="emit('open', index - 1)"
    >
      <div class="rounded-2xl bg-white/85 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
        Mock media {{ index }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant: 'single' | 'double'
}>()

const emit = defineEmits<{ open: [index: number] }>()
const count = computed(() => (props.variant === 'double' ? 2 : 1))
</script>
