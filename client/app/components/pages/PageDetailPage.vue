<template>
  <div v-if="page" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <CommunityPageHeroBanner
      :page="page"
      :category-label="categoryLabel"
      :follower-count-label="followerCountLabel"
      :like-count-label="likeCountLabel"
    />

    <CommunityGroupTabsBar v-model="activeTab" />

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.24fr)_320px]">
      <section class="min-w-0 space-y-4">
        <template v-if="activeTab === 'posts'">
          <CommunityPageFeedSection
            :page="page"
            :posts="pagePosts"
          />
        </template>

        <template v-else>
          <CommunityPageAboutCard
            :page="page"
            :category-label="categoryLabel"
            :follower-count-label="followerCountLabel"
            :like-count-label="likeCountLabel"
          />
        </template>
      </section>

      <aside class="space-y-4">
        <CommunityPageActionCard
          :page="page"
          :follower-count-label="followerCountLabel"
          :like-count-label="likeCountLabel"
        />

        <CommunityPageAboutCard
          :page="page"
          :category-label="categoryLabel"
          :follower-count-label="followerCountLabel"
          :like-count-label="likeCountLabel"
          compact
        />
      </aside>
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] pb-10 pt-4">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-6 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16">
      <FoundationEmptyState
        icon="i-ph-megaphone-simple-fill"
        title="Không tìm thấy fanpage"
        description="Slug fanpage này chưa có trong dữ liệu mock hiện tại. Bạn có thể quay lại flow tạo trang để dựng một fanpage mới."
      />

      <div class="mt-6 flex justify-center">
        <NuxtLink
          to="/create-page"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          Tạo trang mới
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageSlug?: string
}>()

const route = useRoute()
const activeTab = ref<"posts" | "about">("posts")

const resolvedSlug = computed(() =>
  props.pageSlug || String(route.params.name || ""),
)

const {
  page,
  categoryLabel,
  followerCountLabel,
  likeCountLabel,
  pagePosts,
} = useCommunityPageDetail(resolvedSlug, computed(() => route.query))

watch(() => route.fullPath, () => {
  activeTab.value = "posts"
})

useSeoMeta({
  title: computed(() =>
    page.value ? `${page.value.name} | VNSEEA` : "Trang fanpage | VNSEEA",
  ),
  description: computed(() =>
    page.value?.summary || "Trang fanpage trên VNSEEA.",
  ),
})
</script>
