<template>
  <div class="space-y-5 pb-10">
    <EventsCreateEventHero
      :stats="heroStats"
      @quick-fill="quickFillSeed++"
    />
    <EventsCreateEventComposer :quick-fill-seed="quickFillSeed" />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Tạo sự kiện | VNSEEA",
  description: "Tạo sự kiện cộng đồng mới trên VNSEEA với thông tin, lịch trình và ảnh bìa.",
})

const quickFillSeed = ref(0)

const heroStats = [
  {
    label: "Trường chính",
    value: "7",
    description: "Tên, mô tả, địa điểm, thời gian và ảnh bìa.",
  },
  {
    label: "Preview",
    value: "Live",
    description: "Card bên phải đổi theo nội dung đang nhập.",
  },
  {
    label: "Submit",
    value: "Mock",
    description: "Chưa ghi dữ liệu vào backend.",
  },
] as const
</script>
