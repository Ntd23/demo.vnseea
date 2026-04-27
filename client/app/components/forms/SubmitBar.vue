<template>
  <SharedKernelSubmitBar v-bind="$attrs" />
</template>

<script setup lang="ts">
import SharedKernelSubmitBar from "../../../src/shared-kernel/presentation/components/forms/SubmitBar.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
