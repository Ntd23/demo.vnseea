<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10 pt-5">
    <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]">
      <div class="relative overflow-hidden px-5 py-6 sm:px-7">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(29,78,216,0.14),transparent_30%)]" />

        <div class="relative flex flex-col gap-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex items-start gap-4">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#1738ff_0%,#8b5cf6_100%)] text-white shadow-[0_16px_30px_rgba(37,99,235,0.24)]">
                <Icon name="i-ph-hash-bold" class="h-8 w-8" />
              </div>

              <div>
                <p class="text-[12px] font-black uppercase tracking-[0.22em] text-[#0000ff]/60">
                  Hashtag Feed
                </p>
                <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[2.35rem]">
                  {{ hashtagLabel }}
                </h1>
                <p class="mt-2 max-w-[760px] text-[14px] leading-7 text-slate-500">
                  {{ heroDescription }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                :to="{ path: '/search', query: { q: hashtagLabel } }"
                class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <Icon name="i-ph-magnifying-glass-bold" class="mr-2 h-4 w-4" />
                Tìm trong search
              </NuxtLink>

              <NuxtLink
                to="/home"
                class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
              >
                <Icon name="i-ph-house-line-fill" class="mr-2 h-4 w-4" />
                Về bảng tin
              </NuxtLink>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article
              v-for="item in heroStats"
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

    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
            {{ hasMatches ? 'Hashtag liên quan' : 'Hashtag gợi ý' }}
          </p>
          <p class="mt-1 text-[14px] leading-6 text-slate-500">
            {{ hasMatches
              ? 'Các hashtag này thường xuất hiện cùng nhóm bài viết đang được lọc.'
              : 'Hiện chưa có bài phù hợp, bạn có thể thử các hashtag phổ biến dưới đây.' }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-3">
        <NuxtLink
          v-for="item in visibleHashtags"
          :key="item.slug"
          :to="item.to"
          class="inline-flex items-center gap-2 rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 py-2 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        >
          <span>{{ formatHashtagLabel(item.label) }}</span>
          <span class="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500">{{ item.count }}</span>
        </NuxtLink>
      </div>
    </section>

    <section
      v-if="hasMatches"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(15,35,110,0.06)]"
    >
      <div class="flex flex-col gap-2 border-b border-[#eef2fb] pb-4">
        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
          Bài viết chứa hashtag
        </p>
        <h2 class="text-[1.45rem] font-black tracking-[-0.04em] text-[#243b63]">
          {{ matchingPosts.length }} bài đang hiển thị cho {{ hashtagLabel }}
        </h2>
        <p class="text-[14px] leading-6 text-slate-500">
          Danh sách này được lấy từ mock feed hiện có, giữ nguyên card bài viết và luồng tương tác giống trang chủ.
        </p>
      </div>

      <div class="mt-5 space-y-4">
        <FeedPostCard
          v-for="post in matchingPosts"
          :key="post.id"
          :post="post"
        />
      </div>
    </section>

    <section
      v-else
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-12 shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-2xl text-center">
        <FoundationEmptyState
          icon="i-ph-hash-bold"
          :title="`Chưa có bài viết cho ${hashtagLabel}`"
          description="Mock social feed hiện tại chưa có bài đăng gắn hashtag này. Bạn có thể thử các hashtag liên quan hoặc quay lại bảng tin để xem các chủ đề khác."
        />

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <NuxtLink
            v-for="item in visibleHashtags.slice(0, 4)"
            :key="item.slug"
            :to="item.to"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
          >
            {{ formatHashtagLabel(item.label) }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatHashtagLabel } from "~/composables/useMockHashtagData"

function readRouteParam(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

const route = useRoute()

const rawTag = computed(() => readRouteParam(route.params.tag))

const {
  hashtagLabel,
  hasMatches,
  matchingPosts,
  relatedHashtags,
  suggestedHashtags,
  heroStats,
} = useMockHashtagData(rawTag)

const visibleHashtags = computed(() =>
  (hasMatches.value ? relatedHashtags.value : suggestedHashtags.value).slice(0, 8),
)

const heroDescription = computed(() => {
  if (hasMatches.value) {
    return `${hashtagLabel.value} đang gom các bài viết liên quan trong mock social feed. Bạn có thể mở từng bài để xem tương tác, chuyển nhanh sang hashtag khác hoặc quay lại search tổng hợp khi cần.`
  }

  return `${hashtagLabel.value} hiện chưa có dữ liệu bài viết trong feed mock. Trang này vẫn giữ sẵn luồng hashtag để bạn nối API ` + "`posts.php?type=hashtag`" + ` hoặc mở rộng dữ liệu mock sau đó.`
})

useSeoMeta({
  title: computed(() => `${hashtagLabel.value} | VNSEEA`),
  description: computed(() =>
    hasMatches.value
      ? `Xem các bài viết đang chứa hashtag ${hashtagLabel.value} trên VNSEEA.`
      : `Trang hashtag ${hashtagLabel.value} trên VNSEEA hiện chưa có dữ liệu bài viết.`,
  ),
})
</script>
