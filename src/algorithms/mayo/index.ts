import type { AlgorithmModule, AlgoStep, Actor } from '../types'
import { generateData } from '../utils'
import MayoMatrix from './MayoMatrix.vue'
import MayoFormula from '../../components/Formula.vue'
import mayoData from './data.json'
import realDump from '../../../public/data/ui_mayo_output.json'

const normalizeSteps = (steps: any[]): AlgoStep[] => {
  return steps.map((step) => ({
    ...step,
    algorithm_detail: step.algorithm_detail || undefined,
    security_note: step.security_note || undefined,
  }))
}

const conceptsArray = Object.values(mayoData.concepts).map((concept: any) => ({
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

const raw = realDump[0] || { keypair: {}, sign: {}, open: {} }
const kp = raw.keypair
const sg = raw.sign
const op = raw.open

export const mayoModule: AlgorithmModule = {
  id: 'mayo',
  name: 'Mayo',
  description: '基于多变量多项式的后量子数字签名算法',
  quizFile: 'mayo_test.txt',
  matrixComponent: MayoMatrix,
  formulaComponent: MayoFormula,
  getSteps: () => [
    ...normalizeSteps(mayoData.steps.keygen),
    ...normalizeSteps(mayoData.steps.sign),
    ...normalizeSteps(mayoData.steps.verify),
  ],
  getConcepts: () => conceptsArray,
  initActors(seed: number): Actor {
    const aliceData = {
      O: extractData(kp, 'O', 84, 18) || generateData(84, 18, 'uniform', seed),
      P1: (kp as any).keypair_P1 || '',
      P2: (kp as any).keypair_P2 || '',
      P3: (kp as any).keypair_P3 || '',
      publicKey: (kp as any).keypair_public_key || '',
      secretKey: (kp as any).keypair_secret_key || '',
      message: (sg as any).message || 'Hello, world!',
      sign_t: extractData(sg, 'sign_t', 64) || generateData(64, 1, 'uniform', seed + 4),
      s: extractData(sg, 's', 9) || generateData(9, 64, 'uniform', seed + 5),
      sign_sig: (sg as any).sign_sig || '',
      sign_salt: (sg as any).sign_salt || '',
    }

    const bobData = {
      O: extractData(op, 'O', 84, 18) || generateData(84, 18, 'uniform', seed),
      message_out: (op as any).message_out || 'Hello, world!',
      open_signed_message: (op as any).open_signed_message || '',
      open_public_key: (op as any).open_public_key || '',
      open_t: extractData(op, 'open_t', 64) || generateData(64, 1, 'uniform', seed + 4),
      open_y: extractData(op, 'open_y', 64) || generateData(64, 1, 'uniform', seed + 5),
      s: extractData(op, 's', 9) || generateData(9, 64, 'uniform', seed + 6),
    }

    return {
      alice: aliceData,
      bob: bobData,
    }
  },
}
