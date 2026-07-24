<!-- English description: Renders the product editor hero with stable media contrast across color modes. -->
<template>
  <section :class="[theme.container, 'surface-card group relative overflow-hidden ring-1 ring-secondary-200/50 shadow-2xl transition-all duration-700']">
    <!-- Premium Decorations -->
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--text-media)_10%,transparent),transparent_40%),radial-gradient(circle_at_bottom_left,color-mix(in_srgb,var(--text-media)_5%,transparent),transparent_40%)]" />
    <div class="pointer-events-none absolute right-[-10%] top-[-30%] h-[500px] w-[500px] rounded-full bg-[color-mix(in_srgb,var(--text-media)_5%,transparent)] blur-[120px] transition-transform duration-1000 group-hover:scale-110" />
    <div :class="theme.bottomGlow" />

    <div class="relative z-10 flex flex-col gap-12 px-8 py-16 sm:px-12 lg:px-16 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-[780px] space-y-8">
        <div class="space-y-4">
          <p class="pl-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary-200/80">
            {{ badge }}
          </p>
          <h1 class="text-5xl sm:text-7xl font-extrabold leading-none tracking-tight text-[var(--text-media)] transition-colors">
            {{ title }}
          </h1>
          <p class="text-base font-medium leading-relaxed text-[var(--text-media-muted)] sm:text-lg pl-1 max-w-2xl italic">
            "{{ description }}"
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 pt-4">
          <UButton
            :to="appRoutes.myProducts"
            variant="soft"
            size="xl"
            class="h-14 rounded-xl bg-[color-mix(in_srgb,var(--text-media)_10%,transparent)] px-8 text-[11px] font-semibold text-[var(--text-media)] ring-1 ring-[var(--border-media)] backdrop-blur-xl transition-all hover:bg-[color-mix(in_srgb,var(--text-media)_20%,transparent)] active:scale-95"
          >
            <template #leading>
              <Icon name="i-ph-arrow-left-duotone" class="h-5 w-5" />
            </template>
            {{ $t("pages.productsPage.backToMyProducts") || "Back" }}
          </UButton>

          <UButton
            size="xl"
            class="h-14 rounded-xl border-none px-10 text-[11px] font-semibold shadow-[0_4px_14px_color-mix(in srgb, var(--bg-brand) 20%, transparent)] transition-all active:scale-95"
            :class="theme.secondaryAction"
            @click="$emit('secondaryAction')"
          >
            <template #leading>
              <Icon name="i-ph-sparkle-duotone" class="h-6 w-6" />
            </template>
            {{ secondaryActionLabel }}
          </UButton>
        </div>
      </div>

      <!-- Hero Stats -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:w-[380px]">
        <div
          v-for="item in stats"
          :key="item.label"
          class="group/stat rounded-[18px] border border-[var(--border-media)] bg-[color-mix(in_srgb,var(--text-media)_5%,transparent)] p-6 backdrop-blur-2xl transition-all duration-500 hover:bg-[color-mix(in_srgb,var(--text-media)_10%,transparent)]"
        >
          <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-[color-mix(in_srgb,var(--text-media)_45%,transparent)] transition-colors group-hover/stat:text-[var(--text-media-muted)]">
            {{ item.label }}
          </p>
          <p class="mt-4 text-3xl font-extrabold leading-none tracking-tight text-[var(--text-media)]">
            {{ item.value }}
          </p>
          <p class="mt-2 text-[10px] font-bold text-[color-mix(in_srgb,var(--text-media)_40%,transparent)] group-hover/stat:text-[var(--text-media-muted)] line-clamp-1">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { ProductHeroStat } from "../../domain/types/product-editor.types"

const props = defineProps<{
  variant: "create" | "edit"
  badge: string
  title: string
  description: string
  stats: ProductHeroStat[]
  secondaryActionLabel: string
}>()

defineEmits<{
  (e: "secondaryAction"): void
}>()

const theme = computed(() => {
  if (props.variant === "edit") {
    return {
      container: "bg-gradient-to-br from-secondary-950 via-primary-900 to-secondary-900",
      bottomGlow: "pointer-events-none absolute bottom-[-22%] left-[-8%] h-[300px] w-[300px] rounded-full bg-primary-400/10 blur-3xl",
      secondaryAction: "bg-[var(--bg-brand)] text-[var(--text-inverse)] hover:bg-[var(--bg-brand-hover)] shadow-[var(--shadow-brand)]",
    }
  }

  return {
    container: "bg-gradient-to-br from-orange-950 via-amber-900 to-rose-900",
    bottomGlow: "pointer-events-none absolute bottom-[-22%] left-[-8%] h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-3xl",
    secondaryAction: "bg-[var(--text-media)] text-[var(--color-on-light-surface)] hover:bg-[color-mix(in_srgb,var(--text-media)_90%,transparent)] shadow-[var(--shadow-sm)]",
  }
})
</script>
