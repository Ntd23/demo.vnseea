<!-- English description: Renders a PHTML-aligned job summary inside feed posts with reliable links to the job detail route. -->
<template>
  <section class="job-feed-card">
    <div v-if="pending" class="job-feed-card__loading" aria-hidden="true">
      <USkeleton class="job-feed-card__cover-skeleton" />
      <USkeleton class="job-feed-card__avatar-skeleton" />
      <USkeleton class="job-feed-card__title-skeleton" />
      <USkeleton class="job-feed-card__meta-skeleton" />
    </div>

    <template v-else>
      <NuxtLink :to="detailPath" class="job-feed-card__cover-link">
        <NuxtImg
          v-if="coverUrl"
          :src="coverUrl"
          :alt="title"
          width="960"
          height="420"
          loading="lazy"
          class="job-feed-card__cover"
        />
        <span
          v-else
          class="job-feed-card__cover job-feed-card__cover--fallback"
        >
          <Icon
            name="i-ph-briefcase-duotone"
            class="job-feed-card__cover-icon"
          />
        </span>
      </NuxtLink>

      <div class="job-feed-card__body">
        <NuxtLink :to="detailPath" class="job-feed-card__avatar-link">
          <NuxtImg
            v-if="ownerAvatarUrl"
            :src="ownerAvatarUrl"
            :alt="ownerName"
            width="104"
            height="104"
            loading="lazy"
            class="job-feed-card__avatar"
          />
          <span
            v-else
            class="job-feed-card__avatar job-feed-card__avatar--fallback"
          >
            <Icon
              name="i-ph-buildings-duotone"
              class="job-feed-card__avatar-icon"
            />
          </span>
        </NuxtLink>

        <h2 class="job-feed-card__title">
          <NuxtLink :to="detailPath">{{ title }}</NuxtLink>
        </h2>

        <NuxtLink v-if="ownerName" :to="ownerPath" class="job-feed-card__owner">
          {{ ownerName }}
        </NuxtLink>

        <div class="job-feed-card__meta">
          <span v-if="job?.location" class="job-feed-card__meta-item">
            <Icon
              name="i-ph-map-pin-fill"
              class="job-feed-card__meta-icon job-feed-card__meta-icon--location"
            />
            <span>{{ job.location }}</span>
          </span>
          <span v-if="postTime" class="job-feed-card__meta-item">
            <Icon
              name="i-ph-clock-fill"
              class="job-feed-card__meta-icon job-feed-card__meta-icon--time"
            />
            <span>{{ postTime }}</span>
          </span>
          <span v-if="job?.typeLabel" class="job-feed-card__meta-item">
            <Icon
              name="i-ph-briefcase-fill"
              class="job-feed-card__meta-icon job-feed-card__meta-icon--type"
            />
            <span>{{ job.typeLabel }}</span>
          </span>
          <NuxtLink
            v-if="job?.categoryLabel"
            :to="categoryPath"
            class="job-feed-card__meta-item job-feed-card__meta-link"
          >
            <Icon
              name="i-ph-tag-fill"
              class="job-feed-card__meta-icon job-feed-card__meta-icon--category"
            />
            <span>{{ job.categoryLabel }}</span>
          </NuxtLink>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useJobFeedCardVM } from "../../application/view-models/useJobFeedCardVM"

const props = defineProps<{
  postId: number
  postTime?: string
  fallbackTitle: string
  fallbackCoverUrl?: string
  fallbackOwnerName: string
  fallbackOwnerAvatarUrl?: string
  fallbackOwnerPath: string
}>()

const { job, pending } = useJobFeedCardVM(toRef(props, "postId"))

