<template>
  <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_20px_50px_rgba(15,35,110,0.08)]">
    <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div class="flex min-w-0 flex-col justify-between gap-10 bg-[#0f172a] p-8 text-white sm:p-12 lg:p-16 relative overflow-hidden">
        <!-- Background Accents -->
        <div class="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_70%)]" />
        
        <div class="relative space-y-8">
          <div class="flex flex-wrap items-center gap-3">
            <span class="inline-flex h-9 items-center rounded-2xl bg-white/10 px-4 text-[12px] font-black uppercase tracking-[0.15em] text-white backdrop-blur-xl border border-white/20">
              {{ $t("pages.livePage.heroEyebrow") }}
            </span>
            <span class="inline-flex h-9 items-center rounded-2xl bg-rose-600 px-4 text-[12px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-rose-600/30">
              LIVE NOW
            </span>
          </div>

          <div class="space-y-4">
            <h1 class="max-w-[720px] text-[42px] font-black leading-tight tracking-tight sm:text-[64px]">
              {{ $t("pages.livePage.heroTitle") }}
            </h1>
            <p class="max-w-xl text-[16px] font-medium leading-relaxed text-white/60">
              {{ $t("pages.livePage.heroDescription") }}
            </p>
          </div>

          <div class="flex flex-col gap-4 sm:flex-row pt-4">
            <UButton
              size="xl"
              class="h-16 rounded-2xl bg-white px-10 font-black text-[#0f172a] transition-all hover:bg-primary-50 active:scale-95 shadow-2xl"
              @click="$emit('goLive')"
            >
              <template #leading>
                <Icon name="i-ph-video-camera-fill" class="h-6 w-6 text-rose-600" />
              </template>
              {{ $t("pages.livePage.goLive") }}
            </UButton>
            
            <button
              class="flex h-16 items-center gap-3 rounded-2xl bg-white/10 px-8 text-[13px] font-black uppercase tracking-widest text-white backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all"
              @click="$emit('focusChat')"
            >
              <Icon name="i-ph-chat-circle-dots-fill" class="h-6 w-6" />
              {{ $t("pages.livePage.openChat") }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Sidebar Area -->
      <div class="bg-slate-50 p-8 lg:p-12 flex flex-col justify-center gap-4">
        <div 
          v-for="(item, index) in stats" 
          :key="item.label" 
          class="group/stat p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-x-2"
        >
          <div class="flex items-center justify-between mb-4">
            <p class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {{ item.label }}
            </p>
            <div class="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 text-[#0f172a]">
              <Icon :name="index === 0 ? 'i-ph-broadcast-fill' : index === 1 ? 'i-ph-users-fill' : 'i-ph-chat-teardrop-dots-fill'" class="h-4 w-4" />
            </div>
          </div>
          <p class="text-[32px] font-black tracking-tight text-[#0f172a] leading-none mb-1">
            {{ item.value }}
          </p>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
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
