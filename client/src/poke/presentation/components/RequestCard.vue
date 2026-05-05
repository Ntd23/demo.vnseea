<!-- Description: Renders one API-backed poke request card and exposes real poke-back and remove actions. -->
<template>
  <article class="surface-card group relative overflow-hidden rounded-[18px] bg-white ring-1 ring-secondary-200/50 transition-all duration-500 hover:-translate-y-2 hover:ring-primary-500/20 hover:shadow-[0_12px_32px_rgba(37,99,235,0.12)]">
    <div class="h-2 w-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 shadow-sm" />

    <div class="p-8 space-y-8">
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 items-center gap-5">
          <div class="relative shrink-0">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-2xl text-sm font-extrabold text-white shadow-[0_4px_14px_rgba(0,0,255,0.2)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ring-1 ring-white/20"
              :style="{ background: accentBackground }"
            >
              <img v-if="record.avatarUrl" :src="record.avatarUrl" :alt="record.name" class="h-full w-full rounded-2xl object-cover">
              <span v-else>{{ record.initials }}</span>
            </div>

            <div
              v-if="record.online"
              class="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[3px] border-white bg-sky-500 shadow-lg shadow-sky-500/20"
            />
          </div>

          <div class="min-w-0 space-y-1">
            <p class="truncate text-lg font-extrabold tracking-tight text-secondary-900 transition-colors group-hover:text-secondary-900">
              {{ record.name }}
            </p>
            <p class="truncate text-sm font-semibold text-secondary-500">
              {{ record.role }}
            </p>
            <div class="flex items-center gap-2">
              <Icon name="i-ph-clock-duotone" class="h-3 w-3 text-primary-400" />
              <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                {{ record.timeLabel }}
              </p>
            </div>
          </div>
        </div>

        <UBadge 
          variant="soft" 
          class="rounded-xl bg-secondary-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-secondary-500 ring-1 ring-secondary-100 transition-all shadow-sm group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:ring-primary-200"
        >
          {{ record.mutualLabel }}
        </UBadge>
      </div>

      <div class="rounded-2xl bg-secondary-50/50 p-6 space-y-4 ring-1 ring-secondary-100/50 transition-all group-hover:bg-white group-hover:ring-primary-100 group-hover:shadow-lg group-hover:shadow-primary-500/5">
        <div class="flex items-center justify-between gap-2 border-b border-secondary-100/50 pb-4">
          <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">{{ t("pages.pokePage.pokeCountLabel") }}</p>
          <p class="truncate text-[11px] font-semibold text-secondary-900">
            {{ record.online ? t("pages.pokePage.activeNow") : record.role }}
          </p>
        </div>
        
        <div class="flex items-center justify-between gap-2">
          <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">{{ t("pages.pokePage.pokeActionLabel") }}</p>
          <p class="truncate text-[11px] font-semibold italic text-secondary-900">"{{ record.contextLabel }}"</p>
        </div>

        <p class="text-sm font-medium leading-relaxed text-secondary-500">
          {{ record.note }}
        </p>
      </div>

      <div class="flex flex-col gap-3 pt-2">
        <UButton
          size="xl"
          class="h-14 rounded-xl border-none bg-primary-600 text-[11px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_4px_14px_rgba(0,0,255,0.2)] transition-all hover:bg-primary-700 active:scale-95"
          @click="$emit('poke', record.id)"
        >
          <template #leading>
            <Icon :name="pokedBack ? 'i-ph-check-circle-duotone' : 'i-ph-hand-pointing-duotone'" class="h-5 w-5 mr-1" />
          </template>
          {{ pokedBack ? t("pages.pokePage.invitationSent") : t("pages.pokePage.pokeBack") }}
        </UButton>

        <UButton
          v-if="!pokedBack"
          variant="soft"
          size="xl"
          class="h-14 rounded-xl bg-white text-[11px] font-semibold uppercase tracking-[0.06em] text-secondary-500 ring-1 ring-secondary-200/50 transition-all hover:bg-secondary-50 hover:text-secondary-900 hover:ring-secondary-300 active:scale-95"
          @click="$emit('remove', record.id)"
        >
          <template #leading>
             <Icon name="i-ph-trash-duotone" class="h-5 w-5 mr-1" />
          </template>
          {{ t("pages.pokePage.deletePoke") }}
        </UButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PokeRecord } from "../../application/composables/usePokeData"

const props = defineProps<{
  record: PokeRecord
  pokedBack: boolean
}>()

const { t } = useI18n()

defineEmits<{
  poke: [id: string]
  remove: [id: string]
}>()

const accentBackground = computed(() =>
  `linear-gradient(135deg, ${props.record.accent} 0%, #0000ff 100%)`,
)
</script>
