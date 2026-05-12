import type { AlgorithmModule, AlgoStep, Actor } from '../types'
import { generateData } from '../utils'
import HQCMatrix from './HQCMatrix.vue'
import HQCFormula from '../../components/Formula.vue'
import hqcData from './data.json'
const normalizeSteps = (steps: any[]): AlgoStep[] => {
  return steps.map((step) => ({
    ...step,

    algorithm_detail: step.algorithm_detail || undefined,
    security_note: step.security_note || undefined,
  }))
}

const conceptsArray = Object.values(hqcData.concepts).map((concept: any) => ({
  name: concept.name,
  description: concept.explanation,
}))

const extractData = (source: any, prefix: string, rows: number, cols?: number) => {
  const res: number[] = []
  if (cols !== undefined) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${prefix}[${r}][${c}]`
        if (source[key]) res.push(...source[key])
      }
    }
  } else {
    for (let i = 0; i < rows; i++) {
      const key = `${prefix}[${i}]`
      if (source[key]) res.push(...source[key])
    }
  }
  return res.length > 0 ? res : null
}

let cachedHqcData: { kp: any; enc: any; dec: any } | null = null

async function getHqcData() {
  if (!cachedHqcData) {
    const url = `${import.meta.env.BASE_URL}data/ui_hqc_output.json`
    const realDump = await fetch(url).then(r => r.json())
    const raw = realDump[0] || { keypair: {}, encapsulation: {}, decapsulation: {} }
    cachedHqcData = { kp: raw.keypair, enc: raw.encapsulation, dec: raw.decapsulation }
  }
  return cachedHqcData
}

const PARAM_N1 = 46
const PARAM_N2 = 384

export const hqcModule: AlgorithmModule = {
  id: 'hqc',
  name: 'HQC',
  description: '基于纠错码的密钥封装机制，抗量子计算攻击。',
  quizFile: 'hqc_test.txt',
  matrixComponent: HQCMatrix,
  formulaComponent: HQCFormula,
  getSteps: () => [
    ...normalizeSteps(hqcData.steps.keygen),
    ...normalizeSteps(hqcData.steps.encaps),
    ...normalizeSteps(hqcData.steps.decaps),
  ],
  getConcepts: () => conceptsArray,
  async initActors(seed: number): Promise<Actor> {
    const { kp } = await getHqcData()
    const aliceData = {
      seed: generateData(1, 1, 'uniform', seed),
      x: generateData(PARAM_N1, 1, 'noise', seed),
      y: generateData(PARAM_N1, 1, 'noise', seed + 1),
      e: generateData(PARAM_N1, 1, 'noise', seed + 2),
      G: generateData(PARAM_N2, PARAM_N1, 'uniform', seed),
      h: extractData(kp, 'public_key', PARAM_N1),
      m_prime: generateData(64, 1, 'msg', seed),
    }

    const bobData = {
      m: generateData(64, 1, 'msg', seed),
      v: generateData(PARAM_N1, 1, 'noise', seed + 3),
      e1: generateData(PARAM_N1, 1, 'noise', seed + 4),
      e2: generateData(PARAM_N1, 1, 'noise', seed + 5),
      u: generateData(PARAM_N2, 1, 'uniform', seed),
    }

    return {
      alice: aliceData,
      bob: bobData,
    }
  },
}
