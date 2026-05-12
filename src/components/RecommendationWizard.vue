<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { algoStats } from '../data/algoStats'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'recommend': [algoName: string]
}>()

const currentStep = ref(1)
const answers = ref({
  primaryGoal: 'confidentiality' as 'confidentiality' | 'authentication',
  // 数据保密路径问题
  encryptionSpeed: 'fast' as 'fast' | 'balanced' | 'secure',
  encryptionSize: 'small' as 'small' | 'medium' | 'large',
  // 身份认证路径问题
  hasSecureStorage: 'yes' as 'yes' | 'no',
  signaturePriority: 'small' as 'small' | 'security',
  systemBottleneck: 'bandwidth' as 'bandwidth' | 'compute' | 'security',
  publicKeySizeTolerance: 'small' as 'small' | 'large'
})

const recommendation = ref<string | null>(null)

const recommendationDetails = ref<any>(null)

const calculateRecommendation = () => {
  let recommendedName: string = 'kyber'
  let details: any = {}

  if (answers.value.primaryGoal === 'confidentiality') {
    // 数据保密路径细化
    if (answers.value.encryptionSpeed === 'fast') {
      // 追求快速加密
      if (answers.value.encryptionSize === 'small') {
        // 速度快且尺寸小
        recommendedName = 'kyber'
        details = {
          title: '🏆 冠军算法：Kyber (ML-KEM)',
          category: '高速低尺寸加密方案',
          coreAdvantage: 'NIST标准化KEM，速度快，尺寸紧凑',
          principle: '基于Module-LWE问题，在密钥尺寸和运行速度上达到了极佳平衡。其密文仅需掩盖消息m和随机数r，计算u,v即可，非常高效。',
          data: '根据数据，Kyber的公钥大小约为800字节，加密时间约为104微秒。',
          scenario: '适合需要快速加密传输数据或建立安全通道（如TLS握手）的场景。'
        }
      } else {
        // 速度快但尺寸可接受
        recommendedName = 'falcon'
        details = {
          title: '🏆 冠军算法：Falcon (FALCON)',
          category: '高速高效加密方案',
          coreAdvantage: 'NIST标准化KEM，速度快，基于格的高效实现',
          principle: '基于格的密钥封装机制，采用NTRU-like格结构，结合FFT加速，实现了高效的密钥生成和封装过程。',
          data: '根据数据，Falcon的公钥大小约为897字节，加密时间极快。',
          scenario: '适合需要快速加密且对安全性要求较高的场景。'
        }
      }
    } else if (answers.value.encryptionSpeed === 'balanced') {
      // 平衡型需求
      if (answers.value.encryptionSize === 'small') {
        // 平衡型且尺寸小
        recommendedName = 'ntru'
        details = {
          title: '🏆 冠军算法：NTRU (NTRU-HPS)',
          category: '平衡型格密码加密方案',
          coreAdvantage: 'NIST标准化KEM，基于经典格结构，实现成熟',
          principle: '基于多项式环上的最短向量问题，通过多项式乘法实现高效的密钥交换，具有较长的研究历史和成熟的实现。',
          data: '根据数据，NTRU-HPS的公钥大小约为935字节，加密性能稳定。',
          scenario: '适合大多数需要平衡性能的加密场景，特别是对格密码有成熟实现需求的场景。'
        }
      } else {
        // 平衡型且尺寸可接受
        recommendedName = 'hqc'
        details = {
          title: '🏆 冠军算法：HQC (Hamming Quasi-Cyclic)',
          category: '平衡型纠错码加密方案',
          coreAdvantage: '基于成熟纠错码理论，安全性稳定',
          principle: 'HQC 基于随机线性码的译码问题，这是一个已知的 NP 完全问题。它使用级联码（Reed-Solomon 码和 Reed-Muller 码）进行纠错，通过 Fujisaki-Okamoto 变换实现 IND-CCA2 安全性。',
          data: '根据数据，HQC-128 的公钥大小为 2249 字节，密文大小为 4481 字节。',
          scenario: '适合需要平衡性能且对格密码学持保守态度的场景。'
        }
      }
    } else {
      // 追求最高安全性
      recommendedName = 'hqc'
      details = {
        title: '🏆 冠军算法：HQC (Hamming Quasi-Cyclic)',
        category: '高安全性纠错码加密方案',
        coreAdvantage: '基于成熟的纠错码理论，数学假设最少',
        principle: 'HQC 基于随机线性码的译码问题，这是一个已知的 NP 完全问题。它使用级联码（Reed-Solomon 码和 Reed-Muller 码）进行纠错，通过 Fujisaki-Okamoto 变换实现 IND-CCA2 安全性。',
        data: '根据数据，HQC-128 的公钥大小为 2249 字节，密文大小为 4481 字节，封装时间约为 1.2 毫秒。',
        scenario: '适合对格密码学持怀疑态度、需要数学假设最少的加密场景，或需要极高安全保证的军事/政府应用。'
      }
    }
  } else {
    // 身份认证路径细化
    if (answers.value.hasSecureStorage === 'yes') {
      // 状态受控环境
      if (answers.value.signaturePriority === 'small') {
        // 优先考虑签名尺寸和验证速度
        recommendedName = 'xmss'
        details = {
          title: '🏆 冠军算法：XMSS (eXtended Merkle Signature Scheme)',
          category: '状态受控环境签名方案',
          coreAdvantage: '极小的签名，极快的验证速度',
          principle: '利用Merkle树将一次性签名(WOTS+)组合。它虽然需要维护状态索引idx，但安全性基于哈希函数的抗碰撞性，非常成熟。',
          data: '根据数据，XMSS的签名大小约为2.5KB(2500字节)，验证速度约为3.3ms。相比之下SPHINCS+的签名高达17KB。',
          scenario: '适合固件代码签名或根证书签发等场景，特别是在需要极小签名和快速验证的情况下。'
        }
      } else {
        // 优先考虑安全性
        recommendedName = 'sphincs'
        details = {
          title: '🏆 冠军算法：SPHINCS+ (SLH-DSA)',
          category: '状态受控环境高安全性签名方案',
          coreAdvantage: '数学假设最少，最大安全保障',
          principle: '不依赖格理论或多变量方程求解的困难性，只依赖哈希函数的抗碰撞性。即使Lattice问题被攻破，SPHINCS+依然安全。它使用了FORS（少次签名）和Hypertree（多层Merkle树）结构。',
          data: '根据数据，SPHINCS+的签名大小高达17088字节(约17KB)。',
          scenario: '适合需要长期安全保障的场景，如法律文档、重要证书等，对安全性要求极高。'
        }
      }
    } else {
      // 无状态环境
      if (answers.value.systemBottleneck === 'security') {
        // 优先考虑安全性
        recommendedName = 'sphincs'
        details = {
          title: '🏆 冠军算法：SPHINCS+ (SLH-DSA)',
          category: '极度保守安全签名方案',
          coreAdvantage: '数学假设最少，最大安全保障',
          principle: '不依赖格理论或多变量方程求解的困难性，只依赖哈希函数的抗碰撞性。即使Lattice问题被攻破，SPHINCS+依然安全。它使用了FORS（少次签名）和Hypertree（多层Merkle树）结构。',
          data: '根据数据，SPHINCS+的签名大小高达17088字节(约17KB)。',
          scenario: '适合军事级应用、极度保守安全需求或需要保存50年以上的法律文档。'
        }
      } else if (answers.value.systemBottleneck === 'bandwidth') {
        // 带宽受限
        if (answers.value.publicKeySizeTolerance === 'small') {
          // 带宽受限且公钥尺寸要求小
          recommendedName = 'dilithium'
          details = {
            title: '🏆 冠军算法：Dilithium (ML-DSA)',
            category: '低带宽签名方案',
            coreAdvantage: '签名尺寸适中，验证速度快',
            principle: '基于模格（Module Lattice）。利用Fiat-Shamir变换和拒绝采样(Rejection Sampling)。签名过程z=y+c·s需要反复尝试，直到z不泄露私钥信息。',
            data: 'Dilithium2公钥1312字节，签名2420字节。虽然比ECDSA大，但比SPHINCS+小得多，且验证速度极快（基于NTT变换）。',
            scenario: '适合带宽受限但计算资源充足的场景，如IoT设备和移动应用。'
          }
        } else {
          // 带宽受限但公钥尺寸可接受
          recommendedName = 'mayo'
          details = {
            title: '🏆 冠军算法：Mayo',
            category: '极低带宽签名方案',
            coreAdvantage: '极致的签名尺寸',
            principle: 'Mayo是UOV的改进版。通过"Whipping Map"（将小规模UOV映射扩展到大空间）和"Oil Space"（私钥陷门）的概念，在保持验证极快的同时，压缩了公钥。',
            data: '根据数据，Mayo-1的签名仅为321字节，远小于Dilithium2的2420字节。',
            scenario: '适合IoT设备、LoRaWAN、卫星通信、拥堵的区块链网络等通信带宽极度昂贵的场景。'
          }
        }
      } else {
        // 计算资源受限 (systemBottleneck === 'compute')
        if (answers.value.publicKeySizeTolerance === 'small') {
          // 存不下大公钥，用 Dilithium
          recommendedName = 'dilithium'
          details = {
            title: '🏆 冠军算法：Dilithium (ML-DSA)',
            category: '平衡型低计算签名方案',
            coreAdvantage: '综合性能优秀，验证速度极快，公钥/签名尺寸适中',
            principle: '基于模格（Module Lattice）。利用Fiat-Shamir变换和拒绝采样(Rejection Sampling)。',
            data: 'Dilithium2公钥1312字节，签名2420字节，验证速度极快。',
            scenario: '适合计算资源受限且存储空间有限的场景，如智能卡和通用嵌入式设备。'
          }
        } else {
          // 能存下大公钥，用计算极简的 UOV
          recommendedName = 'uov'
          details = {
            title: '🏆 冠军算法：UOV (Unbalanced Oil and Vinegar)',
            category: '极简计算数字签名方案',
            coreAdvantage: '极快的签名/验证速度，长达20多年的安全性验证',
            principle: '基于多变量二次方程系统求解的困难性（MQ问题）。通过划分油变量和醋变量，巧妙地避开了非线性项，使其在签名时退化为简单的线性方程组求解。',
            data: '签名极小（约96字节），验证只需进行简单的多项式代入，但公钥极大（可能达到数百KB）。',
            scenario: '适合对安全性要求极高、CPU计算能力极弱，但闪存空间充足的设备。'
          }
        }
      }
    }
  }

  recommendation.value = recommendedName
  recommendationDetails.value = details
}

