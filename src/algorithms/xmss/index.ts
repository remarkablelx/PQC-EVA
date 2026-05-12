import type { AlgorithmModule, AlgoStep, Actor } from '../types'
import { generateData } from '../utils'
import XmssMatrix from './XmssMatrix.vue'
import XmssFormula from '../../components/Formula.vue'
import xmssData from './data.json'
const normalizeSteps = (steps: any[]): AlgoStep[] => {
  return steps.map((step) => ({
    ...step,
    algorithm_detail: step.algorithm_detail || undefined,
    security_note: step.security_note || undefined,
  }))
}

const conceptsArray = Object.values(xmssData.concepts).map((concept: any) => ({
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

let cachedXmssData: { kp: any; sg: any; op: any } | null = null

async function getXmssData() {
  if (!cachedXmssData) {
    const url = `${import.meta.env.BASE_URL}data/ui_xmss_output.json`
    const realDump = await fetch(url).then(r => r.json())
    const raw = realDump[0] || { keypair: {}, sign: {}, open: {} }
    cachedXmssData = { kp: raw.keypair, sg: raw.sign, op: raw.open }
  }
  return cachedXmssData
}

export const xmssModule: AlgorithmModule = {
  id: 'xmss',
  name: 'XMSS (Stateful)',
  description: '扩展Merkle签名方案 (RFC 8391)',
  quizFile: 'xmss_test.txt',
  matrixComponent: XmssMatrix,
  formulaComponent: XmssFormula,
  getSteps: () => [
    ...normalizeSteps(xmssData.steps.keygen),
    ...normalizeSteps(xmssData.steps.sign),
    ...normalizeSteps(xmssData.steps.verify),
  ],
  getConcepts: () => conceptsArray,
  async initActors(seed: number): Promise<Actor> {
    const { kp, sg, op } = await getXmssData()
    const aliceData = {
      pk_size: (kp as any).pk_size || 0,
      sk_size: (kp as any).sk_size || 0,
      keygen_time_sec: (kp as any).keygen_time_sec || 0,
      public_key: (kp as any).public_key || '',
      secret_key: (kp as any).secret_key || '',
      sig_size: (kp as any).sig_size || 0,
      sign_time_sec: (sg as any).sign_time_sec || 0,
      message: (sg as any).message || 'Hello, world!',
      mlen: (sg as any).mlen || 13,
      sign_smlen: (sg as any).sign_smlen || 0,
      signed_message: (sg as any).signed_message || '',
      sign_secret_key: (sg as any).sign_secret_key || '',
    }

    const bobData = {
      open_time_sec: (op as any).open_time_sec || 0,
      message_out: (op as any).message_out || 'Hello, world!',
      mlen_out: (op as any).mlen_out || 13,
      open_smlen: (op as any).open_smlen || 0,
      open_signed_message: (op as any).open_signed_message || '',
      open_public_key: (op as any).open_public_key || '',
      result: (op as any).result || '验签成功',
    }

    return {
      alice: aliceData,
      bob: bobData,
    }
  },
}
