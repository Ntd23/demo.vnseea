<template>
  <ProfilePresentationHero :user="user" />
</template>

<script setup lang="ts">
import ProfilePresentationHero from "../../../src/profile/presentation/components/ProfileHero.vue"
import { useProfile } from "../../../src/profile/application/composables/use-profile"

const { user } = useProfile()
/**
 * Legacy wrapper for ProfileHero.
 * Design and logic moved to src/profile/presentation/components/ProfileHero.vue
 */
</script>
