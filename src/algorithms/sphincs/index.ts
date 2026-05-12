import type { AlgorithmModule, AlgoStep, Actor } from '../types'
import { generateData } from '../utils'
import SphincsMatrix from './SphincsMatrix.vue'
import SphincsFormula from '../../components/Formula.vue'
import sphincsData from './data.json'
const normalizeSteps = (steps: any[]): AlgoStep[] => {
  return steps.map((step) => ({
    ...step,
    algorithm_detail: step.algorithm_detail || undefined,
    security_note: step.security_note || undefined,
  }))
}

const conceptsArray = Object.values(sphincsData.concepts).map((concept: any) => ({
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

let cachedSphincsData: { kp: any; sg: any; op: any } | null = null

async function getSphincsData() {
  if (!cachedSphincsData) {
    const url = `${import.meta.env.BASE_URL}data/ui_sphincs_output.json`
    const realDump = await fetch(url).then(r => r.json())
    const raw = realDump[0] || { keypair: {}, sign: {}, open: {} }
    cachedSphincsData = { kp: raw.keypair, sg: raw.sign, op: raw.open }
  }
  return cachedSphincsData
}

export const sphincsModule: AlgorithmModule = {
  id: 'sphincs',
  name: 'SPHINCS+',
  description: '无状态哈希签名方案',
  quizFile: 'sphincs_test.txt',
  matrixComponent: SphincsMatrix,
  formulaComponent: SphincsFormula,
  getSteps: () => [
    ...normalizeSteps(sphincsData.steps.keygen),
    ...normalizeSteps(sphincsData.steps.sign),
    ...normalizeSteps(sphincsData.steps.verify),
  ],
  getConcepts: () => conceptsArray,
  async initActors(seed: number): Promise<Actor> {
    const { kp, sg, op } = await getSphincsData()
    const aliceData = {
      n: (kp as any).n || 16,
      h: (kp as any).h || 66,
      d: (kp as any).d || 22,
      fors_height: (kp as any).fors_height || 6,
      fors_trees: (kp as any).fors_trees || 33,
      w: (kp as any).w || 16,
      keypair_cycles: (kp as any).keypair_cycles || 0,
      sig_size: (kp as any).sig_size || 0,
      pk_size: (kp as any).pk_size || 0,
      sk_size: (kp as any).sk_size || 0,
      public_key: (kp as any).public_key || '',
      secret_key: (kp as any).secret_key || '',
      wots_pk: (kp as any).wots_pk || '',
      wots_pk_size: (kp as any).wots_pk_size || 0,
      sign_cycles: (sg as any).sign_cycles || 0,
      message: (sg as any).message || 'Hello, world!',
      mlen: (sg as any).mlen || 13,
      signed_message: (sg as any).signed_message || '',
      sign_smlen: (sg as any).sign_smlen || 0,
      sign_secret_key: (sg as any).sign_secret_key || '',
    }

    const bobData = {
      verify_cycles: (op as any).verify_cycles || 0,
      message_out: (op as any).message_out || 'Hello, world!',
      mlen_out: (op as any).mlen_out || 13,
      open_signed_message: (op as any).open_signed_message || '',
      open_smlen: (op as any).open_smlen || 0,
      open_public_key: (op as any).open_public_key || '',
      result: (op as any).result || 'success',
    }

    return {
      alice: aliceData,
      bob: bobData,
    }
  },
}
