<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:px-7">
      <div class="flex items-center gap-4">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0000ff_100%)] text-white shadow-[0_14px_30px_rgba(0,0,255,0.22)]">
          <Icon name="i-ph-flag-fill" class="h-7 w-7" />
        </div>

        <div>
          <h1 class="text-[2rem] font-black tracking-[-0.05em] text-[#243b63]">
            Các trang
          </h1>
          <p class="mt-1 text-[14px] leading-6 text-slate-500">
            Quản lý fanpage bạn theo dõi, xem gợi ý phù hợp và mở nhanh flow tạo page mới trong cùng một khu vực.
          </p>
        </div>
      </div>
    </section>

    <CommunityPageDirectoryTabsBar
      :tabs="tabItems"
      :active-tab="mode"
      create-to="/create-page"
    />

    <section
      v-if="mode === 'mine' && visiblePages.length === 0"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-12 shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16 lg:min-h-[520px]"
    >
      <div class="flex h-full flex-col items-center justify-center text-center">
        <FoundationEmptyState
          icon="i-ph-flag-fill"
          title="Không có trang nào để hiển thị"
          description="Bạn chưa tạo fanpage nào trong tài khoản này. Bắt đầu bằng một page mới để giới thiệu thương hiệu, dịch vụ hoặc kênh nội dung của bạn."
        />

        <div class="mt-6 flex justify-center">
          <NuxtLink
            to="/create-page"
            class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
          >
            <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
            Tạo page đầu tiên
          </NuxtLink>
        </div>
      </div>
    </section>

    <section
      v-else-if="visiblePages.length === 0"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-12 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-xl">
        <FoundationEmptyState
          icon="i-ph-magnifying-glass"
          title="Không có fanpage phù hợp"
          description="Tab này hiện chưa có dữ liệu mock. Bạn có thể chuyển sang tab khác hoặc tạo mới một page để bắt đầu."
        />
      </div>
    </section>

    <div v-else class="grid gap-4 xl:grid-cols-2">
      <CommunityPageCard
        v-for="page in visiblePages"
        :key="page.id"
        :page="page"
        :action-label="actionLabel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  communityPageDirectory,
  communityPageRouteMap,
  communityPageTabs,
} from "../../../types/community"
import type { CommunityPageRecord, CommunityPageTab } from "../../../types/community"

const props = withDefaults(defineProps<{
  mode?: CommunityPageTab
}>(), {
  mode: "mine",
})

const visiblePages = computed<CommunityPageRecord[]>(() => {
  if (props.mode === "mine") return []

  return communityPageDirectory.filter(page =>
    page.directoryTabs?.includes(props.mode),
  )
})

const tabItems = computed(() =>
  communityPageTabs.map(tab => ({
    ...tab,
    to: communityPageRouteMap[tab.value],
  })),
)

const actionLabel = computed(() => {
  if (props.mode === "suggested") return "Khám phá fanpage"
  if (props.mode === "favorite") return "Xem cập nhật"
  return "Xem fanpage"
})

useSeoMeta({
  title: computed(() => {
    if (props.mode === "suggested") return "Các trang được đề xuất | VNSEEA"
    if (props.mode === "favorite") return "Các trang được yêu thích | VNSEEA"
    return "Các trang | VNSEEA"
  }),
  description: computed(() => {
    if (props.mode === "suggested") {
      return "Danh sách fanpage được đề xuất trên VNSEEA."
    }

    if (props.mode === "favorite") {
      return "Danh sách fanpage được yêu thích trên VNSEEA."
    }

    return "Danh bạ fanpage trên VNSEEA với khu vực trang của tôi, page được đề xuất và page được yêu thích."
  }),
})
</script>
