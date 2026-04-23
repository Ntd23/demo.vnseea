<template>
  <div class="flex h-[calc(100dvh-56px)] min-h-0 w-full overflow-hidden bg-[#f4f7ff]">
    <!-- Conversation List -->
    <aside class="hidden min-h-0 w-[420px] shrink-0 overflow-hidden xl:block">
      <MessagesChatList @select-user="onSelectUser" />
    </aside>

    <!-- Main Chat Window -->
    <section class="min-h-0 min-w-0 flex-1 overflow-hidden bg-white relative">
      <MessagesChatWindow @toggle-info="infoPanelOpen = !infoPanelOpen" />
      
      <!-- Overlays / Popovers can go here -->
    </section>

    <!-- Info Side Panel -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-400 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <aside v-if="infoPanelOpen" class="hidden min-h-0 w-[360px] shrink-0 overflow-hidden border-l border-secondary-100 bg-white shadow-2xl xl:block z-20">
        <MessagesMessageSidePanel />
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const infoPanelOpen = ref(false)

function onSelectUser(user: any) {
  console.log('Selected user:', user.name)
  // Logic to load conversation
}
</script>
