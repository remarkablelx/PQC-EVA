<script setup lang="ts">
import { ref, watch, nextTick, onUpdated } from 'vue';
import { useAlgoStore } from '../stores/algorithmStore';

const store = useAlgoStore();
const selectedOption = ref<number | null>(null);

watch(() => store.currentQuizIndex, async () => {
    selectedOption.value = null;
    await nextTick();
    if ((window as any).MathJax) {
        (window as any).MathJax.typesetPromise();
    }
});

watch(() => store.showQuizModal, async (val) => {
    if (val) {

        selectedOption.value = null;
        await nextTick();
        if ((window as any).MathJax) {
            (window as any).MathJax.typesetPromise();
        }
    }
});

onUpdated(() => {
     if ((window as any).MathJax) {
        (window as any).MathJax.typesetPromise();
    }
});

const checkAnswer = (idx: number) => {
  if (selectedOption.value !== null) return;
  selectedOption.value = idx;
};

const close = () => {
    store.showQuizModal = false;
    selectedOption.value = null;
};

const handleNext = () => {
    store.nextQuestion();
    selectedOption.value = null;
};

const handlePrev = () => {
    store.prevQuestion();
    selectedOption.value = null;
};

const getOptionClass = (idx: number) => {
  if (selectedOption.value === null) return 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200';

  const correct = store.quizData?.correctIdx;
  if (idx === correct) return 'bg-green-900/30 border-green-500 text-green-200';
  if (selectedOption.value === idx && idx !== correct) return 'bg-red-900/30 border-red-500 text-red-200';
  return 'bg-slate-800 border-slate-700 opacity-50 text-slate-400';
};
</script>

<template>
  <div v-if="store.showQuizModal" class="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-pen-to-square text-blue-400"></i>
          算法知识小测验
        </h3>
        <button @click="close" class="text-slate-400 hover:text-white">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="store.quizLoading" class="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
        <i class="fa-solid fa-circle-notch animate-spin text-2xl"></i>
        <span>题目加载中...</span>
      </div>

      <!-- Content -->
      <div v-else-if="store.quizData" class="space-y-4">
        <div class="flex justify-between text-xs text-slate-500 uppercase font-bold mb-2">
            <span>题目 {{ store.currentQuizIndex + 1 }} / {{ store.quizQuestions.length }}</span>
            <span>{{ store.currentAlgo.toUpperCase() }}</span>
        </div>

        <p class="text-lg font-medium text-slate-200 mb-4 leading-relaxed" v-html="store.quizData.question"></p>

        <div class="space-y-2">
          <button v-for="(opt, idx) in store.quizData.options" :key="idx"
                  @click="checkAnswer(idx)"
                  class="w-full text-left p-3 rounded border transition-all duration-200 flex justify-between items-center text-sm"
                  :class="getOptionClass(idx)">
            <span class="flex-1 mr-2 flex items-center">
                <span class="font-bold mr-2">{{ String.fromCharCode(65+idx) }}.</span>
                <span v-html="opt"></span>
            </span>
            <i v-if="selectedOption === idx"
               class="fa-solid"
               :class="idx === store.quizData.correctIdx ? 'fa-check text-green-400' : 'fa-xmark text-red-400'"></i>
          </button>
        </div>

        <div v-if="selectedOption !== null" class="mt-4 p-3 bg-slate-800 rounded border border-slate-700 text-sm">
          <p class="font-bold text-slate-300 mb-1">解析：</p>
          <p class="text-slate-400" v-html="store.quizData.explanation"></p>
        </div>

        <div class="mt-6 flex justify-between items-center pt-4 border-t border-slate-800">
            <button @click="handlePrev"
                    :disabled="store.currentQuizIndex === 0"
                    class="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors flex items-center gap-2">
                <i class="fa-solid fa-chevron-left"></i> 上一个
            </button>

            <button @click="handleNext"
                    :disabled="store.currentQuizIndex === store.quizQuestions.length - 1"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:bg-slate-700">
                下一个 <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-8 text-red-400 flex flex-col items-center gap-2">
        <i class="fa-solid fa-circle-exclamation text-2xl"></i>
        <p>加载题目失败</p>
        <p class="text-xs text-slate-500">请检查 public/data/ 目录下是否存在对应的 _test.txt 文件</p>
      </div>
    </div>
  </div>
</template>
