<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAlgoStore } from '../stores/algorithmStore';

const store = useAlgoStore();
const containerRef = ref<HTMLElement | null>(null);
const width = ref(800);
const height = ref(400);

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        width.value = entry.contentRect.width;
        height.value = entry.contentRect.height;
      }
    });
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<template>
  <div ref="containerRef" class="w-full h-full bg-slate-950 relative overflow-hidden select-none">
    <component v-if="store.MatrixComponent" :is="store.MatrixComponent" :step="store.currentStep"
      :step-index="store.currentStepIndex" :actors="store.actors" :width="width" :height="height" />
  </div>
</template>
