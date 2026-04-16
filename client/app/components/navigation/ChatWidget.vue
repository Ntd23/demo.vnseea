<template>
  <div class="flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_4px_24px_rgba(0,0,255,0.06)]">
    <div class="flex shrink-0 items-center justify-between border-b border-[#f1f4f9] px-4 py-4">
      <div>
        <span class="block text-[17px] font-bold text-[#1f2937]">Trò chuyện</span>
        <span class="block text-[12px] text-slate-500">{{ onlineCount }} người đang online</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200" title="Tạo nhóm chat" type="button">
          <Icon name="i-ph-user-plus-bold" class="h-[15px] w-[15px]" />
        </button>
        <button class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200" title="Cài đặt" type="button">
          <Icon name="i-ph-gear-bold" class="h-[15px] w-[15px]" />
        </button>
      </div>
    </div>

    <div class="flex shrink-0 gap-2 border-b border-[#f1f4f9] px-4 py-3">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="flex h-[36px] flex-1 items-center justify-center rounded-[10px] transition duration-150"
        :class="activeTab === tab.value ? 'bg-[#f4eaea] text-[#0000ff]' : 'bg-transparent text-slate-400 hover:bg-slate-50'"
        type="button"
        @click="activeTab = tab.value"
      >
        <Icon :name="tab.icon" class="h-5 w-5" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto scrollbar-hide">
      <div v-if="activeTab === 'send'" class="flex flex-col gap-4 px-4 py-4">
        <span class="text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Nội dung</span>

        <div class="flex flex-col gap-1.5">
          <label class="text-[14px] font-semibold text-[#333333]">Gửi đến:</label>
          <input v-model="sendTo" class="h-[42px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-3 text-[14px] text-[#333333] outline-none transition focus:border-[#0000ff] focus:ring-1 focus:ring-[#0000ff]/20" placeholder="Tên người nhận..." type="text">
        </div>

        <div>
          <textarea v-model="sendMessage" class="w-full resize-none rounded-[8px] border border-[#d1d5db] bg-white p-3 text-[14px] text-[#333333] placeholder:text-[#9ca3af] outline-none transition focus:border-[#0000ff] focus:ring-1 focus:ring-[#0000ff]/20" placeholder="Nhập tin nhắn..." rows="3" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[14px] font-semibold text-[#333333]">Đính kèm <span class="font-normal text-[#6b7280]">(tùy chọn)</span></label>
          <div class="flex items-center overflow-hidden rounded-[8px] border border-dashed border-[#c7d2fe]">
            <label class="flex h-[38px] cursor-pointer items-center gap-1.5 bg-[#f8fafc] px-3 transition hover:bg-[#f1f5f9]">
              <Icon name="i-ph-paperclip" class="h-4 w-4 text-[#0000ff]" />
              <span class="text-[13px] font-medium text-[#333333]">Chọn tệp</span>
              <input class="hidden" type="file" @change="onFile">
            </label>
            <span class="border-l border-dashed border-[#c7d2fe] px-3 text-[13px] text-[#6b7280] truncate">{{ attachFile ? attachFile.name : 'Chưa có tệp nào được chọn' }}</span>
          </div>
        </div>

        <div class="mt-1 flex items-center gap-2">
          <div class="relative flex items-center justify-center">
            <input id="select-all" v-model="selectAll" class="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[4px] border border-[#cbd5e1] bg-white checked:border-[#0000ff] checked:bg-[#0000ff] transition" type="checkbox">
            <Icon name="i-ph-check-bold" class="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition peer-checked:opacity-100" />
          </div>
          <label class="cursor-pointer text-[14px] text-[#4b5563]" for="select-all">Chọn tất cả</label>
        </div>

        <button class="flex h-[42px] w-full items-center justify-center rounded-[8px] bg-[#0000ff] text-[15px] font-bold text-white transition hover:bg-[#0000dd]" type="button">Gửi tin nhắn</button>

        <div class="relative mt-2">
          <select class="w-full appearance-none rounded-[8px] border border-[#d1d5db] bg-white px-3 py-2.5 text-[14px] text-[#333333] outline-none transition focus:border-[#0000ff]">
            <option value="">Chọn thẻ...</option>
            <option value="important">Quan trọng</option>
            <option value="work">Công việc</option>
          </select>
          <Icon name="i-ph-caret-down-bold" class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]" />
        </div>
      </div>

      <div v-else-if="activeTab === 'contacts'" class="flex flex-col py-2">
        <button v-for="contact in extendedContacts" :key="contact.id" class="flex w-full items-center gap-3 px-4 py-2 transition hover:bg-[#f8fafc]" type="button" @click="openMiniChat(contact)">
          <div class="relative shrink-0">
            <img v-if="contact.avatarUrl" :src="contact.avatarUrl" class="h-10 w-10 rounded-full object-cover">
            <div v-else class="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold text-white" :style="{ background: avatarColor(contact.id) }">{{ contact.avatar }}</div>
            <div class="absolute bottom-0 right-0 h-[11px] w-[11px] rounded-full border-2 border-white" :class="contact.online ? 'bg-[#31a24c]' : 'bg-[#cbd5e1]'" />
          </div>

          <div class="min-w-0 flex-1 text-left">
            <div class="flex items-center gap-2">
              <span class="truncate text-[14px] text-[#333333]">{{ contact.name }}</span>
              <span v-if="contact.online" class="rounded-full bg-[#e7f8ec] px-2 py-0.5 text-[10px] font-semibold text-[#31a24c]">Online</span>
            </div>
            <p class="truncate text-[12px] text-slate-500">{{ contact.status || 'Sẵn sàng trò chuyện' }}</p>
          </div>

          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#0056ff] text-white transition hover:bg-[#0047d4]">
            <Icon name="i-ph-chat-circle-dots-bold" class="h-[14px] w-[14px]" />
          </div>
        </button>
      </div>

      <div v-else-if="activeTab === 'groups'" class="flex flex-col py-2">
        <button v-for="group in groups" :key="group.id" class="flex w-full items-center gap-3 px-4 py-2.5 transition hover:bg-[#f8fafc]" type="button" @click="openMiniGroup(group)">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffb3c6] text-[#e63946]">
            <Icon name="i-ph-users-three-fill" class="h-[22px] w-[22px]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <p class="truncate text-[14px] text-[#333333]">{{ group.name }}</p>
            <p class="text-[12px] text-slate-500">{{ group.members }} thành viên</p>
          </div>
        </button>
      </div>
    </div>

    <div class="shrink-0 border-t border-[#f1f4f9] p-4">
      <div class="flex items-center gap-2 rounded-[8px] bg-[#f1f5f9] px-3 py-2">
        <Icon name="i-ph-magnifying-glass" class="h-[18px] w-[18px] shrink-0 text-[#94a3b8]" />
        <input v-model="search" class="flex-1 bg-transparent text-[14px] text-[#333333] placeholder:text-[#94a3b8] outline-none" placeholder="Tìm kiếm người dùng" type="text">
      </div>
    </div>

    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
      <div v-if="miniChat.open" class="absolute inset-x-3 bottom-3 z-10 rounded-[18px] border border-[#0000ff]/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
        <div class="flex items-center justify-between border-b border-[#f1f4f9] px-3 py-2.5">
          <div class="min-w-0">
            <p class="truncate text-[13px] font-semibold text-slate-800">{{ miniChat.title }}</p>
            <p class="text-[11px] text-[#31a24c]">Đang hoạt động</p>
          </div>
          <button class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500" type="button" @click="miniChat.open = false">
            <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
          </button>
        </div>

        <div class="max-h-56 space-y-2 overflow-y-auto p-3 text-[13px]">
          <div class="flex justify-end">
            <div class="max-w-[82%] rounded-2xl bg-[#0000ff] px-3 py-2 text-white">{{ miniChat.sample }}</div>
          </div>
          <div class="flex justify-start">
            <div class="max-w-[82%] rounded-2xl bg-slate-100 px-3 py-2 text-slate-700">{{ miniChat.reply }}</div>
          </div>
        </div>

        <div class="border-t border-[#f1f4f9] p-3">
          <div class="flex items-center gap-2 rounded-[10px] bg-[#f1f5f9] px-3 py-2">
            <input v-model="miniChat.message" class="flex-1 bg-transparent text-[13px] outline-none" placeholder="Nhập tin nhắn..." type="text">
            <button class="text-[#0000ff]" type="button">
              <Icon name="i-ph-paper-plane-right-bold" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { contacts } = useMockSocialData()

const activeTab = ref('send')
const search = ref('')
const sendTo = ref('')
const sendMessage = ref('')
const attachFile = ref<File | null>(null)
const selectAll = ref(false)
const onlineCount = computed(() => contacts.filter(c => c.online).length)

const tabs = [
  { value: 'send', icon: 'i-ph-paper-plane-right' },
  { value: 'contacts', icon: 'i-ph-address-book' },
  { value: 'groups', icon: 'i-ph-users-three' },
]

const groups = [
  { id: 1, name: 'Group-1', members: 5 },
  { id: 2, name: 'Hahan', members: 3 },
]

const extendedContacts = computed(() => contacts.map((c, i) => {
  let img = ''
  if (c.name === 'Xu Nguyễn') img = 'https://i.pravatar.cc/150?u=1'
  if (i === 1) img = 'https://i.pravatar.cc/150?u=2'
  if (i === 2) img = 'https://i.pravatar.cc/150?u=3'
  if (i === 4) img = 'https://i.pravatar.cc/150?u=4'
  if (i === 5) img = 'https://i.pravatar.cc/150?u=5'
  return { ...c, avatarUrl: img, status: c.online ? 'Đang online' : 'Hôm nay không hoạt động' }
}))

const palette = ['#0000ff', '#2525e0', '#3d3dcc', '#5555bb', '#1a1aff', '#0000cc', '#4444dd', '#0000aa', '#3333ee', '#6666ff', '#2222dd', '#1111cc']
function avatarColor(id: number) { return palette[(id - 1) % palette.length] }

const miniChat = reactive({ open: false, title: '', sample: 'Chào bạn, mình nhắn nhanh từ chat widget.', reply: 'Ok, mình phản hồi ngay đây.', message: '' })
const openMiniChat = (contact: any) => {
  miniChat.title = contact.name
  miniChat.open = true
}
const openMiniGroup = (group: any) => {
  miniChat.title = group.name
  miniChat.open = true
  miniChat.sample = 'Đây là mẫu hội thoại nhóm.'
  miniChat.reply = 'Đã thêm vào nhóm.'
}

const onFile = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) attachFile.value = f
}
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: thin; }
.scrollbar-hide::-webkit-scrollbar { width: 6px; }
.scrollbar-hide::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 9999px; }
</style>
