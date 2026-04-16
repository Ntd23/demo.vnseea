<template>
  <div class="rounded-[18px] border border-[#0000ff]/10 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,255,0.04)]">
    <h3 class="text-heading text-[18px]">Giới thiệu</h3>

    <!-- Overview -->
    <div class="mt-4 space-y-4">
      <div v-for="section in sections" :key="section.title">
        <h4 class="text-caption-primary mb-2 flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#0000ff]/8 bg-[#0000ff]/5 text-[#0000ff]/60">
            <Icon :name="section.icon" class="h-3.5 w-3.5" />
          </span>
          {{ section.title }}
        </h4>
        <div class="space-y-2 pl-9">
          <div v-for="item in section.items" :key="item.label" class="flex items-start gap-2">
            <Icon :name="item.icon" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p class="text-body-primary text-[13px] font-medium">{{ item.value }}</p>
              <p v-if="item.sub" class="text-caption-secondary">{{ item.sub }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const sections = [
  {
    title: "Công việc và học vấn",
    icon: "i-ph-briefcase",
    items: [
      { icon: "i-ph-buildings", value: "Founder tại VNSEEA", sub: "2023 — Hiện tại" },
      { icon: "i-ph-graduation-cap", value: "Đại học Bách Khoa TP.HCM", sub: "Khoa Khoa học Máy tính · 2018 — 2022" },
    ],
  },
  {
    title: "Nơi ở",
    icon: "i-ph-map-pin",
    items: [
      { icon: "i-ph-house-simple", value: "Sống tại TP. Hồ Chí Minh", sub: undefined },
      { icon: "i-ph-map-trifold", value: "Đến từ Đà Nẵng, Việt Nam", sub: undefined },
    ],
  },
  {
    title: "Thông tin liên hệ",
    icon: "i-ph-phone",
    items: [
      { icon: "i-ph-envelope-simple", value: "admin@vnseea.com", sub: undefined },
      { icon: "i-ph-globe-simple", value: "vnseea.com", sub: undefined },
      { icon: "i-ph-phone", value: "+84 xxx xxx xxx", sub: undefined },
    ],
  },
  {
    title: "Thông tin cơ bản",
    icon: "i-ph-info",
    items: [
      { icon: "i-ph-gender-intersex", value: "Nam", sub: undefined },
      { icon: "i-ph-calendar-blank", value: "Ngày sinh: 15/03/1996", sub: undefined },
      { icon: "i-ph-heart", value: "Độc thân", sub: undefined },
    ],
  },
]
</script>
