<script setup lang="ts">
import { onUpdated, onMounted, nextTick, watch } from 'vue';
import type { AlgoStep } from '../algorithms/types';

const props = defineProps<{
  step: AlgoStep;
}>();

const typesetMath = () => {
  nextTick(() => {
    const windowWithMathJax = window as any;

    const performTypeset = () => {
      if (windowWithMathJax.MathJax) {
        windowWithMathJax.MathJax.typesetPromise();
      }
    };

    if (windowWithMathJax.MathJax) {
      // MathJax已经加载，直接排版
      performTypeset();
    } else {
      // 监听MathJax加载完成事件
      const handleMathJaxReady = () => {
        performTypeset();
      };

      // 监听MathJax的官方加载完成事件
      window.addEventListener('MathJax:Ready', handleMathJaxReady);

      // 同时监听window load事件作为备选方案
      const handleWindowLoad = () => {
        window.removeEventListener('MathJax:Ready', handleMathJaxReady);
        performTypeset();
      };
      window.addEventListener('load', handleWindowLoad);
    }
  });
};

onMounted(typesetMath);
onUpdated(typesetMath);
watch(() => props.step, typesetMath);

const formatExplanation = (text: string) => text || '';
const formatFormula = (formula: string) => formula ? `$$ ${formula} $$` : '';
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    <div
      class="w-full bg-slate-800 rounded-xl border border-slate-700 p-6 relative shadow-lg flex-shrink-0 group hover:border-blue-500/50 transition-colors">
      <div class="absolute top-0 right-0 p-3 opacity-10">
        <i class="fa-solid fa-file-signature text-4xl text-blue-400"></i>
      </div>
      <div class="flex items-center justify-center overflow-x-auto py-6 min-h-[100px]">
        <div class="text-3xl text-blue-100 leading-loose text-center font-serif tracking-wide"
          v-html="formatFormula(step.formula)">
        </div>
      </div>
      <div class="mt-3 flex justify-between items-center border-t border-slate-700/50 pt-3">
        <span class="text-[12px] text-slate-500 font-mono uppercase tracking-wider">Algorithm Step</span>
        <span class="text-[12px] text-blue-400/80 font-mono">{{ step.phase }} Phase</span>
      </div>
    </div>
    <div class="w-full flex-1 bg-slate-800/30 rounded-lg p-1 border border-slate-700/30 flex flex-col overflow-hidden">
      <div class="h-full overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <div class="relative pl-6 border-l-2 border-yellow-500/50">
          <h4 class="text-xl font-bold text-slate-200 mb-4 flex items-center gap-3">
            <i class="fa-solid fa-book-open text-yellow-500 text-lg"></i> 数学原理
          </h4>
          <div class="bg-yellow-900/10 rounded p-4">
            <p class="text-lg text-yellow-100/80 leading-8 text-justify font-light"
              v-html="formatExplanation(step.explanation)">
            </p>
          </div>
        </div>
        <div class="relative pl-6 border-l-2 border-purple-500/50">
          <h4 class="text-xl font-bold text-slate-200 mb-4 flex items-center gap-3">
            <i class="fa-solid fa-comments text-purple-400 text-lg"></i> 通俗理解
          </h4>
          <div class="bg-purple-900/10 rounded p-4">
            <p class="text-lg text-purple-100/80 leading-8 text-justify italic" v-html="formatExplanation(step.common)">
            </p>
          </div>
        </div>
        <div v-if="step.algorithm_detail" class="relative pl-6 border-l-2 border-emerald-500/50">
          <h4 class="text-xl font-bold text-slate-200 mb-4 flex items-center gap-3">
            <i class="fa-solid fa-code text-emerald-400 text-lg"></i> 算法细节
          </h4>
          <div class="bg-emerald-900/10 rounded p-4">
            <p class="text-lg text-emerald-100/80 leading-8 text-justify"
              v-html="formatExplanation(step.algorithm_detail)">
            </p>
          </div>
        </div>
        <div v-if="step.security_note" class="relative pl-6 border-l-2 border-red-500/50">
          <h4 class="text-xl font-bold text-slate-200 mb-4 flex items-center gap-3">
            <i class="fa-solid fa-shield-halved text-red-400 text-lg"></i> 安全要点
          </h4>
          <div class="bg-red-900/10 rounded p-4">
            <p class="text-lg text-red-100/80 leading-8 text-justify" v-html="formatExplanation(step.security_note)">
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
