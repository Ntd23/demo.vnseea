<template>
  <div v-if="group" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <CommunityGroupHeroBanner
      :group="group"
      :member-count-label="memberCountLabel"
      :online-count-label="onlineCountLabel"
      :privacy-label="privacyLabel"
      :category-label="categoryLabel"
    />

    <CommunityGroupTabsBar v-model="activeTab" />

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.24fr)_320px]">
      <section class="min-w-0 space-y-4">
        <template v-if="activeTab === 'posts'">
          <CommunityGroupFeedSection
            :group="group"
            :posts="groupPosts"
          />
        </template>

        <template v-else>
          <CommunityGroupAboutCard
            :group="group"
            :privacy-label="privacyLabel"
            :privacy-description="privacyDescription"
            :category-label="categoryLabel"
            :member-count-label="memberCountLabel"
          />

          <CommunityGroupTopicsCard
            :group="group"
            :category-label="categoryLabel"
            :privacy-description="privacyDescription"
          />
        </template>
      </section>

      <aside class="space-y-4">
        <CommunityGroupAboutCard
          :group="group"
          :privacy-label="privacyLabel"
          :privacy-description="privacyDescription"
          :category-label="categoryLabel"
          :member-count-label="memberCountLabel"
          compact
        />

        <CommunityGroupMembersCard
          :members="members"
          :member-count-label="memberCountLabel"
        />

        <CommunityGroupAdminCard
          v-if="group.canManage"
          :slug="group.slug"
        />
      </aside>
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] pb-10 pt-4">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-6 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16">
      <FoundationEmptyState
        icon="i-ph-users-three-fill"
        title="Không tìm thấy nhóm"
        description="Slug nhóm này chưa có trong dữ liệu mock hiện tại. Bạn có thể quay lại danh sách nhóm để chọn một community khác."
      />

      <div class="mt-6 flex justify-center">
        <NuxtLink
          to="/groups"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          Quay lại danh sách nhóm
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const activeTab = ref<"posts" | "about">("posts")

const {
  group,
  members,
  privacyLabel,
  privacyDescription,
  categoryLabel,
  memberCountLabel,
  onlineCountLabel,
  groupPosts,
} = useCommunityGroupDetail(computed(() => String(route.params.name || "")))

watch(() => route.fullPath, () => {
  activeTab.value = "posts"
})

useSeoMeta({
  title: computed(() =>
    group.value ? `${group.value.name} | VNSEEA` : "Trang nhóm | VNSEEA",
  ),
  description: computed(() =>
    group.value?.summary || "Trang chi tiết nhóm trên VNSEEA.",
  ),
})
</script>
