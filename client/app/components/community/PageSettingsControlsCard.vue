<template>
  <CommunitySettingsSectionCard
    :eyebrow="$t('community.pageSettings.controls.eyebrow')"
    :title="$t('community.pageSettings.controls.title')"
    :description="$t('community.pageSettings.controls.desc')"
    icon="i-ph-cursor-click-bold"
  >
    <template #trailing>
      <UBadge color="neutral" variant="soft" class="rounded-full px-4 py-2 text-[12px] font-semibold text-[#243b63]">
        {{ selectedCtaLabel }}
      </UBadge>
    </template>

    <div class="space-y-5">
      <div>
        <p class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0000ff]/65">
          {{ $t("community.pageSettings.controls.preset") }}
        </p>

        <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="option in ctaOptions"
            :key="option.value"
            class="rounded-[22px] border px-4 py-4 text-left transition"
            :class="selectedCtaLabel === option.labelText
              ? 'border-[#0000ff]/22 bg-[#eef0ff] shadow-[0_12px_24px_rgba(0,0,255,0.08)]'
              : 'border-[#dbe3f2] bg-white hover:border-[#c5caff] hover:bg-[#f8fbff]'"
            type="button"
            :aria-pressed="selectedCtaLabel === option.labelText"
            @click="model.ctaLabel = option.labelText"
          >
            <div class="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-[#0000ff] shadow-[0_8px_18px_rgba(15,35,110,0.05)]">
              <Icon :name="option.icon || 'i-ph-circle-fill'" class="h-5 w-5" />
            </div>
            <p class="mt-4 text-[14px] font-black text-[#243b63]">
              {{ option.labelText }}
            </p>
            <p class="mt-2 text-[12px] leading-5 text-slate-500">
              {{ option.descriptionText }}
            </p>
          </button>
        </div>
      </div>

      <UAlert
        color="neutral"
        variant="subtle"
        icon="i-ph-info-fill"
        :title="$t('community.pageSettings.controls.logic')"
        :description="logicDescription"
        class="rounded-[20px]"
      />

      <div class="grid gap-3 lg:grid-cols-2">
        <div
          v-for="toggle in toggleItems"
          :key="toggle.key"
          class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-4"
        >
          <USwitch
            v-model="model[toggle.key]"
            color="primary"
            size="lg"
            :label="toggle.label"
            :description="toggle.description"
            class="items-start"
          />
        </div>
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import { communityPageCtaOptions } from "../../../types/community"
import type { CommunityPageSettingsDraft } from "../../../types/community"

const model = defineModel<CommunityPageSettingsDraft>({ required: true })
const { t } = useI18n()

const ctaOptions = computed(() =>
  communityPageCtaOptions.map(option => ({
    ...option,
    labelText: t(option.label),
    descriptionText: option.description ? t(option.description) : "",
  })),
)

const selectedCtaLabel = computed(() =>
  model.value.ctaLabel.trim() ? model.value.ctaLabel : t("community.pageSettings.basics.stats.ctaFallback"),
)

const logicDescription = computed(() =>
  t("community.pageSettings.controls.logicDesc", { cta: selectedCtaLabel.value.toLowerCase() }).replaceAll("**", ""),
)

const toggleItems = computed(() => [
  {
    key: "allowMessages" as const,
    label: t("community.pageSettings.controls.toggles.messagesLabel"),
    description: t("community.pageSettings.controls.toggles.messagesDesc"),
  },
  {
    key: "showFollowerCount" as const,
    label: t("community.pageSettings.controls.toggles.followersLabel"),
    description: t("community.pageSettings.controls.toggles.followersDesc"),
  },
  {
    key: "showLikeCount" as const,
    label: t("community.pageSettings.controls.toggles.likesLabel"),
    description: t("community.pageSettings.controls.toggles.likesDesc"),
  },
  {
    key: "showWebsite" as const,
    label: t("community.pageSettings.controls.toggles.websiteLabel"),
    description: t("community.pageSettings.controls.toggles.websiteDesc"),
  },
  {
    key: "recommendRelatedPages" as const,
    label: t("community.pageSettings.controls.toggles.relatedLabel"),
    description: t("community.pageSettings.controls.toggles.relatedDesc"),
  },
])
</script>
