<template>
  <NuxtLink
    :to="to"
    class="group flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-semibold transition"
    :class="active ? 'bg-[#edf1ff] text-[#0000ff]' : 'text-slate-700 hover:bg-[#f7f9ff] hover:text-[#0000ff]'"
  >
    <span
      class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
      :class="active ? 'border-[#ccd7ff] bg-white text-[#0000ff]' : 'border-[#edf2fb] bg-white text-slate-600'"
    >
      <Icon :name="icon" class="h-3.5 w-3.5" />
    </span>
    <span class="truncate">{{ label }}</span>
    <span
      v-if="badge"
      class="ml-auto inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-bold"
      :class="active ? 'bg-white text-[#0000ff]' : 'bg-amber-100 text-amber-700'"
    >
      {{ badge }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
const route = useRoute()

const props = defineProps<{
  label: string
  icon: string
  to: string
  badge?: number
}>()

const active = computed(() => {
  if (props.to === "/") {
    return route.path === "/" || route.path === "/home"
  }

  return route.path === props.to
})
</script>
