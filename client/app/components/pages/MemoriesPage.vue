<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10 pt-5">
    <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]">
      <div class="relative overflow-hidden px-5 py-6 sm:px-7">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_30%)]" />

        <div class="relative flex flex-col gap-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-[780px]">
              <p class="text-[12px] font-black uppercase tracking-[0.22em] text-[#0000ff]/60">
                Memory Lane
              </p>
              <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[2.35rem]">
                Ngày này năm trước bạn đã chia sẻ gì?
              </h1>
              <p class="mt-3 text-[14px] leading-7 text-slate-500">
                Trang <span class="font-semibold text-[#243b63]">/memories</span> gom lại các bài đăng cùng ngày ở những năm trước
                và thêm nút chia sẻ lại trực tiếp trên từng ký ức.
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                to="/home"
                class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <Icon name="i-ph-house-line-fill" class="mr-2 h-4 w-4" />
                Về bảng tin
              </NuxtLink>

              <button
                v-if="sharedMemoryCount > 0"
                class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
                type="button"
                @click="resetSharedMemories"
              >
                <Icon name="i-ph-arrow-counter-clockwise-bold" class="mr-2 h-4 w-4" />
                Làm mới chia sẻ
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

    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-3 border-b border-[#eef2fb] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
            Ký ức cùng ngày
          </p>
          <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.04em] text-[#243b63]">
            {{ memoryEntries.length }} bài viết từ những năm trước
          </h2>
          <p class="mt-2 text-[14px] leading-6 text-slate-500">
            Mỗi bài vẫn giữ nguyên card bài viết dùng chung, còn hành động chia sẻ lại được đưa ra ngoài để không đụng vào component feed hiện có.
          </p>
        </div>

        <NuxtLink
          to="/saved-posts"
          class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        >
          <Icon name="i-ph-bookmark-simple-bold" class="mr-2 h-4 w-4" />
          Xem bài đã lưu
        </NuxtLink>
      </div>

      <div class="mt-5 space-y-5">
        <MemoriesMemoryCard
          v-for="item in memoryEntries"
          :key="item.id"
          :entry="item"
          :shared="sharedMemoryIds.includes(item.id)"
          @share="shareMemory"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { memoryEntries } = useMockMemoriesData()

const sharedMemoryIds = ref<string[]>([])

const sharedMemoryCount = computed(() => sharedMemoryIds.value.length)

const summaryCards = computed(() => {
  const interactionCount = memoryEntries.reduce(
    (sum, item) => sum + item.post.stats.likes + item.post.stats.comments + item.post.stats.shares,
    0,
  )

  return [
    {
      label: "Ký ức",
      value: memoryEntries.length.toLocaleString("vi-VN"),
      description: "Số bài đăng cùng ngày được kéo lại từ mock social feed.",
    },
    {
      label: "Năm trước",
      value: new Set(memoryEntries.map(item => item.yearOffset)).size.toLocaleString("vi-VN"),
      description: "Số mốc năm khác nhau đang xuất hiện trong timeline ký ức.",
    },
    {
      label: "Đã chia sẻ lại",
      value: sharedMemoryCount.value.toLocaleString("vi-VN"),
      description: "Những ký ức bạn đã phát lại lên bảng tin trong phiên này.",
    },
    {
      label: "Tương tác cũ",
      value: interactionCount.toLocaleString("vi-VN"),
      description: "Tổng tương tác của các bài ký ức đang được hiển thị.",
    },
  ]
})

function shareMemory(id: string) {
  if (sharedMemoryIds.value.includes(id)) return
  sharedMemoryIds.value = [...sharedMemoryIds.value, id]
}

function resetSharedMemories() {
  sharedMemoryIds.value = []
}

useSeoMeta({
  title: "Memories | VNSEEA",
  description: "Xem lại các bài viết ngày này năm trước và chia sẻ lại trên VNSEEA.",
})
</script>