const nextStep = () => {
  if (currentStep.value === 1) {
    // 第一步选择首要目标后，根据目标进入不同路径
    if (answers.value.primaryGoal === 'confidentiality') {
      // 数据保密路径：进入第二步（加密速度）
      currentStep.value = 2
    } else {
      // 身份认证路径：进入第三步（安全存储）
      currentStep.value = 3
    }
  } else if (currentStep.value === 2) {
    // 数据保密路径第二步（加密速度）：进入第三步（加密尺寸）
    currentStep.value = 3
  } else if (currentStep.value === 3) {
    if (answers.value.primaryGoal === 'confidentiality') {
      // 数据保密路径第三步（加密尺寸）：计算推荐
      calculateRecommendation()
      return
    } else {
      // 身份认证路径第三步（安全存储）：进入下一步
      if (answers.value.hasSecureStorage === 'yes') {
        // 有安全存储：进入第四步（签名尺寸）
        currentStep.value = 4
      } else {
        // 无安全存储：进入第五步（系统瓶颈）
        currentStep.value = 5
      }
    }
  } else if (currentStep.value === 4) {
    // 身份认证路径第四步（签名尺寸）：计算推荐
    calculateRecommendation()
    return
  } else if (currentStep.value === 5) {
    // 身份认证路径第五步（系统瓶颈）：进入第六步（公钥尺寸）
    currentStep.value = 6
  } else if (currentStep.value === 6) {
    // 身份认证路径第六步（公钥尺寸）：计算推荐
    calculateRecommendation()
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const close = () => {
  reset()
  emit('update:show', false)
}

const reset = () => {
  currentStep.value = 1
  answers.value = {
    primaryGoal: 'confidentiality',
    encryptionSpeed: 'fast',
    encryptionSize: 'small',
    hasSecureStorage: 'yes',
    signaturePriority: 'small',
    systemBottleneck: 'bandwidth',
    publicKeySizeTolerance: 'small'
  }
  recommendation.value = null
  recommendationDetails.value = null
}

const recommendedAlgo = computed(() => {
  if (!recommendation.value) return null
  return algoStats.find(algo => algo.name === recommendation.value)
})

const selectAlgo = () => {
  if (recommendation.value) {
    emit('recommend', recommendation.value)
    close()
  }
}
</script>

<template>
  <!-- 模态框遮罩 -->
  <div v-if="show" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" @click="close">
    <!-- 模态框内容 -->
    <div class="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
      <!-- 向导标题 -->
      <div class="p-6 border-b border-slate-800">
        <h2 class="text-2xl font-bold text-white">PQC算法推荐向导</h2>
        <p class="text-slate-400 mt-1">回答几个问题，找到最适合您需求的后量子密码算法</p>
      </div>

      <!-- 向导内容 -->
      <div class="p-6">
        <!-- 步骤指示器 -->
        <div class="flex items-center justify-center mb-8">
          <div v-for="i in 6" :key="i" class="flex items-center">
            <!-- 步骤圆圈 -->
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
              i === currentStep
                ? 'bg-blue-600 text-white scale-110'
                : i < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-400'
            ]">
              {{ i }}
            </div>
            <!-- 连接线 -->
            <div v-if="i < 6" :class="[
              'w-12 h-1 transition-all',
              i < currentStep
                ? 'bg-green-600'
                : 'bg-slate-700'
            ]"></div>
          </div>
        </div>

        <!-- Q1：首要安全目标 -->
        <div v-if="currentStep === 1" class="space-y-4">
          <h3 class="text-xl font-semibold text-white mb-4">🔮 PQC 算法推荐向导 - 第一部分：基础意图</h3>
          <h4 class="text-lg font-medium text-white mb-2">1. 您的首要安全目标是什么？</h4>
          <p class="text-slate-400 mb-6">
            选择您最核心的安全需求，这将决定推荐算法的主要方向。
          </p>

          <div class="grid grid-cols-1 gap-4">
            <button @click="answers.primaryGoal = 'confidentiality'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.primaryGoal === 'confidentiality'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">A.</span>
                <h5 class="text-xl font-semibold text-white">数据保密 (Confidentiality)</h5>
              </div>
              <p class="text-slate-300 ml-10">
                我需要加密传输中的数据或建立安全通道（如 TLS 握手）。
              </p>
            </button>

            <button @click="answers.primaryGoal = 'authentication'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.primaryGoal === 'authentication'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">B.</span>
                <h5 class="text-xl font-semibold text-white">身份认证与完整性 (Authentication)</h5>
              </div>
              <p class="text-slate-300 ml-10">
                我需要验证数据的来源，确保固件、文档或交易未被篡改。
              </p>
            </button>
          </div>
        </div>

        <!-- Q2：加密速度（数据保密路径） -->
        <div v-if="currentStep === 2" class="space-y-4">
          <h3 class="text-xl font-semibold text-white mb-4">🔮 PQC 算法推荐向导 - 第二部分：数据保密路径</h3>
          <h4 class="text-lg font-medium text-white mb-2">2. 您对加密速度的要求是什么？</h4>
          <p class="text-slate-400 mb-6">
            不同算法在加密速度上有明显差异，选择适合您系统性能需求的选项。
          </p>

          <div class="grid grid-cols-1 gap-4">
            <button @click="answers.encryptionSpeed = 'fast'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.encryptionSpeed === 'fast'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">A.</span>
                <h5 class="text-xl font-semibold text-white">追求极致速度</h5>
              </div>
              <p class="text-slate-300 ml-10">
                加密速度是首要考虑因素，系统对延迟非常敏感。
              </p>
            </button>

            <button @click="answers.encryptionSpeed = 'balanced'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.encryptionSpeed === 'balanced'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">B.</span>
                <h5 class="text-xl font-semibold text-white">平衡型需求</h5>
              </div>
              <p class="text-slate-300 ml-10">
                希望在速度、安全性和尺寸之间取得平衡。
              </p>
            </button>

            <button @click="answers.encryptionSpeed = 'secure'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.encryptionSpeed === 'secure'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">C.</span>
                <h5 class="text-xl font-semibold text-white">优先考虑安全性</h5>
              </div>
              <p class="text-slate-300 ml-10">
                安全性是第一位的，愿意为更高的安全性牺牲一些速度。
              </p>
            </button>
          </div>
        </div>

        <!-- Q3：加密尺寸（数据保密路径） / 安全存储（身份认证路径） -->
        <div v-if="currentStep === 3" class="space-y-4">
          <template v-if="answers.primaryGoal === 'confidentiality'">
            <h3 class="text-xl font-semibold text-white mb-4">🔮 PQC 算法推荐向导 - 第二部分：数据保密路径</h3>
            <h4 class="text-lg font-medium text-white mb-2">3. 您对加密数据尺寸的接受程度如何？</h4>
            <p class="text-slate-400 mb-6">
              不同算法生成的密文和公钥尺寸差异较大，选择适合您带宽和存储条件的选项。
            </p>

            <div class="grid grid-cols-1 gap-4">
              <button @click="answers.encryptionSize = 'small'" :class="[
                'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
                answers.encryptionSize === 'small'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              ]">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl font-bold text-blue-400">A.</span>
                  <h5 class="text-xl font-semibold text-white">需要极小尺寸</h5>
                </div>
                <p class="text-slate-300 ml-10">
                  带宽或存储资源受限，需要最小的加密数据尺寸。
                </p>
              </button>

              <button @click="answers.encryptionSize = 'medium'" :class="[
                'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
                answers.encryptionSize === 'medium'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              ]">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl font-bold text-blue-400">B.</span>
                  <h5 class="text-xl font-semibold text-white">中等尺寸可接受</h5>
                </div>
                <p class="text-slate-300 ml-10">
                  有一定的带宽和存储资源，可以接受中等大小的加密数据。
                </p>
              </button>

              <button @click="answers.encryptionSize = 'large'" :class="[
                'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
                answers.encryptionSize === 'large'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              ]">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl font-bold text-blue-400">C.</span>
                  <h5 class="text-xl font-semibold text-white">尺寸不是问题</h5>
                </div>
                <p class="text-slate-300 ml-10">
                  带宽和存储资源充足，优先考虑其他性能指标。
                </p>
              </button>
            </div>
          </template>
          <template v-else>
            <h3 class="text-xl font-semibold text-white mb-4">🔮 PQC 算法推荐向导 - 第二部分：签名场景深度评估</h3>
            <h4 class="text-lg font-medium text-white mb-2">3. 您的设备是否具备安全的非易失性存储，且能严格管理"状态"？</h4>
            <p class="text-slate-400 mb-6">
              深度背景：某些算法如 XMSS 依赖于计数器。如果虚拟机回滚或存储故障导致计数器重用，私钥将立即泄露。
            </p>

            <div class="grid grid-cols-1 gap-4">
              <button @click="answers.hasSecureStorage = 'yes'" :class="[
                'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
                answers.hasSecureStorage === 'yes'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              ]">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl font-bold text-blue-400">A.</span>
                  <h5 class="text-xl font-semibold text-white">是的，这是受控环境</h5>
                </div>
                <p class="text-slate-300 ml-10">
                  如硬件安全模块 HSM、智能卡或固件发布服务器，我可以保证签名计数器只增不减。
                </p>
              </button>

              <button @click="answers.hasSecureStorage = 'no'" :class="[
                'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
                answers.hasSecureStorage === 'no'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              ]">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl font-bold text-blue-400">B.</span>
                  <h5 class="text-xl font-semibold text-white">不行，这是通用计算机或分布式系统</h5>
                </div>
                <p class="text-slate-300 ml-10">
                  我不希望承担状态管理的风险，或者系统环境无法保证状态的严格管理。
                </p>
              </button>
            </div>
          </template>
        </div>

        <!-- Q4：签名尺寸敏感度（身份认证路径） -->
        <div v-if="currentStep === 4" class="space-y-4">
          <h3 class="text-xl font-semibold text-white mb-4">🔮 PQC 算法推荐向导 - 第三部分：状态受控环境分支</h3>
          <h4 class="text-lg font-medium text-white mb-2">4. 您对签名尺寸和验证速度的敏感度如何？</h4>
          <p class="text-slate-400 mb-6">
            这将决定在状态受控环境下的最佳签名算法选择。
          </p>

          <div class="grid grid-cols-1 gap-4">
            <button @click="answers.signaturePriority = 'small'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.signaturePriority === 'small'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">A.</span>
                <h5 class="text-xl font-semibold text-white">我需要极小的签名，验证速度快是关键</h5>
              </div>
              <p class="text-slate-300 ml-10">
                主要用于固件代码签名或根证书签发，对签名大小和验证速度有严格要求。
              </p>
            </button>

            <button @click="answers.signaturePriority = 'security'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.signaturePriority === 'security'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">B.</span>
                <h5 class="text-xl font-semibold text-white">我需要最高的安全性，不介意签名尺寸较大</h5>
              </div>
              <p class="text-slate-300 ml-10">
                主要用于需要长期安全保障的场景，如法律文档、重要证书等，对安全性要求极高。
              </p>
            </button>
          </div>
        </div>

        <!-- Q5：系统瓶颈（身份认证路径） -->
        <div v-if="currentStep === 5" class="space-y-4">
          <h3 class="text-xl font-semibold text-white mb-4">🔮 PQC 算法推荐向导 - 第四部分：无状态通用环境分支</h3>
          <h4 class="text-lg font-medium text-white mb-2">5. 您的系统瓶颈主要在哪里？</h4>
          <p class="text-slate-400 mb-6">
            这是最关键的权衡点，将决定推荐算法的核心方向。
          </p>

          <div class="grid grid-cols-1 gap-4">
            <button @click="answers.systemBottleneck = 'bandwidth'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.systemBottleneck === 'bandwidth'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">A.</span>
                <h5 class="text-xl font-semibold text-white">通信带宽极度昂贵</h5>
              </div>
              <p class="text-slate-300 ml-10">
                例如 LoRaWAN、卫星通信、或者拥堵的区块链网络。我不能传输几 KB 的数据。
              </p>
            </button>

            <button @click="answers.systemBottleneck = 'compute'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.systemBottleneck === 'compute'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">B.</span>
                <h5 class="text-xl font-semibold text-white">计算资源受限但带宽尚可</h5>
              </div>
              <p class="text-slate-300 ml-10">
                这是一个嵌入式设备，CPU 较弱，但我可以通过 WiFi/4G 传输数据。
              </p>
            </button>

            <button @click="answers.systemBottleneck = 'security'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.systemBottleneck === 'security'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">C.</span>
                <h5 class="text-xl font-semibold text-white">我对"格密码学"持怀疑态度</h5>
              </div>
              <p class="text-slate-300 ml-10">
                我不相信较新的数学假设（如 LWE/SIS），我只相信哈希函数。
              </p>
            </button>
          </div>
        </div>

        <!-- Q6：公钥尺寸接受度（身份认证路径） -->
        <div v-if="currentStep === 6" class="space-y-4">
          <h4 class="text-lg font-medium text-white mb-2">6. 您能接受多大的公钥尺寸？</h4>
          <p class="text-slate-400 mb-6">
            深度背景：某些算法如 UOV/Mayo 类算法通过增大公钥来换取极小的签名。
          </p>

          <div class="grid grid-cols-1 gap-4">
            <button @click="answers.publicKeySizeTolerance = 'small'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.publicKeySizeTolerance === 'small'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">A.</span>
                <h5 class="text-xl font-semibold text-white">我的设备存储空间很小</h5>
              </div>
              <p class="text-slate-300 ml-10">
                存不下几十 KB 的公钥，需要紧凑的公钥设计。
              </p>
            </button>

            <button @click="answers.publicKeySizeTolerance = 'large'" :class="[
              'p-6 rounded-lg border-2 transition-all flex flex-col items-start',
              answers.publicKeySizeTolerance === 'large'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            ]">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl font-bold text-blue-400">B.</span>
                <h5 class="text-xl font-semibold text-white">我可以预存较大的公钥</h5>
              </div>
              <p class="text-slate-300 ml-10">
                只要签名过程产生的流量极小即可，公钥大小不是主要问题。
              </p>
            </button>
          </div>
        </div>

        <!-- 推荐结果 -->
        <div v-if="recommendation" class="space-y-6">
          <h3 class="text-2xl font-bold text-white mb-2">🎯 最终推荐与深度解析</h3>
          <p class="text-slate-400 mb-4">
            根据您的回答，我们为您推荐以下算法：
          </p>

          <div class="bg-slate-800 rounded-lg p-6 border-l-4 border-green-500">
            <div v-if="recommendationDetails" class="flex flex-col items-start">
              <h4 class="text-2xl font-bold text-white mb-2">{{ recommendationDetails.title }}</h4>
              <p class="text-green-400 font-medium mb-4">{{ recommendationDetails.category }}</p>

              <div class="space-y-4 w-full">
                <div class="flex flex-col">
                  <h5 class="text-lg font-semibold text-white mb-1">核心优势</h5>
                  <p class="text-slate-300">{{ recommendationDetails.coreAdvantage }}</p>
                </div>

                <div class="flex flex-col">
                  <h5 class="text-lg font-semibold text-white mb-1">原理解析</h5>
                  <p class="text-slate-300">{{ recommendationDetails.principle }}</p>
                </div>

                <div class="flex flex-col">
                  <h5 class="text-lg font-semibold text-white mb-1">数据佐证</h5>
                  <p class="text-slate-300">{{ recommendationDetails.data }}</p>
                </div>

                <div class="flex flex-col">
                  <h5 class="text-lg font-semibold text-white mb-1">适用场景</h5>
                  <p class="text-slate-300">{{ recommendationDetails.scenario }}</p>
                </div>
              </div>

              <div class="mt-6 w-full">
                <button @click="selectAlgo"
                  class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                  <i class="fas fa-check"></i>
                  查看算法详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-6 border-t border-slate-800 flex justify-between">
        <!-- 上一步按钮 -->
        <button v-if="currentStep > 1 && !recommendation" @click="currentStep--"
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
          上一步
        </button>
        <div v-else></div>

        <!-- 下一步/完成按钮 -->
        <div class="flex gap-3">
          <!-- 跳过按钮 -->
          <button v-if="!recommendation" @click="close"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all">
            跳过
          </button>

          <!-- 下一步/完成按钮 -->
          <button v-if="!recommendation" @click="nextStep"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
            {{ currentStep === 6 ? '查看推荐' : '下一步' }}
          </button>

          <!-- 关闭按钮 -->
          <button v-else @click="close"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
