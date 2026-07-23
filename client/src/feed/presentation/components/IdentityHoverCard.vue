<!-- Description: Lazy hover card for user and community-page authors shown from feed post identities. -->
<template>
  <div
    class="identity-hover"
    @mouseenter="openCard"
    @mouseleave="scheduleClose"
    @focusin="openCard"
    @focusout="scheduleClose"
  >
    <slot />

    <Transition name="identity-hover-card">
      <section
        v-if="visible && supportedIdentity"
        class="identity-hover__card"
        @mouseenter="cancelClose"
        @mouseleave="scheduleClose"
      >
        <button class="identity-hover__close" type="button" :aria-label="t('feed.postHeader.hoverClose')" @click="visible = false">
          <Icon name="i-ph-x-bold" />
        </button>

        <div class="identity-hover__profile">
          <NuxtLink :to="authorPath" class="identity-hover__avatar" @click="visible = false">
            <img v-if="displayAvatar" :src="displayAvatar" :alt="displayName">
            <span v-else>{{ initials }}</span>
          </NuxtLink>
          <div class="identity-hover__copy">
            <NuxtLink :to="authorPath" class="identity-hover__name" @click="visible = false">
              {{ displayName }}
            </NuxtLink>
            <span v-if="identityType === 'page'" class="identity-hover__kind">
              <Icon name="i-ph-flag-fill" />
              {{ t("feed.postHeader.hoverPage") }}<template v-if="displayRole"> · {{ displayRole }}</template>
            </span>
            <span v-else-if="displayRole" class="identity-hover__kind">
              <Icon name="i-ph-user-circle-fill" />
              {{ displayRole }}
            </span>
            <span v-if="followersLabel" class="identity-hover__followers">
              <Icon name="i-ph-seal-check-fill" />
              {{ followersLabel }}
            </span>
          </div>
        </div>

        <p v-if="description" class="identity-hover__description">{{ description }}</p>

        <div v-if="loading" class="identity-hover__loading">
          <Icon name="i-ph-circle-notch-bold" class="animate-spin" />
          {{ t("feed.postHeader.hoverLoading") }}
        </div>

        <div v-else-if="!isOwnIdentity" class="identity-hover__actions">
          <button class="identity-hover__action identity-hover__action--message" type="button" @click="openMessages">
            <Icon name="i-ph-messenger-logo-fill" />
            {{ t("feed.postHeader.hoverMessage") }}
          </button>
          <button
            class="identity-hover__action"
            :class="{ 'identity-hover__action--following': relationshipActive }"
            type="button"
            :disabled="followPending || !detailsLoaded"
            @click="toggleRelationship"
          >
            <Icon :name="relationshipActive ? 'i-ph-check-circle-fill' : identityType === 'page' ? 'i-ph-thumbs-up-fill' : 'i-ph-user-plus-fill'" />
            {{ followPending
              ? t("feed.postHeader.following")
              : identityType === "page"
                ? page?.liked
                  ? t("feed.postHeader.hoverLikedPage")
                  : t("feed.postHeader.hoverLikePage")
                : isFollowing
                  ? t("feed.postHeader.followed")
                  : t("feed.postHeader.follow") }}
          </button>
        </div>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { createApiCommunityRepository } from "../../../community/infrastructure/repositories/ApiCommunityRepository"
import type { CommunityPageRecord } from "../../../community/domain/types/community.types"
import { createApiProfileRepository } from "../../../profile/infrastructure/repositories/ApiProfileRepository"
import type { ProfileApiResponse } from "../../../profile/domain/types/profile.types"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"

const props = defineProps<{
  author: string
  authorAvatarUrl?: string
  authorPath?: string
  authorId?: number
  role?: string
}>()

const { t, locale } = useI18n()
const toast = useToast()
const profileRepository = createApiProfileRepository()
const communityRepository = createApiCommunityRepository()
const visible = ref(false)
const loading = ref(false)
const loadAttempted = ref(false)
const followPending = ref(false)
const profile = ref<ProfileApiResponse | null>(null)
const page = ref<CommunityPageRecord | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | undefined

