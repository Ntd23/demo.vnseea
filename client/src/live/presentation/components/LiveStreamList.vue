<template>
  <aside class="surface-card flex flex-col overflow-hidden border-none ring-1 ring-secondary-100 shadow-xl bg-white p-6">
    <div class="flex items-center justify-between gap-4 mb-6 px-1">
      <div class="space-y-1">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
          {{ $t("pages.livePage.streamsEyebrow") }}
        </p>
        <h2 class="text-xl font-black tracking-tight text-[var(--text-primary)] leading-none">
          {{ $t("pages.livePage.streamsTitle") }}
        </h2>
      </div>
      <UBadge
        variant="soft"
        color="primary"
        class="rounded-full font-black text-[10px] uppercase tracking-widest px-3 py-1 ring-1 ring-inset ring-primary-100"
      >
        {{ streams.length }}
      </UBadge>
    </div>

    <div class="space-y-4 overflow-y-auto pr-1 scrollbar-hide">
      <button
        v-for="stream in streams"
        :key="stream.id"
        class="w-full text-left transition-all duration-300 group/item relative"
        type="button"
        @click="$emit('select', stream.id)"
      >
        <div 
          class="surface-card p-3 ring-1 ring-secondary-100 shadow-sm group-hover/item:shadow-xl group-hover/item:ring-primary-500/30 group-hover/item:-translate-y-1 transition-all duration-500"
          :class="stream.id === selectedId ? 'bg-primary-50/40 ring-primary-500/40 shadow-xl' : 'bg-white'"
        >
          <div class="relative h-40 overflow-hidden rounded-2xl mb-4 group/img">
            <img 
              :alt="stream.title" 
              class="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110" 
              :src="stream.cover"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            
            <div class="absolute left-3 top-3 flex gap-2">
              <UBadge
                variant="solid"
                :color="stream.status === 'live' ? 'rose' : 'black'"
                class="rounded-lg font-black text-[9px] uppercase tracking-widest px-2.5 py-1 shadow-lg"
                :class="{ 'animate-pulse': stream.status === 'live' }"
              >
                {{ stream.status === "live" ? $t("pages.livePage.statusLiveUpper") : stream.status === "scheduled" ? $t("pages.livePage.statusScheduledUpper") : $t("pages.livePage.statusEndedUpper") }}
              </UBadge>
            </div>

            <span class="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-black tracking-widest text-white backdrop-blur-md border border-white/10 shadow-lg">
              {{ stream.duration }}
            </span>
          </div>

          <div class="flex gap-4 px-1">
            <UAvatar
              :src="`https://ui-avatars.com/api/?name=${stream.host.name}&background=0000ff&color=fff`"
              :alt="stream.host.name"
              size="sm"
              class="ring-2 ring-white shadow-sm shrink-0"
              :ui="{ rounded: 'rounded-[12px]' }"
            />
            <div class="min-w-0 space-y-1">
              <h3 class="line-clamp-2 text-[13px] font-black leading-tight text-[var(--text-primary)] group-hover/item:text-secondary-900 transition-colors uppercase tracking-tight">{{ stream.title }}</h3>
              <div class="flex items-center gap-2">
                <p class="truncate text-[10px] font-bold text-[var(--text-primary)]">
                  {{ stream.host.name }}
                </p>
                <span class="h-1 w-1 rounded-full bg-secondary-200" />
                <p class="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                  {{ $t("pages.livePage.viewerCountShort", { count: stream.viewers }) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { MockLiveStream } from "../../domain/types/live.types"

defineProps<{
  streams: ReadonlyArray<MockLiveStream>
  selectedId: string
}>()

defineEmits<{ select: [id: string] }>()
</script>
