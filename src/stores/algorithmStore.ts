import { defineStore } from 'pinia'
import { ref, computed, watch, shallowRef } from 'vue'
import { AlgorithmRegistry, type AlgoId } from '../algorithms'
import type { QuizData, Actor } from '../algorithms/types'
import GenericFormula from '../components/Formula.vue'

export const useAlgoStore = defineStore('algo', () => {
  const currentAlgoId = ref<AlgoId>('kyber')
  const level = ref<number>(512)
  const showIntro = ref(false)
  const currentStepIndex = ref(0)
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)
  const animationSpeed = ref<'slow' | 'normal' | 'fast'>('normal')
  const enableAnimation = ref(true)
  const isAutoPlaying = ref(false)
  const autoPlayInterval = ref<number | null>(null)
  const autoPlaySpeed = ref<'slow' | 'normal' | 'fast'>('normal')

  const animationDuration = computed(() => {
    switch (animationSpeed.value) {
      case 'slow':
        return 1200
      case 'fast':
        return 400
      default:
        return 800
    }
  })

  const getAutoPlayInterval = computed(() => {
    switch (autoPlaySpeed.value) {
      case 'slow':
        return 3000
      case 'fast':
        return 1000
      default:
        return 2000
    }
  })

  const actors = ref<Actor>({} as Actor)
  const steps = ref<any[]>([])
  const MatrixComponent = shallowRef<any>(null)
  const FormulaComponent = shallowRef<any>(GenericFormula)

  const loadAlgorithm = async () => {
    isLoading.value = true
    loadError.value = null
    try {
      const loader = AlgorithmRegistry[currentAlgoId.value]
      if (!loader) throw new Error(`Algorithm ${currentAlgoId.value} not found`)
      const module = await loader()
      MatrixComponent.value = module.matrixComponent
      FormulaComponent.value = module.formulaComponent || GenericFormula
      steps.value = module.getSteps()
      actors.value = module.initActors(Date.now())
      currentStepIndex.value = 0
    } catch (e: any) {
      console.error('Failed to load algorithm:', e)
      loadError.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  watch(currentAlgoId, loadAlgorithm, { immediate: true })
  const currentStep = computed(() => steps.value[currentStepIndex.value])
  const nextStep = () => {
    if (currentStepIndex.value < steps.value.length - 1) currentStepIndex.value++
  }
  const prevStep = () => {
    if (currentStepIndex.value > 0) currentStepIndex.value--
  }
  const reset = () => loadAlgorithm()

  const getPhases = () => {
    const phases = new Map<string, number>()
    steps.value.forEach((step, index) => {
      if (!phases.has(step.phase)) phases.set(step.phase, index)
    })
    return Array.from(phases.entries()).map(([name, index]) => ({ name, startIndex: index }))
  }

  const jumpToPhase = (startIndex: number) => {
    currentStepIndex.value = startIndex
  }

  const startAutoPlay = () => {
    if (isAutoPlaying.value) return
    isAutoPlaying.value = true
    const intervalId = window.setInterval(() => {
      if (currentStepIndex.value < steps.value.length - 1) {
        currentStepIndex.value++
      } else {
        stopAutoPlay()
      }
    }, getAutoPlayInterval.value)
    autoPlayInterval.value = intervalId
  }

  const stopAutoPlay = () => {
    if (autoPlayInterval.value) {
      clearInterval(autoPlayInterval.value)
      autoPlayInterval.value = null
    }
    isAutoPlaying.value = false
  }

  watch(currentAlgoId, stopAutoPlay)
  const cleanup = () => {
    stopAutoPlay()
  }

  const showQuizModal = ref(false)
  const quizLoading = ref(false)
  const quizQuestions = ref<QuizData[]>([])
  const currentQuizIndex = ref(0)
  const quizData = computed(() => quizQuestions.value[currentQuizIndex.value])

  function parseQuizText(text: string): QuizData[] {
    const questions: QuizData[] = []
    const lines = text.split('\n')
    let currentQuestion: QuizData | null = null
    let currentOptions: string[] = []

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('题目 ')) {
        if (currentQuestion) {
          currentQuestion.options = currentOptions
          questions.push(currentQuestion)
        }
        currentQuestion = { question: '', options: [], correctIdx: 0, explanation: '' }
        currentOptions = []
      } else if (currentQuestion) {
        if (
          currentOptions.length < 4 &&
          (trimmedLine.startsWith('A.') ||
            trimmedLine.startsWith('B.') ||
            trimmedLine.startsWith('C.') ||
            trimmedLine.startsWith('D.'))
        ) {
          currentOptions.push(trimmedLine.substring(2).trim())
        } else if (trimmedLine.startsWith('答案：')) {
          const answer = trimmedLine.substring(3).trim()
          currentQuestion.correctIdx = answer.charCodeAt(0) - 'A'.charCodeAt(0)
        } else if (trimmedLine.startsWith('提示：')) {
          currentQuestion.explanation = trimmedLine.substring(3).trim()
        } else if (
          trimmedLine &&
          !trimmedLine.startsWith('答案：') &&
          !trimmedLine.startsWith('提示：')
        ) {
          currentQuestion.question += trimmedLine + ' '
        }
      }
    }

    if (currentQuestion) {
      currentQuestion.options = currentOptions
      questions.push(currentQuestion)
    }

    return questions
  }

  async function generateQuiz() {
    if (
      quizQuestions.value.length > 0 &&
      quizQuestions.value[0]?.question?.includes(currentAlgoId.value.toUpperCase())
    ) {
      return
    }
    quizLoading.value = true
    quizQuestions.value = []
    currentQuizIndex.value = 0

    try {
      const loader = AlgorithmRegistry[currentAlgoId.value]
      if (!loader) throw new Error(`Algorithm ${currentAlgoId.value} not found`)
      const module = await loader()
      const response = await fetch(`/data/${module.quizFile}`)
      if (!response.ok) throw new Error(`Failed to load quiz file: ${module.quizFile}`)
      const text = await response.text()
      quizQuestions.value = parseQuizText(text)
      if (quizQuestions.value.length === 0) {
        throw new Error('No questions parsed from quiz file')
      }
    } catch (e) {
      console.error('Quiz load error:', e)
      quizQuestions.value = [
        {
          question: '题目加载失败',
          options: ['重试'],
          correctIdx: 0,
          explanation: `错误: ${e}`,
        },
      ]
    } finally {
      quizLoading.value = false
    }
  }

  const nextQuestion = () => {
    if (currentQuizIndex.value < quizQuestions.value.length - 1) currentQuizIndex.value++
  }
  const prevQuestion = () => {
    if (currentQuizIndex.value > 0) currentQuizIndex.value--
  }

  return {
    currentAlgo: currentAlgoId,
    level,
    showIntro,
    steps,
    currentStep,
    currentStepIndex,
    actors,
    MatrixComponent,
    FormulaComponent,
    isLoading,
    loadError,
    nextStep,
    prevStep,
    reset,
    showQuizModal,
    quizLoading,
    quizQuestions,
    currentQuizIndex,
    quizData,
    generateQuiz,
    nextQuestion,
    prevQuestion,
    animationSpeed,
    enableAnimation,
    animationDuration,
    getPhases,
    jumpToPhase,
    isAutoPlaying,
    autoPlaySpeed,
    startAutoPlay,
    stopAutoPlay,
    cleanup,
  }
})
