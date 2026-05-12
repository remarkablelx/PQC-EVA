export interface AlgoVersion {
  version: string

  stats: {
    publicKeySize: number
    secretKeySize: number
    productSize: number
    signEncapSpeed: number
    verifyDecapSpeed: number
    keyGenSpeed: number
  }

  rawData: {
    publicKeySize: number
    secretKeySize: number
    productSize: number
    keyGenTime: number
    signEncapTime: number
    verifyDecapTime: number
  }
}

export interface AlgoStat {
  name: string
  fullName: string
  type: 'encryption' | 'signature'

  versions: AlgoVersion[]

  defaultVersion: string
}

export const algoStats: AlgoStat[] = []

export const radarDimensions = [
  { name: '公钥尺寸效率', max: 1 },
  { name: '私钥尺寸效率', max: 1 },
  { name: '产物尺寸效率', max: 1 },
  { name: '签名/封装速度', max: 1 },
  { name: '验证/解封装速度', max: 1 },
  { name: '密钥生成速度', max: 1 },
]
