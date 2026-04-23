<template>
  <section class="surface-card group overflow-hidden ring-1 ring-secondary-200/50 shadow-2xl bg-gradient-to-br from-secondary-950 via-primary-900 to-secondary-900 text-white relative">
    <!-- Premium Decorations -->
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_40%)]" />
    <div class="pointer-events-none absolute right-[-10%] top-[-30%] h-96 w-96 rounded-full bg-primary-500/10 blur-[120px] transition-transform duration-1000 group-hover:scale-110" />

    <div class="relative z-10 flex flex-col gap-12 px-8 py-12 sm:px-12 lg:px-16 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-[780px] space-y-8">
        <div class="space-y-4">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-300/80 pl-1">
            {{ $t("pages.createEventPage.heroEyebrow") }}
          </p>
          <h1 class="text-5xl sm:text-6xl font-black leading-none tracking-tight text-white transition-colors group-hover:text-primary-100">
            {{ $t("pages.createEventPage.heroTitle") }}
          </h1>
          <p class="text-base font-medium leading-relaxed text-white/70 sm:text-lg pl-1 max-w-2xl italic">
            "{{ $t("pages.createEventPage.heroDescription") }}"
          </p>
        </div>

        <div class="flex flex-wrap gap-4 pt-4 lg:pt-0">
          <UButton
            to="/events"
            variant="soft"
            size="xl"
            class="h-14 rounded-2xl bg-white/10 text-white font-black text-[11px] uppercase tracking-widest ring-1 ring-white/20 hover:bg-white/20 backdrop-blur-xl transition-all active:scale-95 px-8"
          >
            <template #leading>
              <Icon name="i-ph-arrow-left-duotone" class="h-5 w-5" />
            </template>
            {{ $t("pages.createEventPage.backToEvents") }}
          </UButton>

          <UButton
            size="xl"
            class="h-14 rounded-2xl bg-primary-600 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary-500/40 transition-all hover:bg-primary-700 active:scale-95 px-10 border-none"
            @click="$emit('quickFill')"
          >
            <template #leading>
              <Icon name="i-ph-sparkle-duotone" class="h-6 w-6" />
            </template>
            {{ $t("pages.createEventPage.quickFill") }}
          </UButton>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:w-[380px]">
        <div
          v-for="item in stats"
          :key="item.label"
          class="group/stat rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/10"
        >
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 group-hover/stat:text-primary-300 transition-colors">
            {{ item.label }}
          </p>
          <p class="mt-4 text-3xl font-black text-white leading-none tracking-tight">
            {{ item.value }}
          </p>
          <p class="mt-2 text-[10px] font-bold text-white/40 group-hover/stat:text-white/60 line-clamp-1">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stats: ReadonlyArray<{
    label: string
    value: string
    description: string
  }>
}>()

defineEmits<{
  quickFill: []
}>()
</script>
