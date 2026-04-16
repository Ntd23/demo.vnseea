<template>
  <div class="rounded-[18px] border border-[#0000ff]/10 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,255,0.04)]">
    <div class="flex items-center justify-between">
      <h3 class="text-title-primary">Giới thiệu</h3>
      <button class="text-caption-secondary hover:text-[#0000ff] transition" type="button">Chỉnh sửa</button>
    </div>

    <p class="text-body-secondary mt-3 leading-relaxed">
      🎯 Xây dựng cộng đồng kết nối người Việt. Đam mê công nghệ và thiết kế sản phẩm.
    </p>

    <div class="mt-4 space-y-3">
      <div v-for="item in infoItems" :key="item.label" class="flex items-center gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-[#0000ff]/8 bg-[#0000ff]/5 text-[#0000ff]/70">
          <Icon :name="item.icon" class="h-4 w-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-caption-secondary">{{ item.label }}</p>
          <p class="text-body-primary truncate text-[13px] font-medium">{{ item.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const infoItems = [
  { icon: "i-ph-briefcase", label: "Công việc", value: "Founder tại VNSEEA" },
  { icon: "i-ph-graduation-cap", label: "Học vấn", value: "Đại học Bách Khoa" },
  { icon: "i-ph-map-pin", label: "Sống tại", value: "TP. Hồ Chí Minh, Việt Nam" },
  { icon: "i-ph-heart", label: "Tình trạng", value: "Độc thân" },
  { icon: "i-ph-calendar-blank", label: "Tham gia", value: "Tháng 3, 2024" },
  { icon: "i-ph-globe-simple", label: "Website", value: "vnseea.com" },
]
</script>
