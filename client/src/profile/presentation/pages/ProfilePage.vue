<!-- Description: Renders the profile screen with backend-backed user data while preserving the legacy PHP section order. -->
<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-4 pb-16 pt-4 sm:px-6">
    <section
      v-if="pending"
      class="rounded-[28px] border border-[#dbe4f4] bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
    >
      <div class="space-y-3">
        <USkeleton class="h-6 w-28 rounded-full" />
        <USkeleton class="h-10 w-72 rounded-2xl" />
        <USkeleton class="h-5 w-full rounded-xl" />
        <USkeleton class="h-5 w-2/3 rounded-xl" />
      </div>
    </section>

    <section
      v-else-if="!profile"
      class="rounded-[28px] border border-[#dbe4f4] bg-white px-6 py-12 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
    >
      <FoundationEmptyState
        icon="i-ph-user-circle-duotone"
        :title="$t('pages.profilePage.emptyTitle')"
        :description="$t('pages.profilePage.emptyDescription')"
      />
    </section>

    <template v-else>
      <section class="overflow-hidden rounded-[28px] border border-[#dbe4f4] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div class="relative h-[220px] overflow-hidden sm:h-[300px]">
          <img
            v-if="profile.coverImage"
            :src="profile.coverImage"
            :alt="profile.displayName"
            class="h-full w-full object-cover"
          >
          <div
            v-else
            class="h-full w-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_56%,#bfdbfe_100%)]"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/15 to-transparent" />

          <div v-if="profile.isOwner" class="absolute right-4 top-4 flex gap-2">
            <button class="profile-page__cover-action" type="button">
              <Icon name="i-ph-camera-duotone" class="h-4 w-4" />
            </button>
            <button class="profile-page__cover-action" type="button">
              <Icon name="i-ph-crop-duotone" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="px-4 pb-5 sm:px-6">
          <div class="-mt-14 flex flex-col gap-5 lg:-mt-16 lg:flex-row lg:items-end lg:justify-between">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div class="relative shrink-0">
                <UAvatar
                  :src="profile.avatarUrl"
                  :text="profile.avatarText"
                  size="3xl"
                  class="h-[110px] w-[110px] ring-4 ring-white shadow-[0_18px_34px_rgba(15,23,42,0.18)] sm:h-[128px] sm:w-[128px]"
                  :ui="{
                    rounded: 'rounded-[32px]',
                    background: 'bg-primary-600',
                    text: 'text-white font-black text-3xl',
                  }"
                />
                <button v-if="profile.isOwner" class="profile-page__avatar-action" type="button">
                  <Icon name="i-ph-camera-plus-duotone" class="h-4 w-4" />
                </button>
              </div>

              <div class="space-y-3">
                <div class="space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h1 class="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                      {{ profile.displayName }}
                    </h1>
                    <UBadge v-if="profile.verified" color="primary" variant="soft" class="rounded-full px-3 py-1 font-semibold">
                      <Icon name="i-ph-seal-check-duotone" class="mr-1 h-4 w-4" />
                      {{ $t("settings.data.fields.verified") }}
                    </UBadge>
                    <UBadge v-if="profile.roleBadge" color="neutral" variant="soft" class="rounded-full px-3 py-1 font-semibold">
                      {{ profile.roleBadge }}
                    </UBadge>
                  </div>
                  <p class="text-sm font-semibold text-slate-600">
                    @{{ profile.username }}
                    <span v-if="profile.statusBadge"> · {{ profile.statusBadge }}</span>
                  </p>
                </div>

                <p v-if="profile.bio" class="max-w-3xl text-sm leading-6 text-slate-700">
                  {{ profile.bio }}
                </p>

                <div class="flex flex-wrap gap-3">
                  <div
                    v-for="stat in profile.stats"
                    :key="stat.label"
                    class="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3"
                  >
                    <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ stat.label }}</p>
                    <p class="mt-1 text-base font-black text-[var(--text-primary)]">{{ stat.value }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="action in heroActions"
                :key="action.id"
                :variant="action.variant === 'solid' ? 'solid' : 'soft'"
                :color="action.variant === 'solid' ? 'primary' : 'neutral'"
                class="rounded-full px-5 font-semibold"
              >
                <template #leading>
                  <Icon :name="action.icon" class="h-4 w-4" />
                </template>
                {{ action.label }}
              </UButton>
            </div>
          </div>

          <nav class="mt-5 border-t border-[#e2e8f0] pt-4">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="profile-page__tab"
                :class="{ 'profile-page__tab--active': activeTab === tab.key }"
                type="button"
                @click="activeTab = tab.key"
              >
                {{ tab.label }}
              </button>
            </div>
          </nav>
        </div>
      </section>

      <template v-if="activeTab === 'timeline'">
        <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <section class="min-w-0 space-y-5">
            <section v-if="profile.isOwner && copy.completionItems.length" class="surface-card space-y-4 p-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ copy.completionTitle }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="item in copy.completionItems"
                  :key="item"
                  color="primary"
                  variant="soft"
                  class="rounded-full px-3 py-1 font-semibold"
                >
                  {{ item }}
                </UBadge>
              </div>
            </section>

            <FeedPublisherBox v-if="profile.isOwner" />

            <div v-if="timelinePosts.length" class="space-y-5">
              <FeedPostCard v-for="post in timelinePosts" :key="post.id" :post="post" />
            </div>

            <UAlert
              v-else
              color="neutral"
              variant="subtle"
              icon="i-ph-newspaper-clipping-duotone"
              :title="$t('pages.pageDetailPage.feedEmptyTitle')"
              :description="$t('pages.pageDetailPage.feedEmptyDescription')"
              class="rounded-[24px]"
            />
          </section>

          <aside class="space-y-5">
            <section v-if="profile.intro.length" class="surface-card space-y-4 p-5">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-black text-[var(--text-primary)]">{{ copy.introTitle }}</h2>
                <UButton variant="ghost" color="primary" size="xs" class="font-semibold">
                  {{ copy.introAction }}
                </UButton>
              </div>

              <div class="space-y-3">
                <div
                  v-for="item in profile.intro"
                  :key="`${item.label}-${item.value}`"
                  class="flex items-start gap-3 rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3"
                >
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-primary-600 shadow-sm">
                    <Icon :name="item.icon" class="h-5 w-5" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ item.label }}</p>
                    <p class="mt-1 text-sm font-semibold text-[var(--text-primary)]">{{ item.value }}</p>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="friends.length" class="surface-card space-y-4 p-5">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-black text-[var(--text-primary)]">{{ copy.friendsTitle }}</h2>
                <UButton variant="ghost" color="primary" size="xs" class="font-semibold">
                  {{ copy.friendsAction }}
                </UButton>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="friend in friends.slice(0, 4)"
                  :key="friend.id"
                  class="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-3"
                >
                  <UAvatar
                    :text="friend.initials"
                    size="md"
                    :ui="{
                      rounded: 'rounded-xl',
                      background: 'bg-primary-600',
                      text: 'text-white font-bold',
                    }"
                  />
                  <p class="mt-3 truncate text-sm font-black text-[var(--text-primary)]">{{ friend.name }}</p>
                  <p class="text-xs text-slate-500">{{ friend.meta }}</p>
                </div>
              </div>
            </section>

            <section class="surface-card space-y-4 p-5">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-black text-[var(--text-primary)]">{{ copy.photosTitle }}</h2>
                <UButton variant="ghost" color="primary" size="xs" class="font-semibold">
                  {{ copy.photosAction }}
                </UButton>
              </div>

              <UAlert
                color="neutral"
                variant="subtle"
                icon="i-ph-images-duotone"
                :title="$t('pages.pageDetailPage.feedEmptyTitle')"
                :description="$t('pages.pageDetailPage.feedEmptyDescription')"
                class="rounded-[20px]"
              />
            </section>
          </aside>
        </div>
      </template>

      <section v-else-if="activeTab === 'about'" class="surface-card space-y-5 p-5">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ copy.aboutTitle }}</p>
          <h2 class="mt-1 text-xl font-black text-[var(--text-primary)]">{{ profile.displayName }}</h2>
        </div>

        <div v-if="profile.aboutSections.length" class="grid gap-4 lg:grid-cols-2">
          <section
            v-for="section in profile.aboutSections"
            :key="section.title"
            class="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5"
          >
            <h3 class="text-base font-black text-[var(--text-primary)]">{{ section.title }}</h3>
            <div class="mt-4 space-y-3">
              <div
                v-for="item in section.items"
                :key="`${item.label}-${item.value}`"
                class="flex items-start gap-3"
              >
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-primary-600 shadow-sm">
                  <Icon :name="item.icon" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ item.label }}</p>
                  <p class="mt-1 text-sm font-semibold text-[var(--text-primary)]">{{ item.value }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-ph-info-duotone"
          :title="$t('pages.pageDetailPage.feedEmptyTitle')"
          :description="$t('pages.pageDetailPage.feedEmptyDescription')"
          class="rounded-[24px]"
        />
      </section>

      <section v-else-if="activeTab === 'friends'" class="surface-card space-y-5 p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ copy.friendsTitle }}</p>
            <h2 class="mt-1 text-xl font-black text-[var(--text-primary)]">{{ friends.length }} {{ copy.friendsTitle }}</h2>
          </div>
          <UButton variant="soft" color="primary" class="rounded-full px-5 font-semibold">
            {{ copy.friendsAction }}
          </UButton>
        </div>

        <div v-if="friends.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="friend in friends"
            :key="friend.id"
            class="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
          >
            <UAvatar
              :text="friend.initials"
              size="lg"
              :ui="{
                rounded: 'rounded-2xl',
                background: 'bg-primary-600',
                text: 'text-white font-bold',
              }"
            />
            <p class="mt-4 text-base font-black text-[var(--text-primary)]">{{ friend.name }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ friend.meta }}</p>
          </div>
        </div>

        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-ph-users-three-duotone"
          :title="$t('pages.pageDetailPage.feedEmptyTitle')"
          :description="$t('pages.pageDetailPage.feedEmptyDescription')"
          class="rounded-[24px]"
        />
      </section>

      <section v-else class="surface-card space-y-5 p-5">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ activeTab === 'videos' ? copy.videosTitle : activeTab === 'photos' ? copy.photosTitle : copy.albumsTitle }}
          </p>
          <h2 class="mt-1 text-xl font-black text-[var(--text-primary)]">
            {{ activeTab === 'videos' ? copy.videosTitle : activeTab === 'photos' ? copy.photosTitle : copy.albumsTitle }}
          </h2>
        </div>

        <UAlert
          color="neutral"
          variant="subtle"
          icon="i-ph-images-square-duotone"
          :title="$t('pages.pageDetailPage.feedEmptyTitle')"
          :description="$t('pages.pageDetailPage.feedEmptyDescription')"
          class="rounded-[24px]"
        />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import FeedPublisherBox from "../../../feed/presentation/components/FeedPublisherBox.vue"
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import { useProfileVM } from "../../application/composables/useProfileVM"

const route = useRoute()

const username = computed(() => {
  const value = route.params.username
  return Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "")
})

const {
  activeTab,
  copy,
  friends,
  heroActions,
  pending,
  profile,
  tabs,
  timelinePosts,
} = useProfileVM(username)
</script>

<style scoped>
.profile-page__cover-action,
.profile-page__avatar-action,
.profile-page__tab {
  transition: all 0.2s ease;
}

.profile-page__cover-action,
.profile-page__avatar-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
}

.profile-page__cover-action {
  height: 40px;
  width: 40px;
}

.profile-page__avatar-action {
  position: absolute;
  bottom: 8px;
  right: 8px;
  height: 34px;
  width: 34px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.profile-page__tab {
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.68);
}

.profile-page__tab--active {
  border-color: rgba(37, 99, 235, 0.16);
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
}
</style>
