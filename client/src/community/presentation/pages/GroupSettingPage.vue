<template>
  <div v-if="group && previewGroup" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <CommunityCreationHeaderCard
      eyebrow="community.settings.eyebrow"
      :title="$t('community.settings.title', { name: $t(group.name) })"
      description="community.settings.desc"
      icon="i-ph-gear-six-fill"
      :highlights="[memberCountLabel, selectedPrivacyLabel, selectedCategoryLabel]"
    />

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.08fr)_340px]">
      <UForm
        :state="draft"
        :validate="validateDraft"
        class="min-w-0 space-y-4"
        @submit="handleSave"
        @error="handleSaveError"
      >
        <CommunityGroupSettingsBasicsCard
          v-model="draft"
          :group-path="groupPath"
        />

        <CommunityGroupSettingsControlsCard v-model="draft" />

        <CommunitySettingsSectionCard
          eyebrow="community.settings.finish.eyebrow"
          title="community.settings.finish.title"
          description="community.settings.finish.desc"
          icon="i-ph-floppy-disk-back-bold"
        >
          <div class="flex flex-col gap-4">
            <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3 text-[13px] leading-6 text-slate-500">
              {{ $t('community.settings.finish.status', { enabled: enabledPolicies, total: totalPolicies, privacy: $t(selectedPrivacyLabel).toLowerCase() }) }}
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
                :to="groupPath"
                color="neutral"
                variant="outline"
                size="xl"
                :disabled="isBusy"
                class="justify-center rounded-full"
              >
                <Icon name="i-ph-arrow-left-bold" class="mr-2 h-4 w-4" />
                {{ $t("community.settings.finish.back") }}
              </UButton>

              <UButton
                type="submit"
                color="primary"
                variant="solid"
                size="xl"
                :loading="isBusy"
                :disabled="isSaveDisabled"
                class="justify-center rounded-[16px] px-5 text-[14px] font-extrabold shadow-[0_12px_24px_rgba(0,0,255,0.24)]"
              >
                <Icon name="i-ph-floppy-disk-bold" class="mr-2 h-4 w-4" />
                {{ $t("community.settings.finish.save") }}
              </UButton>
            </div>
          </div>
        </CommunitySettingsSectionCard>
      </UForm>

      <CommunityGroupSettingsSidebar
        :group="previewGroup"
        :members="visibleMembers"
        :member-count-label="memberCountLabel"
        :privacy-label="selectedPrivacyLabel"
        :privacy-description="selectedPrivacyDescription"
        :category-label="selectedCategoryLabel"
        :enabled-policies="enabledPolicies"
        :total-policies="totalPolicies"
        :show-member-directory="draft.showMemberDirectory"
      />
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] pb-10 pt-4">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-6 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16">
      <FoundationEmptyState
        icon="i-ph-gear-six-fill"
        :title="$t('community.settings.empty.title')"
        :description="$t('community.settings.empty.desc')"
      />

      <div class="mt-6 flex justify-center">
        <NuxtLink
          to="/groups"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          {{ $t("community.settings.empty.back") }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useStorage, watchDebounced } from "@vueuse/core"
import CommunityCreationHeaderCard from "../components/CreationHeaderCard.vue"
import CommunityGroupSettingsBasicsCard from "../components/GroupSettingsBasicsCard.vue"
import CommunityGroupSettingsControlsCard from "../components/GroupSettingsControlsCard.vue"
import CommunityGroupSettingsSidebar from "../components/GroupSettingsSidebar.vue"
import CommunitySettingsSectionCard from "../components/SettingsSectionCard.vue"
import { useCommunityGroupDetail } from "../../application/composables/useCommunityGroupDetail"
import { createCommunityGroupSettingsDraft } from "../../application/factories/community-drafts"
import {
  communityCategoryOptions,
  communityPrivacyOptions,
} from "../../domain/constants/community-options"
import {
  createCommunitySlug,
  getCommunityGroupPath,
  getCommunityOptionDescription,
  getCommunityOptionLabel,
} from "../../domain/services/community-helpers.service"
import type {
  CommunityGroupRecord,
  CommunityGroupSettingsDraft,
} from "../../domain/types/community.types"

