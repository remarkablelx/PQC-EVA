import type { AlgorithmModule, AlgoStep, Actor } from '../types'
import { generateData } from '../utils'
import FalconMatrix from './FalconMatrix.vue'
import FalconFormula from '../../components/Formula.vue'
import falconData from './data.json'

const normalizeSteps = (steps: any[]): AlgoStep[] => {
  return steps.map((step) => ({
    ...step,
    algorithm_detail: step.algorithm_detail || undefined,
    security_note: step.security_note || undefined,
  }))
}

const conceptsArray = Object.values(falconData.concepts).map((concept: any) => ({
  name: concept.name,
  description: concept.explanation,
}))

const falconModule: AlgorithmModule = {
  id: 'falcon',
  name: 'Falcon',
  description: 'NIST 标准化后量子签名方案，基于格密码学',
  quizFile: 'falcon_test.txt',
  matrixComponent: FalconMatrix,
  formulaComponent: FalconFormula,
  getSteps: () => [
    ...normalizeSteps(falconData.steps.keygen),
    ...normalizeSteps(falconData.steps.sign),
    ...normalizeSteps(falconData.steps.verify),
  ],
  getConcepts: () => conceptsArray,
  initActors(seed: number): Actor {
    const aliceData = {
      f: generateData(3, 1, 'noise', seed + 1),
      g: generateData(3, 1, 'noise', seed + 2),
      F: generateData(3, 1, 'uniform', seed + 3),
      G: generateData(3, 1, 'uniform', seed + 4),
      h: generateData(3, 1, 'uniform', seed + 5),
      r: generateData(3, 1, 'secret', seed + 6),
      c: generateData(3, 1, 'uniform', seed + 7),
      s1: generateData(3, 1, 'noise', seed + 8),
      s2: generateData(3, 1, 'noise', seed + 9),
      m: generateData(1, 1, 'msg', seed + 10),
    }

    const bobData = {
      h: generateData(3, 1, 'uniform', seed + 5),
      r: generateData(3, 1, 'secret', seed + 6),
      c: generateData(3, 1, 'uniform', seed + 7),
      s1: generateData(3, 1, 'noise', seed + 8),
      s2: generateData(3, 1, 'noise', seed + 9),
      m: generateData(1, 1, 'msg', seed + 10),
    }

    return {
      alice: aliceData,
      bob: bobData,
    }
  },
}

export default falconModule
