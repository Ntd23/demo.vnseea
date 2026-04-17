<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10">
    <CommunityCreationHeaderCard
      eyebrow="P-21 · Fanpage"
      title="Tạo trang mới"
      description="Khởi tạo một fanpage cho thương hiệu, cửa hàng, chuyên gia hoặc dự án nội dung để bắt đầu đăng bài, nhận theo dõi và xây dựng hiện diện công khai."
      icon="i-ph-megaphone-simple-fill"
      :highlights="['Công khai ngay từ đầu', 'URL thương hiệu', 'Sẵn sàng cho hồ sơ fanpage']"
    />

    <CommunityCreationForm
      v-model="draft"
      entity-label="trang"
      :category-options="communityPageCategoryOptions"
      :show-privacy="false"
      :url-prefix="communityPageUrlPrefix"
      name-label="Tên trang"
      name-placeholder="Ví dụ: Studio Nội thất Mộc Mây"
      url-label="Page URL"
      slug-placeholder="studio-noi-that-moc-may"
      description-label="Giới thiệu ngắn"
      description-placeholder="Mô tả ngắn gọn thương hiệu, dịch vụ, sản phẩm hoặc loại nội dung chính mà fanpage của bạn sẽ chia sẻ."
      category-label="Loại trang"
      back-label="Quay lại trang chủ"
      back-to="/home"
      submit-label="Tạo trang"
      :submit-to="submitTo"
      identity-section-label="Định danh fanpage"
      identity-section-title="Tên trang gọn, dễ nhớ và đúng nhận diện"
      identity-section-badge="Dùng tốt cho tìm kiếm, chia sẻ và hồ sơ công khai"
      identity-hint="Tên nên khớp với thương hiệu, dịch vụ hoặc persona chính"
      description-section-label="Giới thiệu fanpage"
      description-section-title="Cho người theo dõi biết bạn đang cung cấp điều gì"
      description-hint="Gợi ý: nói rõ thương hiệu là ai, phục vụ nhóm người nào và nội dung chính bạn sẽ đăng tải."
      configuration-section-label="Phân loại fanpage"
      configuration-section-title="Chọn danh mục để hệ thống đề xuất đúng đối tượng"
      action-description="Sau khi hoàn tất, bạn có thể thêm cover, avatar, CTA, thông tin liên hệ và bài giới thiệu đầu tiên của fanpage."
      preview-icon="i-ph-storefront-fill"
      :next-steps="nextSteps"
    />
  </div>
</template>

<script setup lang="ts">
import {
  communityPageCategoryOptions,
  communityPageUrlPrefix,
  createCommunitySlug,
  createCommunityPageDraft,
  getCommunityPagePath,
} from "../../../types/community"
import type { CommunityDraft } from "../../../types/community"

useSeoMeta({
  title: "Tạo trang mới | VNSEEA",
  description: "Tạo fanpage mới trên VNSEEA với tên, URL, mô tả và category để sẵn sàng cho flow trang công khai.",
})

const draft = ref<CommunityDraft>(createCommunityPageDraft())

const submitTo = computed(() => {
  const resolvedSlug =
    draft.value.slug.trim()
    || createCommunitySlug(draft.value.name)
    || "fanpage-moi"

  const query = new URLSearchParams()

  if (draft.value.name.trim()) {
    query.set("name", draft.value.name.trim())
  }

  if (draft.value.description.trim()) {
    query.set("description", draft.value.description.trim())
  }

  if (draft.value.category) {
    query.set("category", draft.value.category)
  }

  const queryString = query.toString()

  return `${getCommunityPagePath(resolvedSlug)}${queryString ? `?${queryString}` : ""}`
})

const nextSteps = [
  {
    title: "Hoàn thiện hồ sơ fanpage",
    description: "Thêm cover, avatar, giới thiệu nổi bật và thông tin liên hệ để trang nhìn đáng tin hơn.",
  },
  {
    title: "Chọn CTA phù hợp",
    description: "Tùy mục tiêu, bạn có thể bật nút nhắn tin, gọi điện, xem cửa hàng hoặc theo dõi.",
  },
  {
    title: "Đăng bài giới thiệu đầu tiên",
    description: "Ghim một bài mở đầu để người mới biết bạn cung cấp gì và nên tương tác thế nào với fanpage.",
  },
] as const
</script>
