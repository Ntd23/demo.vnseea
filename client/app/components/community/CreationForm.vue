<template>
  <section class="rounded-[30px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="max-w-[760px]">
        <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
          {{ $t("community.creation.common.basicSetup") }}
        </p>
        <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[1.75rem]">
          {{ $t("community.creation.common.fillInfo", { entity: entityText }) }}
        </h2>
        <p class="mt-2 text-[14px] leading-7 text-slate-500">
          {{ $t("community.creation.common.fillDesc", { entity: entityText }) }}
        </p>
      </div>

      <div class="inline-flex items-center gap-2 rounded-full bg-[#f6f8ff] px-4 py-2 text-[12px] font-semibold text-slate-600">
        <Icon name="i-ph-check-circle-fill" class="h-4 w-4 text-[#0000ff]" />
        {{ $t("community.creation.common.completionStatus", { count: completionCount, total: completionTotal }) }}
      </div>
    </div>

    <UForm
      :state="model"
      :validate="validateForm"
      class="mt-8"
      @submit="emit('submit')"
    >
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div class="space-y-6">
          <section class="rounded-[26px] border border-[#e8edf7] bg-[#fbfcff] p-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
                  {{ identitySectionLabelText }}
                </p>
                <p class="mt-1 text-[15px] font-black text-[#243b63]">
                  {{ identitySectionTitleText }}
                </p>
              </div>

              <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-semibold text-slate-500">
                {{ identitySectionBadgeText }}
              </UBadge>
            </div>

            <div class="mt-5 space-y-6">
              <UFormField
                name="name"
                :label="nameLabelText"
                required
                size="xl"
                class="space-y-2"
              >
                <UInput
                  v-model="model.name"
                  :placeholder="namePlaceholder"
                  color="primary"
                  size="xl"
                  :disabled="isBusy"
                  class="w-full"
                  :ui="inputUi"
                />
              </UFormField>

              <div class="flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-medium text-[#243b63]">
                  {{ identityHintText }}
                </UBadge>
                <UBadge
                  v-if="isNameReady"
                  color="success"
                  variant="soft"
                  class="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                >
                  {{ identityReadyLabelText }}
                </UBadge>
              </div>

              <UFormField
                name="slug"
                :label="urlLabelText"
                required
                size="xl"
                class="space-y-2"
              >
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-[0.95rem] font-medium text-slate-500">
                    {{ urlPrefix }}
                  </div>
                  <UInput
                    v-model="model.slug"
                    :placeholder="slugPlaceholder"
                    color="primary"
                    size="xl"
                    :disabled="isBusy"
                    class="w-full"
                    :ui="slugInputUi"
                  />
                </div>
              </UFormField>

              <div class="flex flex-col gap-2 rounded-[18px] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(15,35,110,0.04)] sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <p class="text-[12px] font-semibold text-slate-500">
                    {{ $t("community.creation.common.urlSuggested") }}
                  </p>
                  <p class="mt-1 break-all text-[13px] font-medium text-[#243b63]">
                    {{ urlPrefix }}{{ suggestedSlug || $t("community.creation.common.urlDefault") }}
                  </p>
                </div>

                <UButton
                  v-if="suggestedSlug && model.slug.trim() !== suggestedSlug"
                  type="button"
                  color="neutral"
                  variant="outline"
                  size="md"
                  :disabled="isBusy"
                  class="rounded-full"
                  @click="applySuggestedSlug"
                >
                  {{ $t("community.creation.common.useSuggestion") }}
                </UButton>
              </div>
            </div>
          </section>

          <section class="rounded-[26px] border border-[#e8edf7] bg-[#fbfcff] p-5">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
              {{ descriptionSectionLabelText }}
            </p>
            <p class="mt-1 text-[15px] font-black text-[#243b63]">
              {{ descriptionSectionTitleText }}
            </p>

            <UFormField
              name="description"
              :label="descriptionLabelText"
              required
              size="xl"
              class="mt-5 space-y-2"
            >
              <UTextarea
                v-model="model.description"
                :placeholder="descriptionPlaceholder"
                color="primary"
                size="xl"
                autoresize
                :rows="7"
                :disabled="isBusy"
                class="w-full"
                :ui="textareaUi"
              />
            </UFormField>

            <div class="mt-3 flex flex-col gap-2 rounded-[18px] bg-white px-4 py-3 text-[12px] text-slate-500 shadow-[0_8px_18px_rgba(15,35,110,0.04)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                {{ descriptionHintText }}
              </p>
              <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#243b63]">
                {{ $t("community.creation.common.charCount", { count: descriptionLength }) }}
              </UBadge>
            </div>
          </section>

          <section class="rounded-[26px] border border-[#e8edf7] bg-[#fbfcff] p-5">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
              {{ configurationSectionLabelText }}
            </p>
            <p class="mt-1 text-[15px] font-black text-[#243b63]">
              {{ configurationSectionTitleText }}
            </p>

            <div
              v-if="showPrivacy"
              class="mt-5 grid gap-3 sm:grid-cols-3"
              role="radiogroup"
              :aria-label="privacyLabelText"
            >
              <button
                v-for="option in privacyOptions"
                :key="option.value"
                class="rounded-[22px] border px-4 py-4 text-left transition"
                :class="model.privacy === option.value
                  ? 'border-[#0000ff]/25 bg-[#eef0ff] shadow-[0_12px_24px_rgba(0,0,255,0.08)]'
                  : 'border-[#dbe3f2] bg-white hover:border-[#c5caff] hover:bg-[#f8fbff]'"
                type="button"
                :aria-pressed="model.privacy === option.value"
                @click="selectPrivacy(option.value)"
              >
                <div class="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-[#0000ff] shadow-[0_8px_18px_rgba(15,35,110,0.05)]">
                  <Icon :name="option.icon || 'i-ph-circle-fill'" class="h-5 w-5" />
                </div>
                <p class="mt-4 text-[14px] font-black text-[#243b63]">
                  {{ $t(option.label) }}
                </p>
                <p class="mt-2 text-[12px] leading-5 text-slate-500">
                  {{ option.description ? $t(option.description) : "" }}
                </p>
              </button>
            </div>

            <UFormField
              name="category"
              :label="categoryLabelText"
              required
              size="xl"
              class="mt-5 space-y-2"
            >
              <USelect
                v-model="model.category"
                :items="categoryItems"
                value-key="value"
                label-key="label"
                color="primary"
                size="xl"
                :disabled="isBusy"
                class="w-full"
                :ui="selectUi"
              />
            </UFormField>

            <div class="mt-3 rounded-[18px] bg-white px-4 py-3 text-[13px] leading-6 text-slate-500 shadow-[0_8px_18px_rgba(15,35,110,0.04)]">
              {{ selectedCategoryDescription }}
            </div>
          </section>

          <section class="rounded-[24px] border border-[#dbe3f2] bg-white px-4 py-4 sm:px-5">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
                    {{ $t("community.creation.common.action") }}
                  </p>
                  <p class="mt-1 text-[14px] leading-6 text-slate-500">
                    {{ actionDescriptionText }}
                  </p>
                </div>

                <div class="inline-flex items-center gap-2 self-start rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-500">
                  <Icon name="i-ph-floppy-disk-back-fill" class="h-4 w-4 text-[#0000ff]" />
                  {{ $t("community.creation.common.completionStatus", { count: completionCount, total: completionTotal }) }}
                </div>
              </div>

              <UAlert
                v-if="statusAlert"
                :color="statusAlert.color"
                variant="subtle"
                :icon="statusAlert.icon"
                :title="statusAlert.title"
                :description="statusAlert.description"
                class="rounded-[20px]"
                aria-live="polite"
              />

              <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <UButton
                  :to="backTo"
                  color="neutral"
                  variant="ghost"
                  size="xl"
                  :disabled="isBusy"
                  class="justify-center rounded-full text-[1rem] font-semibold"
                >
                  <Icon name="i-ph-arrow-left" class="mr-2 h-5 w-5" />
                  {{ backLabelText }}
                </UButton>

                <UButton
                  type="submit"
                  color="primary"
                  variant="solid"
                  size="xl"
                  :loading="isBusy"
                  :disabled="isSubmitDisabled"
                  class="justify-center rounded-[18px] px-6 text-[1.02rem] font-extrabold shadow-[0_12px_24px_rgba(0,0,255,0.24)]"
                >
                  {{ submitLabelText }}
                </UButton>
              </div>
            </div>
          </section>
        </div>

        <CommunityCreationInsightsPanel
          :entity-label="entityLabel"
          :completion-count="completionCount"
          :completion-total="completionTotal"
          :preview-title="previewTitle"
          :preview-url="previewUrl"
          :preview-description="previewDescription"
          :privacy-label="selectedPrivacyLabel"
          :privacy-description="selectedPrivacyDescription"
          :category-label="selectedCategoryLabel"
          :show-privacy="showPrivacy"
          :preview-icon="previewIcon"
          :next-steps="nextSteps"
          :name-ready="isNameReady"
          :url-ready="isUrlReady"
          :description-ready="isDescriptionReady"
          :privacy-ready="isPrivacyReady"
          :category-ready="isCategoryReady"
        />
      </div>
    </UForm>
  </section>
