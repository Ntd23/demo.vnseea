<!-- English description: Renders the shared community create form with optional page location and map pin request controls. -->
<template>
  <div class="space-y-6" :class="{ 'creation-form--page': isPage || isGroup }">
    <div class="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <div class="mb-10">
        <h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">
          {{ title || $t("community.creation.common.fillInfo", { entity: entityText }) }}
        </h1>
        <p v-if="!hideDescription" class="mt-2 text-[15px] text-slate-500">
          {{ $t("community.creation.common.fillDesc", { entity: entityText }) }}
        </p>
      </div>

      <UForm
        :state="model"
        :validate="validateForm"
        class="space-y-6"
        @submit="emit('submit')"
      >
        <!-- Name -->
        <UFormField
          :label="nameLabelText"
          name="name"
          required
        >
          <UInput
            v-model="model.name"
            :placeholder="namePlaceholder"
            icon="i-ph-users-three-bold"
            size="xl"
            class="w-full"
            :ui="{ base: 'h-12 rounded-xl' }"
          />
        </UFormField>

        <!-- URL Slug -->
        <UFormField
          :label="urlLabelText"
          name="slug"
          required
        >
          <div v-if="isPage || isGroup" class="w-full">
            <div class="flex w-full items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
              <div class="flex items-center justify-center bg-slate-50 border-r border-slate-200 px-4 h-12 text-slate-500 text-[14px] font-medium whitespace-nowrap select-none">
                {{ urlPrefix }}
              </div>
              <input
                v-model="model.slug"
                type="text"
                :placeholder="slugPlaceholder"
                class="flex-1 h-12 px-4 text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none border-none bg-transparent"
              />
            </div>
            <span class="text-[13px] text-slate-500 mt-2 block">
              {{ isPage ? 'Link trang' : 'Link nhóm' }}: {{ urlPrefix }}{{ model.slug || '' }}
            </span>
          </div>
          <UInput
            v-else
            v-model="model.slug"
            :placeholder="slugPlaceholder"
            icon="i-ph-link-bold"
            size="xl"
            class="w-full"
            :ui="{ base: 'h-12 rounded-xl' }"
          />
          <template #hint>
            <span v-if="!(isPage || isGroup)" class="text-[11px] font-medium text-slate-400">
              {{ urlPrefix }}{{ model.slug || '...' }}
            </span>
          </template>
        </UFormField>

        <!-- Description -->
        <UFormField
          :label="descriptionLabelText"
          name="description"
          required
        >
          <UTextarea
            v-model="model.description"
            :placeholder="descriptionPlaceholder"
            size="xl"
            autoresize
            :rows="4"
            class="w-full"
            :ui="{ base: 'rounded-xl px-4 py-3' }"
          />
        </UFormField>

        <!-- Privacy & Category Dropdowns -->
        <div class="grid gap-6 sm:grid-cols-2">
          <UFormField
            v-if="showPrivacy"
            :label="$t('community.creation.group.privacyLabel')"
            name="privacy"
            required
          >
            <USelect
              v-model="model.privacy"
              :items="privacyItems"
              value-key="value"
              label-key="label"
              icon="i-ph-shield-check-bold"
              size="xl"
              class="w-full"
              :ui="{ base: 'h-12 rounded-xl' }"
            />
          </UFormField>

          <UFormField
            :label="categoryLabelText"
            name="category"
            required
          >
            <USelect
              v-model="model.category"
              :items="categoryItems"
              value-key="value"
              label-key="label"
              :icon="(isPage || isGroup) ? undefined : 'i-ph-tag-bold'"
              size="xl"
              class="w-full"
              :ui="{ base: 'h-12 rounded-xl' }"
            />
          </UFormField>
        </div>

        <UFormField
          v-if="showLocation"
          :label="locationLabelText"
          name="location"
          required
        >
          <GooglePlaceField
            v-model="locationModel"
            :placeholder="locationPlaceholderText"
            :helper-text="locationHintText"
            require-coordinates
          />
        </UFormField>

        <UCheckbox
          v-if="showMapPinRequest"
          v-model="mapPinRequestedModel"
          label="Yêu cầu ghim trên bản đồ"
          description="Admin sẽ duyệt trước khi tên trang hiển thị trực tiếp trên bản đồ tìm kiếm gần đây."
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        />

        <!-- Buttons -->
        <div class="flex items-center justify-between pt-8">
          <UButton
            :to="backTo"
            variant="ghost"
            color="neutral"
            size="lg"
            class="text-link rounded-xl px-6"
          >
            {{ $t("community.creation.common.back") }}
          </UButton>

          <UButton
            type="submit"
            color="primary"
            size="xl"
            :loading="isBusy"
            :disabled="isSubmitDisabled"
            class="btn-primary rounded-xl px-12 font-bold shadow-md shadow-primary-500/20"
          >
            {{ submitLabelText }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import GooglePlaceField from "../../../location/presentation/components/GooglePlaceField.vue"
import {
  emptyLocationSelection,
  hasLocationCoordinates,
  normalizeLocationSelection,
} from "../../../location/domain/types/location.types"
import {
  createCommunitySlug,
} from "../../domain/services/community-helpers.service"
import {
  isCommunityDescriptionValid,
  isCommunityNameValid,
  isCommunitySlugFormatValid,
  isCommunitySlugLengthValid,
} from "../../domain/services/community-validation.service"
import type {
  CommunityDraft,
  CommunityOption,
} from "../../domain/types/community.types"
import { communityUrlPrefix } from "../../domain/constants/community-options"

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
  backTo?: string
  nameLabel?: string
  namePlaceholder?: string
  urlLabel?: string
  slugPlaceholder?: string
  descriptionLabel?: string
  descriptionPlaceholder?: string
  categoryLabel?: string
  showLocation?: boolean
  showMapPinRequest?: boolean
  locationLabel?: string
  locationPlaceholder?: string
  locationHint?: string
  urlPrefix?: string
  submitState?: CreationSubmitState
  submitDisabled?: boolean
  title?: string
  hideDescription?: boolean
  isPage?: boolean
  isGroup?: boolean
}>(), {
  privacyOptions: () => [],
  showPrivacy: true,
  submitLabel: "",
  backTo: "/home",
  nameLabel: "",
  namePlaceholder: "",
  urlLabel: "",
  slugPlaceholder: "",
  descriptionLabel: "",
  descriptionPlaceholder: "",
  categoryLabel: "",
  showLocation: false,
  showMapPinRequest: false,
  locationLabel: "",
  locationPlaceholder: "",
  locationHint: "",
  urlPrefix: communityUrlPrefix,
  submitState: "idle",
  submitDisabled: false,
  title: "",
  hideDescription: false,
  isPage: false,
  isGroup: false,
})

