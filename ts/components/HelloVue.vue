<template>
  <div class="hello-vue">
    <h2>🎉 Vue.js Integration Test</h2>
    <p>{{ message }}</p>
    <button @click="increment">Count: {{ count }}</button>
    <p><small>{{ timestamp }}</small></p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { loggers } from '@/utils/logger'

const logger = loggers.ui

// Reactive state
const count = ref(0)
const message = ref('Vue.js is working in Chrome Extension!')

// Computed property
const timestamp = computed(() => new Date().toLocaleString('ja-JP'))

// Methods
const increment = () => {
  count.value++
}

// Lifecycle
onMounted(() => {
  logger.info('Vue component mounted successfully')
})
</script>

<style scoped>
.hello-vue {
  padding: 20px;
  border: 2px solid #42b883;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
  max-width: 400px;
  margin: 20px auto;
}

.hello-vue h2 {
  color: #42b883;
  margin-bottom: 10px;
}

.hello-vue button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.hello-vue button:hover {
  background-color: #369870;
}
</style>