const detailPath = computed(() => appRoutes.postDetail(props.postId))
const title = computed(() => job.value?.title || props.fallbackTitle)
const coverUrl = computed(
  () => job.value?.imageUrl || props.fallbackCoverUrl || "",
)
const ownerName = computed(
  () => job.value?.owner?.name || props.fallbackOwnerName,
)
const ownerAvatarUrl = computed(
  () => job.value?.owner?.avatarUrl || props.fallbackOwnerAvatarUrl || "",
)
const ownerPath = computed(() => {
  const owner = job.value?.owner

  if (!owner?.slug) {
    return props.fallbackOwnerPath
  }

  return owner.kind === "page"
    ? appRoutes.pageDetail(owner.slug)
    : appRoutes.profile(owner.slug)
})
const categoryPath = computed(() => ({
  path: appRoutes.jobs,
  query: {
    category: job.value?.category || undefined,
  },
}))
</script>

<style scoped>
.job-feed-card {
  overflow: hidden;
  margin-top: 12px;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-surface);
}

.job-feed-card__loading {
  position: relative;
  display: flex;
  min-height: 360px;
  flex-direction: column;
  align-items: center;
}

.job-feed-card__cover-skeleton {
  width: 100%;
  height: 230px;
  border-radius: 0;
}

.job-feed-card__avatar-skeleton {
  width: 104px;
  height: 104px;
  margin-top: -52px;
  border: 4px solid var(--bg-surface);
  border-radius: 50%;
}

.job-feed-card__title-skeleton {
  width: min(70%, 380px);
  height: 26px;
  margin-top: 18px;
}

.job-feed-card__meta-skeleton {
  width: min(82%, 520px);
  height: 18px;
  margin-top: 18px;
}

.job-feed-card__cover-link {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 6;
  overflow: hidden;
  background: var(--bg-muted);
}

.job-feed-card__cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.job-feed-card__cover--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-secondary);
}

.job-feed-card__cover-icon {
  width: 54px;
  height: 54px;
}

.job-feed-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px 22px;
  text-align: center;
}

.job-feed-card__avatar-link {
  width: 104px;
  height: 104px;
  margin-top: -52px;
  border: 4px solid var(--bg-surface);
  border-radius: 50%;
  background: var(--bg-surface);
  box-shadow: var(--shadow-md);
}

.job-feed-card__avatar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  object-fit: cover;
}

.job-feed-card__avatar--fallback {
  background: var(--bg-muted);
  color: var(--icon-secondary);
}

.job-feed-card__avatar-icon {
  width: 34px;
  height: 34px;
}

.job-feed-card__title {
  max-width: 100%;
  margin: 18px 0 0;
  color: var(--text-primary);
  font-size: 25px;
  font-weight: 800;
  line-height: 1.25;
}

.job-feed-card__title a,
.job-feed-card__owner,
.job-feed-card__meta-link {
  color: inherit;
  text-decoration: none;
}

.job-feed-card__title a:hover,
.job-feed-card__owner:hover,
.job-feed-card__meta-link:hover {
  color: var(--text-brand);
}

.job-feed-card__owner {
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 600;
}

.job-feed-card__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 12px;
  margin-top: 14px;
}

.job-feed-card__meta-item {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.job-feed-card__meta-item:not(:last-child)::after {
  margin-left: 7px;
  color: var(--text-tertiary);
  content: "\2022";
}

.job-feed-card__meta-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.job-feed-card__meta-icon--location {
  color: var(--color-error);
}

.job-feed-card__meta-icon--time {
  color: var(--color-success);
}

.job-feed-card__meta-icon--type {
  color: var(--color-info);
}

.job-feed-card__meta-icon--category {
  color: var(--color-warning);
}

@media (max-width: 640px) {
  .job-feed-card__cover-link {
    aspect-ratio: 16 / 8;
  }

  .job-feed-card__body {
    padding-right: 14px;
    padding-left: 14px;
  }

  .job-feed-card__avatar-link,
  .job-feed-card__avatar-skeleton {
    width: 88px;
    height: 88px;
    margin-top: -44px;
  }

  .job-feed-card__title {
    font-size: 21px;
  }

  .job-feed-card__meta {
    gap: 7px 9px;
  }
}
</style>
