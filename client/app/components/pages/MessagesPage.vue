<template>
  <div class="flex h-[calc(100dvh-56px)] min-h-0 w-full overflow-hidden bg-[#f4f7ff]">
    <aside class="hidden min-h-0 w-[360px] shrink-0 overflow-hidden border-r border-[#dce6fb] bg-white xl:block">
      <MessagesConversationList />
    </aside>

    <section class="min-h-0 min-w-0 flex-1 overflow-hidden bg-white">
      <MessagesMessagePane />
    </section>
  </div>
</template>
