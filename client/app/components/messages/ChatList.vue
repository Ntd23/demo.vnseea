<template>
  <MessagesPresentationChatList v-bind="$attrs" />
</template>

<script setup lang="ts">
const { t } = useI18n()

defineEmits<{
  'select-user': [user: any]
  'send': []
}>()

const activeTab = ref<'group' | 'user' | 'teams'>('group')

const tabs = computed(() => [
  { id: 'group', label: t('pages.messagesPage.sendMultiple'), icon: 'i-ph-user-list-fill' },
  { id: 'user', label: t('pages.messagesPage.users'), icon: 'i-ph-user-circle-fill' },
  { id: 'teams', label: t('pages.messagesPage.teams'), icon: 'i-ph-users-three-fill' },
] as const)

const users = computed(() => [
  { id: 1, name: 'Ngocktokyo', status: t('pages.messagesPage.activeNow'), isOnline: true, avatarUrl: 'https://i.pravatar.cc/150?u=101' },
  { id: 2, name: 'dung1', status: t('pages.messagesPage.activeOneHourAgo'), isOnline: false, avatarUrl: 'https://i.pravatar.cc/150?u=102' },
  { id: 3, name: 'dung2', status: t('pages.messagesPage.activeNow'), isOnline: true, avatarUrl: 'https://i.pravatar.cc/150?u=103' },
  { id: 4, name: 'tien', status: t('pages.messagesPage.activeYesterday'), isOnline: false, avatarUrl: 'https://i.pravatar.cc/150?u=104' },
])
</script>
