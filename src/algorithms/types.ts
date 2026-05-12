import type { Component } from 'vue'

export interface AlgoStep {
  id: string
  name: string
  desc: string
  formula: string
  explanation: string
  common: string
  algorithm_detail?: string
  security_note?: string
  owner: 'Alice' | 'Bob'
  phase: 'KeyGen' | 'Encaps' | 'Decaps' | 'Sign' | 'Verify'
  dataType:
    | 'uniform'
    | 'noise'
    | 'msg'
    | 'ntt'
    | 'secret'
    | 'cipher'
    | 'hash'
    | 'random'
    | 'hint'
    | 'check'
}

export interface QuizData {
  question: string
  options: string[]
  correctIdx: number
  explanation: string
}

export interface Actor {
  alice: any
  bob: any
}

export interface KyberActor {
  alice: {
    A: number[]
    s: number[]
    e: number[]
    t: number[]
    mn: number[]
    m_final: number[]
  }
  bob: {
    m: number[]
    r: number[]
    e1: number[]
    e2: number[]
    u: number[]
    v: number[]
    K: number[]
  }
}

export interface DilithiumActor {
  alice: {
    rho: number[]
    A: number[]
    s1: number[]
    s2: number[]
    t: number[]
    t1: number[]
    t0: number[]
    y: number[]
    w: number[]
    w1: number[]
    w0: number[]
    c: number[]
    z: number[]
    h: number[]
    m: number[]
    e: number[]
    cs1: number[]
    z_diff: number[]
  }
  bob: {
    A: number[]
    t: number[]
    t1: number[]
    z: number[]
    c: number[]
    c_prime: number[]
    w1_prime: number[]
    m: number[]
    h: number[]
  }
}

export interface XmssActor {
  alice: {
    pk_size: number
    sk_size: number
    keygen_time_sec: number
    public_key: string
    secret_key: string
    sig_size: number
    sign_time_sec: number
    message: string
    mlen: number
    sign_smlen: number
    signed_message: string
    sign_secret_key: string
  }
  bob: {
    open_time_sec: number
    message_out: string
    mlen_out: number
    open_smlen: number
    open_signed_message: string
    open_public_key: string
    result: string
  }
}

export interface SphincsActor {
  alice: {
    n: number
    h: number
    d: number
    fors_height: number
    fors_trees: number
    w: number
    keypair_cycles: number
    sig_size: number
    pk_size: number
    sk_size: number
    public_key: string
    secret_key: string
    wots_pk: string
    wots_pk_size: number
    sign_cycles: number
    message: string
    mlen: number
    signed_message: string
    sign_smlen: number
    sign_secret_key: string
  }
  bob: {
    verify_cycles: number
    message_out: string
    mlen_out: number
    open_signed_message: string
    open_smlen: number
    open_public_key: string
    result: string
  }
}

export interface MayoActor {
  alice: {
    O: number[]
    P1: string
    P2: string
    P3: string
    publicKey: string
    secretKey: string
    message: string
    sign_t: number[]
    s: number[]
    sign_sig: string
    sign_salt: string
  }
  bob: {
    O: number[]
    message_out: string
    open_signed_message: string
    open_public_key: string
    open_t: number[]
    open_y: number[]
    s: number[]
  }
}

export interface UovActor {
  alice: {
    pk_size: number
    sk_size: number
    sig_size: number
    keypair_time_us: number
    public_key: string
    secret_key: string
    sign_time_us: number
    message: string
    mlen: number
    sign_smlen: number
    signed_message: string
    sign_secret_key: string
  }
  bob: {
    open_time_us: number
    message_out: string
    mlen_out: number
    open_smlen: number
    open_signed_message: string
    open_public_key: string
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

export interface AlgorithmModule {
  id: string
  name: string
  description: string
  quizFile: string
  getSteps(): AlgoStep[]
  getConcepts?(): { name: string; description: string }[]
  initActors(seed: number): Actor
  matrixComponent: Component
  formulaComponent: Component
  treeComponent?: Component
}
