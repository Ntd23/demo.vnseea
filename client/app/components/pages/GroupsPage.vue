<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10">
    <section class="overflow-hidden rounded-[30px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <div class="flex flex-col gap-5 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0000ff_100%)] text-white shadow-[0_14px_30px_rgba(0,0,255,0.22)]">
            <Icon name="i-ph-users-three-fill" class="h-7 w-7" />
          </div>

          <div>
            <p class="text-[12px] font-bold uppercase tracking-[0.22em] text-[#0000ff]/65">
              Community Hub
            </p>
            <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63]">
              {{ pageTitle }}
            </h1>
            <p class="mt-2 max-w-[720px] text-[14px] leading-7 text-slate-500">
              {{ pageDescription }}
            </p>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
              Nhóm gợi ý
            </p>
            <p class="mt-1 text-[1.25rem] font-black text-[#243b63]">
              {{ suggestedCount }}
            </p>
          </div>
          <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
              Đã tham gia
            </p>
            <p class="mt-1 text-[1.25rem] font-black text-[#243b63]">
              {{ joinedCount }}
            </p>
          </div>
          <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
              Trạng thái
            </p>
            <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
              {{ activeTabDescription }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <CommunityGroupsFilterBar
      v-model:search="search"
      :tabs="tabItems"
      :active-tab="mode"
      create-to="/create-group"
    />

    <section class="rounded-[28px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/65">
            {{ activeTabLabel }}
          </p>
          <p class="mt-1 text-[14px] leading-6 text-slate-500">
            {{ activeTabHint }}
          </p>
        </div>

        <NuxtLink
          to="/create-group"
          class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8faff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        >
          <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
          Tạo nhóm mới
        </NuxtLink>
      </div>
    </section>

    <section
      v-if="mode === 'mine' && visibleGroups.length === 0"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-xl">
        <FoundationEmptyState
          icon="i-ph-users-three-fill"
          title="Không có nhóm nào để hiển thị"
          description="Bạn chưa tạo hoặc chưa theo dõi nhóm nào trong tài khoản này. Tạo nhóm mới để bắt đầu gom thành viên, bài đăng và hoạt động cộng đồng."
        />

        <div class="mt-6 flex justify-center">
          <NuxtLink
            to="/create-group"
            class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
          >
            <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
            Tạo nhóm đầu tiên
          </NuxtLink>
        </div>
      </div>
    </section>

    <section
      v-else-if="visibleGroups.length === 0"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-xl">
        <FoundationEmptyState
          icon="i-ph-magnifying-glass"
          title="Không tìm thấy nhóm phù hợp"
          description="Thử đổi từ khóa tìm kiếm hoặc chuyển sang một tab khác để xem thêm community phù hợp hơn."
        />
      </div>
    </section>

    <div v-else class="grid gap-4 xl:grid-cols-2">
      <CommunityGroupCard
        v-for="group in visibleGroups"
        :key="group.id"
        :group="group"
        :action-label="mode === 'suggested' ? 'Khám phá nhóm' : 'Xem cập nhật'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  communityGroupDirectory,
  communityGroupRouteMap,
  communityGroupTabs,
} from "../../../types/community"
import type { CommunityGroupTab } from "../../../types/community"

const props = withDefaults(defineProps<{
  mode?: CommunityGroupTab
}>(), {
  mode: "mine",
})

const mode = computed(() => props.mode)
const search = ref("")

const pageTitle = computed(() => {
  if (props.mode === "suggested") return "Các nhóm đề xuất"
  if (props.mode === "joined") return "Các nhóm đã tham gia"
  return "Các nhóm"
})

const pageDescription = computed(() => {
  if (props.mode === "suggested") {
    return "Khám phá những community được gợi ý theo sở thích, danh mục bạn quan tâm và hoạt động gần đây trong hệ sinh thái VNSEEA."
  }

  if (props.mode === "joined") {
    return "Quay lại các nhóm bạn đã tham gia để theo dõi cập nhật mới, sự kiện sắp tới và những cuộc thảo luận đang diễn ra."
  }

  return "Quản lý nhóm bạn đang theo dõi, xem đề xuất theo sở thích và mở nhanh flow tạo cộng đồng mới ngay trong cùng một khu vực."
})

const suggestedCount = computed(() =>
  communityGroupDirectory.filter(group => group.segment === "suggested").length,
)

const joinedCount = computed(() =>
  communityGroupDirectory.filter(group => group.segment === "joined").length,
)

const tabItems = computed(() =>
  communityGroupTabs.map(tab => ({
    ...tab,
    to: communityGroupRouteMap[tab.value],
    count:
      tab.value === "mine"
        ? 0
        : communityGroupDirectory.filter(group => group.segment === tab.value).length,
  })),
)

const visibleGroups = computed(() => {
  const groups =
    props.mode === "mine"
      ? []
      : communityGroupDirectory.filter(group => group.segment === props.mode)

  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return groups

  return groups.filter(group =>
    [
      group.name,
      group.slug,
      group.summary,
      group.ownerLabel,
      ...group.tags,
    ].join(" ").toLowerCase().includes(keyword),
  )
})

const activeTabLabel = computed(() =>
  communityGroupTabs.find(tab => tab.value === props.mode)?.label ?? "Nhóm",
)

const activeTabDescription = computed(() => {
  if (props.mode === "mine") return "Chưa có nhóm nào"
  if (props.mode === "suggested") return `${suggestedCount.value} community đang chờ bạn khám phá`
  return `${joinedCount.value} community đang hoạt động`
})

const activeTabHint = computed(() => {
  if (props.mode === "mine") {
    return "Danh sách này sẽ hiện các nhóm bạn tạo hoặc đang quản trị. Hiện tại tài khoản chưa có community nào."
  }

  if (props.mode === "suggested") {
    return "Các nhóm được gợi ý dựa trên danh mục bạn quan tâm, hoạt động gần đây và mạng lưới hiện có."
  }

  return "Đây là các community bạn đã tham gia, hữu ích để quay lại theo dõi nội dung và cập nhật mới."
})

useSeoMeta({
  title: computed(() => `${pageTitle.value} | VNSEEA`),
  description: pageDescription,
})
</script>
