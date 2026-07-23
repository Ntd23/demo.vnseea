<!-- Description: Renders one backend-backed incoming poke request with a focused poke-back action. -->
<template>
  <article class="poke-request-card">
    <NuxtLink :to="record.href" class="poke-request-card__person">
      <span class="poke-request-card__avatar">
        <img 
          v-if="record.avatarUrl" 
          :src="record.avatarUrl" 
          :alt="record.name" 
          class="h-full w-full object-cover"
          @error="(e: any) => e.target.src = '/img/user.png'"
        >
        <span v-else class="poke-request-card__initials">
          {{ record.initials }}
        </span>
      </span>
      
      <span class="poke-request-card__identity">
        <span class="poke-request-card__name">
          {{ record.name }}
        </span>
        <span class="poke-request-card__meta">
          {{ record.mutualLabel || record.role }}
        </span>
      </span>
    </NuxtLink>

    <div class="poke-request-card__details">
      <span class="poke-request-card__pill" :data-online="record.online ? 'true' : 'false'">
        <span class="poke-request-card__dot" />
        {{ record.online ? t("pages.pokePage.activeNow") : t("pages.pokePage.offlineStatus") }}
      </span>
      <span class="poke-request-card__time">
        <Icon name="i-ph-clock-duotone" class="h-4 w-4" />
        {{ displayTime }}
      </span>
    </div>

    <UButton
      class="poke-request-card__action"
      color="primary"
      :variant="pokedBack ? 'soft' : 'solid'"
      :loading="responding"
      :disabled="pokedBack"
      :icon="pokedBack ? 'i-ph-check-circle-duotone' : 'i-ph-hand-pointing-duotone'"
      @click="$emit('poke', record.id)"
    >
      {{ pokedBack ? t("pages.pokePage.invitationSent") : t("pages.pokePage.pokeBack") }}
    </UButton>
  </article>
</template>

<script setup lang="ts">
import { useNow } from "@vueuse/core"
import type { PokeRecord } from "../../application/composables/usePokeData"

const props = defineProps<{
  record: PokeRecord
  pokedBack: boolean
  responding: boolean
}>()

const { t } = useI18n()

defineEmits<{
  poke: [id: string]
}>()

const now = useNow({ interval: 30000 })
const displayTime = computed(() => {
  const timestamp = props.record.timestamp
  if (!timestamp) return props.record.timeLabel

  const diffInSeconds = Math.floor((now.value.getTime() - timestamp * 1000) / 1000)
  
  if (diffInSeconds < 60) {
    return t('pages.pokePage.justNow')
  }
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return t('pages.pokePage.minuteAgo', { count: minutes })
  }
  
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return t('pages.pokePage.hoursAgo', { count: hours })
  }

  return props.record.timeLabel
})
</script>

<style scoped>
.poke-request-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.poke-request-card__person {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.poke-request-card__avatar {
  display: grid;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
}

.poke-request-card__initials {
  color: var(--bg-brand);
  font-size: 15px;
  font-weight: 800;
}

.poke-request-card__identity {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.poke-request-card__name {
  overflow: hidden;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poke-request-card__meta {
  overflow: hidden;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poke-request-card__details {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 8px;
}

.poke-request-card__pill,
.poke-request-card__time {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: #f8fafc;
  padding: 6px 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.poke-request-card__pill[data-online="true"] {
  background: #ecfdf5;
  color: #047857;
}

.poke-request-card__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.poke-request-card__action {
  justify-content: center;
  border-radius: 12px;
  font-weight: 800;
}

@media (min-width: 720px) {
  .poke-request-card {
    grid-template-columns: minmax(220px, 1fr) minmax(180px, auto) 160px;
    align-items: center;
    padding: 16px;
  }

  .poke-request-card__details {
    justify-content: flex-end;
  }
}
</style>
