<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAlgoStore } from '../stores/algorithmStore'
import { useRouter } from 'vue-router'
import RecommendationWizard from './RecommendationWizard.vue'
import { algoCategories } from '../data/algoCategories'

const store = useAlgoStore()
const router = useRouter()
const showWizard = ref(false)

const isLoading = computed(() => store.isLoading)

const loadError = computed(() => store.loadError)

const handleAlgoChange = () => {
  store.reset()
}

const goToComparison = () => {
  router.push('/comparison')
}

const goToRealData = () => {
  router.push('/real-data')
}

const goToLiveDemo = () => {
  router.push('/livedemo')
}

const handleRecommend = (algoName: string) => {
  store.currentAlgo = algoName
  handleAlgoChange()
  router.push('/')
}


</script>

<template>
  <header
    class="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6 shadow-lg z-20 flex-shrink-0">
    <div class="flex items-center gap-4">
      <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
        <i class="fa-solid fa-shield-halved text-white"></i>

      </div>
      <div>
        <h1 class="text-lg font-bold tracking-wide text-white">
          PQC-EVA <span class="text-blue-400 text-sm font-normal">| 交互式后量子计算密码可视分析系统</span>
        </h1>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <!-- 算法选择 -->
      <div class="flex items-center gap-2">
        <span class="text-slate-400 text-sm">算法:</span>
        <div class="relative">
          <select v-model="store.currentAlgo" @change="handleAlgoChange"
            class="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500 text-white font-mono pr-8 appearance-none cursor-pointer"
            :disabled="isLoading">
            <optgroup v-for="(category, idx) in algoCategories" :key="idx" :label="category.name">
              <option v-for="algo in category.algorithms" :key="algo.id" :value="algo.id">
                {{ algo.name }}
              </option>
            </optgroup>
          </select>
          <!-- 加载指示器 -->
          <div v-if="isLoading" class="absolute right-2 top-1/2 transform -translate-y-1/2">
            <i class="fa-solid fa-spinner fa-spin text-blue-400 text-xs"></i>
          </div>
          <!-- 错误指示器 -->
          <div v-else-if="loadError" class="absolute right-2 top-1/2 transform -translate-y-1/2">
            <i class="fa-solid fa-exclamation-circle text-red-400 text-xs"></i>
          </div>
        </div>
      </div>

      <!-- 分步理解按钮 -->
      <button @click="router.push('/main')"
        class="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
        <i class="fa-solid fa-book-open"></i> 分步理解
      </button>

      <!-- Live Demo 按钮 -->
      <button @click="goToLiveDemo"
        class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
        <i class="fa-solid fa-flask"></i> Live Demo
      </button>

      <!-- 算法对比按钮 -->
      <button @click="goToComparison"
        class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
        <i class="fa-solid fa-scale-balanced"></i> 算法对比
      </button>

      <!-- 真实数据流按钮 -->
      <button @click="goToRealData"
        class="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
        <i class="fa-solid fa-stream"></i> 真实数据流
      </button>

      <!-- 推荐向导按钮 -->
      <button @click="showWizard = true"
        class="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
        <i class="fa-solid fa-magic"></i> 推荐向导
      </button>

      <!-- 算法知识小测验 -->
      <button @click="store.showQuizModal = true; store.generateQuiz()"
        class="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
        <i class="fa-solid fa-wand-magic-sparkles"></i> 算法知识小测验
      </button>
    </div>
  </header>

  <!-- 推荐向导模态框 -->
  <RecommendationWizard v-model:show="showWizard" @recommend="handleRecommend" />
</template>
