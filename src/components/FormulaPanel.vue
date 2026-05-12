<script setup lang="ts">
import { useAlgoStore } from '../stores/algorithmStore';

const store = useAlgoStore();
</script>

<template>
  <div class="h-full bg-slate-900 flex flex-col relative overflow-hidden">
    <div class="p-6 border-b border-slate-800 bg-slate-900 z-10 flex items-center gap-3 flex-shrink-0">
      <div class="bg-blue-900/30 p-3 rounded text-blue-400">
        <i class="fa-solid fa-square-root-variable text-xl"></i>
      </div>
      <h3 class="text-xl font-bold text-slate-200">当前步骤核心公式 & 原理</h3>
      <span v-if="store.isLoading" class="text-sm text-yellow-500 ml-auto">
        <i class="fa-solid fa-spinner fa-spin mr-2"></i> 加载中...
      </span>
    </div>
    <div class="flex-1 p-8 overflow-y-auto">
      <component v-if="store.FormulaComponent && store.currentStep" :is="store.FormulaComponent"
        :step="store.currentStep" />
      <div v-else-if="!store.isLoading" class="flex flex-col items-center justify-center h-full text-slate-600">
        <i class="fa-solid fa-code-branch text-5xl mb-6 opacity-50"></i>
        <p class="text-lg">暂无步骤数据</p>
      </div>
    </div>
  </div>
</template>
