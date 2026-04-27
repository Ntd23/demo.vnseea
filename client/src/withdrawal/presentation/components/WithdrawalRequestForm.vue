<template>
  <section class="surface-card p-6 sm:p-10 shadow-xl ring-1 ring-secondary-100 transition-all duration-500 hover:shadow-2xl">
    <div class="space-y-10">
      <div class="space-y-1">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900 pl-1">
          {{ $t("pages.withdrawalPage.newRequest") }}
        </p>
        <h2 class="text-3xl font-black tracking-tight text-secondary-900">
          {{ $t("pages.withdrawalPage.withdrawFunds") }}
        </h2>
        <p class="text-sm font-medium leading-relaxed text-secondary-500 max-w-xl">
          {{ $t("pages.withdrawalPage.withdrawDescription") }}
        </p>
      </div>

      <div class="grid gap-10 lg:grid-cols-2">
        <div class="space-y-8">
          <div class="space-y-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 pl-1">
              {{ $t("pages.withdrawalPage.amountToWithdraw") }}
            </p>
            <div class="relative group/input">
              <UInput
                v-model.number="payload.amount"
                type="number"
                size="xl"
                placeholder="0"
                :ui="{ 
                  rounded: 'rounded-2xl', 
                  size: { xl: 'h-[72px] px-8 text-2xl font-black' }, 
                  base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300' 
                }"
              />
              <div class="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-black text-secondary-400 group-focus-within/input:text-primary-500">
                VND
              </div>
            </div>
            <p class="text-[10px] font-bold text-secondary-400 px-1">
              {{ $t("pages.withdrawalPage.minWithdrawal") }}: <span class="text-secondary-900">{{ formatWithdrawalCurrency(minimumAmount) }}</span>
            </p>
          </div>

          <div class="space-y-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 pl-1">
              {{ $t("pages.withdrawalPage.accountNumber") }}
            </p>
            <UInput
              v-model="payload.accountNumber"
              size="xl"
              icon="i-ph-hash-duotone"
              :placeholder="$t('pages.withdrawalPage.accountNumberPlaceholder')"
              :ui="{ 
                rounded: 'rounded-2xl', 
                size: { xl: 'h-14 px-6 font-semibold' }, 
                base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300' 
              }"
            />
          </div>
        </div>

        <div class="space-y-8">
          <div class="space-y-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 pl-1">
              {{ $t("pages.withdrawalPage.withdrawalMethod") }}
            </p>
            <div class="grid gap-3 sm:grid-cols-1">
              <button
                v-for="method in methods"
                :key="method.value"
                class="flex items-center justify-between rounded-2xl border p-5 transition-all active:scale-[0.98]"
                :class="payload.method === method.value 
                  ? 'bg-primary-50 border-primary-500 ring-4 ring-primary-500/5' 
                  : 'bg-white border-secondary-100 hover:border-primary-200'"
                @click="payload.method = method.value"
              >
                <div class="flex items-center gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl transition-all" :class="payload.method === method.value ? 'bg-primary-600 text-white shadow-lg' : 'bg-secondary-50 text-secondary-400'">
                    <Icon :name="method.icon" class="h-6 w-6" />
                  </div>
                  <span class="text-sm font-black" :class="payload.method === method.value ? 'text-secondary-900' : 'text-secondary-500'">
                    {{ $t(method.label) }}
                  </span>
                </div>
                <Icon v-if="payload.method === method.value" name="i-ph-check-circle-fill" class="h-6 w-6 text-primary-600" />
              </button>
            </div>
          </div>

          <UButton
            size="xl"
            block
            :disabled="!isValid"
            class="h-16 rounded-2xl bg-secondary-900 text-[13px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-secondary-900/10 transition-all hover:bg-black active:scale-[0.97]"
            @click="handleSubmit"
          >
            {{ $t("pages.withdrawalPage.submitRequest") }}
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatWithdrawalCurrency } from "../../domain/types/withdrawal.types"
import type { WithdrawalMethod, WithdrawalRequestPayload } from "../../domain/types/withdrawal.types"

const props = defineProps<{
  availableBalance: number
  methods: WithdrawalMethod[]
  minimumAmount: number
}>()

const emit = defineEmits<{
  (e: "request", payload: WithdrawalRequestPayload): void
}>()

const payload = reactive<WithdrawalRequestPayload>({
  amount: 200000,
  method: "bank",
  accountNumber: "",
})

const isValid = computed(() => {
  return payload.amount >= props.minimumAmount && 
         payload.amount <= props.availableBalance && 
         payload.accountNumber.trim().length > 0
})

const handleSubmit = () => {
  if (!isValid.value) return
  emit("request", { ...payload })
  payload.accountNumber = ""
}
</script>
