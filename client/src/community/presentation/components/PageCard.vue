<!-- Description: Displays a compact backend-backed community page card aligned with the shared feed/profile card system. -->
<template>
  <article class="page-card">
    <NuxtLink :to="pageTo" class="page-card__cover" :style="{ background: page.banner }" :aria-label="pageName">
      <span class="page-card__category">{{ categoryLabel }}</span>
      <span v-if="page.canManage" class="page-card__owner-badge">
        <Icon name="i-ph-flag-fill" class="h-4 w-4" />
      </span>
    </NuxtLink>

    <div class="page-card__content">
      <div class="page-card__identity">
        <NuxtLink :to="pageTo" class="page-card__avatar" :style="{ background: page.accent }" :aria-label="pageName">
          <img
            v-if="page.avatarUrl"
            :src="page.avatarUrl"
            :alt="pageName"
            class="page-card__avatar-img"
          >
          <span v-else>{{ avatarLabel }}</span>
        </NuxtLink>

        <div class="page-card__title-wrap">
          <NuxtLink :to="pageTo" class="page-card__title">
            {{ pageName }}
          </NuxtLink>
          <p class="page-card__slug">/p/{{ page.slug }}</p>
        </div>
      </div>

      <p v-if="pageSummary" class="page-card__summary">
        {{ pageSummary }}
      </p>

      <div class="page-card__stats">
        <span class="page-card__chip">
          <Icon name="i-ph-users-three-duotone" class="h-4 w-4" />
          {{ $t("community.pages.format.followers", { count: followerCountLabel }) }}
        </span>
        <span class="page-card__chip">
          <Icon name="i-ph-thumbs-up-duotone" class="h-4 w-4" />
          {{ $t("community.pages.format.likes", { count: likeCountLabel }) }}
        </span>
      </div>

      <div v-if="ownerLabel || responseLabel || locationLabel" class="page-card__meta">
        <p v-if="ownerLabel">
          <Icon name="i-ph-briefcase-duotone" class="h-4 w-4" />
          <span>{{ ownerLabel }}</span>
        </p>
        <p v-if="responseLabel">
          <Icon name="i-ph-chat-centered-dots-duotone" class="h-4 w-4" />
          <span>{{ responseLabel }}</span>
        </p>
        <p v-if="locationLabel">
          <Icon name="i-ph-map-pin-duotone" class="h-4 w-4" />
          <span>{{ locationLabel }}</span>
        </p>
      </div>

      <div v-if="localizedTags.length" class="page-card__tags">
        <span
          v-for="tag in localizedTags.slice(0, 3)"
          :key="tag"
          class="page-card__tag"
        >
          #{{ tag }}
        </span>
      </div>

      <div class="page-card__actions">
        <NuxtLink
          v-if="page.canManage"
          :to="pageSettingsTo"
          class="page-card__action page-card__action--secondary"
        >
          <Icon name="i-ph-gear-six-duotone" class="mr-1.5 h-4 w-4" />
          {{ $t("community.pagesDirectory.settingsAction") }}
        </NuxtLink>

        <NuxtLink
          :to="pageTo"
          class="page-card__action page-card__action--primary"
        >
          {{ resolvedActionLabel }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  formatCommunityFollowerCount,
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

const pageName = computed(() => t(props.page.name))
const pageSummary = computed(() => t(props.page.summary))
const ownerLabel = computed(() => props.page.ownerLabel ? t(props.page.ownerLabel) : "")
const responseLabel = computed(() => props.page.responseLabel ? t(props.page.responseLabel) : "")
const locationLabel = computed(() =>
  props.page.locationLabel ? t(props.page.locationLabel) : "",
)
const localizedTags = computed(() => props.page.tags.map(tag => t(tag)).filter(Boolean))
const followerCountLabel = computed(() => formatCommunityFollowerCount(props.page.followers))
const likeCountLabel = computed(() => formatCommunityLikeCount(props.page.likes))
const avatarLabel = computed(() => pageName.value.slice(0, 2).toUpperCase())

const categoryLabel = computed(() => {
  const label = getCommunityOptionLabel(
    communityPageCategoryOptions,
    props.page.category,
    "community.groups.card.noCategory",
  )

  return t(label)
})

const resolvedActionLabel = computed(() =>
  props.actionLabel || t("community.pagesDirectory.actionMine"),
)

const pageTo = computed(() => getCommunityPagePath(props.page.slug))
const pageSettingsTo = computed(() => getCommunityPageSettingsPath(props.page.slug))
</script>

<style scoped>
.page-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.page-card:hover {
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.page-card__cover {
  position: relative;
  display: block;
  height: 112px;
  overflow: hidden;
  color: #ffffff;
  text-decoration: none;
}

.page-card__cover::after {
  position: absolute;
  inset: 0;
  content: "";
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.36));
}

.page-card__category,
.page-card__owner-badge {
  position: absolute;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.42);
  color: #ffffff;
  backdrop-filter: blur(10px);
}

.page-card__category {
  top: 12px;
  left: 12px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.page-card__owner-badge {
  right: 12px;
  bottom: 12px;
  justify-content: center;
  width: 34px;
  height: 34px;
}

.page-card__content {
  padding: 16px;
}

.page-card__identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-card__avatar {
  display: flex;
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
  color: #ffffff;
  font-size: 16px;
  font-weight: 900;
  text-decoration: none;
}

.page-card__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.page-card__title-wrap {
  min-width: 0;
}

.page-card__title {
  display: block;
  overflow: hidden;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
}

.page-card__title:hover {
  color: #0000ff;
}

.page-card__slug {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.page-card__summary {
  display: -webkit-box;
  margin: 12px 0 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: #334155;
  font-size: 13.5px;
  line-height: 1.55;
}

.page-card__stats,
.page-card__tags,
.page-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.page-card__chip,
.page-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.page-card__chip {
  background: rgba(0, 0, 255, 0.05);
  color: #334155;
  padding: 6px 10px;
}

.page-card__tag {
  border: 1px solid rgba(0, 0, 255, 0.12);
  color: #0000ff;
  padding: 5px 10px;
}

.page-card__meta {
  display: grid;
  gap: 8px;
  margin-top: 14px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.page-card__meta p {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.page-card__meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-card__actions {
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}

.page-card__action {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  text-decoration: none;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.page-card__action:hover {
  transform: translateY(-1px);
}

.page-card__action--secondary {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.page-card__action--secondary:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.page-card__action--primary {
  border: 1px solid #60a5fa;
  background: #3b82f6;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 255, 0.16);
}

.page-card__action--primary:hover {
  background: #2563eb;
}

@media (max-width: 639px) {
  .page-card__actions {
    justify-content: stretch;
  }

  .page-card__actions :deep(a),
  .page-card__actions :deep(button) {
    flex: 1;
    justify-content: center;
  }
}
</style>
