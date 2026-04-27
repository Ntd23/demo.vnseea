<template>
  <section class="surface-card group overflow-hidden border-none ring-1 ring-secondary-100 shadow-2xl relative">
    <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
      <!-- Main Hero Content -->
      <div class="relative overflow-hidden p-8 sm:p-12 lg:p-16">
        <!-- Abstract Background -->
        <div class="pointer-events-none absolute inset-0 opacity-40">
          <div class="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-500/10 blur-[100px]" />
          <div class="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-sky-500/10 blur-[100px]" />
        </div>

        <div class="relative space-y-8">
          <UBadge
            variant="soft"
            color="primary"
            class="rounded-full font-black text-[10px] uppercase tracking-[0.3em] px-5 py-1.5 ring-1 ring-inset ring-primary-100"
          >
            <template #leading>
              <span class="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            </template>
            {{ $t("pages.livePage.heroEyebrow") }}
          </UBadge>

          <div class="space-y-4">
            <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-[var(--text-primary)] leading-[1.05]">
              {{ $t("pages.livePage.heroTitle") }}
            </h1>
            <p class="max-w-[620px] text-base font-medium leading-relaxed text-[var(--text-primary)]">
              {{ $t("pages.livePage.heroDescription") }}
            </p>
          </div>

          <div class="flex flex-col gap-4 sm:flex-row pt-4">
            <UButton
              size="xl"
              class="rounded-2xl font-black text-xs uppercase tracking-widest px-10 h-14 shadow-xl shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 transition-all active:scale-95"
              @click="$emit('goLive')"
            >
              <template #leading>
                <Icon name="i-ph-video-camera-duotone" class="h-6 w-6" />
              </template>
              {{ $t("pages.livePage.goLive") }}
            </UButton>
            
            <UButton
              size="xl"
              variant="soft"
              color="white"
              class="rounded-2xl font-black text-xs uppercase tracking-widest px-8 h-14 ring-1 ring-secondary-200 hover:ring-primary-500 transition-all bg-white shadow-sm"
              @click="$emit('focusChat')"
            >
              <template #leading>
                <Icon name="i-ph-chat-circle-dots-duotone" class="h-6 w-6 text-[var(--text-primary)]" />
              </template>
              {{ $t("pages.livePage.openChat") }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Stats Sidebar Area -->
      <div class="border-t border-secondary-50 bg-secondary-50/20 p-8 lg:border-l lg:border-t-0 flex flex-col justify-center gap-4">
        <div 
          v-for="item in stats" 
          :key="item.label" 
          class="surface-card p-6 ring-1 ring-secondary-50 bg-white/60 hover:bg-white hover:ring-primary-200 hover:shadow-xl transition-all duration-500 group/stat"
        >
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)] mb-3 transition-transform group-hover/stat:translate-x-1">
            {{ item.label }}
          </p>
          <p class="text-3xl font-black tracking-tight text-[var(--text-primary)] mb-1">
            {{ item.value }}
          </p>
          <p class="text-[11px] font-bold tracking-wide text-[var(--text-primary)] uppercase">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
}>()

defineEmits<{ goLive: []; focusChat: [] }>()
</script>
