<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10">
    <CommunityCreationHeaderCard
      eyebrow="P-18 · Community"
      title="Tạo nhóm mới"
      description="Thiết lập một cộng đồng mới cho thành viên cùng trao đổi, chia sẻ nội dung và kết nối quanh một chủ đề chung."
      icon="i-ph-users-four-fill"
      :highlights="['URL tùy chỉnh', 'Kiểm soát quyền riêng tư', 'Sẵn sàng mời thành viên']"
    />

    <CommunityCreationForm
      v-model="draft"
      entity-label="nhóm"
      :privacy-options="communityPrivacyOptions"
      :category-options="communityCategoryOptions"
      name-label="Tên nhóm"
      name-placeholder="Ví dụ: Cộng đồng Ô tô miền Trung"
      url-label="Tập đoàn URL"
      slug-placeholder="cong-dong-o-to-mien-trung"
      description-label="Sự mô tả"
      description-placeholder="Mô tả ngắn gọn chủ đề của nhóm, đối tượng phù hợp và nội dung mọi người sẽ cùng thảo luận."
      privacy-label="Loại nhóm"
      category-label="Loại"
      back-to="/groups"
      submit-to="/groups"
      submit-label="Tạo ra"
    />
  </div>
</template>

<script setup lang="ts">
import {
  communityCategoryOptions,
  communityPrivacyOptions,
} from "../../../types/community"
import type { CommunityDraft } from "../../../types/community"

useSeoMeta({
  title: "Tạo nhóm mới | VNSEEA",
  description: "Tạo nhóm mới trên VNSEEA với tên, URL, mô tả, category và quyền riêng tư.",
})

const draft = ref<CommunityDraft>({
  name: "",
  slug: "",
  description: "",
  privacy: "public",
  category: "auto",
})
</script>