const entityText = computed(() => t(props.entityLabel))
const submitLabelText = computed(() => props.submitLabel || t("community.creation.common.create"))
const nameLabelText = computed(() => props.nameLabel || t("community.creation.common.nameLabel"))
const urlLabelText = computed(() => props.urlLabel || t("community.creation.common.urlLabel"))
const descriptionLabelText = computed(() => props.descriptionLabel || t("community.creation.common.descriptionLabel"))
const categoryLabelText = computed(() => props.categoryLabel || t("community.creation.common.categoryLabel"))
const locationLabelText = computed(() => props.locationLabel || t("community.creation.common.locationLabel"))
const locationPlaceholderText = computed(() => props.locationPlaceholder || t("community.creation.common.locationPlaceholder"))
const locationHintText = computed(() => props.locationHint || t("community.creation.common.locationHint"))

const isBusy = computed(() => props.submitState === "loading")
const isSubmitDisabled = computed(() => props.submitDisabled || isBusy.value)

const privacyItems = computed(() =>
  props.privacyOptions.map(option => ({
    value: option.value,
    label: t(option.label),
  })),
)

const categoryItems = computed(() =>
  props.categoryOptions.map(option => ({
    value: option.value,
    label: t(option.label),
  })),
)

const locationModel = computed({
  get: () => normalizeLocationSelection(model.value.location ?? emptyLocationSelection()),
  set: (value) => {
    model.value.location = normalizeLocationSelection(value)
  },
})

const mapPinRequestedModel = computed({
  get: () => Boolean(model.value.mapPinRequested),
  set: (value: boolean) => {
    model.value.mapPinRequested = value
  },
})

watch(
  () => model.value.name,
  (value, previousValue) => {
    const previousSuggestedSlug = createCommunitySlug(previousValue || "")
    const currentSlug = (model.value.slug || "").trim()
    if (!currentSlug || currentSlug === previousSuggestedSlug) {
      model.value.slug = createCommunitySlug(value)
    }
  },
)

const validateForm = (state: CommunityDraft): CreationFormError[] => {
  const errors: CreationFormError[] = []
  const name = (state.name || "").trim()
  const slug = (state.slug || "").trim()
  const nameIsValid = isCommunityNameValid(name)
  const slugWasGeneratedFromName = slug === createCommunitySlug(name)

  if (!name) errors.push({ name: "name", message: t("community.creation.common.validationNameRequired") })
  else if (!nameIsValid) errors.push({ name: "name", message: t("community.creation.common.validationNameLength") })

  // When the invalid slug was generated from a short name, report the actionable
  // error on the name field. The watcher will regenerate the slug after it is fixed.
  if (nameIsValid || !slugWasGeneratedFromName) {
    if (!slug) errors.push({ name: "slug", message: t("community.creation.common.validationSlugRequired") })
    else if (!isCommunitySlugLengthValid(slug)) errors.push({ name: "slug", message: t("community.creation.common.validationSlugLength") })
    else if (!isCommunitySlugFormatValid(slug)) errors.push({ name: "slug", message: t("community.creation.common.validationSlugInvalid") })
  }

  if (!isCommunityDescriptionValid(state.description)) errors.push({ name: "description", message: t("community.creation.common.validationDescriptionRequired") })
  if (props.showPrivacy && !state.privacy) errors.push({ name: "privacy", message: t("community.creation.common.validationPrivacyRequired") })
  if (!state.category) errors.push({ name: "category", message: t("community.creation.common.validationCategoryRequired") })
  if (props.showLocation && (!(state.location?.address || "").trim() || !hasLocationCoordinates(state.location))) {
    errors.push({ name: "location", message: t("community.creation.common.validationLocationRequired") })
  }
  return errors
}
</script>

<style scoped>
.creation-form--page :deep(select),
.creation-form--page :deep(button[role="combobox"]),
.creation-form--page :deep(.u-select-button) {
  border: 1px solid #bfdbfe !important;
  border-radius: 12px !important;
  background-color: #ffffff !important;
  color: #0f172a !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  outline: none !important;
}

.creation-form--page :deep(select:focus),
.creation-form--page :deep(button[role="combobox"]:focus-within),
.creation-form--page :deep(.u-select-button:focus-within) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15) !important;
}

/* Make sure UFormField labels are bold, matching the mockup */
.creation-form--page :deep(label) {
  font-weight: 700 !important;
  color: #0f172a !important;
  font-size: 15px !important;
}
</style>
