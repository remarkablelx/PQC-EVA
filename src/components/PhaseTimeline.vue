<script setup lang="ts">
import { useAlgoStore } from '../stores/algorithmStore';

const store = useAlgoStore();

const getPhases = () => {
  const phases = new Map<string, number>();

  store.steps.forEach((step, index) => {
    if (!phases.has(step.phase)) {
      phases.set(step.phase, index);
    }
  });

  return Array.from(phases.entries()).map(([name, index]) => ({
    name,
    startIndex: index
  }));
};

const jumpToPhase = (startIndex: number) => {
  store.currentStepIndex = startIndex;
};

const isActivePhase = (phase: { startIndex: number }) => {
  const nextPhase = getPhases().find(p => p.startIndex > phase.startIndex);
  if (nextPhase) {
    return store.currentStepIndex >= phase.startIndex && store.currentStepIndex < nextPhase.startIndex;
  }
  return store.currentStepIndex >= phase.startIndex;
};
</script>

<template>
  <div class="w-full mb-6">
    <div class="flex items-center justify-between relative">
      <!-- Timeline line -->
      <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 transform -translate-y-1/2 z-0"></div>

      <!-- Phase nodes -->
      <div v-for="(phase, index) in getPhases()" :key="phase.name"
        class="flex flex-col items-center relative z-10 cursor-pointer transition-all"
        @click="jumpToPhase(phase.startIndex)">
        <!-- Phase dot -->
        <div class="w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center" :class="isActivePhase(phase)
          ? 'bg-blue-500 scale-125 ring-2 ring-blue-500/30'
          : 'bg-slate-600 hover:bg-slate-500'">
          <div v-if="isActivePhase(phase)" class="w-2 h-2 rounded-full bg-white"></div>
        </div>

        <!-- Phase label -->
        <div class="mt-2 text-sm font-medium transition-colors"
          :class="isActivePhase(phase) ? 'text-blue-400' : 'text-slate-400 hover:text-slate-300'">
          {{ phase.name }}
        </div>

        <!-- Step count for this phase -->
        <div class="mt-1 text-xs text-slate-500">
          {{
            (() => {
              const nextPhase = getPhases()[index + 1];
              if (nextPhase) {
                return nextPhase.startIndex - phase.startIndex;
              }
              return store.steps.length - phase.startIndex;
            })()
          }} 步
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.phase-node:hover {
  transform: translateY(-2px);
}
</style>
