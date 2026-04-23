<template>
  <section class="surface-card group overflow-hidden p-8 sm:p-12 ring-1 ring-secondary-200/50 shadow-2xl relative bg-white">
    <!-- Premium Decorations -->
    <div class="pointer-events-none absolute right-[-5%] top-[-30%] h-96 w-96 rounded-full bg-primary-100/30 blur-[120px] transition-transform duration-1000 group-hover:scale-110" />
    <div class="pointer-events-none absolute bottom-[-40%] left-[5%] h-80 w-80 rounded-full bg-emerald-100/20 blur-[120px] transition-transform duration-1000 group-hover:-translate-x-4" />

    <div class="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-8">
        <!-- Main Icon Container -->
        <div class="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-[32px] bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-2xl shadow-primary-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Icon :name="icon.includes('duotone') ? icon : icon.replace('-fill', '-duotone')" class="h-10 w-10 sm:h-12 sm:w-12" />
        </div>

        <div class="min-w-0 space-y-2.5">
          <p
            v-if="eyebrow"
            class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1"
          >
            {{ $t(eyebrow) }}
          </p>
          <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-secondary-900 leading-none">
            {{ $t(title) }}
          </h1>
          <p
            v-if="description"
            class="text-base font-medium leading-relaxed text-secondary-500 max-w-2xl pl-1 italic"
          >
            "{{ $t(description) }}"
          </p>
        </div>
      </div>

      <!-- Highlights/Badges Container -->
      <div class="flex flex-wrap gap-3 pt-6 lg:pt-0">
        <div
          v-for="highlight in normalizedHighlights"
          :key="highlight"
          class="rounded-2xl border border-secondary-100 bg-secondary-50/50 px-6 py-3 font-black text-[10px] uppercase tracking-widest text-secondary-500 shadow-sm transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100/50 hover:shadow-md hover:-translate-y-1 active:scale-95"
        >
          {{ $t(highlight) }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description?: string
  eyebrow?: string
  icon?: string
  highlights?: string[]
}>(), {
  description: "",
  eyebrow: "",
  icon: "i-ph-users-three-fill",
  highlights: () => [],
})

const { t } = useI18n()

const normalizedHighlights = computed(() =>
  props.highlights.length > 0
    ? props.highlights
    : [t("community.creation.common.quickFill"), t("community.creation.common.editLater")],
)
</script>
