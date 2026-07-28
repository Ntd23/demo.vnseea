<!-- English description: Displays the chat widget skeleton while the client-only widget and its initial inbox request are loading. -->
<template>
  <div class="chat-widget-loading" aria-hidden="true">
    <div class="chat-widget-loading__header">
      <div class="chat-widget-loading__heading">
        <USkeleton class="h-4 w-24 rounded-full" />
        <USkeleton class="h-3 w-28 rounded-full" />
      </div>

      <div class="chat-widget-loading__actions">
        <USkeleton v-for="index in 3" :key="index" class="h-8 w-8 rounded-full" />
      </div>
    </div>

    <div class="chat-widget-loading__tabs">
      <USkeleton v-for="index in 3" :key="index" class="h-9 flex-1 rounded-[var(--radius-md)]" />
    </div>

    <div class="chat-widget-loading__list">
      <div v-for="index in 6" :key="index" class="chat-widget-loading__row">
        <USkeleton class="h-9 w-9 shrink-0 rounded-full" />
        <div class="chat-widget-loading__copy">
          <USkeleton class="h-3 w-28 rounded-full" />
          <USkeleton class="h-2.5 w-20 rounded-full" />
        </div>
        <USkeleton class="ml-auto h-7 w-7 shrink-0 rounded-[var(--radius-sm)]" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-widget-loading {
  min-height: 420px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.chat-widget-loading__header {
  display: flex;
  min-height: 68px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--border-light);
  padding: 12px 14px;
}

.chat-widget-loading__heading,
.chat-widget-loading__copy {
  display: grid;
  gap: 8px;
}

.chat-widget-loading__actions,
.chat-widget-loading__tabs,
.chat-widget-loading__row {
  display: flex;
  align-items: center;
}

.chat-widget-loading__actions {
  gap: 8px;
}

.chat-widget-loading__tabs {
  gap: 8px;
  border-bottom: 1px solid var(--border-light);
  padding: 10px 14px;
}

.chat-widget-loading__list {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.chat-widget-loading__row {
  min-height: 48px;
  gap: 12px;
}
</style>
