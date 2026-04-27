<template>
  <div class="mx-auto max-w-[1280px] space-y-10 pb-24 px-4 sm:px-6">
    <CommunityCreationHeaderCard
      :eyebrow="$t('community.creation.page.eyebrow')"
      :title="$t('community.creation.page.title')"
      :description="$t('community.creation.page.description')"
      icon="i-ph-megaphone-simple-fill"
      :highlights="[
        $t('community.creation.page.highlights.0'),
        $t('community.creation.page.highlights.1'),
        $t('community.creation.page.highlights.2')
      ]"
    />

    <CommunityCreationForm
      v-model="draft"
      entity-label="community.creation.common.entityLabelPage"
      :category-options="communityPageCategoryOptions"
      :show-privacy="false"
      :url-prefix="communityPageUrlPrefix"
      :name-label="$t('community.creation.page.nameLabel')"
      :name-placeholder="$t('community.creation.page.namePlaceholder')"
      :url-label="$t('community.creation.common.urlLabel')"
      :slug-placeholder="$t('community.creation.page.slugPlaceholder')"
      :description-label="$t('community.creation.common.descriptionLabel')"
      :description-placeholder="$t('community.creation.common.introHint', { entity: $t('community.creation.common.entityLabelPage') })"
      :category-label="$t('community.creation.page.categoryLabel')"
      :back-label="$t('community.creation.common.back')"
      back-to="/home"
      :submit-label="$t('community.creation.page.submitLabel')"
      :identity-section-label="$t('community.creation.page.identitySectionLabel')"
      :identity-section-title="$t('community.creation.page.identitySectionTitle')"
      :identity-section-badge="$t('community.creation.page.identitySectionBadge')"
      :identity-hint="$t('community.creation.page.identityHint')"
      :description-section-label="$t('community.creation.page.descriptionSectionLabel')"
      :description-section-title="$t('community.creation.page.descriptionSectionTitle')"
      :description-hint="$t('community.creation.page.descriptionHint')"
      :configuration-section-label="$t('community.creation.page.configurationSectionLabel')"
      :configuration-section-title="$t('community.creation.page.configurationSectionTitle')"
      :action-description="$t('community.creation.page.actionDescription')"
      preview-icon="i-ph-storefront-fill"
      :next-steps="nextSteps"
      :submit-state="submitState"
      :submit-disabled="isSubmitDisabled"
      :draft-restored="draftRestored"
      @submit="handleCreatePage"
    />
  </div>
</template>

<script setup lang="ts">
import { useStorage } from "@vueuse/core"
import {
  communityPageCategoryOptions,
  communityPageUrlPrefix,
  createCommunityPageDraft,
  createCommunitySlug,
  getCommunityPagePath,
} from "../../../types/community"
import type { CommunityDraft } from "../../../types/community"

type CommunityCreationState = "idle" | "loading" | "success" | "error"

const { t } = useI18n()
const toast = useToast()

const draft = useStorage<CommunityDraft>(
  "community:create-page-draft",
  createCommunityPageDraft(),
  undefined,
  {
    mergeDefaults: true,
    initOnMounted: true,
  },
)

const submitState = ref<CommunityCreationState>("idle")
const draftRestored = ref(false)

const submitPath = computed(() => {
  const resolvedSlug =
    draft.value.slug.trim()
    || createCommunitySlug(draft.value.name)
    || "fanpage-moi"

  const query = new URLSearchParams()

  if (draft.value.name.trim()) {
    query.set("name", draft.value.name.trim())
  }

  if (draft.value.description.trim()) {
    query.set("description", draft.value.description.trim())
  }

  if (draft.value.category) {
    query.set("category", draft.value.category)
  }

  const queryString = query.toString()

  return `${getCommunityPagePath(resolvedSlug)}${queryString ? `?${queryString}` : ""}`
})

const nextSteps = computed(() => [
  {
    title: t("community.creation.page.nextSteps.step1Title"),
    description: t("community.creation.page.nextSteps.step1Desc"),
  },
  {
    title: t("community.creation.page.nextSteps.step2Title"),
    description: t("community.creation.page.nextSteps.step2Desc"),
  },
  {
    title: t("community.creation.page.nextSteps.step3Title"),
    description: t("community.creation.page.nextSteps.step3Desc"),
  },
])

const isSubmitDisabled = computed(() =>
  submitState.value === "loading"
  || !draft.value.name.trim()
  || !draft.value.slug.trim()
  || draft.value.description.trim().length < 24
  || !draft.value.category,
)

onMounted(async () => {
  await nextTick()
  draftRestored.value = !isDefaultDraft(draft.value)
})

watch(
  () => ({ ...draft.value }),
  () => {
    if (submitState.value !== "loading") {
      submitState.value = "idle"
    }

    draftRestored.value = false
  },
)

async function handleCreatePage() {
  submitState.value = "loading"

  try {
    await new Promise(resolve => setTimeout(resolve, 550))

    submitState.value = "success"

    toast.add({
      title: t("community.creation.common.statusSuccessTitle", {
        entity: t("community.creation.common.entityLabelPage"),
      }),
      description: t("community.creation.common.statusSuccessDescription", {
        entity: t("community.creation.common.entityLabelPage"),
      }),
      color: "success",
    })

    const destination = submitPath.value

    draft.value = createCommunityPageDraft()
    draftRestored.value = false

    await navigateTo(destination)
  }
  catch {
    submitState.value = "error"

    toast.add({
      title: t("community.creation.common.statusErrorTitle"),
      description: t("community.creation.common.statusErrorDescription"),
      color: "error",
    })
  }
}

function isDefaultDraft(value: CommunityDraft) {
  const defaultDraft = createCommunityPageDraft()

  return value.name === defaultDraft.name
    && value.slug === defaultDraft.slug
    && value.description === defaultDraft.description
    && value.privacy === defaultDraft.privacy
    && value.category === defaultDraft.category
}
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

