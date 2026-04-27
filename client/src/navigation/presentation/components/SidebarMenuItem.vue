<template>
  <NuxtLink
    :to="to"
    class="group flex min-w-0 items-center gap-3.5 rounded-xl px-3 py-2.5 transition-all duration-300"
    :class="isActive ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm shadow-primary-500/5' : 'text-[var(--text-primary)] hover:bg-secondary-50 hover:text-primary-600'"
  >
    <span
      class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300"
      :class="isActive ? 'border-primary-200 bg-white text-primary-600 shadow-sm' : 'border-secondary-100 bg-white text-[var(--icon-primary)] group-hover:border-primary-200 group-hover:text-primary-600'"
    >
      <Icon :name="isActive ? icon : icon.replace('-fill', '-duotone')" class="h-4.5 w-4.5" />
    </span>
    
    <span class="truncate text-[10px] font-black uppercase tracking-[0.2em] leading-none">{{ label }}</span>
    
    <span
      v-if="badge"
      class="ml-auto inline-flex min-w-5 shrink-0 items-center justify-center rounded-lg px-2 py-1 text-[9px] font-black shadow-sm ring-1 ring-inset"
      :class="isActive ? 'bg-primary-600 text-white ring-primary-500' : 'bg-primary-100 text-primary-700 ring-primary-200'"
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
  active?: boolean
}>()

const isActive = computed(() => {
  if (props.active !== undefined) return props.active
  
  if (props.to === "/") {
    return route.path === "/" || route.path === "/home"
  }

  return route.path === props.to
})
</script>
