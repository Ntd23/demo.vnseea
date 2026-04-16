<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
    <div class="shrink-0 border-b border-[#dce6fb] bg-white px-4 py-4">
      <div class="flex items-center gap-3">
        <label class="relative block flex-1">
          <Icon name="i-ph-magnifying-glass" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-[#f8fbff] pl-12 pr-4 text-[1rem] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:rounded-[1.45rem]" placeholder="Tìm kiếm cuộc trò chuyện" type="text">
        </label>
        <button class="flex h-[3.6rem] w-[3.6rem] shrink-0 items-center justify-center rounded-[1.15rem] bg-[linear-gradient(180deg,#2749ff_0%,#0000ff_100%)] text-white shadow-[0_14px_32px_rgba(0,0,255,0.18)] transition hover:brightness-105 sm:rounded-[1.45rem]" type="button">
          <Icon name="i-ph-user-plus-fill" class="h-5 w-5" />
        </button>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-3">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="rounded-[1.15rem] border px-3 py-3 transition sm:rounded-[1.45rem]"
          :class="activeTab === tab.id ? 'border-[#0000ff]/15 bg-[#eef2ff] text-[#0000ff] shadow-[0_8px_18px_rgba(0,0,255,0.08)]' : 'border-[#dbe3f2] bg-white text-slate-500 hover:border-[#c7d3ea] hover:bg-[#fbfcff] hover:text-[#243b63]'"
          type="button"
          @click="activeTab = tab.id"
        >
          <span class="flex items-center justify-center gap-1.5 text-[0.9rem] font-semibold leading-tight">
            <Icon :name="tab.icon" class="h-4 w-4 shrink-0" />
            <span class="text-center">{{ tab.label }}</span>
          </span>
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto bg-[#f8fbff] px-4 py-4 scrollbar-hide">
      <div class="space-y-4">
        <div class="rounded-[1.25rem] border border-[#dbe3f2] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-[1.5rem] sm:p-5">
          <p class="text-[0.95rem] font-bold uppercase tracking-[0.22em] text-[#0000ff]/60">Soạn tin</p>
          <div class="mt-4 grid gap-4">
            <div class="grid gap-2">
              <label class="text-[0.95rem] font-semibold text-[#243b63]">Gửi đến</label>
              <input class="h-[3.6rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-white px-5 text-[1rem] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:rounded-[1.45rem]" placeholder="Chọn người nhận" type="text">
            </div>

            <div class="grid gap-2">
              <label class="text-[0.95rem] font-semibold text-[#243b63]">Nội dung</label>
              <textarea class="min-h-[8.5rem] w-full rounded-[1.15rem] border border-[#dbe3f2] bg-white px-5 py-4 text-[1rem] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:rounded-[1.45rem]" placeholder="Nhập tin nhắn..."></textarea>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label class="flex items-center gap-2 text-[0.95rem] text-slate-600">
                <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-[#0000ff] focus:ring-[#0000ff]">
                Chọn tất cả
              </label>

              <button class="inline-flex h-[3.4rem] items-center justify-center rounded-[1.15rem] bg-[linear-gradient(180deg,#2749ff_0%,#0000ff_100%)] px-5 text-[0.98rem] font-black text-white shadow-[0_14px_32px_rgba(0,0,255,0.18)] transition hover:brightness-105 sm:rounded-[1.45rem]" type="button">
                Gửi tin nhắn
              </button>
            </div>

            <div class="grid gap-2">
              <label class="text-[0.95rem] font-semibold text-[#243b63]">Nhãn</label>
              <div class="relative">
                <select class="h-[3.6rem] w-full appearance-none rounded-[1.15rem] border border-[#dbe3f2] bg-white px-5 text-[1rem] text-slate-700 outline-none transition focus:border-[#8aa4e8] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.06)] sm:rounded-[1.45rem]">
                  <option value="">Chọn thẻ...</option>
                  <option value="important">Quan trọng</option>
                  <option value="work">Công việc</option>
                </select>
                <Icon name="i-ph-caret-down-bold" class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="mb-3 flex items-center justify-between">
            <p class="text-[0.95rem] font-bold uppercase tracking-[0.22em] text-[#0000ff]/60">Người dùng</p>
            <span class="text-[0.85rem] text-slate-500">{{ users.length }} kết quả</span>
          </div>

          <div class="space-y-3">
            <div v-for="user in users" :key="user.id" class="flex items-center justify-between gap-3 rounded-[1.25rem] border border-[#dbe3f2] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-[1.5rem] sm:p-4">
              <div class="flex items-center gap-3 min-w-0">
                <div class="relative shrink-0">
                  <img :src="user.avatarUrl" class="h-12 w-12 rounded-full object-cover">
                  <span class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#cfd8e3]" />
                </div>
                <div class="min-w-0">
                  <p class="truncate text-[0.98rem] font-semibold text-[#243b63]">{{ user.name }}</p>
                  <p class="truncate text-[0.82rem] text-slate-500">{{ user.status }}</p>
                </div>
              </div>

              <button class="inline-flex h-10 items-center justify-center rounded-[1rem] bg-[#eef2ff] px-4 text-[0.9rem] font-bold text-[#0000ff] transition hover:bg-[#dfe5ff]" type="button">Mở chat</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeTab = ref<'group' | 'user' | 'teams'>('group')
const tabs = [
  { id: 'group', label: 'Gửi nhiều người', icon: 'i-ph-user-list-fill' },
  { id: 'user', label: 'Người dùng', icon: 'i-ph-user-circle-fill' },
  { id: 'teams', label: 'Các nhóm', icon: 'i-ph-users-three-fill' },
] as const
const users = [
  { id: 1, name: 'Ngocktokyo', status: 'Đang hoạt động', avatarUrl: 'https://i.pravatar.cc/150?u=101' },
  { id: 2, name: 'dung1', status: 'Hoạt động 1 giờ trước', avatarUrl: 'https://i.pravatar.cc/150?u=102' },
  { id: 3, name: 'dung2', status: 'Đang hoạt động', avatarUrl: 'https://i.pravatar.cc/150?u=103' },
  { id: 4, name: 'tien', status: 'Hoạt động hôm qua', avatarUrl: 'https://i.pravatar.cc/150?u=104' },
]
</script>
