<template>
  <nav class="bg-white py-2.5 shadow-sm xl:hidden">
    <div class="flex items-center justify-around px-3">
      <button
        v-for="item in items"
        :key="item.label"
        class="flex h-12 w-12 items-center justify-center rounded-full border-4 transition"
        :class="item.active
          ? 'border-[#0000ff] bg-[#0000ff]/8 text-[#0000ff]'
          : 'border-slate-200 bg-white text-slate-500 hover:border-[#0000ff]/30 hover:text-[#0000ff]'"
        type="button"
        :aria-label="item.label"
      >
        <Icon :name="item.icon" class="h-5 w-5" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const items = computed(() => [
  {
    label: "Bảng tin",
    icon: "i-ph-squares-four-fill",
    active: route.path === "/" || route.path === "/home",
  },
  {
    label: "Bài viết",
    icon: "i-ph-article-fill",
    active: false,
  },
  {
    label: "Ảnh",
    icon: "i-ph-image-fill",
    active: false,
  },
  {
    label: "Video",
    icon: "i-ph-video-camera-fill",
    active: false,
  },
  {
    label: "Nhạc",
    icon: "i-ph-music-note-fill",
    active: false,
  },
])
</script>
