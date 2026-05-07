<!-- Description: Renders the create-group route with a simple heading-first shell and the existing ordered form fields, aligned to the legacy PHP group creation flow. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 pb-20">
    <section class="rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-10 shadow-[var(--shadow-md)] sm:px-12 sm:py-14">
      <div class="max-w-3xl space-y-4">
        <h1 class="text-heading text-[2rem] text-[var(--text-primary)] sm:text-[2.75rem]">
          {{ $t('community.creation.group.title') }}
        </h1>
        <p class="text-[16px] font-medium leading-relaxed text-[var(--text-secondary)]">
          {{ $t('community.creation.group.description') }}
        </p>
      </div>
    </section>

    <CommunityCreationForm
      v-model="draft"
      entity-label="community.creation.common.entityLabelGroup"
      :privacy-options="communityPrivacyOptions"
      :category-options="communityCategoryOptions"
      :name-label="$t('community.creation.group.nameLabel')"
      :name-placeholder="$t('community.creation.group.namePlaceholder')"
      :url-label="$t('community.creation.common.urlLabel')"
      :slug-placeholder="$t('community.creation.group.slugPlaceholder')"
      :description-label="$t('community.creation.common.descriptionLabel')"
      :description-placeholder="$t('community.creation.group.description')"
      back-to="/groups"
      :submit-label="$t('community.creation.common.create')"
      :submit-state="submitState"
      :submit-disabled="isSubmitDisabled"
      @submit="handleCreateGroup"
    />
  </div>
</template>

<script setup lang="ts">
import { useStorage } from "@vueuse/core"
import CommunityCreationForm from "../components/CreationForm.vue"
import { createCommunityGroupDraft } from "../../application/factories/community-drafts"
import {
  communityCategoryOptions,
  communityPrivacyOptions,
} from "../../domain/constants/community-options"
import { getCommunityGroupPath } from "../../domain/services/community-helpers.service"
import type { CommunityDraft } from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

type CommunityCreationState = "idle" | "loading" | "success" | "error"

const { t } = useI18n()
const toast = useToast()
const repository = createApiCommunityRepository()

const draft = useStorage<CommunityDraft>(
  "community:create-group-draft",
  createCommunityGroupDraft(),
  undefined,
  {
    mergeDefaults: true,
    initOnMounted: true,
  },
)

const submitState = ref<CommunityCreationState>("idle")
const draftRestored = ref(false)

const highlights = computed(() => [
  t("community.creation.group.highlights[0]"),
  t("community.creation.group.highlights[1]"),
  t("community.creation.group.highlights[2]"),
])

const isSubmitDisabled = computed(() =>
  submitState.value === "loading"
  || !draft.value.name.trim()
  || !draft.value.slug.trim()
  || draft.value.description.trim().length < 24
  || !draft.value.privacy
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

async function handleCreateGroup() {
  submitState.value = "loading"

  try {
    const createdGroup = await repository.createGroup(draft.value)

    submitState.value = "success"

    toast.add({
      title: t("community.creation.common.statusSuccessTitle", {
        entity: t("community.creation.common.entityLabelGroup"),
      }),
      description: t("community.creation.common.statusSuccessDescription", {
        entity: t("community.creation.common.entityLabelGroup"),
      }),
      color: "success",
    })

    draft.value = createCommunityGroupDraft()
    draftRestored.value = false

    await navigateTo(getCommunityGroupPath(createdGroup.slug))
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
  const defaultDraft = createCommunityGroupDraft()

  return value.name === defaultDraft.name
    && value.slug === defaultDraft.slug
    && value.description === defaultDraft.description
    && value.privacy === defaultDraft.privacy
    && value.category === defaultDraft.category
}
</script>