type GroupSettingsState = "idle" | "loading" | "success" | "error"

type GroupSettingsError = {
  name?: keyof CommunityGroupSettingsDraft
  message: string
}

const { t } = useI18n()
const route = useRoute()
const toast = useToast()

const {
  group,
  members,
  memberCountLabel,
} = useCommunityGroupDetail(computed(() => String(route.params.group || "")))

const draft = ref<CommunityGroupSettingsDraft>(
  createCommunityGroupSettingsDraft(),
)
const saveState = ref<GroupSettingsState>("idle")
const draftRestored = ref(false)
const storageHydrated = ref(false)
const isSyncingDraft = ref(false)

const draftStorage = useStorage<CommunityGroupSettingsDraft | null>(
  `community:group-settings:${String(route.params.group || "")}`,
  null,
  undefined,
  { initOnMounted: true },
)

const normalizedTags = computed(() =>
  draft.value.tags
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean),
)

const normalizedGuidelines = computed(() =>
  draft.value.guidelines
    .split("\n")
    .map(rule => rule.trim())
    .filter(Boolean),
)

const previewGroup = computed<CommunityGroupRecord | null>(() => {
  if (!group.value) return null

  return {
    ...group.value,
    name: draft.value.name.trim() || group.value.name,
    slug: draft.value.slug.trim() || group.value.slug,
    summary: draft.value.summary.trim() || group.value.summary,
    website: draft.value.website.trim() || group.value.website,
    locationLabel: draft.value.locationLabel.trim() || group.value.locationLabel,
    privacy: draft.value.privacy,
    category: draft.value.category,
    tags: normalizedTags.value.length > 0 ? normalizedTags.value : group.value.tags,
    guidelines: normalizedGuidelines.value.length > 0
      ? normalizedGuidelines.value
      : group.value.guidelines,
  }
})

const selectedPrivacyLabel = computed(() =>
  t(
    getCommunityOptionLabel(
      communityPrivacyOptions,
      draft.value.privacy,
      "community.settings.controls.privacyFallback",
    ),
  ),
)

const selectedPrivacyDescription = computed(() =>
  t(
    getCommunityOptionDescription(
      communityPrivacyOptions,
      draft.value.privacy,
      "community.settings.controls.noPrivacy",
    ),
  ),
)

const selectedCategoryLabel = computed(() =>
  t(
    getCommunityOptionLabel(
      communityCategoryOptions,
      draft.value.category,
      "community.groups.card.noCategory",
    ),
  ),
)

const totalPolicies = 5

const enabledPolicies = computed(() =>
  [
    draft.value.joinApproval,
    draft.value.postApproval,
    draft.value.allowMemberInvites,
    draft.value.showMemberDirectory,
    draft.value.welcomePostEnabled,
  ].filter(Boolean).length,
)

const visibleMembers = computed(() =>
  members.value.slice(0, draft.value.showMemberDirectory ? 5 : 3),
)

const groupPath = computed(() =>
  group.value ? getCommunityGroupPath(group.value.slug) : "/groups",
)

const isBusy = computed(() => saveState.value === "loading")
const isSaveDisabled = computed(() =>
  isBusy.value
  || !draft.value.name.trim()
  || !draft.value.slug.trim()
  || draft.value.summary.trim().length < 24
  || !draft.value.category,
)

const statusAlert = computed(() => {
  if (saveState.value === "loading") {
    return {
      color: "primary" as const,
      icon: "i-ph-spinner-gap-bold",
      title: t("community.settings.finish.statusSavingTitle"),
      description: t("community.settings.finish.statusSavingDescription"),
    }
  }

  if (saveState.value === "success") {
    return {
      color: "success" as const,
      icon: "i-ph-check-circle-fill",
      title: t("community.settings.finish.statusSuccessTitle"),
      description: t("community.settings.finish.statusSuccessDescription"),
    }
  }

  if (saveState.value === "error") {
    return {
      color: "error" as const,
      icon: "i-ph-warning-circle-fill",
      title: t("community.settings.finish.statusErrorTitle"),
      description: t("community.settings.finish.statusErrorDescription"),
    }
  }

  if (draftRestored.value) {
    return {
      color: "primary" as const,
      icon: "i-ph-clock-counter-clockwise-fill",
      title: t("community.settings.finish.draftRestoredTitle"),
      description: t("community.settings.finish.draftRestoredDescription"),
    }
  }

  return null
})

