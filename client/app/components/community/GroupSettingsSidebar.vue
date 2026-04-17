<template>
  <div class="space-y-4 xl:sticky xl:top-[84px]">
    <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <div class="relative overflow-hidden px-5 py-5 text-white">
        <div class="absolute inset-0" :style="{ background: group.banner }" />
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.32),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.36))]" />

        <div class="relative">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">
            Xem trước sau khi lưu
          </p>
          <div class="mt-4 flex items-start gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-white/18 bg-white/12 text-[1rem] font-black text-white backdrop-blur">
              {{ initials }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-[1.05rem] font-black">{{ group.name }}</p>
              <p class="mt-1 break-all text-[12px] text-white/72">vnseea.vn/g/{{ group.slug }}</p>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold">
            <span class="rounded-full bg-white/14 px-3 py-1.5">{{ privacyLabel }}</span>
            <span class="rounded-full bg-white/14 px-3 py-1.5">{{ categoryLabel }}</span>
          </div>

          <p class="mt-4 text-[13px] leading-6 text-white/82">
            {{ group.summary }}
          </p>
        </div>
      </div>

      <div class="grid gap-px border-t border-white/10 bg-[#edf2fb] sm:grid-cols-3">
        <div class="bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Chính sách bật</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ enabledPolicies }}/{{ totalPolicies }}</p>
        </div>
        <div class="bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Thẻ chủ đề</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ group.tags.length }}</p>
        </div>
        <div class="bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Nội quy</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ group.guidelines?.length || 0 }}</p>
        </div>
      </div>
    </section>

    <CommunityGroupAboutCard
      :group="group"
      :privacy-label="privacyLabel"
      :privacy-description="privacyDescription"
      :category-label="categoryLabel"
      :member-count-label="memberCountLabel"
      compact
    />

    <CommunityGroupMembersCard
      v-if="showMemberDirectory"
      :members="members"
      :member-count-label="memberCountLabel"
    />

    <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
      <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
        Lưu ý quản trị
      </p>
      <div class="mt-4 space-y-3">
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[13px] font-semibold text-[#243b63]">Giữ mô tả đủ rõ</p>
          <p class="mt-1 text-[12px] leading-5 text-slate-500">
            Thành viên mới thường quyết định tham gia trong 1-2 câu đầu tiên của phần giới thiệu.
          </p>
        </div>
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[13px] font-semibold text-[#243b63]">Quy tắc nên ngắn và cụ thể</p>
          <p class="mt-1 text-[12px] leading-5 text-slate-500">
            Nội quy càng rõ thì moderator càng dễ xử lý bài viết và yêu cầu gia nhập.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { getCommunityInitials } from "../../../types/community"
import type {
  CommunityGroupMember,
  CommunityGroupRecord,
} from "../../../types/community"

const props = defineProps<{
  group: CommunityGroupRecord
  members: CommunityGroupMember[]
  memberCountLabel: string
  privacyLabel: string
  privacyDescription: string
  categoryLabel: string
  enabledPolicies: number
  totalPolicies: number
  showMemberDirectory: boolean
}>()

const initials = computed(() =>
  getCommunityInitials(props.group.name),
)
</script>
