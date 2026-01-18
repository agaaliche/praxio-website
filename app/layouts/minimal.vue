<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
// Minimal layout with no navigation, header, or footer
</script>

<style scoped>
/* Remove all padding/margins for iframe embedding */
body {
  margin: 0;
  padding: 0;
}
</style>