</template>

<script setup lang="ts">
import {
  createCommunitySlug,
  communityUrlPrefix,
  getCommunityCompletionCount,
  getCommunityCompletionTotal,
} from "../../../types/community"
import type {
  CommunityDraft,
  CommunityOption,
} from "../../../types/community"

type CreationSubmitState = "idle" | "loading" | "success" | "error"

type CreationFormError = {
  name?: keyof CommunityDraft
  message: string
}

const { t } = useI18n()

const emit = defineEmits<{
  submit: []
}>()

const model = defineModel<CommunityDraft>({ required: true })

const props = withDefaults(defineProps<{
  entityLabel: string
  categoryOptions: CommunityOption[]
  privacyOptions?: CommunityOption[]
  showPrivacy?: boolean
  submitLabel?: string
  backLabel?: string
  backTo?: string
  nameLabel?: string
  namePlaceholder?: string
  urlLabel?: string
  slugPlaceholder?: string
  descriptionLabel?: string
  descriptionPlaceholder?: string
  categoryLabel?: string
  privacyLabel?: string
  urlPrefix?: string
  identitySectionLabel?: string
  identitySectionTitle?: string
  identitySectionBadge?: string
  identityHint?: string
  identityReadyLabel?: string
  descriptionSectionLabel?: string
  descriptionSectionTitle?: string
  descriptionHint?: string
  configurationSectionLabel?: string
  configurationSectionTitle?: string
  actionDescription?: string
  previewIcon?: string
  nextSteps?: Array<{ title: string; description: string }>
  submitState?: CreationSubmitState
  submitDisabled?: boolean
  draftRestored?: boolean
}>(), {
  privacyOptions: () => [],
  showPrivacy: true,
  submitLabel: "",
  backLabel: "",
  backTo: "/home",
  nameLabel: "",
  namePlaceholder: "",
  urlLabel: "",
  slugPlaceholder: "",
  descriptionLabel: "",
  descriptionPlaceholder: "",
  categoryLabel: "",
  privacyLabel: "",
  urlPrefix: communityUrlPrefix,
  identitySectionLabel: "",
  identitySectionTitle: "",
  identitySectionBadge: "",
  identityHint: "",
  identityReadyLabel: "",
  descriptionSectionLabel: "",
  descriptionSectionTitle: "",
  descriptionHint: "",
  configurationSectionLabel: "",
  configurationSectionTitle: "",
  actionDescription: "",
  previewIcon: "i-ph-users-three-fill",
  nextSteps: () => [],
  submitState: "idle",
  submitDisabled: false,
  draftRestored: false,
})

