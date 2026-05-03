<!-- Description: Renders the create-group route with a simple heading-first shell and the existing ordered form fields, aligned to the legacy PHP group creation flow. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 pb-20">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)] sm:px-6">
      <div class="space-y-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {{ $t('community.creation.group.eyebrow') }}
        </p>
        <h1 class="text-[1.7rem] font-black tracking-[-0.04em] text-[#243b63] sm:text-[2rem]">
          {{ $t('community.creation.group.title') }}
        </h1>
        <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
          {{ $t('community.creation.group.description') }}
        </p>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="item in highlights"
          :key="item"
          class="inline-flex items-center rounded-full bg-[#f6f8ff] px-3 py-1.5 text-[12px] font-semibold text-[#243b63]"
        >
          {{ item }}
        </span>
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
      :privacy-label="$t('community.creation.group.privacyLabel')"
      :category-label="$t('community.creation.common.categoryLabel')"
      back-to="/groups"
      :submit-label="$t('community.creation.common.create')"
      :submit-state="submitState"
      :submit-disabled="isSubmitDisabled"
      :draft-restored="draftRestored"
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
