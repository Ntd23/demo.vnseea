<!-- Description: Renders the create-page route with a heading-first shell and the existing ordered form fields, aligned to the legacy PHP page creation flow. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-4 pb-24 sm:px-6">
    <CommunityCreationForm
      v-model="draft"
      entity-label="community.creation.common.entityLabelPage"
      :category-options="communityPageCategoryOptions"
      :show-privacy="false"
      show-location
      show-map-pin-request
      :url-prefix="communityPageUrlPrefix"
      :name-label="$t('community.creation.page.nameLabel')"
      :name-placeholder="$t('community.creation.page.namePlaceholder')"
      :url-label="$t('community.creation.common.urlLabel')"
      :slug-placeholder="$t('community.creation.page.slugPlaceholder')"
      :description-label="$t('community.creation.common.descriptionLabel')"
      :description-placeholder="$t('community.creation.common.introHint', { entity: $t('community.creation.common.entityLabelPage') })"
      :category-label="$t('community.creation.page.categoryLabel')"
      :location-label="$t('community.creation.page.locationLabel')"
      :location-placeholder="$t('community.creation.page.locationPlaceholder')"
      :location-hint="$t('community.creation.page.locationHint')"
      :back-label="$t('community.creation.common.back')"
      :back-to="appRoutes.pages"
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
import CommunityCreationForm from "../components/CreationForm.vue"
import { useCommunityCreatePagePageVM } from "../../application/view-models/useCommunityCreatePagePageVM"
import {
  communityPageCategoryOptions,
  communityPageUrlPrefix,
} from "../../domain/constants/community-options"

const {
  draft,
  submitState,
  draftRestored,
  highlights,
  nextSteps,
  isSubmitDisabled,
  handleCreatePage,
  appRoutes,
} = useCommunityCreatePagePageVM()
</script>
