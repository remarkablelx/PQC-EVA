<script setup lang="ts">
import { useAlgoStore } from '../stores/algorithmStore';

const store = useAlgoStore();
</script>

<template>
  <div class="flex items-center gap-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700/50">
    <div class="flex items-center gap-2">
      <span class="text-sm text-slate-400">动画:</span>
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          v-model="store.enableAnimation"
          class="sr-only peer"
        >
        <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-sm text-slate-400">速度:</span>
      <select
        v-model="store.animationSpeed"
        class="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500 text-white font-mono"
      >
        <option value="slow">慢</option>
        <option value="normal">正常</option>
        <option value="fast">快</option>
      </select>
    </div>
  </div>
</template>
