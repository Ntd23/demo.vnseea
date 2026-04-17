<template>
  <Teleport to="body">
    <div
      v-if="job"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 py-4 backdrop-blur-[2px] sm:items-center"
      @click.self="$emit('close')"
    >
      <form
        class="max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-xl)]"
        @submit.prevent="submit"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-label-secondary text-[var(--color-primary-600)]">
              Ứng tuyển
            </p>
            <h2 class="mt-1 text-heading text-[var(--text-primary)]">
              {{ job.title }}
            </h2>
            <p class="mt-1 text-body-secondary">
              {{ job.company }} · {{ job.location }}
            </p>
          </div>
          <button
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[var(--color-secondary-100)] text-[var(--text-secondary)] transition hover:text-[var(--color-primary-600)]"
            type="button"
            @click="$emit('close')"
          >
            <Icon name="i-ph-x-bold" class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">Họ tên</span>
            <input v-model="form.name" required class="job-input mt-2" placeholder="Nguyễn Văn A">
          </label>
          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">Email</span>
            <input v-model="form.email" required class="job-input mt-2" placeholder="email@example.com" type="email">
          </label>
          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">Số điện thoại</span>
            <input v-model="form.phone" required class="job-input mt-2" placeholder="090..." type="tel">
          </label>
          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">CV upload</span>
            <input class="job-input mt-2 file:mr-3 file:rounded-[12px] file:border-0 file:bg-[var(--color-primary-50)] file:px-3 file:py-2 file:text-[12px] file:font-bold file:text-[var(--color-primary-600)]" type="file" accept=".pdf,.doc,.docx" @change="setCvName">
          </label>
        </div>

        <label class="mt-4 block">
          <span class="text-[12px] font-bold text-[var(--text-secondary)]">Lời nhắn</span>
          <textarea v-model="form.message" required class="job-input mt-2 min-h-[130px] resize-y py-3" placeholder="Tóm tắt kinh nghiệm, thời gian có thể bắt đầu và lý do phù hợp." />
        </label>

        <div
          v-if="submitted"
          class="mt-4 rounded-[18px] bg-[var(--color-primary-50)] px-4 py-3 text-[13px] font-bold text-[var(--color-primary-600)]"
        >
          Đã mô phỏng gửi hồ sơ. Chưa gọi API job.php.
        </div>

        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            class="inline-flex h-11 items-center justify-center rounded-[18px] border border-[var(--border-default)] bg-white px-4 text-[13px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
            type="button"
            @click="$emit('close')"
          >
            Đóng
          </button>
          <button
            class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary-500)] px-5 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
            type="submit"
          >
            <Icon name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
            Gửi hồ sơ
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { JobApplicationPayload, MockJob } from "~/composables/useMockJobsData"

const props = defineProps<{
  job?: MockJob
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: JobApplicationPayload]
}>()

const submitted = ref(false)
const form = reactive({
  name: "",
  email: "",
  phone: "",
  message: "",
  cvName: "",
})

watch(() => props.job?.id, () => {
  submitted.value = false
})

const setCvName = (event: Event) => {
  const input = event.target as HTMLInputElement
  form.cvName = input.files?.[0]?.name ?? ""
}

const submit = () => {
  if (!props.job) return

  submitted.value = true
  emit("submit", {
    jobId: props.job.id,
    name: form.name,
    email: form.email,
    phone: form.phone,
    message: form.message,
    cvName: form.cvName,
  })
}
</script>

<style scoped>
.job-input {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: var(--color-secondary-100);
  padding: 0 14px;
  min-height: 46px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: all var(--duration-fast) var(--ease-default);
}

.job-input:focus {
  border-color: var(--color-primary-200);
  background: var(--bg-surface);
  box-shadow: 0 0 0 4px var(--bg-surface-active);
}
</style>