const inputUi = {
  base: "h-[4.75rem] rounded-[24px] px-5 text-[1.05rem]",
}

const slugInputUi = {
  base: "h-[4.75rem] rounded-[24px] pl-[11.2rem] pr-5 text-[1.05rem] sm:pl-[12rem]",
}

const textareaUi = {
  base: "min-h-[210px] rounded-[24px] px-5 py-4 text-[1.02rem] leading-7",
}

const selectUi = {
  base: "h-[4.75rem] rounded-[24px] px-5 text-[1rem] font-medium",
}

const entityText = computed(() => t(props.entityLabel))

const submitLabelText = computed(() =>
  props.submitLabel || t("community.creation.common.create"),
)

const backLabelText = computed(() =>
  props.backLabel || t("community.creation.common.back"),
)

const nameLabelText = computed(() =>
  props.nameLabel || t("community.creation.common.nameLabel"),
)

const urlLabelText = computed(() =>
  props.urlLabel || t("community.creation.common.urlLabel"),
)

const descriptionLabelText = computed(() =>
  props.descriptionLabel || t("community.creation.common.descriptionLabel"),
)

const categoryLabelText = computed(() =>
  props.categoryLabel || t("community.creation.common.categoryLabel"),
)

const privacyLabelText = computed(() =>
  props.privacyLabel || t("community.creation.group.privacyLabel"),
)

