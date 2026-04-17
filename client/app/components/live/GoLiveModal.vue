<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-black/42 px-3 py-4 backdrop-blur-[2px] sm:items-center" @click.self="$emit('close')">
      <form class="w-full max-w-[620px] rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-xl)]" @submit.prevent="submit">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-label-secondary text-[var(--color-primary-600)]">Go Live</p>
            <h2 class="mt-1 text-heading text-[var(--text-primary)]">Tạo live stream</h2>
            <p class="mt-1 text-body-secondary">Mock form cho `live.php`, sẵn sàng nối provider realtime.</p>
          </div>
          <button
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
            type="button"
            @click="$emit('close')"
          >
            <Icon name="i-ph-x-bold" class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="block sm:col-span-2">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">Tiêu đề live</span>
            <input v-model="form.title" class="live-input mt-2" required placeholder="Ví dụ: Q&A cộng đồng tối nay">
          </label>

          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">Danh mục</span>
            <select v-model="form.category" class="live-input mt-2">
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </label>

          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">Quyền xem</span>
            <select v-model="form.privacy" class="live-input mt-2">
              <option value="public">Công khai</option>
              <option value="members">Thành viên</option>
              <option value="private">Riêng tư</option>
            </select>
          </label>

          <label class="block sm:col-span-2">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">Mô tả</span>
            <textarea v-model="form.description" class="live-input mt-2 min-h-[130px] resize-y py-3" placeholder="Nội dung chính của buổi live, khách mời, agenda..." />
          </label>
        </div>

        <div v-if="submitted" class="mt-4 rounded-[18px] bg-[var(--color-primary-50)] px-4 py-3 text-[13px] font-bold text-[var(--color-primary-600)]">
          Đã mô phỏng tạo live stream. Chưa gọi API live.php.
        </div>

        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button class="h-11 rounded-[18px] border border-[var(--border-default)] bg-white px-5 text-[13px] font-bold text-[var(--text-secondary)]" type="button" @click="$emit('close')">Đóng</button>
          <button class="h-11 rounded-[18px] bg-[var(--color-primary-500)] px-5 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)]" type="submit">Bắt đầu live</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { GoLivePayload } from "~/composables/useMockLiveData"

const props = defineProps<{
  open: boolean
  categories: ReadonlyArray<string>
}>()

const emit = defineEmits<{ close: []; create: [payload: GoLivePayload] }>()

const submitted = ref(false)
const form = reactive<GoLivePayload>({
  title: "",
  category: props.categories[0] ?? "Cộng đồng",
  privacy: "public",
  description: "",
})

watch(() => props.open, (open) => {
  if (open) submitted.value = false
})

const submit = () => {
  submitted.value = true
  emit("create", { ...form })
}
</script>

<style scoped>
.live-input {
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-hover);
  padding: 0 14px;
  color: var(--text-primary);
  outline: none;
}
</style>
