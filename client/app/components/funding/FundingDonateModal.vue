<template>
  <Teleport to="body">
    <div v-if="campaign" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 py-4 backdrop-blur-[2px] sm:items-center" @click.self="$emit('close')">
      <form class="w-full max-w-[540px] rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-xl)]" @submit.prevent="submit">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-label-secondary text-[var(--color-primary-600)]">Donate</p>
            <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ campaign.title }}</h2>
            <p class="mt-1 text-body-secondary">{{ campaign.owner }} · {{ campaign.location }}</p>
          </div>
          <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[var(--color-secondary-100)] text-[var(--text-secondary)]" type="button" @click="$emit('close')">
            <Icon name="i-ph-x-bold" class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-5 grid grid-cols-3 gap-2">
          <button v-for="amount in amounts" :key="amount" class="h-12 rounded-[18px] text-[13px] font-extrabold transition" :class="form.amount === amount ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'bg-[var(--color-secondary-100)] text-[var(--color-primary-900)]'" type="button" @click="form.amount = amount">
            {{ formatFundingCurrency(amount) }}
          </button>
        </div>

        <label class="mt-4 block">
          <span class="text-[12px] font-bold text-[var(--text-secondary)]">Số tiền khác</span>
          <input v-model.number="form.amount" class="funding-input mt-2" min="10000" type="number">
        </label>

        <label class="mt-4 block">
          <span class="text-[12px] font-bold text-[var(--text-secondary)]">Phương thức</span>
          <select v-model="form.paymentMethod" class="funding-input mt-2">
            <option value="wallet">Ví VNSEEA</option>
            <option value="card">Thẻ thanh toán</option>
            <option value="bank">Chuyển khoản</option>
          </select>
        </label>

        <label class="mt-4 block">
          <span class="text-[12px] font-bold text-[var(--text-secondary)]">Lời nhắn</span>
          <textarea v-model="form.message" class="funding-input mt-2 min-h-[110px] resize-y py-3" placeholder="Gửi lời nhắn đến chủ chiến dịch." />
        </label>

        <div v-if="submitted" class="mt-4 rounded-[18px] bg-[var(--color-primary-50)] px-4 py-3 text-[13px] font-bold text-[var(--color-primary-600)]">
          Đã mô phỏng donate. Chưa gọi API funding.php / wallet.php.
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button class="h-11 rounded-[18px] border border-[var(--border-default)] bg-white px-4 text-[13px] font-bold text-[var(--text-secondary)]" type="button" @click="$emit('close')">Đóng</button>
          <button class="h-11 rounded-[18px] bg-[var(--color-primary-500)] px-5 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)]" type="submit">Ủng hộ</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { DonationPayload, MockFundingCampaign } from "~/composables/useMockFundingData"
import { formatFundingCurrency } from "~/composables/useMockFundingData"

const props = defineProps<{ campaign?: MockFundingCampaign }>()
const emit = defineEmits<{ close: []; donate: [payload: DonationPayload] }>()

const amounts = [100000, 300000, 500000]
const submitted = ref(false)
const form = reactive<DonationPayload>({
  campaignId: "",
  amount: 300000,
  paymentMethod: "wallet",
  message: "",
})

watch(() => props.campaign?.id, (id) => {
  submitted.value = false
  form.campaignId = id ?? ""
})

const submit = () => {
  if (!props.campaign) return
  submitted.value = true
  emit("donate", { ...form, campaignId: props.campaign.id })
}
</script>

<style scoped>
.funding-input {
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: var(--color-secondary-100);
  padding: 0 14px;
  color: var(--text-primary);
  outline: none;
}
</style>
