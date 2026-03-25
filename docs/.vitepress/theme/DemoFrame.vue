<script setup lang="ts">
import { useData } from 'vitepress'

const { isDark } = useData()
</script>

<template>
  <div class="demo-frame-container">
    <iframe
      :src="`${$frontmatter.demoBase || '/txgraph/demo/'}${isDark ? '' : '?theme=light'}`"
      class="demo-frame"
      allow="clipboard-read; clipboard-write"
    />
  </div>
</template>

<style scoped>
.demo-frame-container {
  width: 100%;
  height: calc(100vh - var(--vp-nav-height) - 1px);
  overflow: hidden;
}

.demo-frame {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
