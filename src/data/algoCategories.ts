export interface AlgoItem {
  id: string
  name: string
  description: string
  icon: string
}

export interface AlgoCategory {
  name: string
  description: string
  algorithms: AlgoItem[]
  icon: string
}

export const algoCategories: AlgoCategory[] = [
  {
    name: '格密码',
    description: '基于格理论的后量子密码算法，具有良好的安全性和效率',
    icon: 'fa-cube',
    algorithms: [
      {
        id: 'kyber',
        name: 'Kyber (ML-KEM)',
        description: '基于模块格的密钥封装机制，NIST标准算法',
        icon: 'fa-key',
      },
      {
        id: 'dilithium',
        name: 'Dilithium (ML-DSA)',
        description: '基于格的数字签名方案，NIST标准算法',
        icon: 'fa-pen-to-square',
      },
      {
        id: 'falcon',
        name: 'Falcon (FALCON)',
        description: '基于格的密钥封装机制(KEM)，NIST标准算法',
        icon: 'fa-feather',
      },
      {
        id: 'ntru',
        name: 'NTRU (NTRU-HPS)',
        description: '基于格的密钥封装机制(KEM)，NIST标准算法',
        icon: 'fa-circle-nodes',
      },
    ],
  },
  {
    name: '多变量密码',
    description: '基于多变量多项式方程组的后量子密码算法，适合签名场景',
    icon: 'fa-project-diagram',
    algorithms: [
      {
        id: 'uov',
        name: 'UOV (Multivariate)',
        description: '基于单变量输出的多变量密码方案',
        icon: 'fa-square-root-variable',
      },
      {
        id: 'mayo',
        name: 'Mayo (Multivariate)',
        description: '基于多变量二次多项式的签名方案',
        icon: 'fa-calculator',
      },
    ],
  },
  {
    name: '编码密码',
    description: '基于纠错码理论的后量子密码算法，具有良好的理论基础',
    icon: 'fa-wave-square',
    algorithms: [
      {
        id: 'hqc',
        name: 'HQC (Code-based)',
        description: '基于准循环低密度奇偶校验码的密钥封装机制',
        icon: 'fa-code',
      },
    ],
  },
  {
    name: '安全哈希',
    description: '基于密码学哈希函数的后量子密码算法，适合签名场景',
    icon: 'fa-sitemap',
    algorithms: [
      {
        id: 'xmss',
        name: 'XMSS (Stateful)',
        description: '基于哈希函数的有状态签名方案',
        icon: 'fa-tree',
      },
      {
        id: 'sphincs',
        name: 'SPHINCS+ (Hash)',
        description: '基于哈希函数的无状态签名方案，NIST标准算法',
        icon: 'fa-hashtag',
      },
    ],
  },
]

export const allAlgorithms = algoCategories.flatMap((category) => category.algorithms)

export function getAlgorithmById(id: string): AlgoItem | undefined {
  return allAlgorithms.find((algo) => algo.id === id)
}

export function getCategoryByAlgorithmId(id: string): AlgoCategory | undefined {
  return algoCategories.find((category) => category.algorithms.some((algo) => algo.id === id))
}
