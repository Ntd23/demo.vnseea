<!-- Description: Displays a compact page list row aligned to the legacy PHP pages-list layout without extra dashboard metadata. -->
<template>
  <article class="page-card">
    <div class="page-card__main">
      <NuxtLink :to="pageTo" class="page-card__avatar" :aria-label="pageName">
        <img
          v-if="page.avatarUrl"
          :src="page.avatarUrl"
          :alt="pageName"
          class="page-card__avatar-img"
        >
        <span v-else>{{ avatarLabel }}</span>
      </NuxtLink>

      <div class="page-card__content">
        <NuxtLink :to="pageTo" class="page-card__title">
          {{ pageName }}
        </NuxtLink>

        <div class="page-card__meta">
          <span class="page-card__meta-item">
            <Icon name="i-ph-thumbs-up-duotone" class="h-4 w-4" />
            {{ $t("community.pages.format.likes", { count: likeCountLabel }) }}
          </span>
          <span v-if="categoryLabel" class="page-card__meta-item">
            <Icon name="i-ph-tag-duotone" class="h-4 w-4" />
            {{ categoryLabel }}
          </span>
        </div>

        <p v-if="pageSummary" class="page-card__summary">
          {{ pageSummary }}
        </p>
      </div>
    </div>

    <div class="page-card__actions">
      <NuxtLink
        v-if="page.canManage"
        :to="pageSettingsTo"
        class="page-card__action page-card__action--secondary"
      >
        {{ $t("community.pagesDirectory.settingsAction") }}
      </NuxtLink>

      <NuxtLink
        v-else
        :to="pageTo"
        class="page-card__action page-card__action--primary"
      >
        {{ resolvedActionLabel }}
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  formatCommunityLikeCount,
  getCommunityOptionLabel,
  getCommunityPagePath,
  getCommunityPageSettingsPath,
} from "../../domain/services/community-helpers.service"
import { communityPageCategoryOptions } from "../../domain/constants/community-options"
import type { CommunityPageRecord } from "../../domain/types/community.types"

const props = withDefaults(defineProps<{
  page: CommunityPageRecord
  actionLabel?: string
}>(), {
  actionLabel: "",
})

const { t } = useI18n()

const pageName = computed(() => props.page.name)
const pageSummary = computed(() => props.page.summary)
const likeCountLabel = computed(() => formatCommunityLikeCount(props.page.likes))
const avatarLabel = computed(() => pageName.value.slice(0, 2).toUpperCase())

const categoryLabel = computed(() => {
  const label = getCommunityOptionLabel(
    communityPageCategoryOptions,
    props.page.category,
    "",
  )

  return label ? t(label) : ""
})

const resolvedActionLabel = computed(() =>
  props.actionLabel || t("community.pagesDirectory.actionSuggested"),
)

const pageTo = computed(() => getCommunityPagePath(props.page.slug))
const pageSettingsTo = computed(() => getCommunityPageSettingsPath(props.page.slug))
</script>

<style scoped>
.page-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.page-card__main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.page-card__avatar {
  display: inline-flex;
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
  background: var(--bg-surface-active);
  color: var(--text-brand);
  font-size: 18px;
  font-weight: 800;
  text-decoration: none;
}

.page-card__avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-card__content {
  min-width: 0;
  flex: 1;
}

.page-card__title {
  display: inline-block;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.3;
  text-decoration: none;
}

.page-card__title:hover {
  color: var(--text-brand);
}

.page-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin-top: 8px;
}

.page-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.page-card__summary {
  margin: 10px 0 0;
  color: var(--text-secondary);
  font-size: 13.5px;
  line-height: 1.6;
}

.page-card__actions {
  display: flex;
  justify-content: flex-end;
}

.page-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.page-card__action--secondary {
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  background: var(--bg-surface);
}

.page-card__action--primary {
  background: var(--bg-brand);
  color: var(--text-inverse);
  box-shadow: var(--shadow-brand);
}

.page-card__action--primary:hover {
  background: var(--bg-brand-hover);
}
</style>
