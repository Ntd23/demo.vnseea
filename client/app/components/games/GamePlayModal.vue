<template>
  <Teleport to="body">
    <div v-if="game" class="fixed inset-0 z-50 flex items-end justify-center bg-black/42 px-3 py-4 backdrop-blur-[2px] sm:items-center" @click.self="$emit('close')">
      <section class="w-full max-w-[760px] overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-xl)]">
        <div class="relative h-64 overflow-hidden bg-[var(--color-secondary-900)]">
          <img :alt="game.title" class="absolute inset-0 h-full w-full object-cover" :src="game.cover">
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.82))]" />
          <button class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur" type="button" @click="$emit('close')">
            <Icon name="i-ph-x-bold" class="h-4 w-4" />
          </button>
          <div class="absolute bottom-5 left-5 right-5">
            <p class="text-[12px] font-extrabold uppercase tracking-[0.16em] text-white/72">{{ game.categoryLabel }}</p>
            <h2 class="mt-2 text-3xl font-black leading-tight text-white">{{ game.title }}</h2>
          </div>
        </div>

        <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div class="p-5">
            <div class="rounded-[24px] bg-[var(--bg-surface-hover)] p-5 text-center">
              <p class="text-label-secondary text-[var(--text-tertiary)]">{{ $t('community.games.modal.mockPlayArea') }}</p>
              <p class="mt-2 text-[3rem] font-black leading-none text-[var(--color-primary-600)]">{{ score }}</p>
              <p class="mt-2 text-[14px] font-semibold text-[var(--text-secondary)]">
                {{ $t('community.games.modal.mockDesc') }}
              </p>
              <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button class="h-12 rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-6 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)]" type="button" @click="score += scoreStep">
                  {{ $t('community.games.modal.scoreBtn') }}
                </button>
                <button class="h-12 rounded-[var(--radius-full)] border border-[var(--border-default)] bg-white px-6 text-[14px] font-extrabold text-[var(--color-primary-600)]" type="button" @click="finish">
                  {{ $t('community.games.modal.finishBtn') }}
                </button>
              </div>
            </div>

            <div v-if="finished" class="mt-4 rounded-[18px] bg-[var(--color-primary-50)] px-4 py-3 text-[13px] font-bold text-[var(--color-primary-600)]">
              {{ $t('community.games.modal.savedMsg', { score }) }}
            </div>
          </div>

          <aside class="border-t border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-5 lg:border-l lg:border-t-0">
            <p class="text-label-secondary text-[var(--text-tertiary)]">{{ $t('community.games.modal.sessionInfo') }}</p>
            <div class="mt-4 space-y-3">
              <div class="rounded-[18px] bg-white p-3">
                <p class="text-[12px] font-bold text-[var(--text-tertiary)]">{{ $t('community.games.modal.bestScore') }}</p>
                <p class="mt-1 text-[20px] font-black text-[var(--text-primary)]">{{ bestScore }}</p>
              </div>
              <div class="rounded-[18px] bg-white p-3">
                <p class="text-[12px] font-bold text-[var(--text-tertiary)]">{{ $t('community.games.modal.duration') }}</p>
                <p class="mt-1 text-[20px] font-black text-[var(--text-primary)]">{{ duration }}</p>
              </div>
              <div class="rounded-[18px] bg-white p-3">
                <p class="text-[12px] font-bold text-[var(--text-tertiary)]">{{ $t('community.games.modal.status') }}</p>
                <p class="mt-1 text-[14px] font-extrabold text-[var(--color-primary-600)]">{{ finished ? $t('community.games.modal.finished') : $t('community.games.modal.playing') }}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { GameSessionPayload, MockGame } from "~/composables/useMockGamesData"

const props = defineProps<{
  game?: MockGame
  bestScore: number
}>()

const emit = defineEmits<{
  close: []
  finish: [payload: GameSessionPayload]
}>()

const score = ref(0)
const finished = ref(false)
const startedAt = ref(Date.now())
const scoreStep = 150

const duration = computed(() => {
  const seconds = Math.max(1, Math.round((Date.now() - startedAt.value) / 1000))
  return `00:${seconds.toString().padStart(2, "0")}`
})

watch(() => props.game?.id, () => {
  score.value = 0
  finished.value = false
  startedAt.value = Date.now()
})

const finish = () => {
  if (!props.game) return
  finished.value = true
  emit("finish", {
    gameId: props.game.id,
    score: score.value,
    duration: duration.value,
  })
}
</script>
