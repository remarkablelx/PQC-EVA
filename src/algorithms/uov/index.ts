import type { AlgorithmModule, AlgoStep, Actor } from '../types'
import { generateData } from '../utils'
import UovMatrix from './UovMatrix.vue'
import UovFormula from '../../components/Formula.vue'
import uovData from './data.json'
import realDump from '../../../public/data/ui_uov_output.json'

const normalizeSteps = (steps: any[]): AlgoStep[] => {
  return steps.map((step) => ({
    ...step,
    algorithm_detail: step.algorithm_detail || undefined,
    security_note: step.security_note || undefined,
  }))
}

const conceptsArray = Object.values(uovData.concepts).map((concept: any) => ({
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

export const uovModule: AlgorithmModule = {
  id: 'uov',
  name: 'UOV',
  description: 'Unbalanced Oil and Vinegar 多变量签名',
  quizFile: 'uov_test.txt',
  matrixComponent: UovMatrix,
  formulaComponent: UovFormula,
  getSteps: () => [
    ...normalizeSteps(uovData.steps.keygen),
    ...normalizeSteps(uovData.steps.sign),
    ...normalizeSteps(uovData.steps.verify),
  ],
  getConcepts: () => conceptsArray,
  initActors(seed: number): Actor {
    const aliceData = {
      pk_size: (kp as any).pk_size || 0,
      sk_size: (kp as any).sk_size || 0,
      sig_size: (kp as any).sig_size || 0,
      keypair_time_us: (kp as any).keypair_time_us || 0,
      public_key: (kp as any).public_key || '',
      secret_key: (kp as any).secret_key || '',
      sign_time_us: (sg as any).sign_time_us || 0,
      message: (sg as any).message || 'Hello, world!',
      mlen: (sg as any).mlen || 14,
      sign_smlen: (sg as any).sign_smlen || 0,
      signed_message: (sg as any).signed_message || '',
      sign_secret_key: (sg as any).sign_secret_key || '',
    }

    const bobData = {
      open_time_us: (op as any).open_time_us || 0,
      message_out: (op as any).message_out || 'Hello, world!',
      mlen_out: (op as any).mlen_out || 14,
      open_smlen: (op as any).open_smlen || 0,
      open_signed_message: (op as any).open_signed_message || '',
      open_public_key: (op as any).open_public_key || '',
    }

    return {
      alice: aliceData,
      bob: bobData,
    }
  },
}