const completionCount = computed(() =>
  getCommunityCompletionCount(model.value, { includePrivacy: props.showPrivacy }),
)

const completionTotal = computed(() =>
  getCommunityCompletionTotal(props.showPrivacy),
)

const descriptionLength = computed(() => model.value.description.trim().length)
const suggestedSlug = computed(() => createCommunitySlug(model.value.name))
const isBusy = computed(() => props.submitState === "loading")
const isSubmitDisabled = computed(() => props.submitDisabled || isBusy.value)

const selectedPrivacyOption = computed(() =>
  props.privacyOptions.find(option => option.value === model.value.privacy),
)

const selectedCategoryOption = computed(() =>
  props.categoryOptions.find(option => option.value === model.value.category),
)

const categoryItems = computed(() =>
  props.categoryOptions.map(option => ({
    value: option.value,
    label: t(option.label),
  })),
)

const selectedPrivacyLabel = computed(() =>
  selectedPrivacyOption.value?.label
    ? t(selectedPrivacyOption.value.label)
    : t("community.creation.common.noPrivacy"),
)

const selectedPrivacyDescription = computed(() =>
  selectedPrivacyOption.value?.description
    ? t(selectedPrivacyOption.value.description)
    : t("community.creation.common.privacyDescDefault", { entity: entityText.value }),
)

const selectedCategoryLabel = computed(() =>
  selectedCategoryOption.value?.label
    ? t(selectedCategoryOption.value.label)
    : t("community.creation.common.noCategory"),
)

const selectedCategoryDescription = computed(() =>
  selectedCategoryOption.value?.description
    ? t(selectedCategoryOption.value.description)
    : t("community.creation.common.categoryDescDefault", { entity: entityText.value }),
)

const identitySectionLabelText = computed(() =>
  props.identitySectionLabel || t("community.creation.common.identitySection", { entity: entityText.value }),
)

const identitySectionTitleText = computed(() =>
  props.identitySectionTitle || t("community.creation.common.identityTitle"),
)

const identitySectionBadgeText = computed(() =>
  props.identitySectionBadge || t("community.creation.common.identityBadge"),
)

const identityHintText = computed(() =>
  props.identityHint || t("community.creation.common.identityHint"),
)

const identityReadyLabelText = computed(() =>
  props.identityReadyLabel || t("community.creation.common.identityReady"),
)

const descriptionSectionLabelText = computed(() =>
  props.descriptionSectionLabel || t("community.creation.common.introSection", { entity: entityText.value }),
)

const descriptionSectionTitleText = computed(() =>
  props.descriptionSectionTitle
    || (props.showPrivacy ? t("community.creation.common.introTitleGroup") : t("community.creation.common.introTitlePage")),
)

const descriptionHintText = computed(() =>
  props.descriptionHint || t("community.creation.common.introHint", { entity: entityText.value }),
)

const configurationSectionLabelText = computed(() =>
  props.configurationSectionLabel || (props.showPrivacy ? t("community.creation.common.configLabelDisplay") : t("community.creation.common.configLabelContent")),
)

const configurationSectionTitleText = computed(() =>
  props.configurationSectionTitle
    || (props.showPrivacy
      ? t("community.creation.common.configTitleGroup")
      : t("community.creation.common.configTitlePage")),
)