const identityType = computed<"user" | "page" | null>(() => {
  if (props.authorPath?.startsWith("/@")) return "user"
  if (props.authorPath?.startsWith("/p/")) return "page"
  return null
})
const identityKey = computed(() => {
  const prefix = identityType.value === "user" ? "/@" : identityType.value === "page" ? "/p/" : ""
  return prefix && props.authorPath?.startsWith(prefix)
    ? decodeURIComponent(props.authorPath.slice(prefix.length).split(/[/?#]/)[0] ?? "")
    : ""
})
const supportedIdentity = computed(() => Boolean(identityType.value && identityKey.value))
const detailsLoaded = computed(() => identityType.value === "user" ? Boolean(profile.value) : Boolean(page.value))
const displayName = computed(() => profile.value?.displayName || page.value?.name || props.author)
const displayAvatar = computed(() => profile.value?.avatarUrl || page.value?.avatarUrl || props.authorAvatarUrl || "")
const pageCategoryLabel = computed(() => {
  if (!page.value) return ""

  const key = `pages.pageDetailPage.categories.${page.value.category}`
  const translated = t(key)

  return translated === key
    ? page.value.ownerLabel || page.value.category
    : translated
})
const displayRole = computed(() => profile.value?.headline || pageCategoryLabel.value || props.role || "")
const description = computed(() => profile.value?.bio || page.value?.summary || "")
const followersCount = computed(() => profile.value?.followersCount ?? page.value?.followers ?? 0)
const numberFormatter = computed(() => new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
}))
const followersLabel = computed(() => detailsLoaded.value
  ? t("feed.postHeader.hoverFollowers", { count: numberFormatter.value.format(followersCount.value) })
  : "")
const isFollowing = computed(() => profile.value
  ? profile.value.isFollowing || profile.value.isFollowRequested
  : page.value?.following === true)
const relationshipActive = computed(() => identityType.value === "page" ? page.value?.liked === true : isFollowing.value)
const isOwnIdentity = computed(() => profile.value?.isOwner === true || page.value?.canManage === true)
const initials = computed(() => displayName.value.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase() ?? "").join("") || "U")
const authorPath = computed(() => props.authorPath || "#")

const cancelClose = () => {
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = undefined
}

const scheduleClose = () => {
  cancelClose()
  closeTimer = setTimeout(() => { visible.value = false }, 180)
}

const loadDetails = async () => {
  if (!supportedIdentity.value || detailsLoaded.value || loading.value || loadAttempted.value) return

  loadAttempted.value = true
  loading.value = true
  try {
    if (identityType.value === "user") profile.value = await profileRepository.getProfileByUsername(identityKey.value)
    else page.value = await communityRepository.getPageBySlug(identityKey.value)
  }
  catch {
    toast.add({
      color: "warning",
      icon: "i-ph-warning-circle-fill",
      title: t("feed.postHeader.hoverLoadError"),
    })
  }
  finally {
    loading.value = false
  }
}

const openCard = () => {
  cancelClose()
  if (!supportedIdentity.value) return
  visible.value = true
  void loadDetails()
}

const toggleRelationship = async () => {
  if (followPending.value || !detailsLoaded.value) return

  followPending.value = true
  try {
    if (identityType.value === "page" && page.value) {
      page.value = await communityRepository.likePage(page.value.slug)
      toast.add({
        color: "success",
        icon: page.value.liked ? "i-ph-thumbs-up-fill" : "i-ph-thumbs-down-fill",
        title: t(page.value.liked
          ? "feed.postHeader.hoverPageLikedSuccess"
          : "feed.postHeader.hoverPageUnlikedSuccess", { name: page.value.name }),
      })
      return
    }

    if (profile.value) {
      const wasFollowing = profile.value.isFollowing || profile.value.isFollowRequested
      const result = await profileRepository.runProfileAction({ action: "follow", userId: profile.value.id })
      const status = result.status.toLowerCase()
      const unfollowed = /unfollow|remove|delete|not_follow|none|0/.test(status)
      const requested = status.includes("request")
      const nextFollowing = !unfollowed && !requested && (!wasFollowing || /follow|following|1/.test(status))
      const followerDelta = profile.value.isFollowing && !nextFollowing
        ? -1
        : !profile.value.isFollowing && nextFollowing
          ? 1
          : 0
      profile.value = {
        ...profile.value,
        isFollowing: nextFollowing,
        isFollowRequested: !unfollowed && requested,
        followersCount: Math.max(0, profile.value.followersCount + followerDelta),
      }
      toast.add({
        color: "success",
        icon: requested
          ? "i-ph-clock-fill"
          : nextFollowing
            ? "i-ph-user-check-fill"
            : "i-ph-user-minus-fill",
        title: t(requested
          ? "feed.postHeader.hoverFollowRequestedSuccess"
          : nextFollowing
            ? "feed.postHeader.hoverFollowSuccess"
            : "feed.postHeader.hoverUnfollowSuccess", { name: profile.value.displayName }),
      })
    }
  }
  catch {
    toast.add({
      color: "error",
      icon: "i-ph-warning-circle-fill",
      title: t(identityType.value === "page"
        ? "feed.postHeader.hoverPageLikeError"
        : "feed.postHeader.hoverFollowError"),
    })
  }
  finally {
    followPending.value = false
  }
}

