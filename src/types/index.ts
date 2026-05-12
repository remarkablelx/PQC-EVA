export interface AlgoStep {
  id: string
  name: string
  owner: 'Alice' | 'Bob'
  phase: 'KeyGen' | 'Encaps' | 'Decaps' | 'Sign' | 'Verify'
  subPhase?: 'IND-CPA' | 'IND-CCA'
  previewType?: 'matrix' | 'poly' | 'tree'
  desc: string
  formula: string
  explanation: string
  common: string
  techDetail?: string
  transmission?: string
  dataType: 'uniform' | 'noise' | 'msg' | 'ntt' | 'hash'
}

export interface QuizData {
  question: string
  options: string[]
  correctIdx: number
  explanation: string
}

export type AlgorithmType = 'kyber' | 'hqc' | 'dilithium' | 'uov' | 'mayo' | 'xmss' | 'sphincs'

export type AlgoId = AlgorithmType

export interface KyberActor {
  alice: {
    A: number[]
    s: number[]
    e: number[]
    t: number[]
  }
  bob: {
    m: number[]
    r: number[]
    e1: number[]
    e2: number[]
    u: number[]
    v: number[]
  }
}

export interface DilithiumActor {
  alice: {
    A: number[][]
    s1: number[]
    s2: number[]
    t1: number[]
    t2: number[]
  }
  bob: {
    m: number[]
    r: number[]
    c: number[]
    z1: number[]
    z2: number[]
  }
}

export interface UovActor {
  alice: {
    A: number[][]
    S: number[][]
    T: number[][]
    privateKey: number[]
    publicKey: number[]
  }
  bob: {
    m: number[]
    signature: number[]
  }
}

export interface MayoActor {
  alice: {
    A: number[][]
    b: number[]
    s: number[]
    t: number[]
  }
  bob: {
    m: number[]
    r: number[]
    c: number[]
  }
}

export interface XmssActor {
  alice: {
    sk: number[]
    pk: number[]
    auth: number[][]
  }
  bob: {
    m: number[]
    signature: number[]
    root: number[]
  }
}

export interface SphincsActor {
  alice: {
    sk: number[]
    pk: number[]
    wots: number[][]
  }
  bob: {
    m: number[]
    signature: number[]
    fors: number[][]
  }
}

export interface HQCActor {
  alice: {
    seed: number[]
    x: number[]
    y: number[]
    e: number[]
    G: number[]
    h: number[]
    m_prime: number[]
  }
  bob: {
    m: number[]
    v: number[]
    e1: number[]
    e2: number[]
    u: number[]
  }
}

export type Actor =
  | KyberActor
  | DilithiumActor
  | UovActor
  | MayoActor
  | XmssActor
  | SphincsActor
  | HQCActor
