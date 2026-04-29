<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-4 pb-16 pt-4 sm:px-6">
    <ProfileHero />

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <section class="min-w-0 space-y-5">
        <ProfileCompletionCard :items="checklist" />
        <FeedPublisherBox />
        <ProfileFeedList :posts="posts" />
      </section>

      <ProfileSidebar
        :highlight-photos="highlightPhotos"
        :mutual-friends="mutualFriends"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FeedPublisherBox from "../../../feed/presentation/components/FeedPublisherBox.vue"
import { useMockSocialData } from "../../../feed/application/composables/useMockSocialData"
import ProfileCompletionCard from "../components/ProfileCompletionCard.vue"
import ProfileFeedList from "../components/ProfileFeedList.vue"
import ProfileHero from "../components/ProfileHero.vue"
import ProfileSidebar from "../components/ProfileSidebar.vue"

const { t } = useI18n()
const { posts } = useMockSocialData()

useSeoMeta({
  title: () => t("pages.profilePage.seoTitle"),
  description: () => t("pages.profilePage.seoDescription"),
  ogTitle: () => t("pages.profilePage.seoTitle"),
  ogDescription: () => t("pages.profilePage.seoDescription"),
})

const checklist = computed(() => [
  t("pages.profilePage.checklistAvatar"),
  t("pages.profilePage.checklistCover"),
  t("pages.profilePage.checklistIntro"),
  t("pages.profilePage.checklistPosts"),
  t("pages.profilePage.checklistFriends"),
])

const mutualFriends = computed(() => [
  { initials: "TH", name: "Thu Hà", meta: t("pages.profilePage.mutualFriendsMeta", { count: 8 }) },
  { initials: "BT", name: "Bảo Trân", meta: t("pages.profilePage.mutualFriendsMeta", { count: 12 }) },
  { initials: "NP", name: "Nam Phạm", meta: t("pages.profilePage.mutualFriendsMeta", { count: 5 }) },
  { initials: "LD", name: "Linh Đào", meta: t("pages.profilePage.mutualFriendsMeta", { count: 9 }) },
])

const highlightPhotos = Array.from({ length: 4 }, (_, index) => index)
</script>
