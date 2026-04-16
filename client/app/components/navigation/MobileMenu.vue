<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-full"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-x-full"
    >
      <div v-if="open" class="fixed inset-0 z-50">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-[2px]" @click="$emit('close')" />
        <!-- Menu panel (right side, max 380px) -->
        <div class="absolute right-0 top-0 bottom-0 w-[85vw] max-w-[380px] overflow-y-auto bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.1)]">
        <!-- Header -->
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
          <span class="text-[17px] font-bold text-slate-800">Menu</span>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            type="button"
            @click="$emit('close')"
          >
            <Icon name="i-ph-x-bold" class="h-4 w-4" />
          </button>
        </div>

        <!-- Admin card -->
        <div class="mx-4 mt-3 rounded-[16px] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div class="flex items-center justify-between">
            <span class="text-[15px] font-bold text-slate-800">Quản trị viên</span>
            <span class="text-xl">🤝</span>
          </div>
          <div class="mt-2 space-y-1">
            <div class="flex items-center gap-2 text-[13px] text-slate-500">
              <Icon name="i-ph-wallet" class="h-4 w-4" />
              <span>Cái ví: VND9.999.999.999</span>
            </div>
            <div class="flex items-center gap-2 text-[13px] text-slate-500">
              <Icon name="i-ph-coin" class="h-4 w-4" />
              <span>Điểm: 50</span>
            </div>
          </div>
        </div>

        <!-- Navigation list -->
        <div class="mt-3 px-4">
          <NuxtLink
            v-for="item in mainNav"
            :key="item.label"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
            @click="$emit('close')"
          >
            <Icon :name="item.icon" class="h-5 w-5 text-slate-600" />
            <span class="text-[14px] text-slate-700">{{ item.label }}</span>
          </NuxtLink>
        </div>

        <!-- Divider -->
        <div class="mx-4 my-2 border-t border-slate-100" />

        <!-- Settings section -->
        <div class="px-4">
          <NuxtLink
            v-for="item in settingsNav"
            :key="item.label"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
            @click="$emit('close')"
          >
            <Icon :name="item.icon" class="h-5 w-5 text-slate-600" />
            <span class="text-[14px] text-slate-700">{{ item.label }}</span>
          </NuxtLink>
        </div>

        <!-- Divider -->
        <div class="mx-4 my-2 border-t border-slate-100" />

        <!-- Bottom actions -->
        <div class="px-4 pb-8">
          <button
            v-for="item in bottomActions"
            :key="item.label"
            class="flex w-full items-center justify-between rounded-xl px-3 py-3 transition hover:bg-slate-50"
            type="button"
          >
            <span class="text-[14px] text-slate-600">{{ item.label }}</span>
            <Icon :name="item.icon" class="h-4 w-4 text-slate-400" />
          </button>
        </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const mainNav = [
  { label: "Tìm kiếm", icon: "i-ph-magnifying-glass", to: "#" },
  { label: "Các trang", icon: "i-ph-flag", to: "#" },
  { label: "Sản phẩm của tôi", icon: "i-ph-package", to: "#" },
  { label: "Thị trường", icon: "i-ph-storefront", to: "#" },
  { label: "Blog", icon: "i-ph-newspaper", to: "#" },
  { label: "Bài báo của tôi", icon: "i-ph-article", to: "#" },
  { label: "Phim", icon: "i-ph-film-strip", to: "#" },
  { label: "Sự kiện", icon: "i-ph-calendar-blank", to: "#" },
  { label: "Nhóm của tôi", icon: "i-ph-users-three", to: "#" },
  { label: "Diễn đàn", icon: "i-ph-chats-circle", to: "#" },
  { label: "Quảng cáo", icon: "i-ph-megaphone", to: "#" },
  { label: "Tập ảnh", icon: "i-ph-images", to: "#" },
  { label: "Xem", icon: "i-ph-play-circle", to: "#" },
  { label: "Cuộn phim", icon: "i-ph-film-reel", to: "#" },
  { label: "Bài đã lưu", icon: "i-ph-bookmark-simple", to: "#" },
  { label: "Chọc", icon: "i-ph-hand-waving", to: "#" },
  { label: "Khám phá", icon: "i-ph-compass", to: "#" },
  { label: "Bài viết phổ biến", icon: "i-ph-fire", to: "#" },
  { label: "Tìm bạn", icon: "i-ph-user-plus", to: "#" },
  { label: "Việc làm", icon: "i-ph-briefcase", to: "#" },
  { label: "Những điều phổ biến", icon: "i-ph-trend-up", to: "#" },
  { label: "Kinh phí", icon: "i-ph-hand-heart", to: "#" },
  { label: "Ký ức", icon: "i-ph-clock-counter-clockwise", to: "#" },
  { label: "Ưu đãi", icon: "i-ph-tag", to: "#" },
]

const settingsNav = [
  { label: "Cài đặt", icon: "i-ph-gear", to: "#" },
  { label: "Đăng ký", icon: "i-ph-clipboard-text", to: "#" },
  { label: "Khu vực quản trị", icon: "i-ph-shield-check", to: "#" },
  { label: "Đăng xuất", icon: "i-ph-sign-out", to: "/welcome" },
]

const bottomActions = [
  { label: "Chuyển tài khoản", icon: "i-ph-arrows-left-right" },
  { label: "Các phím tắt bàn phím", icon: "i-ph-keyboard" },
  { label: "Chế độ ban đêm", icon: "i-ph-moon" },
]
</script>
