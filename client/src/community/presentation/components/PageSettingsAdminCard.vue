<!-- Description: Renders page admin search and management controls in page settings. -->
<template>
  <CommunitySettingsSectionCard
    :eyebrow="$t('community.pageSettings.sidebar.admin.eyebrow')"
    :title="$t('community.pageSettings.sidebar.admin.title')"
    :description="$t('community.pageSettings.sidebar.admin.desc')"
    icon="i-ph-shield-checkered-bold"
    :translate-text="false"
  >
    <div class="space-y-6 py-4">
      <!-- Add Admin Section -->
      <div class="flex flex-col gap-3 sm:flex-row">
        <div class="relative flex-1">
          <Icon name="i-ph-magnifying-glass-bold" class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm thành viên theo tên hoặc email..."
            class="admin-search-input"
          >
        </div>
        <button type="button" class="admin-add-button" :disabled="!searchQuery" @click="handleAddAdmin">
          <Icon name="i-ph-user-plus-bold" class="mr-2 h-4 w-4" />
          Thêm quản trị viên
        </button>
      </div>

      <!-- Admin List -->
      <div class="admin-list space-y-3">
        <div v-for="admin in admins" :key="admin.id" class="admin-item">
          <div class="flex items-center gap-3">
            <div class="admin-avatar">
              <img v-if="admin.avatar" :src="admin.avatar" :alt="admin.name">
              <span v-else>{{ admin.name.charAt(0) }}</span>
            </div>
            <div>
              <div class="admin-name">{{ admin.name }}</div>
              <div class="admin-role">{{ admin.role === 'owner' ? 'Chủ sở hữu' : 'Quản trị viên' }}</div>
            </div>
          </div>
          
          <button 
            v-if="admin.role !== 'owner'" 
            type="button" 
            class="admin-remove-btn"
            @click="handleRemoveAdmin(admin.id)"
          >
            <Icon name="i-ph-user-minus-bold" class="h-4 w-4" />
          </button>
          <div v-else class="owner-badge">
            <Icon name="i-ph-crown-bold" class="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import { ref } from "vue"
import CommunitySettingsSectionCard from "./SettingsSectionCard.vue"

const searchQuery = ref("")

// Mock data
const admins = ref([
  { id: 1, name: "Admin Nguyễn", role: "owner", avatar: "" },
  { id: 2, name: "Thanh Hằng", role: "admin", avatar: "" },
])

function handleAddAdmin() {
  if (!searchQuery.value) return
  alert(`Gửi lời mời quản trị viên đến: ${searchQuery.value}`)
  searchQuery.value = ""
}

function handleRemoveAdmin(id: number) {
  if (confirm("Bạn có chắc chắn muốn gỡ quyền quản trị của thành viên này?")) {
    admins.value = admins.value.filter(a => a.id !== id)
  }
}
</script>

<style scoped>
.admin-search-input {
  width: 100%;
  height: 44px;
  padding-left: 40px;
  padding-right: 16px;
  background: var(--bg-muted);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.admin-search-input:focus {
  background: var(--bg-surface);
  border-color: var(--bg-brand);
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--bg-brand) 10%, transparent);
}

.admin-add-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  background: var(--bg-brand);
  color: var(--text-inverse);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.admin-add-button:hover:not(:disabled) {
  background: var(--bg-brand-hover);
  transform: translateY(-1px);
}

.admin-add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-50);
  color: var(--bg-brand);
  border-radius: 10px;
  font-weight: 800;
  overflow: hidden;
}

.admin-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
}

.admin-role {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.admin-remove-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.admin-remove-btn:hover {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-error);
}

.owner-badge {
  color: var(--color-warning);
  padding: 8px;
}
</style>
