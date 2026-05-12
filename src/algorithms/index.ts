export const AlgorithmRegistry: Record<string, () => Promise<any>> = {
  kyber: () => import('./kyber').then(m => m.kyberModule),
  dilithium: () => import('./dilithium').then(m => m.dilithiumModule),
  hqc: () => import('./hqc').then(m => m.hqcModule),
  mayo: () => import('./mayo').then(m => m.mayoModule),
  sphincs: () => import('./sphincs').then(m => m.sphincsModule),
  uov: () => import('./uov').then(m => m.uovModule),
  xmss: () => import('./xmss').then(m => m.xmssModule),
  falcon: () => import('./falcon').then(m => m.default),
  ntru: () => import('./ntru').then(m => m.default)
}

export type AlgoId = keyof typeof AlgorithmRegistry
