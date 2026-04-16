<template>
  <div class="surface-card overflow-hidden rounded-[24px] border border-[#0000ff]/10 shadow-[0_2px_14px_rgba(0,0,255,0.05)]">
    <div class="relative min-h-[240px] overflow-hidden bg-gradient-to-r from-[#bb1838] via-[#991130] to-[#5c0b28] sm:min-h-[300px]">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.1),transparent_24%)]" />

      <div class="absolute left-4 top-4 flex items-center gap-3 rounded-full bg-white/12 px-3 py-2 backdrop-blur-sm sm:left-5 sm:top-5 sm:px-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 bg-white/10 text-[12px] font-bold text-white">QT</div>
        <div>
          <p class="text-[14px] font-semibold text-white sm:text-[18px]">Quản trị viên</p>
          <p class="text-[11px] text-white/80 sm:text-[12px]">Đang hoạt động</p>
        </div>
      </div>

      <button class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm" type="button">
        <Icon name="i-ph-smiley" class="h-5 w-5" />
      </button>

      <div class="absolute inset-x-0 bottom-0 px-3 pb-3 sm:px-5 sm:pb-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div class="flex items-end gap-3">
            <div class="relative -mb-8 sm:-mb-10">
              <div class="flex h-[96px] w-[96px] items-center justify-center rounded-full border-[4px] border-white bg-[#0000ff] text-[28px] font-bold text-white shadow-[0_6px_18px_rgba(0,0,255,0.22)] sm:h-[112px] sm:w-[112px] sm:text-[32px]">VN</div>
              <button class="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#f0f3ff] text-slate-600 shadow-sm" type="button">
                <Icon name="i-ph-camera-fill" class="h-3.5 w-3.5" />
              </button>
            </div>

            <div class="rounded-[18px] bg-white/92 px-4 py-3 shadow-lg backdrop-blur-sm sm:px-5">
              <p class="text-[16px] font-bold text-slate-900 sm:text-[18px]">Marketing Staff</p>
              <p class="mt-1 text-[12px] text-slate-500 sm:text-[13px]">Khuyến khích hoàn thiện hồ sơ, thêm bài đăng và nội dung giới thiệu.</p>
            </div>
          </div>

          <div class="ml-auto flex flex-wrap items-center gap-2 rounded-full bg-white/92 px-3 py-2 shadow-sm">
            <button class="rounded-full bg-[#0000ff] px-3 py-1.5 text-[12px] font-semibold text-white" type="button">Chỉnh sửa</button>
            <button class="rounded-full border border-[#0000ff]/15 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600" type="button">Các hoạt động</button>
            <button class="rounded-full border border-[#0000ff]/15 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600" type="button">Theo dõi</button>
            <button class="rounded-full border border-[#0000ff]/15 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600" type="button">Nhắn tin</button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto border-t border-[#0000ff]/10 bg-white px-3 py-3 sm:px-4">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="flex shrink-0 items-center gap-2 rounded-full border border-transparent px-3 py-2 text-[12px] font-semibold text-slate-600 hover:border-[#0000ff]/10 hover:bg-[#f7f9ff] hover:text-[#0000ff]"
        type="button"
      >
        <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#0000ff]/8 text-[#0000ff]">•</span>
        {{ tab }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const tabs = ['Thị trường', 'Mốc thời gian', 'Các nhóm', 'Thích', 'Đang theo dõi', 'Người theo dõi', 'Hình ảnh', 'Albums', 'Sản phẩm', 'Gia đình']
</script>
