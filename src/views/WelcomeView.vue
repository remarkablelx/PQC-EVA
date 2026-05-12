<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { algoCategories } from '../data/algoCategories'

const router = useRouter()
const showDetails = ref(false)

const enterSystem = () => {
  router.push('/main')
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center justify-center p-4">
    <!-- 系统标题 -->
    <div class="text-center mb-12 animate-fadeIn">
      <div class="inline-flex items-center justify-center mb-4 p-3 bg-blue-600/20 rounded-full">
        <i class="fa-solid fa-shield-halved text-6xl text-blue-400"></i>
      </div>
      <h1 class="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
        PQC-EVA
      </h1>
      <p class="text-xl text-blue-300 font-light">
        交互式后量子计算密码可视分析系统
      </p>
    </div>

    <!-- 算法分类展示 -->
    <div class="w-full max-w-5xl mb-16 animate-slideUp">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 一级分类卡片 -->
        <div v-for="(category, idx) in algoCategories" :key="idx"
          class="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300">
          <!-- 一级分类标题 -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <i :class="['fa-solid', category.icon, 'text-white']"></i>
            </div>
            <h3 class="text-xl font-bold text-white">{{ category.name }}</h3>
          </div>

          <!-- 一级分类描述 -->
          <p class="text-slate-400 text-sm mb-4">{{ category.description }}</p>

          <!-- 二级分类列表 -->
          <div class="space-y-3">
            <div v-for="(algo, algoIdx) in category.algorithms" :key="algoIdx"
              class="flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg hover:bg-slate-800 transition-colors">
              <div class="w-6 h-6 bg-blue-500/30 rounded flex items-center justify-center mt-1">
                <span class="text-xs font-bold text-blue-300">{{ algoIdx + 1 }}</span>
              </div>
              <div>
                <div class="font-mono text-sm text-white">{{ algo.name }}</div>
                <div class="text-xs text-slate-500">{{ algo.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 进入系统按钮 -->
    <div class="animate-pulse">
      <button @click="enterSystem"
        class="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xl font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3">
        <i class="fa-solid fa-rocket"></i>
        进入系统
      </button>
    </div>

    <!-- 页脚 -->
    <div class="mt-16 text-center text-slate-500 text-sm">
      <p>© 2026 PQC-EVA | 交互式后量子计算密码可视分析系统 | 重庆大学</p>
    </div>
  </div>
</template>

<style scoped>
/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 1s ease-out forwards;
}

.animate-slideUp {
  animation: slideUp 1s ease-out forwards 0.3s;
  opacity: 0;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  h1 {
    font-size: 3rem !important;
  }

  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
