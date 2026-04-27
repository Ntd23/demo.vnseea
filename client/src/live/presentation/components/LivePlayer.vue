<template>
  <section class="surface-card group overflow-hidden border-none ring-1 ring-secondary-100 shadow-2xl bg-secondary-900 text-white relative">
    <div class="relative min-h-[420px] overflow-hidden sm:min-h-[580px]">
      <img
        :alt="stream.title"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        :src="stream.cover"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-secondary-950 via-secondary-950/40 to-secondary-950/20" />

      <!-- Top Overlay -->
      <div class="absolute left-6 top-6 flex flex-wrap gap-3 z-10">
        <UBadge
          variant="solid"
          :color="stream.status === 'live' ? 'rose' : stream.status === 'scheduled' ? 'amber' : 'white'"
          class="rounded-full font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 shadow-lg"
          :class="{ 'animate-pulse': stream.status === 'live' }"
        >
          <template #leading>
            <span class="h-1.5 w-1.5 rounded-full bg-current" />
          </template>
          {{ statusLabel }}
        </UBadge>
        
        <UBadge
          variant="soft"
          color="white"
          class="rounded-full font-black text-[10px] uppercase tracking-widest px-4 py-2 bg-white/20 backdrop-blur-md text-white border-none shadow-lg"
        >
          {{ stream.category }}
        </UBadge>
      </div>

      <div class="absolute right-6 top-6 rounded-full bg-black/60 px-4 py-2 text-[11px] font-black tracking-widest backdrop-blur-md border border-white/10 shadow-lg z-10">
        {{ stream.duration }}
      </div>

      <!-- Play Button -->
      <div class="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xl border border-white/30 shadow-2xl cursor-pointer hover:scale-110 transition-transform duration-300 z-10 group/play">
        <div class="h-20 w-20 flex items-center justify-center rounded-full bg-white text-[var(--text-primary)] transition-colors group-hover/play:bg-primary-50">
          <Icon name="i-ph-play-fill" class="h-10 w-10 translate-x-1" />
        </div>
      </div>

      <!-- Bottom Content -->
      <div class="absolute inset-x-0 bottom-0 p-6 sm:p-10 z-10">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl space-y-3">
            <p class="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">{{ stream.startedAt }}</p>
            <h2 class="text-3xl font-black tracking-tight sm:text-5xl leading-tight">{{ stream.title }}</h2>
            <p class="max-w-2xl text-[14px] font-medium leading-relaxed text-white/80 line-clamp-2">{{ stream.description }}</p>
            <div class="flex flex-wrap gap-2 pt-2">
              <UBadge
                v-for="tag in stream.tags"
                :key="tag"
                variant="outline"
                color="white"
                class="rounded-full font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-white/10 border-white/20 text-white/90"
              >
                #{{ tag }}
              </UBadge>
            </div>
          </div>

          <div class="flex gap-3">
            <UButton
              size="xl"
              variant="soft"
              color="white"
              class="rounded-2xl font-black text-xs uppercase tracking-widest px-8 h-14 bg-white/15 backdrop-blur-md text-white border-none hover:bg-white/30 transition-all shadow-xl"
              @click="$emit('toggleMute')"
            >
              <template #leading>
                <Icon :name="muted ? 'i-ph-speaker-x-duotone' : 'i-ph-speaker-high-duotone'" class="h-6 w-6" />
              </template>
              {{ muted ? $t("pages.livePage.unmute") : $t("pages.livePage.mute") }}
            </UButton>
            
            <UButton
              size="xl"
              class="rounded-2xl font-black text-xs uppercase tracking-widest px-10 h-14 shadow-xl shadow-rose-500/30 bg-rose-600 hover:bg-rose-700 transition-all active:scale-95"
              @click="$emit('like')"
            >
              <template #leading>
                <Icon name="i-ph-heart-duotone" class="h-6 w-6" />
              </template>
              {{ stream.likes + localLikes }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid border-t border-white/10 bg-secondary-950/50 backdrop-blur-lg sm:grid-cols-3 divide-x divide-white/10">
      <div class="flex items-center gap-4 px-8 py-6">
        <UAvatar
          :src="`https://ui-avatars.com/api/?name=${stream.host.name}&background=0000ff&color=fff`"
          :alt="stream.host.name"
          size="lg"
          class="ring-2 ring-white/20"
          :ui="{ rounded: 'rounded-[14px]' }"
        />
        <div class="min-w-0">
          <p class="text-[13px] font-black uppercase tracking-widest text-white truncate">{{ stream.host.name }}</p>
          <p class="text-[10px] font-bold text-white/60 uppercase tracking-widest">{{ stream.host.role }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3 px-8 py-6 text-sm font-black uppercase tracking-widest">
        <Icon name="i-ph-eye-duotone" class="h-6 w-6 text-white" />
        <span class="text-white/80">
          {{ $t("pages.livePage.currentViewers", { count: stream.viewers + joinedViewers }) }}
        </span>
      </div>
      
      <div class="flex items-center gap-3 px-8 py-6 text-sm font-black uppercase tracking-widest">
        <Icon name="i-ph-broadcast-duotone" class="h-6 w-6 text-rose-500" />
        <span class="text-white/80">{{ $t("pages.livePage.playerReady") }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MockLiveStream } from "../../domain/types/live.types"

const props = defineProps<{
  stream: MockLiveStream
  muted: boolean
  localLikes: number
  joinedViewers: number
}>()

defineEmits<{ toggleMute: []; like: [] }>()

const { t } = useI18n()

const statusLabel = computed(() => {
  if (props.stream.status === "live") return t("pages.livePage.statusLive")
  if (props.stream.status === "scheduled") return t("pages.livePage.statusScheduled")
  return t("pages.livePage.statusEnded")
})
</script>
