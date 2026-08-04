<!-- Description: Shows every person tagged in a post with profile navigation and lazy follow controls. -->
<template>
  <UModal
    v-model:open="open"
    :title="t('feed.postHeader.taggedPeopleTitle')"
    :description="t('feed.postHeader.taggedPeopleDescription')"
    :ui="{ content: 'sm:max-w-[520px]', body: 'p-0 sm:p-0' }"
  >
    <template #body>
      <div class="tagged-people">
        <div v-for="user in modalUsers" :key="user.id" class="tagged-people__row">
          <NuxtLink :to="user.profilePath" class="tagged-people__identity" @click="open = false">
            <UAvatar :src="user.avatarUrl || undefined" :alt="user.name" size="lg" />
            <span class="tagged-people__copy">
              <strong class="tagged-people__name">{{ user.name }}</strong>
              <span v-if="user.username" class="tagged-people__username">@{{ user.username }}</span>
            </span>
          </NuxtLink>

          <USkeleton v-if="isAuthenticated && user.relationshipLoading" class="tagged-people__button-skeleton" />
          <UButton
            v-else-if="isAuthenticated && user.relationshipLoaded && !user.isOwner && !user.isFollowing && !user.isFollowRequested"
            type="button"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-ph-user-plus-bold"
            :loading="user.followPending"
            @click="handleFollow(user)"
          >
            {{ t("feed.postHeader.follow") }}
          </UButton>
          <span
            v-else-if="isAuthenticated && user.relationshipLoaded && !user.isOwner && (user.isFollowing || user.isFollowRequested)"
            class="tagged-people__relationship"
          >
            <Icon :name="user.isFollowRequested ? 'i-ph-clock-bold' : 'i-ph-check-bold'" />
            {{ t(user.isFollowRequested ? "feed.postHeader.followRequested" : "feed.postHeader.followed") }}
          </span>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { toRef, watch } from "vue"
import { useTaggedPeopleModal, type TaggedPeopleModalUser } from "../../application/composables/useTaggedPeopleModal"
import type { FeedTaggedUser } from "../../domain/types/feed.types"

const props = defineProps<{ users: FeedTaggedUser[] }>()
const open = defineModel<boolean>("open", { default: false })
const { t } = useI18n()
const toast = useToast()
const { users: modalUsers, isAuthenticated, loadRelationships, followUser } = useTaggedPeopleModal(toRef(props, "users"))

watch(open, isOpen => {
  if (isOpen) void loadRelationships()
})

async function handleFollow(user: TaggedPeopleModalUser) {
  try {
    const result = await followUser(user)
    if (!result) return

    toast.add({
      color: "success",
      icon: result.requested ? "i-ph-clock-fill" : "i-ph-user-check-fill",
      title: t(result.requested
        ? "feed.postHeader.hoverFollowRequestedSuccess"
        : "feed.postHeader.hoverFollowSuccess", { name: user.name }),
    })
  }
  catch {
    toast.add({ color: "error", icon: "i-ph-warning-circle-fill", title: t("feed.postHeader.hoverFollowError") })
  }
}
</script>

<style scoped>
.tagged-people { max-height: min(62vh, 560px); overflow-y: auto; }
.tagged-people__row { display: flex; min-height: 72px; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 18px; border-bottom: 1px solid var(--border-light); }
.tagged-people__row:last-child { border-bottom: 0; }
.tagged-people__identity { display: flex; min-width: 0; flex: 1; align-items: center; gap: 12px; color: inherit; text-decoration: none; }
.tagged-people__copy { display: grid; min-width: 0; gap: 2px; }
.tagged-people__name { overflow: hidden; color: var(--text-primary); font-size: 14px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.tagged-people__username { overflow: hidden; color: var(--text-tertiary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.tagged-people__identity:hover .tagged-people__name { color: var(--bg-brand); text-decoration: underline; }
.tagged-people__button-skeleton { width: 92px; height: 32px; flex: 0 0 auto; border-radius: 10px; }
.tagged-people__relationship { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 5px; color: var(--text-tertiary); font-size: 12px; font-weight: 600; }
.tagged-people__relationship :deep(svg) { width: 14px; height: 14px; }

@media (max-width: 480px) {
  .tagged-people__row { padding: 9px 14px; }
  .tagged-people__relationship { font-size: 0; }
  .tagged-people__relationship :deep(svg) { width: 18px; height: 18px; }
}
</style>
