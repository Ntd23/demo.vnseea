<!-- English description: Animated theme toggle button switching between light and dark mode with rotate/scale effects. -->
<template>
  <button
    type="button"
    class="header-action-btn theme-toggle-btn"
    :title="isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
    :aria-label="isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
    @click="toggleTheme"
  >
    <div
      class="theme-toggle-icon-wrapper"
      :class="{ 'theme-toggle--animating': isRotating }"
    >
      <Icon
        v-if="isDark"
        name="i-ph-moon-stars-fill"
        class="h-[22px] w-[22px] text-indigo-400 theme-icon-moon"
      />
      <Icon
        v-else
        name="i-ph-sun-dim-fill"
        class="h-[23px] w-[23px] text-amber-500 theme-icon-sun"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === "dark")
const isRotating = ref(false)

function toggleTheme() {
  isRotating.value = true
  colorMode.preference = isDark.value ? "light" : "dark"
  setTimeout(() => {
    isRotating.value = false
  }, 500)
}
</script>

<style scoped>
.header-action-btn {
  position: relative;
  display: inline-flex;
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
}

.header-action-btn:hover {
  border-color: var(--border-light);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
}

@media (max-width: 1279.98px) {
  .header-action-btn {
    height: 40px;
    width: 40px;
    background: var(--bg-muted);
  }
}

.theme-toggle-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-toggle-btn:hover .theme-toggle-icon-wrapper {
  transform: scale(1.12) rotate(15deg);
}

.theme-toggle--animating {
  animation: spin-and-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes spin-and-pop {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(0.7);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>
