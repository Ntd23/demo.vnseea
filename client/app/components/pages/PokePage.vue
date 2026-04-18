<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10 pt-5">
    <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]">
      <div class="relative overflow-hidden px-5 py-6 sm:px-7">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_30%)]" />

        <div class="relative flex flex-col gap-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-[780px]">
              <p class="text-[12px] font-black uppercase tracking-[0.22em] text-[#0000ff]/60">
                Poke Board
              </p>
              <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[2.35rem]">
                Những người vừa chọc bạn
              </h1>
              <p class="mt-3 text-[14px] leading-7 text-slate-500">
                Trang <span class="font-semibold text-[#243b63]">/poke</span> giữ luồng đơn giản theo audit:
                danh sách poke hiện có và nút chọc lại ngay trên từng người.
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                to="/messages"
                class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <Icon name="i-ph-chat-circle-dots-bold" class="mr-2 h-4 w-4" />
                Mở tin nhắn
              </NuxtLink>

              <button
                v-if="pokedBackCount > 0"
                class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
                type="button"
                @click="resetPokedBack"
              >
                <Icon name="i-ph-arrow-counter-clockwise-bold" class="mr-2 h-4 w-4" />
                Khôi phục trạng thái
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
            Danh sách poke
          </p>
          <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.04em] text-[#243b63]">
            {{ pokeRecords.length }} người đang chờ phản hồi
          </h2>
          <p class="mt-2 text-[14px] leading-6 text-slate-500">
            Đây là luồng nhẹ, thiên về tái kết nối nhanh. Bạn có thể chọc lại từng người hoặc mở hồ sơ trước khi phản hồi.
          </p>
        </div>
      </div>

      <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PokeRequestCard
          v-for="item in pokeRecords"
          :key="item.id"
          :record="item"
          :poked-back="pokedBackIds.includes(item.id)"
          @poke="pokeBack"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { pokeRecords } = useMockPokeData()

const pokedBackIds = ref<string[]>([])

const pokedBackCount = computed(() => pokedBackIds.value.length)
const pendingPokeCount = computed(() => pokeRecords.length - pokedBackCount.value)

const summaryCards = computed(() => [
  {
    label: "Poke mới",
    value: pokeRecords.length.toLocaleString("vi-VN"),
    description: "Số lần chạm nhẹ đang hiện trong mock list.",
  },
  {
    label: "Đã chọc lại",
    value: pokedBackCount.value.toLocaleString("vi-VN"),
    description: "Những kết nối bạn đã phản hồi ngay trong phiên này.",
  },
  {
    label: "Đang online",
    value: pokeRecords.filter(item => item.online).length.toLocaleString("vi-VN"),
    description: "Những người có thể tiếp tục trò chuyện ngay sau khi chọc lại.",
  },
  {
    label: "Chờ phản hồi",
    value: pendingPokeCount.value.toLocaleString("vi-VN"),
    description: "Số poke chưa được bạn chọc lại trong phiên hiện tại.",
  },
])

function pokeBack(id: string) {
  if (pokedBackIds.value.includes(id)) return
  pokedBackIds.value = [...pokedBackIds.value, id]
}

function resetPokedBack() {
  pokedBackIds.value = []
}

useSeoMeta({
  title: "Poke | VNSEEA",
  description: "Xem danh sách poke và chọc lại nhanh các kết nối trên VNSEEA.",
})
</script>
