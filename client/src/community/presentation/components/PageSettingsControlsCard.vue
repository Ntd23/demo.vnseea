<template>
  <CommunitySettingsSectionCard
    :eyebrow="$t('community.pageSettings.controls.eyebrow')"
    :title="$t('community.pageSettings.controls.title')"
    :description="$t('community.pageSettings.controls.desc')"
    icon="i-ph-cursor-click-bold"
  >
    <template #trailing>
      <span class="page-settings-controls__selected">
        {{ selectedCtaLabel }}
      </span>
    </template>

    <div class="page-settings-controls space-y-5">
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

      <div class="page-settings-controls__info">
        <Icon name="i-ph-info-fill" class="h-5 w-5" />
        <div>
          <p>{{ $t('community.pageSettings.controls.logic') }}</p>
          <span>{{ logicDescription }}</span>
        </div>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <div
          v-for="toggle in toggleItems"
          :key="toggle.key"
          class="page-settings-controls__toggle"
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
import CommunitySettingsSectionCard from "./SettingsSectionCard.vue"
import { communityPageCtaOptions } from "../../domain/constants/community-options"
import type { CommunityPageSettingsDraft } from "../../domain/types/community.types"

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

<style scoped>
.page-settings-controls__selected {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 800;
}

.page-settings-controls__info {
  display: flex;
  gap: 12px;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 14px 16px;
}

.page-settings-controls__info p {
  margin: 0;
  color: #0f172a;
  font-size: 13px;
  font-weight: 900;
}

.page-settings-controls__info span {
  display: block;
  margin-top: 3px;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.page-settings-controls__toggle {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  padding: 16px;
}

.page-settings-controls :deep(label) {
  color: #0f172a;
  font-weight: 800;
}

.page-settings-controls :deep(p) {
  color: #64748b;
}
</style>