const openMessages = async () => {
  const userId = profile.value?.id || page.value?.ownerId || props.authorId
  const query = userId
    ? { userId: String(userId), name: displayName.value }
    : identityType.value === "user"
      ? { user: identityKey.value }
      : { page: identityKey.value }

  visible.value = false
  await navigateTo({ path: appRoutes.messages, query })
}

onBeforeUnmount(cancelClose)
</script>

<style scoped>
.identity-hover { position: relative; }
.identity-hover__card { position: absolute; left: 0; top: calc(100% + 8px); z-index: 1200; width: min(370px, calc(100vw - 32px)); border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; padding: 16px; box-shadow: 0 16px 42px rgba(15, 23, 42, 0.2); }
.identity-hover__close { position: absolute; right: 12px; top: 12px; display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border: 0; border-radius: 50%; background: #f1f5f9; color: #334155; cursor: pointer; }
.identity-hover__close :deep(svg) { width: 15px; height: 15px; }
.identity-hover__profile { display: flex; min-width: 0; align-items: center; gap: 13px; padding-right: 34px; }
.identity-hover__avatar { display: flex; width: 72px; height: 72px; flex: 0 0 72px; align-items: center; justify-content: center; overflow: hidden; border-radius: 50%; background: #eef2ff; color: var(--bg-brand); font-weight: 800; text-decoration: none; }
.identity-hover__avatar img { width: 100%; height: 100%; object-fit: cover; }
.identity-hover__copy { display: grid; min-width: 0; gap: 5px; }
.identity-hover__name { overflow: hidden; color: #0f172a; font-size: 18px; font-weight: 850; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; }
.identity-hover__kind, .identity-hover__followers { display: flex; min-width: 0; align-items: center; gap: 6px; color: #64748b; font-size: 12px; font-weight: 650; }
.identity-hover__kind :deep(svg), .identity-hover__followers :deep(svg) { width: 15px; height: 15px; flex: 0 0 auto; }
.identity-hover__description { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin: 12px 0 0; color: #475569; font-size: 12.5px; line-height: 1.55; }
.identity-hover__loading { display: flex; align-items: center; gap: 7px; margin-top: 14px; color: #64748b; font-size: 12px; font-weight: 700; }
.identity-hover__loading :deep(svg) { width: 16px; height: 16px; }
.identity-hover__actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-top: 15px; }
.identity-hover__action { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; gap: 7px; border: 1px solid var(--bg-brand); border-radius: 10px; background: var(--bg-brand); color: #fff; font-size: 12.5px; font-weight: 800; cursor: pointer; }
.identity-hover__action :deep(svg) { width: 16px; height: 16px; }
.identity-hover__action--message { background: var(--bg-brand); border-color: var(--bg-brand); }
.identity-hover__action--following { border-color: #dbe3ef; background: #f1f5f9; color: #334155; }
.identity-hover__action:disabled { cursor: wait; opacity: .65; }
.identity-hover-card-enter-active, .identity-hover-card-leave-active { transition: opacity .14s ease, transform .14s ease; transform-origin: left top; }
.identity-hover-card-enter-from, .identity-hover-card-leave-to { opacity: 0; transform: translateY(-4px) scale(.98); }
@media (max-width: 520px) { .identity-hover__card { left: -4px; } .identity-hover__avatar { width: 60px; height: 60px; flex-basis: 60px; } }
</style>
