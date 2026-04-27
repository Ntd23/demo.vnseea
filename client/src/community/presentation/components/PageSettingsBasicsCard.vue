<template>
  <CommunitySettingsSectionCard
    :eyebrow="$t('community.pageSettings.basics.eyebrow')"
    :title="$t('community.pageSettings.basics.title')"
    :description="$t('community.pageSettings.basics.desc')"
    icon="i-ph-identification-card-bold"
  >
    <template #trailing>
      <UButton
        :to="pagePath"
        color="neutral"
        variant="outline"
        size="md"
        class="rounded-full"
      >
        <Icon name="i-ph-arrow-square-out-bold" class="mr-1.5 h-4 w-4" />
        {{ $t("community.pageSettings.basics.viewPage") }}
      </UButton>
    </template>

    <div class="space-y-5">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)]">
        <UFormField
          name="name"
          :label="$t('community.pageSettings.basics.fields.name')"
          required
          size="xl"
          class="space-y-2"
        >
          <UInput
            v-model="model.name"
            :placeholder="$t('community.pageSettings.basics.fields.namePlaceholder')"
            color="primary"
            size="xl"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>

        <UFormField
          name="slug"
          :label="$t('community.pageSettings.basics.fields.url')"
          required
          size="xl"
          class="space-y-2"
        >
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[13px] font-semibold text-slate-500">
              {{ urlPrefix }}
            </div>
            <UInput
              v-model="model.slug"
              :placeholder="$t('community.pageSettings.basics.fields.slugPlaceholder')"
              color="primary"
              size="xl"
              class="w-full"
              :ui="slugInputUi"
            />
          </div>

          <div class="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
            <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-medium text-[#243b63]">
              {{ $t("community.pageSettings.basics.fields.urlSuggested", { slug: suggestedSlug || $t("community.pageSettings.basics.fields.slugPlaceholder") }) }}
            </UBadge>
            <UButton
              v-if="suggestedSlug && model.slug.trim() !== suggestedSlug"
              type="button"
              color="neutral"
              variant="outline"
              size="sm"
              class="rounded-full"
              @click="model.slug = suggestedSlug"
            >
              {{ $t("community.pageSettings.basics.fields.urlUseSuggestion") }}
            </UButton>
          </div>
        </UFormField>
      </div>

      <UFormField
        name="summary"
        :label="$t('community.pageSettings.basics.fields.summary')"
        required
        size="xl"
        class="space-y-2"
      >
        <UTextarea
          v-model="model.summary"
          :placeholder="$t('community.pageSettings.basics.fields.summaryPlaceholder')"
          color="primary"
          size="xl"
          autoresize
          :rows="6"
          class="w-full"
          :ui="textareaUi"
        />
      </UFormField>

      <div class="grid gap-5 lg:grid-cols-2">
        <UFormField
          name="category"
          :label="$t('community.pageSettings.basics.fields.category')"
          required
          size="xl"
          class="space-y-2"
        >
          <USelect
            v-model="model.category"
            :items="categoryItems"
            value-key="value"
            label-key="label"
            color="primary"
            size="xl"
            class="w-full"
            :ui="selectUi"
          />
        </UFormField>

        <UFormField
          name="locationLabel"
          :label="$t('community.pageSettings.basics.fields.location')"
          size="xl"
          class="space-y-2"
        >
          <UInput
            v-model="model.locationLabel"
            :placeholder="$t('community.pageSettings.basics.fields.locationPlaceholder')"
            color="primary"
            size="xl"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <UFormField
          name="website"
          :label="$t('community.pageSettings.basics.fields.website')"
          size="xl"
          class="space-y-2"
        >
          <UInput
            v-model="model.website"
            :placeholder="$t('community.pageSettings.basics.fields.websitePlaceholder')"
            color="primary"
            size="xl"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>

        <UFormField
          name="ownerLabel"
          :label="$t('community.pageSettings.basics.fields.ownerLabel')"
          size="xl"
          class="space-y-2"
        >
          <UInput
            v-model="model.ownerLabel"
            :placeholder="$t('community.pageSettings.basics.fields.ownerPlaceholder')"
            color="primary"
            size="xl"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <UFormField
          name="responseLabel"
          :label="$t('community.pageSettings.basics.fields.responseLabel')"
          size="xl"
          class="space-y-2"
        >
          <UInput
            v-model="model.responseLabel"
            :placeholder="$t('community.pageSettings.basics.fields.responsePlaceholder')"
            color="primary"
            size="xl"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>

        <UFormField
          name="ctaLabel"
          :label="$t('community.pageSettings.basics.fields.ctaLabel')"
          size="xl"
          class="space-y-2"
        >
          <UInput
            v-model="model.ctaLabel"
            :placeholder="$t('community.pageSettings.basics.fields.ctaPlaceholder')"
            color="primary"
            size="xl"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>
      </div>

      <UFormField
        name="tags"
        :label="$t('community.pageSettings.basics.fields.tags')"
        size="xl"
        class="space-y-2"
      >
        <UInput
          v-model="model.tags"
          :placeholder="$t('community.pageSettings.basics.fields.tagsPlaceholder')"
          color="primary"
          size="xl"
          class="w-full"
          :ui="inputUi"
        />
      </UFormField>

      <div class="grid gap-3 sm:grid-cols-4">
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ $t("community.pageSettings.basics.fields.summary") }}</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ $t("community.pageSettings.basics.stats.summaryLength", { count: model.summary.trim().length }) }}</p>
        </div>
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ $t("community.pageSettings.basics.stats.topicsLabel") }}</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ $t("community.pageSettings.basics.stats.tagCount", { count: tagCount }) }}</p>
        </div>
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ $t("community.pageSettings.basics.stats.ctaLabel") }}</p>
          <p class="mt-1 truncate text-[15px] font-black text-[#243b63]">{{ model.ctaLabel.trim() || $t("community.pageSettings.basics.stats.ctaFallback") }}</p>
        </div>
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ $t("community.pageSettings.basics.stats.publicLinkLabel") }}</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ model.website.trim() ? $t("community.pageSettings.basics.stats.websiteYes") : $t("community.pageSettings.basics.stats.websiteNo") }}</p>
        </div>
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import CommunitySettingsSectionCard from "./SettingsSectionCard.vue"
import {
  createCommunitySlug,
} from "../../domain/services/community-helpers.service"
import {
  communityPageCategoryOptions,
  communityPageUrlPrefix,
} from "../../domain/constants/community-options"
import type { CommunityPageSettingsDraft } from "../../domain/types/community.types"

const model = defineModel<CommunityPageSettingsDraft>({ required: true })
const { t } = useI18n()

defineProps<{
  pagePath: string
}>()

const inputUi = {
  base: "h-14 rounded-[18px] px-4 text-[15px]",
}

const slugInputUi = {
  base: "h-14 rounded-[18px] pl-[8.1rem] pr-4 text-[15px]",
}

const textareaUi = {
  base: "min-h-[160px] rounded-[18px] px-4 py-3 text-[15px] leading-7",
}

const selectUi = {
  base: "h-14 rounded-[18px] px-4 text-[15px]",
}

const urlPrefix = communityPageUrlPrefix.replace("https://", "")

const categoryItems = computed(() =>
  communityPageCategoryOptions.map(option => ({
    value: option.value,
    label: t(option.label),
  })),
)

const suggestedSlug = computed(() =>
  createCommunitySlug(model.value.name),
)

const tagCount = computed(() =>
  model.value.tags
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean)
    .length,
)
</script>
