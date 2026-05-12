import type { AlgorithmModule, AlgoStep, Actor } from '../types'
import { generateData } from '../utils'
import NtruMatrix from './NtruMatrix.vue'
import NtruFormula from '../../components/Formula.vue'
import ntruData from './data.json'

const normalizeSteps = (steps: any[]): AlgoStep[] => {
  return steps.map((step) => ({
    ...step,
    algorithm_detail: step.algorithm_detail || undefined,
    security_note: step.security_note || undefined
  }))
}

const conceptsArray = Object.values(ntruData.concepts).map((concept: any) => ({
  name: concept.name,
  description: concept.explanation
}))

const ntruModule: AlgorithmModule = {
  id: 'ntru',
  name: 'NTRU',
  description: '基于格密码学的后量子加密方案，具有高效的密钥生成和加密解密操作',
  quizFile: 'ntru_test.txt',
  matrixComponent: NtruMatrix,
  formulaComponent: NtruFormula,
  getSteps: () => [
    ...normalizeSteps(ntruData.steps.keygen),
    ...normalizeSteps(ntruData.steps.encaps),
    ...normalizeSteps(ntruData.steps.decaps)
  ],
  getConcepts: () => conceptsArray,
  initActors(seed: number): Actor {
    const aliceData = {
      f: generateData(3, 1, 'noise', seed + 1),
      g: generateData(3, 1, 'noise', seed + 2),
      f_p: generateData(3, 1, 'uniform', seed + 3),
      f_q: generateData(3, 1, 'uniform', seed + 4),
      h: generateData(3, 1, 'uniform', seed + 5),
      a: generateData(3, 1, 'uniform', seed + 6),
      b: generateData(3, 1, 'uniform', seed + 7),
      m_decrypted: generateData(1, 1, 'msg', seed + 8)
    }

    const bobData = {
      r: generateData(3, 1, 'noise', seed + 9),
      m: generateData(1, 1, 'msg', seed + 10),
      c: generateData(3, 1, 'uniform', seed + 11)
    }

    return {
      alice: aliceData,
      bob: bobData
    }
  }
}

export default ntruModule