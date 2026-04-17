<template>
  <CommunitySettingsSectionCard
    eyebrow="Kiểm soát truy cập"
    title="Quyền riêng tư và luồng quản trị"
    description="Thiết lập cách thành viên nhìn thấy nhóm, gửi yêu cầu tham gia và đăng nội dung trong community."
    icon="i-ph-shield-check-bold"
  >
    <template #trailing>
      <div class="inline-flex items-center rounded-full bg-[#f8fbff] px-4 py-2 text-[12px] font-semibold text-[#243b63]">
        {{ selectedPrivacyLabel }}
      </div>
    </template>

    <div class="space-y-5">
      <div class="grid gap-3 lg:grid-cols-3">
        <button
          v-for="option in communityPrivacyOptions"
          :key="option.value"
          class="rounded-[22px] border px-4 py-4 text-left transition"
          :class="model.privacy === option.value
            ? 'border-[#0000ff]/22 bg-[#eef0ff] shadow-[0_12px_24px_rgba(0,0,255,0.08)]'
            : 'border-[#dbe3f2] bg-white hover:border-[#c5caff] hover:bg-[#f8fbff]'"
          type="button"
          @click="model.privacy = option.value as CommunityPrivacy"
        >
          <div class="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-[#0000ff] shadow-[0_8px_18px_rgba(15,35,110,0.05)]">
            <Icon :name="option.icon || 'i-ph-circle-fill'" class="h-5 w-5" />
          </div>
          <p class="mt-4 text-[14px] font-black text-[#243b63]">
            {{ option.label }}
          </p>
          <p class="mt-2 text-[12px] leading-5 text-slate-500">
            {{ option.description }}
          </p>
        </button>
      </div>

      <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-4">
        <p class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0000ff]/65">
          Logic đang áp dụng
        </p>
        <p class="mt-2 text-[14px] leading-6 text-slate-500">
          {{ selectedPrivacyDescription }}
        </p>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <FormsToggleSwitch
          v-model="model.joinApproval"
          label="Phê duyệt thành viên mới"
          description="Quản trị viên xét yêu cầu tham gia trước khi vào nhóm."
        />
        <FormsToggleSwitch
          v-model="model.postApproval"
          label="Duyệt bài đăng trước khi hiển thị"
          description="Bài viết mới cần moderator kiểm tra trước khi lên feed."
        />
        <FormsToggleSwitch
          v-model="model.allowMemberInvites"
          label="Cho phép thành viên mời thêm người"
          description="Thành viên hiện tại có thể gửi lời mời trực tiếp cho bạn bè."
        />
        <FormsToggleSwitch
          v-model="model.showMemberDirectory"
          label="Hiển thị danh sách thành viên"
          description="Member list vẫn xuất hiện ở sidebar và trang giới thiệu của nhóm."
        />
        <FormsToggleSwitch
          v-model="model.welcomePostEnabled"
          label="Hiển thị bài chào mừng"
          description="Thành viên mới sẽ thấy một bài ghim giới thiệu nội quy và tài nguyên khởi động."
        />
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import {
  communityPrivacyOptions,
  getCommunityOptionDescription,
  getCommunityOptionLabel,
} from "../../../types/community"
import type {
  CommunityGroupSettingsDraft,
  CommunityPrivacy,
} from "../../../types/community"

const model = defineModel<CommunityGroupSettingsDraft>({ required: true })

const selectedPrivacyLabel = computed(() =>
  getCommunityOptionLabel(communityPrivacyOptions, model.value.privacy, "Quyền riêng tư"),
)

const selectedPrivacyDescription = computed(() =>
  getCommunityOptionDescription(communityPrivacyOptions, model.value.privacy, "Chưa chọn quyền riêng tư cho nhóm."),
)
</script>