watch(group, syncDraftFromGroup, { immediate: true })

watchDebounced(
  () => normalizeDraft(draft.value),
  (value) => {
    if (!storageHydrated.value || !group.value) {
      return
    }

    draftStorage.value = { ...value }
  },
  {
    debounce: 250,
    maxWait: 1000,
  },
)

watch(
  () => ({ ...draft.value }),
  () => {
    if (isSyncingDraft.value) {
      return
    }

    if (saveState.value !== "loading") {
      saveState.value = "idle"
    }

    draftRestored.value = false
  },
)

onMounted(async () => {
  storageHydrated.value = true
  await nextTick()
  syncDraftFromGroup()
})

async function handleSave() {
  saveState.value = "loading"

  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    const normalized = normalizeDraft(draft.value)

    draft.value = { ...normalized }
    draftStorage.value = { ...normalized }
    draftRestored.value = false
    saveState.value = "success"

    toast.add({
      title: t("community.settings.finish.statusSuccessTitle"),
      description: t("community.settings.finish.statusSuccessDescription"),
      color: "success",
    })
  }
  catch {
    saveState.value = "error"

    toast.add({
      title: t("community.settings.finish.statusErrorTitle"),
      description: t("community.settings.finish.statusErrorDescription"),
      color: "error",
    })
  }
}

function handleSaveError() {
  saveState.value = "error"
}

function syncDraftFromGroup() {
  if (!group.value) {
    return
  }

  const baseDraft = createLocalizedDraft(group.value)
  const restoredDraft = storageHydrated.value && draftStorage.value
    ? normalizeDraft(draftStorage.value)
    : null

  applyDraft(
    restoredDraft && !isSameDraft(restoredDraft, baseDraft)
      ? { ...baseDraft, ...restoredDraft }
      : baseDraft,
    Boolean(restoredDraft && !isSameDraft(restoredDraft, baseDraft)),
  )
}

function applyDraft(value: CommunityGroupSettingsDraft, restored: boolean) {
  isSyncingDraft.value = true
  draft.value = value
  draftRestored.value = restored
  saveState.value = "idle"

  nextTick(() => {
    isSyncingDraft.value = false
  })
}

function createLocalizedDraft(value: CommunityGroupRecord): CommunityGroupSettingsDraft {
  return {
    ...createCommunityGroupSettingsDraft(value),
    name: t(value.name),
    summary: t(value.summary),
    locationLabel: value.locationLabel ? t(value.locationLabel) : "",
    tags: value.tags.map(tag => t(tag)).join(", "),
    guidelines: (value.guidelines ?? []).map(rule => t(rule)).join("\n"),
  }
}

function normalizeDraft(value: CommunityGroupSettingsDraft): CommunityGroupSettingsDraft {
  return {
    ...value,
    name: value.name.trim(),
    slug: value.slug.trim(),
    summary: value.summary.trim(),
    website: value.website.trim(),
    locationLabel: value.locationLabel.trim(),
    category: value.category.trim(),
    tags: value.tags
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean)
      .join(", "),
    guidelines: value.guidelines
      .split("\n")
      .map(rule => rule.trim())
      .filter(Boolean)
      .join("\n"),
  }
}

function isSameDraft(first: CommunityGroupSettingsDraft, second: CommunityGroupSettingsDraft) {
  return JSON.stringify(normalizeDraft(first)) === JSON.stringify(normalizeDraft(second))
}

const validateDraft = (state: CommunityGroupSettingsDraft): GroupSettingsError[] => {
  const errors: GroupSettingsError[] = []
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
  else if (slug.length < 3 || createCommunitySlug(slug) !== slug) {
    errors.push({
      name: "slug",
      message: t("community.creation.common.validationSlugInvalid"),
    })
  }

  if (state.summary.trim().length < 24) {
    errors.push({
      name: "summary",
      message: t("community.creation.common.validationDescriptionRequired"),
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
