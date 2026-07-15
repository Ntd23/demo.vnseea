<!-- Description: Renders the backend-backed event creation flow with the same field order as the PHP create-event screen. -->
<template>
  <div class="mx-auto max-w-[1120px] pb-10">
    <EventsCreateEventComposer />
  </div>
</template>

<script setup lang="ts">
import EventsCreateEventComposer from "../components/CreateEventComposer.vue"
</script>
