<template>
  <article class="overflow-hidden rounded-[30px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,35,110,0.12)]">
    <div class="h-1.5 w-full" :style="{ background: accentBackground }" />

    <div class="space-y-5 px-5 py-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <div class="relative">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-[18px] text-[1rem] font-black text-white shadow-[0_14px_28px_rgba(15,35,110,0.18)]"
              :style="{ background: accentBackground }"
            >
              {{ record.initials }}
            </div>

            <span
              v-if="record.online"
              class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500"
            />
          </div>

          <div class="min-w-0">
            <NuxtLink
              :to="record.href"
              class="block truncate text-[1.1rem] font-black tracking-[-0.03em] text-[#243b63] transition hover:text-[#0000ff]"
            >
              {{ record.name }}
            </NuxtLink>
            <p class="mt-1 text-[13px] font-semibold text-slate-500">
              {{ record.role }}
            </p>
          </div>
        </div>

        <span class="inline-flex shrink-0 items-center rounded-full bg-[#eef3ff] px-3 py-1 text-[11px] font-bold text-[#243b63]">
          {{ record.timeLabel }}
        </span>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
            {{ t("pages.pokePage.connectionLabel") }}
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
            {{ record.mutualLabel }}
          </p>
        </div>

        <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
            {{ t("pages.pokePage.contextLabel") }}
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
            {{ record.contextLabel }}
          </p>
        </div>
      </div>

      <p class="text-[14px] leading-7 text-slate-600">
        {{ record.note }}
      </p>

      <div class="flex flex-col gap-2 sm:flex-row">
        <button
          class="inline-flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-bold text-white shadow-[0_10px_20px_rgba(0,0,255,0.18)] transition hover:-translate-y-0.5"
          :style="{ background: accentBackground }"
          type="button"
          @click="$emit('poke', record.id)"
        >
          <Icon :name="pokedBack ? 'i-ph-check-bold' : 'i-ph-hand-waving-bold'" class="mr-2 h-4 w-4" />
          {{ pokedBack ? t("pages.pokePage.pokedBackAction") : t("pages.pokePage.pokeBackAction") }}
        </button>

        <NuxtLink
          :to="record.href"
          class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        >
          {{ t("pages.pokePage.viewProfile") }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MockPokeRecord } from "~/composables/useMockPokeData"

const props = defineProps<{
  record: MockPokeRecord
  pokedBack: boolean
}>()

const { t } = useI18n()

defineEmits<{
  poke: [id: string]
}>()

const accentBackground = computed(() =>
  `linear-gradient(135deg, ${props.record.accent} 0%, #0000ff 100%)`,
)
</script>
