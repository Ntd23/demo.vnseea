<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10">
    <CommunityCreationHeaderCard
      :eyebrow="$t('community.creation.group.eyebrow')"
      :title="$t('community.creation.group.title')"
      :description="$t('community.creation.group.description')"
      icon="i-ph-users-four-fill"
      :highlights="highlights"
    />

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
      submit-to="/groups"
    />
  </div>
</template>

<script setup lang="ts">
import {
  communityCategoryOptions,
  communityPrivacyOptions,
} from "../../../types/community"
import type { CommunityDraft } from "../../../types/community"

const { t } = useI18n()

useSeoMeta({
  title: `${t("community.creation.group.title")} | VNSEEA`,
  description: t("community.creation.group.description"),
})

const highlights = computed(() => [
  t("community.creation.group.highlights[0]"),
  t("community.creation.group.highlights[1]"),
  t("community.creation.group.highlights[2]"),
])

const draft = ref<CommunityDraft>({
  name: "",
  slug: "",
  description: "",
  privacy: "public",
  category: "auto",
})
</script>
