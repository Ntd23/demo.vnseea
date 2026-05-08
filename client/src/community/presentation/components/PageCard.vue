<template>
  <article class="page-card">
    <div class="page-card__main">
      <NuxtLink
        :to="pageTo"
        class="page-card__avatar"
        :style="{ background: page.banner }"
        :aria-label="pageName"
      >
        <span class="page-card__avatar-overlay" />
        <img v-if="page.avatarUrl" :src="page.avatarUrl" :alt="pageName" class="page-card__avatar-img">
        <span v-else class="page-card__avatar-text">{{ avatarLabel }}</span>
      </NuxtLink>

      <div class="page-card__content">
        <div class="page-card__header">
          <NuxtLink :to="pageTo" class="page-card__title">
            {{ pageName }}
          </NuxtLink>
          <span v-if="categoryLabel" class="page-card__category">
            {{ categoryLabel }}
          </span>
        </div>

        <div class="page-card__stats">
          <span class="page-card__stat">
            {{ $t("community.pages.format.followers", { count: followerCountLabel }) }}
          </span>
          <span class="page-card__stat-divider">•</span>
          <span class="page-card__stat">
            {{ $t("community.pages.format.likes", { count: likeCountLabel }) }}
          </span>
        </div>
      </div>
    </div>

    <div class="page-card__actions">
      <NuxtLink
        v-if="page.canManage"
        :to="pageSettingsTo"
        class="page-card__action page-card__action--secondary"
      >
        {{ $t("community.pagesDirectory.actionMine") }}
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

const { t, locale } = useI18n()

const pageName = computed(() => props.page.name)
const likeCountLabel = computed(() => formatCommunityLikeCount(props.page.likes))
const followerCountLabel = computed(() =>
  new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US").format(props.page.followers),
)
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
  props.actionLabel ? t(props.actionLabel) : t("community.pagesDirectory.actionSuggested"),
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
  transition: transform var(--duration-fast) var(--ease-default), box-shadow var(--duration-fast) var(--ease-default);
}

.page-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.page-card__main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.page-card__avatar {
  position: relative;
  display: inline-flex;
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
  text-decoration: none;
}

.page-card__avatar-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.24));
  z-index: 1;
}

.page-card__avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-card__avatar-text {
  position: relative;
  z-index: 2;
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-card__content {
  min-width: 0;
  flex: 1;
}

.page-card__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-card__title {
  display: inline-block;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.3;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-card__title:hover {
  color: var(--text-brand);
}

.page-card__category {
  display: inline-flex;
  align-self: flex-start;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.page-card__stats {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.page-card__stat-divider {
  color: var(--text-tertiary);
  font-size: 10px;
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
  transition: all var(--duration-fast) var(--ease-default);
}

.page-card__action--secondary {
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  background: var(--bg-surface);
}

.page-card__action--secondary:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-active);
}

.page-card__action--primary {
  background: var(--bg-brand);
  color: var(--text-inverse);
  box-shadow: var(--shadow-brand);
}

.page-card__action--primary:hover {
  background: var(--bg-brand-hover);
  transform: translateY(-1px);
}
</style>
