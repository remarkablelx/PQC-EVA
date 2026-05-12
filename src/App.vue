<script setup lang="ts">
import HeaderBar from './components/HeaderBar.vue'
import D3MatrixViz from './components/D3MatrixViz.vue'
import StepController from './components/StepController.vue'
import FormulaPanel from './components/FormulaPanel.vue'
import QuizModal from './components/QuizModal.vue'
import { useAlgoStore } from './stores/algorithmStore'

const store = useAlgoStore()
</script>

<template>
  <router-view />
</template>
