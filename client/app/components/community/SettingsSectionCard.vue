<template>
  <section class="surface-card p-6 sm:p-8 relative overflow-hidden ring-1 ring-secondary-100 shadow-xl group">
    <!-- Decorative background element -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary-500/10 transition-colors duration-700" />
    
    <div class="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-4">
        <!-- Premium Icon Wrapper -->
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm transition-transform duration-500 group-hover:scale-110">
          <Icon :name="icon.replace('-bold', '-duotone')" class="h-6 w-6" />
        </div>

        <div class="min-w-0 space-y-1">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500">
            {{ eyebrow ? $t(eyebrow) : '' }}
          </p>
          <h2 class="text-xl font-black tracking-tight text-secondary-900">
            {{ $t(title) }}
          </h2>
          <p
            v-if="description"
            class="text-[13px] font-medium leading-relaxed text-secondary-500 max-w-2xl"
          >
            {{ $t(description) }}
          </p>
        </div>
      </div>

      <div v-if="$slots.trailing" class="shrink-0 pt-1">
        <slot name="trailing" />
      </div>
    </div>

    <!-- Content Slot with Standardized Margin -->
    <div class="relative z-10 mt-8">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description?: string
  icon?: string
}>(), {
  eyebrow: "community.settings.defaultEyebrow",
  description: "",
  icon: "i-ph-gear-six-bold",
})
</script>
