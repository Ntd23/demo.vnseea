<template>
  <aside class="rounded-[30px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-label-secondary text-[var(--text-tertiary)]">Đang phát</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">Kênh live</h2>
      </div>
      <span class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">
        {{ streams.length }}
      </span>
    </div>

    <div class="mt-4 space-y-3">
      <button
        v-for="stream in streams"
        :key="stream.id"
        class="w-full rounded-[22px] border p-2 text-left transition"
        :class="stream.id === selectedId ? 'border-[var(--border-strong)] bg-[var(--color-primary-50)]' : 'border-[var(--border-default)] bg-white hover:bg-[var(--bg-surface-hover)]'"
        type="button"
        @click="$emit('select', stream.id)"
      >
        <div class="relative h-28 overflow-hidden rounded-[18px]">
          <img :alt="stream.title" class="h-full w-full object-cover" :src="stream.cover">
          <div class="absolute inset-0 bg-black/28" />
          <span class="absolute left-2 top-2 rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] font-extrabold text-white" :class="stream.status === 'live' ? 'bg-[var(--color-error)]' : 'bg-black/50'">
            {{ stream.status === "live" ? "LIVE" : "SẮP PHÁT" }}
          </span>
          <span class="absolute bottom-2 right-2 rounded-[var(--radius-full)] bg-black/52 px-2.5 py-1 text-[11px] font-bold text-white">
            {{ stream.duration }}
          </span>
        </div>
        <div class="mt-3 flex gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white" :style="{ background: stream.host.gradient }">
            {{ stream.host.initials }}
          </div>
          <div class="min-w-0">
            <h3 class="line-clamp-2 text-[14px] font-extrabold leading-5 text-[var(--text-primary)]">{{ stream.title }}</h3>
            <p class="mt-1 truncate text-[12px] font-semibold text-[var(--text-secondary)]">{{ stream.host.name }} · {{ stream.viewers }} xem</p>
          </div>
        </div>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { MockLiveStream } from "~/composables/useMockLiveData"

defineProps<{
  streams: ReadonlyArray<MockLiveStream>
  selectedId: string
}>()

defineEmits<{ select: [id: string] }>()
</script>
