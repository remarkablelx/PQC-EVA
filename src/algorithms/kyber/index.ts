import type { AlgorithmModule, AlgoStep, Actor } from '../types'
import { generateData } from '../utils'
import KyberMatrix from './KyberMatrix.vue'
import KyberFormula from '../../components/Formula.vue'
import kyberData from './data.json'
const normalizeSteps = (steps: any[]): AlgoStep[] => {
  return steps.map((step) => ({
    ...step,
    algorithm_detail: step.algorithm_detail || undefined,
    security_note: step.security_note || undefined
  }))
}

const norm = (arr: number[]) => arr.map((x) => Math.abs(x) / 3329)

const conceptsArray = Object.values(kyberData.concepts).map((concept: any) => ({
  name: concept.name,
  description: concept.explanation
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

let cachedKyberData: { kp: any; encaps: any } | null = null

async function getKyberData() {
  if (!cachedKyberData) {
    const url = `${import.meta.env.BASE_URL}data/ui_kyber_output.json`
    const realDump = await fetch(url).then(r => r.json())
    const raw = realDump[0] || { keypair: {}, encapsulation: {}, decapsulation: {} }
    cachedKyberData = { kp: raw.keypair, encaps: raw.encapsulation }
  }
  return cachedKyberData
}

export const kyberModule: AlgorithmModule = {
  id: 'kyber',
  name: 'Kyber (ML-KEM)',
  description: 'NIST 标准化后量子密钥封装机制，基于 Module-LWE 困难问题',
  quizFile: 'kyber_test.txt',
  matrixComponent: KyberMatrix,
  formulaComponent: KyberFormula,
  getSteps: () => [
    ...normalizeSteps(kyberData.steps.keygen),
    ...normalizeSteps(kyberData.steps.encaps),
    ...normalizeSteps(kyberData.steps.decaps)
  ],
  getConcepts: () => conceptsArray,
  async initActors(seed: number): Promise<Actor> {
    const { kp, encaps } = await getKyberData()
    const aliceData = {
      A: norm(extractData(kp, 'A', 2, 2) || [
        1597, 1612, -202, -487, 449, 21, -482, -1455, 1142, 1054, 1011, -1146, -684, 735, 695, 897,
        -1023, 109, 262, 1067, 122, 148, 188, 966, -655, -792, -1543, -1228, -1043, 18, -738, 1144,
        983, 222, -904, -932, 1597, -1329, -210, -1173, 1696, 1057, 483, -357, 1388, 256, 738,
        -1468, -308, -630, 167, 537, 139, -452
      ]),
      s: extractData(kp, 's', 2) || generateData(3, 1, 'noise', seed + 1),
      e: extractData(kp, 'e', 2) || generateData(3, 1, 'noise', seed + 2),
      t: extractData(kp, 't', 2) || generateData(3, 1, 'uniform', seed + 3),
      mn: generateData(1, 1, 'msg', seed + 10),
      m_final: generateData(1, 1, 'msg', seed + 11)
    }

    const bobData = {
      m: generateData(1, 1, 'msg', seed + 4),
      r: extractData(encaps, 'r', 2) || generateData(3, 1, 'noise', seed + 5),
      e1: extractData(encaps, 'e1', 2) || generateData(3, 1, 'noise', seed + 6),
      e2: extractData(encaps, 'e2', 1) || generateData(1, 1, 'noise', seed + 7),
      u: extractData(encaps, 'u', 2) || generateData(3, 1, 'uniform', seed + 8),
      v: extractData(encaps, 'v', 1) || generateData(1, 1, 'uniform', seed + 9),
      K: generateData(1, 1, 'secret', seed + 12)
    }

    return {
      alice: aliceData,
      bob: bobData
    }
  }
}
