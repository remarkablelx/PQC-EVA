<script setup lang="ts">
import HeaderBar from '../components/HeaderBar.vue'
import D3MatrixViz from '../components/D3MatrixViz.vue'
import StepController from '../components/StepController.vue'
import FormulaPanel from '../components/FormulaPanel.vue'
import QuizModal from '../components/QuizModal.vue'
import { useAlgoStore } from '../stores/algorithmStore'

const store = useAlgoStore()
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-200 font-sans">
    <QuizModal />

    <HeaderBar />

    <main class="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
      <div class="lg:w-1/2 w-full flex flex-col lg:border-r border-slate-700 bg-slate-900/50 relative">
        <div class="flex-1 overflow-hidden relative">
          <D3MatrixViz />
        </div>

        <div class="h-[420px] flex-shrink-0">
          <StepController />
        </div>
      </div>

      <div class="lg:w-1/2 w-full flex flex-col h-full overflow-hidden bg-slate-900 transition-all duration-300">
        <FormulaPanel />
      </div>
    </main>
  </div>
</template>
