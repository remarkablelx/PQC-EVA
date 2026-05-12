import type { AlgorithmModule, AlgoStep, Actor } from '../types'
import { generateData } from '../utils'
import DilithiumMatrix from './DilithiumMatrix.vue'
import DilithiumFormula from '../../components/Formula.vue'
import dilithiumData from './data.json'
const normalizeSteps = (steps: any[]): AlgoStep[] => {
  return steps.map((step) => ({
    ...step,
    algorithm_detail: step.algorithm_detail || undefined,
    security_note: step.security_note || undefined,
  }))
}

const conceptsArray = Object.values(dilithiumData.concepts).map((concept: any) => ({
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

let cachedDilithiumData: { kp: any; sg: any; op: any } | null = null

async function getDilithiumData() {
  if (!cachedDilithiumData) {
    const url = `${import.meta.env.BASE_URL}data/ui_dilithium_output.json`
    const realDump = await fetch(url).then(r => r.json())
    const raw = realDump[0] || { keypair: {}, sign: {}, open: {} }
    cachedDilithiumData = { kp: raw.keypair, sg: raw.sign, op: raw.open }
  }
  return cachedDilithiumData
}

const K = 4
const L = 4

export const dilithiumModule: AlgorithmModule = {
  id: 'dilithium',
  name: 'Dilithium',
  description: '基于模块格 (Module-LWE) 的数字签名算法，NIST PQC 标准。',
  quizFile: 'dilithium_test.txt',
  matrixComponent: DilithiumMatrix,
  formulaComponent: DilithiumFormula,
  getSteps: () => [
    ...normalizeSteps(dilithiumData.steps.keygen),
    ...normalizeSteps(dilithiumData.steps.sign),
    ...normalizeSteps(dilithiumData.steps.verify),
  ],
  getConcepts: () => conceptsArray,
  async initActors(seed: number): Promise<Actor> {
    const { kp, sg, op } = await getDilithiumData()
    const aliceData = {
      rho: generateData(1, 1, 'uniform', seed),
      A: extractData(kp, 'A', K, L),
      s1: extractData(kp, 's1', L),
      s2: extractData(kp, 's2', K),
      t: extractData(kp, 't', K),
      t1: extractData(kp, 't1', K),
      t0: extractData(kp, 't0', K),
      y: extractData(sg, 'y', L),
      w: extractData(sg, 'w', K),
      w1: extractData(sg, 'w1', K),
      w0: generateData(4, 1, 'uniform', seed),
      c: (sg as any)['sign_c'] || [],
      z: extractData(sg, 'z', L),
      h: generateData(4, 1, 'uniform', seed),
      m: generateData(8, 1, 'msg', seed),
      e: generateData(4, 1, 'noise', seed),
      cs1: generateData(4, 1, 'noise', seed),
      z_diff: generateData(4, 1, 'uniform', seed),
    }

    const bobData = {
      A: extractData(kp, 'A', K, L),
      t: extractData(kp, 't', K),
      t1: extractData(kp, 't1', K),
      z: extractData(sg, 'z', L),
      c: (sg as any)['sign_c'] || [],
      c_prime: (op as any)['open_c'] || [],
      w1_prime: extractData(op, 'w1', K),
      m: generateData(8, 1, 'msg', seed),
      h: aliceData.h,
    }

    return {
      alice: aliceData,
      bob: bobData,
    }
  },
}