const actionDescriptionText = computed(() =>
  props.actionDescription
    || t("community.creation.common.finishHint", {
      extra: props.showPrivacy
        ? t("community.creation.common.finishExtraGroup")
        : t("community.creation.common.finishExtraPage"),
    }),
)

const previewTitle = computed(() =>
  model.value.name.trim() || t("community.creation.common.previewTitle", { entity: entityText.value }),
)

const effectiveSlug = computed(() =>
  model.value.slug.trim() || suggestedSlug.value || t("community.creation.common.previewUrlDefault"),
)

const previewUrl = computed(() =>
  `${props.urlPrefix}${effectiveSlug.value}`,
)

const previewDescription = computed(() => {
  const capitalizedEntity = entityText.value.charAt(0).toUpperCase() + entityText.value.slice(1)

  return model.value.description.trim()
    || t("community.creation.common.previewDescDefault", { entity: capitalizedEntity })
})

const isNameReady = computed(() => model.value.name.trim().length >= 3)
const isUrlReady = computed(() => model.value.slug.trim().length >= 3)
const isDescriptionReady = computed(() => descriptionLength.value >= 24)
const isPrivacyReady = computed(() => !props.showPrivacy || Boolean(model.value.privacy))
const isCategoryReady = computed(() => Boolean(model.value.category))

const statusAlert = computed(() => {
  if (props.submitState === "loading") {
    return {
      color: "primary" as const,
      icon: "i-ph-spinner-gap-bold",
      title: t("community.creation.common.statusLoadingTitle", { entity: entityText.value }),
      description: t("community.creation.common.statusLoadingDescription"),
    }
  }

  if (props.submitState === "success") {
    return {
      color: "success" as const,
      icon: "i-ph-check-circle-fill",
      title: t("community.creation.common.statusSuccessTitle", { entity: entityText.value }),
      description: t("community.creation.common.statusSuccessDescription", { entity: entityText.value }),
    }
  }

  if (props.submitState === "error") {
    return {
      color: "error" as const,
      icon: "i-ph-warning-circle-fill",
      title: t("community.creation.common.statusErrorTitle"),
      description: t("community.creation.common.statusErrorDescription"),
    }
  }

  if (props.draftRestored) {
    return {
      color: "primary" as const,
      icon: "i-ph-clock-counter-clockwise-fill",
      title: t("community.creation.common.draftRestoredTitle"),
      description: t("community.creation.common.draftRestoredDescription"),
    }
  }

  return null
})

watch(
  () => model.value.name,
  (value, previousValue) => {
    const previousSuggestedSlug = createCommunitySlug(previousValue || "")
    const currentSlug = model.value.slug.trim()

    if (!currentSlug || currentSlug === previousSuggestedSlug) {
      model.value.slug = createCommunitySlug(value)
    }
  },
)

function applySuggestedSlug() {
  if (suggestedSlug.value) {
    model.value.slug = suggestedSlug.value
  }
}

function selectPrivacy(value: string) {
  model.value.privacy = value as CommunityDraft["privacy"]
}

const validateForm = (state: CommunityDraft): CreationFormError[] => {
  const errors: CreationFormError[] = []
  const slug = state.slug.trim()

  if (!state.name.trim()) {
    errors.push({
      name: "name",
      message: t("community.creation.common.validationNameRequired"),
    })
  }

  if (!slug) {
    errors.push({
      name: "slug",
      message: t("community.creation.common.validationSlugRequired"),
    })
  }
  else if (slug.length < 3 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push({
      name: "slug",
      message: t("community.creation.common.validationSlugInvalid"),
    })
  }

  if (state.description.trim().length < 24) {
    errors.push({
      name: "description",
      message: t("community.creation.common.validationDescriptionRequired"),
    })
  }

  if (props.showPrivacy && !state.privacy) {
    errors.push({
      name: "privacy",
      message: t("community.creation.common.validationPrivacyRequired"),
    })
  }

  if (!state.category) {
    errors.push({
      name: "category",
      message: t("community.creation.common.validationCategoryRequired"),
    })
  }

  return errors
}
</script>
