<template>
  <section class="rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-md)]">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-brand)]/70">
          {{ compact ? t("pages.groupDetailPage.aboutCompactEyebrow") : t("pages.groupDetailPage.aboutEyebrow") }}
        </p>
        <h3 class="mt-2 text-[1.2rem] font-black tracking-[-0.04em] text-[var(--text-primary)]">
          {{ compact ? t("pages.groupDetailPage.aboutCompactTitle") : groupName }}
        </h3>
      </div>

      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[color-mix(in_srgb,var(--bg-brand)_10%,transparent)] text-[var(--text-brand)]">
        <Icon :name="compact ? 'i-ph-info-bold' : 'i-ph-identification-card-bold'" class="h-5 w-5" />
      </div>
    </div>

    <p class="mt-4 text-[14px] leading-7 text-[var(--text-secondary)]">
      {{ groupSummary }}
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-[18px] bg-[var(--bg-muted)] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-brand)]/65">{{ t("pages.groupDetailPage.privacyTitle") }}</p>
        <p class="mt-1 text-[13px] font-semibold text-[var(--text-primary)]">{{ privacyLabel }}</p>
        <p class="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">{{ privacyDescription }}</p>
      </div>
      <div class="rounded-[18px] bg-[var(--bg-muted)] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-brand)]/65">{{ t("pages.groupDetailPage.categoryTitle") }}</p>
        <p class="mt-1 text-[13px] font-semibold text-[var(--text-primary)]">{{ categoryLabel }}</p>
        <p class="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">{{ locationLabel }}</p>
      </div>
    </div>

    <div v-if="!compact || group.website" class="mt-4 space-y-2 text-[13px] text-[var(--text-secondary)]">
      <!-- Founded Date: Only show in the full about card (not compact) -->
      <div v-if="!compact" class="flex items-start gap-2">
        <Icon name="i-ph-calendar-blank-bold" class="mt-0.5 h-4 w-4 text-[var(--text-brand)]/70" />
        <span>{{ foundedLabel }}</span>
      </div>

      <!-- Website: Show if available -->
      <div v-if="group.website" class="flex items-start gap-2">
        <Icon name="i-ph-link-simple-bold" class="mt-0.5 h-4 w-4 text-[var(--text-brand)]/70" />
        <a
          :href="websiteHref"
          class="break-all text-[var(--text-brand)] underline decoration-[var(--color-primary-200)] underline-offset-4 transition hover:text-[var(--text-brand)]"
          rel="noopener noreferrer"
          target="_blank"
        >
          {{ group.website }}
        </a>
      </div>
    </div>

    <div v-if="!compact && group.guidelines?.length" class="mt-5">
      <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-brand)]/70">
        {{ t("pages.groupDetailPage.guidelinesTitle") }}
      </p>
      <div class="mt-3 space-y-2.5">
        <div
          v-for="rule in group.guidelines"
          :key="rule"
          class="rounded-[18px] bg-[var(--bg-muted)] px-4 py-3 text-[13px] leading-6 text-[var(--text-secondary)]"
        >
          {{ translateText(rule) }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupRecord } from "../../domain/types/community.types"

const { t } = useI18n()
const translateText = useMaybeTranslatedText()

const props = withDefaults(defineProps<{
  group: CommunityGroupRecord
  privacyLabel: string
  privacyDescription: string
  categoryLabel: string
  memberCountLabel: string
  compact?: boolean
}>(), {
  compact: false,
})

const groupSummary = computed(() =>
  translateText(props.group.summary),
)

const groupName = computed(() =>
  translateText(props.group.name),
)

const locationLabel = computed(() =>
  translateText(props.group.locationLabel),
)

const foundedLabel = computed(() =>
  translateText(props.group.foundedLabel),
)

const websiteHref = computed(() => {
  if (!props.group.website) return "#"
  return props.group.website.startsWith("http") ? props.group.website : `https://${props.group.website}`
})
</script>
