<template>
  <section class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-[var(--color-secondary-900)] text-white shadow-[var(--shadow-xl)]">
    <div class="relative min-h-[360px] overflow-hidden sm:min-h-[500px]">
      <img
        :alt="stream.title"
        class="absolute inset-0 h-full w-full object-cover"
        :src="stream.cover"
      >
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.34),rgba(15,23,42,0.82))]" />

      <div class="absolute left-4 top-4 flex flex-wrap gap-2">
        <span
          class="inline-flex items-center gap-2 rounded-[var(--radius-full)] px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.12em]"
          :class="statusClasses"
        >
          <span class="h-2 w-2 rounded-full bg-current" />
          {{ statusLabel }}
        </span>
        <span class="rounded-[var(--radius-full)] bg-white/16 px-3 py-2 text-[12px] font-bold backdrop-blur">
          {{ stream.category }}
        </span>
      </div>

      <div class="absolute right-4 top-4 rounded-[var(--radius-full)] bg-black/40 px-3 py-2 text-[12px] font-extrabold backdrop-blur">
        {{ stream.duration }}
      </div>

      <div class="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            <p class="text-[13px] font-bold text-white/74">{{ stream.startedAt }}</p>
            <h2 class="mt-2 text-2xl font-black leading-tight sm:text-4xl">{{ stream.title }}</h2>
            <p class="mt-3 max-w-2xl text-[14px] font-semibold leading-6 text-white/78">{{ stream.description }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span v-for="tag in stream.tags" :key="tag" class="rounded-[var(--radius-full)] bg-white/16 px-3 py-1.5 text-[12px] font-extrabold text-white">
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              class="inline-flex h-12 min-w-[120px] items-center justify-center gap-2 rounded-[var(--radius-full)] bg-white px-4 text-[14px] font-extrabold text-[var(--color-primary-600)]"
              type="button"
              @click="$emit('toggleMute')"
            >
              <Icon :name="muted ? 'i-ph-speaker-x-fill' : 'i-ph-speaker-high-fill'" class="h-5 w-5" />
              {{ muted ? $t("pages.livePage.unmute") : $t("pages.livePage.mute") }}
            </button>
            <button
              class="inline-flex h-12 min-w-[110px] items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-4 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)]"
              type="button"
              @click="$emit('like')"
            >
              <Icon name="i-ph-heart-fill" class="h-5 w-5" />
              {{ stream.likes + localLikes }}
            </button>
          </div>
        </div>
      </div>

      <div class="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur">
        <Icon name="i-ph-play-fill" class="h-9 w-9 translate-x-0.5" />
      </div>
    </div>

    <div class="grid border-t border-white/10 bg-[var(--color-secondary-900)] sm:grid-cols-3">
      <div class="flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:border-b-0 sm:border-r">
        <div class="flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-black text-white" :style="{ background: stream.host.gradient }">
          {{ stream.host.initials }}
        </div>
        <div>
          <p class="text-[14px] font-extrabold">{{ stream.host.name }}</p>
          <p class="text-[12px] font-semibold text-white/58">{{ stream.host.role }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 border-b border-white/10 px-5 py-4 text-[14px] font-bold text-white/78 sm:border-b-0 sm:border-r">
        <Icon name="i-ph-eye-fill" class="h-5 w-5 text-white" />
        {{ $t("pages.livePage.currentViewers", { count: stream.viewers + joinedViewers }) }}
      </div>
      <div class="flex items-center gap-2 px-5 py-4 text-[14px] font-bold text-white/78">
        <Icon name="i-ph-broadcast-fill" class="h-5 w-5 text-[var(--color-error)]" />
        {{ $t("pages.livePage.playerReady") }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MockLiveStream } from "~/composables/useMockLiveData"

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

const statusClasses = computed(() => {
  if (props.stream.status === "live") return "bg-[var(--color-error)] text-white"
  if (props.stream.status === "scheduled") return "bg-[var(--color-warning)] text-white"
  return "bg-white/16 text-white"
})
</script>
