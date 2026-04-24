<template>
  <article class="surface-card group overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl ring-1 ring-secondary-200/50 hover:ring-primary-500/20 relative bg-white rounded-3xl">
    <div class="h-2 w-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 shadow-sm" />

    <div class="p-8 space-y-8">
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 items-center gap-5">
          <div class="relative shrink-0">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-2xl text-sm font-black text-white shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-primary-500/30 ring-1 ring-white/20"
              :style="{ background: accentBackground }"
            >
              {{ record.initials }}
            </div>

            <div
              v-if="record.online"
              class="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[3px] border-white bg-sky-500 shadow-lg shadow-sky-500/20"
            />
          </div>

          <div class="min-w-0 space-y-1">
            <p class="truncate text-lg font-black tracking-tight text-secondary-900 group-hover:text-secondary-900 transition-colors">
              {{ record.name }}
            </p>
            <p class="truncate text-sm font-semibold text-secondary-500">
              {{ record.role }}
            </p>
            <div class="flex items-center gap-2">
              <Icon name="i-ph-clock-duotone" class="h-3 w-3 text-primary-400" />
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-900">
                {{ record.timeLabel }}
              </p>
            </div>
          </div>
        </div>

        <UBadge 
          variant="soft" 
          class="rounded-xl font-black text-[9px] uppercase tracking-widest px-3 py-2 bg-secondary-50 text-secondary-500 ring-1 ring-secondary-100 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:ring-primary-200 transition-all shadow-sm"
        >
          {{ record.mutualLabel }}
        </UBadge>
      </div>

      <div class="rounded-2xl bg-secondary-50/50 p-6 space-y-4 ring-1 ring-secondary-100/50 transition-all group-hover:bg-white group-hover:ring-primary-100 group-hover:shadow-lg group-hover:shadow-primary-500/5">
        <div class="flex items-center justify-between gap-2 border-b border-secondary-100/50 pb-4">
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-400">{{ t("pages.pokePage.pokeCountLabel") }}</p>
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 truncate">
            {{ record.online ? t("pages.pokePage.activeNow") : record.role }}
          </p>
        </div>
        
        <div class="flex items-center justify-between gap-2">
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-400">{{ t("pages.pokePage.pokeActionLabel") }}</p>
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 truncate italic">"{{ record.contextLabel }}"</p>
        </div>

        <p class="text-sm font-medium leading-relaxed text-secondary-500">
          {{ record.note }}
        </p>
      </div>

      <div class="flex flex-col gap-3 pt-2">
        <UButton
          size="xl"
          class="h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-600/20 transition-all active:scale-95 border-none"
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
          class="h-14 rounded-2xl bg-white text-secondary-500 ring-1 ring-secondary-200/50 hover:bg-secondary-50 hover:text-secondary-900 hover:ring-secondary-300 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95"
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
