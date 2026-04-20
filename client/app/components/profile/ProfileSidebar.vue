<template>
  <aside class="min-w-0 space-y-3">
    <ProfileInfoCard :title="t('pages.profilePage.sidebarInfoTitle')" icon="i-ph-info-fill" :rows="infoRows" />

    <div class="surface-card rounded-[18px] border border-[#0000ff]/10 p-3 shadow-[0_2px_14px_rgba(0,0,255,0.05)]">
      <div class="flex items-center justify-between">
        <p class="text-title-primary text-[14px]">{{ t("pages.profilePage.sidebarMutualFriendsTitle") }}</p>
        <button class="text-[12px] font-semibold text-[#0000ff] hover:underline" type="button">{{ t("pages.profilePage.sidebarSeeAll") }}</button>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <div v-for="item in mutualFriends" :key="item.name" class="rounded-[14px] bg-[#f7f9ff] p-2 text-center">
          <div class="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#0000ff] text-[11px] font-semibold text-white">{{ item.initials }}</div>
          <p class="mt-1.5 truncate text-[12px] font-semibold text-slate-700">{{ item.name }}</p>
          <p class="text-[11px] text-slate-500">{{ item.meta }}</p>
        </div>
      </div>
    </div>

    <ProfileMediaGrid
      :title="t('pages.profilePage.sidebarHighlightPhotos')"
      :action-label="t('pages.profilePage.sidebarSeeAll')"
      :items="highlightPhotos"
      tile-class="bg-gradient-to-br from-[#e8eeff] to-[#cfd9ff]"
    />
    <ProfileMediaGrid
      :title="t('pages.profilePage.sidebarVideos')"
      :action-label="t('pages.profilePage.sidebarSeeAll')"
      :items="videoTiles"
      tile-class="bg-gradient-to-br from-slate-900 to-slate-700"
    />
    <ProfileMediaGrid
      :title="t('pages.profilePage.sidebarProducts')"
      :action-label="t('pages.profilePage.sidebarSeeAll')"
      :items="productTiles"
      tile-class="bg-gradient-to-br from-[#f5f3ff] to-[#dbeafe]"
    />
  </aside>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  mutualFriends: { initials: string; name: string; meta: string }[]
  highlightPhotos: number[]
}>()

const infoRows = computed(() => [
  { label: "online", icon: "i-ph-eye", right: t("pages.profilePage.infoOnlineStatus"), rightClass: "text-[#0000ff]" },
  { label: "posts", icon: "i-ph-notepad", center: "20", right: t("pages.profilePage.infoPostsCountLabel") },
  { label: "gender", icon: "i-ph-gender-male", right: t("pages.profilePage.infoGenderMale") },
  { label: "location", icon: "i-ph-map-pin", left: t("pages.profilePage.infoLocationValue") },
])
const videoTiles = [0, 1]
const productTiles = [0, 1, 2, 3]
</script>
