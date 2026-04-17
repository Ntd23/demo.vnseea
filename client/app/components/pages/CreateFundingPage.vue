<template>
  <div class="space-y-5 pb-10">
    <section class="overflow-hidden rounded-[34px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
      <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div class="p-6 sm:p-8 lg:p-10">
          <NuxtLink
            to="/funding"
            class="inline-flex items-center gap-2 rounded-full bg-[var(--color-soft)] px-4 py-2 text-sm font-extrabold text-[var(--color-primary)]"
          >
            <Icon name="i-ph-arrow-left-bold" class="h-4 w-4" />
            Kinh phí
          </NuxtLink>
          <p class="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">P-31 · Crowdfunding</p>
          <h1 class="mt-3 text-3xl font-black leading-tight text-[var(--color-text)] sm:text-4xl">
            Tạo chiến dịch gây quỹ
          </h1>
          <p class="mt-4 max-w-2xl text-base font-semibold leading-7 text-[var(--color-muted)]">
            Nhập tiêu đề, mô tả, mục tiêu tiền và ảnh đại diện cho chiến dịch. Form này mô phỏng luồng `funding.php`, chưa gửi dữ liệu lên server.
          </p>
        </div>

        <div class="border-t border-[var(--color-border)] bg-[var(--color-soft)] p-6 lg:border-l lg:border-t-0">
          <div class="rounded-[28px] bg-white p-5 shadow-[var(--shadow-card)]">
            <div class="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--color-primary)] text-white">
              <Icon name="i-ph-hand-heart-fill" class="h-7 w-7" />
            </div>
            <h2 class="mt-4 text-xl font-extrabold text-[var(--color-text)]">Chuẩn bị trước khi đăng</h2>
            <ul class="mt-4 space-y-3 text-sm font-semibold leading-6 text-[var(--color-muted)]">
              <li class="flex gap-2">
                <Icon name="i-ph-check-circle-fill" class="mt-1 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                Mô tả rõ mục tiêu sử dụng tiền.
              </li>
              <li class="flex gap-2">
                <Icon name="i-ph-check-circle-fill" class="mt-1 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                Đặt số tiền mục tiêu có thể kiểm chứng.
              </li>
              <li class="flex gap-2">
                <Icon name="i-ph-check-circle-fill" class="mt-1 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                Thêm ảnh đại diện đúng nội dung chiến dịch.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <FundingCreateFundingForm
        :categories="fundingCategories"
        @create="recordCreatedCampaign"
      />

      <aside class="space-y-4">
        <div class="rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Sau khi tạo</p>
          <h2 class="mt-2 text-xl font-extrabold text-[var(--color-text)]">Kiểm tra preview</h2>
          <p class="mt-3 text-sm font-semibold leading-6 text-[var(--color-muted)]">
            Khi nối API thật, chiến dịch mới sẽ quay về danh sách `/funding` và trang chi tiết `/show_fund/{id}`.
          </p>
          <NuxtLink
            to="/funding"
            class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-[var(--color-border)] px-5 py-3 text-sm font-extrabold text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-soft)]"
          >
            Xem danh sách funding
            <Icon name="i-ph-arrow-right-bold" class="h-4 w-4" />
          </NuxtLink>
        </div>

        <div
          v-if="createdCount > 0"
          class="rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]"
        >
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">Mock session</p>
          <p class="mt-2 text-3xl font-black text-[var(--color-primary)]">{{ createdCount }}</p>
          <p class="mt-1 text-sm font-semibold text-[var(--color-muted)]">chiến dịch đã tạo trong phiên hiện tại.</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FundingCreatePayload } from "~/composables/useMockFundingData"

const { fundingCategories } = useMockFundingData()

useSeoMeta({
  title: "Tạo gây quỹ | VNSEEA",
  description: "Form tạo chiến dịch crowdfunding với tiêu đề, mô tả, mục tiêu tiền và ảnh đại diện.",
})

const createdCount = ref(0)

const recordCreatedCampaign = (_payload: FundingCreatePayload) => {
  createdCount.value += 1
}
</script>
