<template>
  <div class="space-y-4 xl:sticky xl:top-[84px]">
    <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <div class="bg-[linear-gradient(140deg,#0f172a_0%,#243b63_34%,#0000ff_100%)] p-5 text-white">
        <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
          Xem trước
        </p>
        <div class="mt-4 rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-[10px]">
          <div class="flex items-start gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white text-[#0000ff] shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
              <Icon name="i-ph-users-three-fill" class="h-6 w-6" />
            </div>

            <div class="min-w-0">
              <p class="truncate text-[16px] font-black">
                {{ previewTitle }}
              </p>
              <p class="mt-1 break-all text-[12px] font-medium text-white/72">
                {{ previewUrl }}
              </p>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <div
              v-if="showPrivacy"
              class="inline-flex items-center rounded-full bg-white/14 px-3 py-1.5 text-[12px] font-semibold text-white"
            >
              <Icon name="i-ph-shield-check-fill" class="mr-1.5 h-4 w-4" />
              {{ privacyLabel }}
            </div>
            <div class="inline-flex items-center rounded-full bg-white/14 px-3 py-1.5 text-[12px] font-semibold text-white">
              <Icon name="i-ph-tag-fill" class="mr-1.5 h-4 w-4" />
              {{ categoryLabel }}
            </div>
          </div>

          <p class="mt-4 text-[13px] leading-6 text-white/82">
            {{ previewDescription }}
          </p>
        </div>
      </div>

      <div class="space-y-4 p-5">
        <div class="rounded-[22px] border border-[#eef2f8] bg-[#f8fbff] p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
                Mức sẵn sàng
              </p>
              <p class="mt-1 text-[15px] font-black text-[#243b63]">
                {{ completionCount }}/{{ completionTotal }} mục đã hoàn thành
              </p>
            </div>
            <div class="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-[#0000ff] shadow-[0_8px_18px_rgba(15,35,110,0.06)]">
              <Icon name="i-ph-check-fat-fill" class="h-5 w-5" />
            </div>
          </div>

          <div class="mt-4 space-y-2.5">
            <div
              v-for="item in readinessItems"
              :key="item.label"
              class="flex items-start gap-2.5 rounded-[16px] bg-white px-3 py-2.5"
            >
              <div
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]"
                :class="item.done ? 'bg-[#0000ff] text-white' : 'bg-[#eef2f8] text-slate-400'"
              >
                <Icon :name="item.done ? 'i-ph-check-bold' : 'i-ph-dot-outline-bold'" class="h-3.5 w-3.5" />
              </div>
              <div class="min-w-0">
                <p class="text-[13px] font-semibold text-[#243b63]">
                  {{ item.label }}
                </p>
                <p class="mt-0.5 text-[12px] leading-5 text-slate-500">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showPrivacy"
          class="rounded-[22px] border border-[#eef2f8] bg-white p-4"
        >
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
            Quyền hiển thị
          </p>
          <p class="mt-2 text-[14px] font-black text-[#243b63]">
            {{ privacyLabel }}
          </p>
          <p class="mt-2 text-[13px] leading-6 text-slate-500">
            {{ privacyDescription }}
          </p>
        </div>

        <div class="rounded-[22px] border border-[#eef2f8] bg-white p-4">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
            Sau khi tạo
          </p>
          <div class="mt-3 space-y-3">
            <div
              v-for="step in nextSteps"
              :key="step.title"
              class="rounded-[18px] bg-[#f8fbff] px-4 py-3"
            >
              <p class="text-[13px] font-semibold text-[#243b63]">{{ step.title }}</p>
              <p class="mt-1 text-[12px] leading-5 text-slate-500">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  entityLabel: string
  completionCount: number
  completionTotal: number
  previewTitle: string
  previewUrl: string
  previewDescription: string
  privacyLabel?: string
  privacyDescription?: string
  categoryLabel: string
  showPrivacy?: boolean
  nameReady?: boolean
  urlReady?: boolean
  descriptionReady?: boolean
  privacyReady?: boolean
  categoryReady?: boolean
}>(), {
  privacyLabel: "Chưa chọn hiển thị",
  privacyDescription: "Hãy chọn quyền hiển thị để kiểm soát ai có thể tìm thấy và xem nội dung nhóm.",
  showPrivacy: true,
  nameReady: false,
  urlReady: false,
  descriptionReady: false,
  privacyReady: false,
  categoryReady: false,
})

const readinessItems = computed(() => {
  const items = [
    {
      label: "Tên nhóm rõ ràng",
      description: "Tên ngắn gọn giúp thành viên nhận ra chủ đề ngay.",
      done: props.nameReady,
    },
    {
      label: "URL tùy chỉnh",
      description: "Đường dẫn gọn giúp chia sẻ nhóm dễ hơn.",
      done: props.urlReady,
    },
    {
      label: "Mô tả đủ ý",
      description: "Giải thích nhóm dành cho ai và nội dung sẽ tập trung vào đâu.",
      done: props.descriptionReady,
    },
    {
      label: "Phân loại đúng chủ đề",
      description: "Category chuẩn giúp group xuất hiện đúng ngữ cảnh.",
      done: props.categoryReady,
    },
  ]

  if (props.showPrivacy) {
    items.splice(3, 0, {
      label: "Quyền riêng tư đã chọn",
      description: "Thiết lập này ảnh hưởng trực tiếp tới khả năng tham gia và xem nội dung.",
      done: props.privacyReady,
    })
  }

  return items
})

const nextSteps = computed(() => [
  {
    title: `Hoàn thiện trang ${props.entityLabel}`,
    description: `Bạn có thể thêm cover, avatar và nội quy ngay sau khi tạo ${props.entityLabel}.`,
  },
  {
    title: "Mời thành viên đầu tiên",
    description: "Bắt đầu với một nhóm nhỏ để kiểm tra cách hoạt động và nội dung khởi đầu.",
  },
  {
    title: "Mở rộng qua bài ghim",
    description: "Đăng một bài giới thiệu hoặc quy tắc tham gia để giữ trải nghiệm rõ ràng từ đầu.",
  },
])
</script>
