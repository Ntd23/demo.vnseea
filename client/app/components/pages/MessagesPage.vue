<template>
  <div class="h-full min-h-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_26%),linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)] p-3 lg:p-4">
    <div
      class="grid h-full min-h-0 gap-4"
      :class="infoPanelOpen ? 'xl:grid-cols-[360px_minmax(0,1fr)_300px]' : 'xl:grid-cols-[360px_minmax(0,1fr)]'"
    >
      <aside class="hidden min-h-0 xl:block">
        <MessagesChatList @select-user="onSelectUser" />
      </aside>

      <section class="min-h-0 min-w-0">
        <MessagesChatWindow @toggle-info="infoPanelOpen = !infoPanelOpen" />
      </section>

      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="translate-x-8 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-8 opacity-0"
      >
        <aside v-if="infoPanelOpen" class="hidden min-h-0 xl:block">
          <MessagesMessageSidePanel />
        </aside>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const infoPanelOpen = ref(false)

function onSelectUser(user: any) {
  console.log('Selected user:', user.name)
  // Logic to load conversation
}
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

