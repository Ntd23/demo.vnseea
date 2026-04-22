<template>
  <div class="rounded-[18px] border border-[#0000ff]/10 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,255,0.04)]">
    <div class="flex items-center justify-between">
      <h3 class="text-title-primary">{{ t("pages.profilePage.friendsGrid.title") }}</h3>
      <button class="text-caption-secondary hover:text-[#0000ff] transition" type="button">{{ t("pages.profilePage.friendsGrid.seeAll") }}</button>
    </div>
    <p class="text-caption-secondary mt-0.5">{{ t("pages.profilePage.friendsGrid.friendCount", { count: friendCount }) }}</p>

    <div class="mt-3 grid grid-cols-3 gap-2">
      <div
        v-for="friend in friends"
        :key="friend.name"
        class="group cursor-pointer text-center"
      >
        <div class="aspect-square overflow-hidden rounded-[14px] border-2 border-slate-100 transition group-hover:border-[#0000ff]/20">
          <div class="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-500">
            {{ friend.avatar }}
          </div>
        </div>
        <p class="mt-1.5 truncate text-[11px] font-semibold text-slate-700 group-hover:text-[#0000ff]">{{ friend.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const friendCount = 342

const friends = [
  { name: "Thu Hà", avatar: "TH" },
  { name: "Bảo Trần", avatar: "BT" },
  { name: "Nam Phạm", avatar: "NP" },
  { name: "Linh Đào", avatar: "LĐ" },
  { name: "Quỳnh Lê", avatar: "QL" },
  { name: "Xu Nguyễn", avatar: "XN" },
  { name: "Minh Anh", avatar: "MA" },
  { name: "Khánh Vũ", avatar: "KV" },
  { name: "Thanh Hà", avatar: "TH" },
]
</script>
