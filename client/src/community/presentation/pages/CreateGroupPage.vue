<!-- Description: Renders the create-group route with a heading-first shell and the existing ordered form fields, aligned to the legacy PHP group creation flow. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-4 pb-20 sm:px-6">
    <CommunityCreationForm
      v-model="draft"
      is-group
      title="Tạo mới nhóm"
      hide-description
      entity-label="community.creation.common.entityLabelGroup"
      :privacy-options="communityPrivacyOptions"
      :category-options="categoryOptions"
      :name-label="$t('community.creation.group.nameLabel')"
      :name-placeholder="$t('community.creation.group.namePlaceholder')"
      url-label="Nhóm URL"
      :url-prefix="urlPrefix"
      :slug-placeholder="$t('community.creation.group.slugPlaceholder')"
      :description-label="$t('community.creation.common.descriptionLabel')"
      :description-placeholder="$t('community.creation.group.description')"
      :privacy-label="$t('community.creation.group.privacyLabel')"
      category-label="Danh mục nhóm"
      :back-to="appRoutes.groups"
      :submit-label="$t('community.creation.common.create')"
      :submit-state="submitState"
      :submit-disabled="isSubmitDisabled"
      @submit="handleCreateGroup"
    />
  </div>
</template>

<script setup lang="ts">
import CommunityCreationForm from "../components/CreationForm.vue"
import { useCommunityCreateGroupPageVM } from "../../application/view-models/useCommunityCreateGroupPageVM"
import {
  communityCategoryOptions,
  communityPrivacyOptions,
} from "../../domain/constants/community-options"
import { useBackendWebBase } from "#shared-kernel/application/utils/backend-web-url"

const { draft, submitState, isSubmitDisabled, handleCreateGroup, appRoutes } = useCommunityCreateGroupPageVM()

const backendWebBase = useBackendWebBase()
const urlPrefix = computed(() => {
  return `${backendWebBase}/g/`
})

const { t } = useI18n()
const categoryOptions = ref<Array<{ label: string; value: string }>>([])

onMounted(async () => {
  try {
    const data = await $fetch<Array<{ label: string; value: string }>>("/_api/community/group-categories")
    if (Array.isArray(data) && data.length > 0) {
      categoryOptions.value = data
      if (!draft.value.category || !data.some(opt => opt.value === draft.value.category)) {
        draft.value.category = data[0].value
      }
    }
  } catch (error) {
    console.error("Failed to load group categories from DB", error)
    categoryOptions.value = communityCategoryOptions.map(option => ({
      value: option.value,
      label: t(option.label),
    }))
  }
})
</script>
