<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10 pt-5">
    <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]">
      <div class="relative overflow-hidden px-5 py-6 sm:px-7">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(29,78,216,0.14),transparent_32%)]" />

        <div class="relative flex flex-col gap-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-[780px]">
              <p class="text-[12px] font-black uppercase tracking-[0.22em] text-[#0000ff]/60">
                Saved Feed
              </p>
              <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[2.35rem]">
                Bài viết đã lưu để xem lại sau
              </h1>
              <p class="mt-3 text-[14px] leading-7 text-slate-500">
                Trang này gom lại các bài đã bookmark trong phiên mock hiện tại. Bạn có thể mở lại bài viết,
                theo dõi nguồn lưu và bỏ lưu trực tiếp khỏi danh sách.
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                to="/home"
                class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <Icon name="i-ph-house-line-fill" class="mr-2 h-4 w-4" />
                Quay lại bảng tin
              </NuxtLink>

              <button
                v-if="visibleSavedPosts.length > 0"
                class="inline-flex h-11 items-center justify-center rounded-full bg-rose-500 px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(244,63,94,0.2)] transition hover:-translate-y-0.5 hover:bg-rose-600"
                type="button"
                @click="removeAll"
              >
                <Icon name="i-ph-trash-bold" class="mr-2 h-4 w-4" />
                Bỏ lưu tất cả
              </button>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article
              v-for="item in summaryCards"
              :key="item.label"
              class="rounded-[24px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-4"
            >
              <p class="text-[11px] font-black uppercase tracking-[0.16em] text-[#0000ff]/60">
                {{ item.label }}
              </p>
              <p class="mt-2 text-[1.55rem] font-black tracking-[-0.05em] text-[#243b63]">
                {{ item.value }}
              </p>
              <p class="mt-2 text-[13px] leading-6 text-slate-500">
                {{ item.description }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="visibleSavedPosts.length === 0"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-12 shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-2xl text-center">
        <FoundationEmptyState
          icon="i-ph-bookmark-simple"
          title="Bạn chưa giữ lại bài viết nào"
          description="Danh sách bài đã lưu đang trống. Hãy quay lại bảng tin, search hoặc explore để lưu những nội dung cần xem lại sau."
        />

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <button
            class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
            type="button"
            @click="restoreMockData"
          >
            Khôi phục danh sách mock
          </button>

          <NuxtLink
            to="/explore"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
          >
            Đi tới khám phá
          </NuxtLink>
        </div>
      </div>
    </section>

    <section
      v-else
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(15,35,110,0.06)]"
    >
      <div class="flex flex-col gap-3 border-b border-[#eef2fb] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
            Danh sách đang hiển thị
          </p>
          <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.04em] text-[#243b63]">
            {{ visibleSavedPosts.length }} bài viết còn được giữ lại
          </h2>
          <p class="mt-2 text-[14px] leading-6 text-slate-500">
            Mỗi bài có thể bỏ lưu độc lập. Khi xóa hết, trang sẽ chuyển sang empty state để bạn test lại flow restore.
          </p>
        </div>

        <NuxtLink
          to="/search"
          class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        >
          <Icon name="i-ph-magnifying-glass-bold" class="mr-2 h-4 w-4" />
          Tìm thêm nội dung
        </NuxtLink>
      </div>

      <div class="mt-5 space-y-5">
        <SavedPostCard
          v-for="item in visibleSavedPosts"
          :key="item.id"
          :entry="item"
          @remove="removeSavedPost"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { savedPosts } = useMockSavedPostsData()

const removedIds = ref<string[]>([])

const visibleSavedPosts = computed(() =>
  savedPosts.filter(item => !removedIds.value.includes(item.id)),
)

const summaryCards = computed(() => {
  const authors = new Set(visibleSavedPosts.value.map(item => item.post.author))
  const collections = new Set(visibleSavedPosts.value.map(item => item.collectionLabel))
  const interactionCount = visibleSavedPosts.value.reduce(
    (sum, item) => sum + item.post.stats.likes + item.post.stats.comments + item.post.stats.shares,
    0,
  )

  return [
    {
      label: "Đã lưu",
      value: visibleSavedPosts.value.length.toLocaleString("vi-VN"),
      description: "Số bài đang còn xuất hiện trong danh sách bookmark mock.",
    },
    {
      label: "Tác giả",
      value: authors.size.toLocaleString("vi-VN"),
      description: "Số người đã đăng các bài viết bạn đang giữ lại.",
    },
    {
      label: "Bộ sưu tập",
      value: collections.size.toLocaleString("vi-VN"),
      description: "Nhóm lưu nhanh để bạn tách bài theo mục đích tham chiếu.",
    },
    {
      label: "Tương tác",
      value: interactionCount.toLocaleString("vi-VN"),
      description: "Tổng like, bình luận và chia sẻ của các bài còn được lưu.",
    },
  ]
})

function removeSavedPost(id: string) {
  if (removedIds.value.includes(id)) return
  removedIds.value = [...removedIds.value, id]
}

function removeAll() {
  removedIds.value = savedPosts.map(item => item.id)
}

function restoreMockData() {
  removedIds.value = []
}

useSeoMeta({
  title: "Bài viết đã lưu | VNSEEA",
  description: "Xem lại danh sách bài viết đã lưu và bỏ lưu trực tiếp trên VNSEEA.",
})
</script>
