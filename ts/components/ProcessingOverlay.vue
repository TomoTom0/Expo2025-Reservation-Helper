<template>
  <Teleport to="body">
    <div 
      v-if="overlaysStore.processingOverlayVisible"
      class="ytomo-processing-overlay"
      id="ytomo-processing-overlay"
      @click="handleClick"
    >
      <div class="ytomo-processing-content">
        <div class="ytomo-processing-spinner"></div>
        <div class="ytomo-processing-message">{{ overlaysStore.processingMessage }}</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useOverlaysStore } from '@/stores/overlays'

const overlaysStore = useOverlaysStore()

const handleClick = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
}
</script>

<style scoped lang="scss">
.ytomo-processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  opacity: 0;
  animation: fadeIn 0.2s ease-out forwards;
}

.ytomo-processing-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  min-width: 300px;
  transform: scale(0.9);
  animation: dialogAppear 0.2s ease-out forwards;
}

.ytomo-processing-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2c5aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.ytomo-processing-message {
  margin: 0;
  color: #374151;
  font-size: 16px;
  font-weight: 500;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes dialogAppear {
  to {
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ytomo-processing-overlay,
  .ytomo-processing-content,
  .ytomo-processing-spinner {
    animation: none;
    transition: none;
  }
}
</style>